// ==================================================================
// PREMIUM.JS – Premium Management System
// ==================================================================

const fs = require('fs');
const path = require('path');

// ========== CONFIGURATION ==========
const PREMIUM_DB_PATH = './database/premium.json';
const PREMIUM_SETTINGS_PATH = './database/premium_settings.json';

// In‑memory cache
let premiumUsers = new Map(); // phone -> { expiry, collectedBy, activatedAt }
let premiumSettings = {
    premiumGroupId: null,
    premiumChannelId: null,
    autoJoin: true,
    autoJoinGroup: true,
    autoJoinChannel: true
};

// ========== INITIALIZE ==========
function initPremiumDB() {
    const dbDir = './database';
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    
    if (fs.existsSync(PREMIUM_DB_PATH)) {
        try {
            const data = JSON.parse(fs.readFileSync(PREMIUM_DB_PATH, 'utf8'));
            premiumUsers = new Map(Object.entries(data));
            console.log(`✅ Loaded ${premiumUsers.size} premium users`);
        } catch (err) { console.error('Failed to load premium DB:', err); }
    }
    if (fs.existsSync(PREMIUM_SETTINGS_PATH)) {
        try {
            const settings = JSON.parse(fs.readFileSync(PREMIUM_SETTINGS_PATH, 'utf8'));
            premiumSettings = { ...premiumSettings, ...settings };
        } catch (err) { console.error('Failed to load premium settings:', err); }
    }
    savePremiumSettings();
}
initPremiumDB();

function savePremiumDB() {
    try {
        fs.writeFileSync(PREMIUM_DB_PATH, JSON.stringify(Object.fromEntries(premiumUsers), null, 2));
    } catch (err) { console.error('Failed to save premium DB:', err); }
}
function savePremiumSettings() {
    try {
        fs.writeFileSync(PREMIUM_SETTINGS_PATH, JSON.stringify(premiumSettings, null, 2));
    } catch (err) { console.error('Failed to save premium settings:', err); }
}

// ========== PREMIUM CHECKS ==========
function isPremium(phoneNumber) {
    const user = premiumUsers.get(phoneNumber);
    if (!user) return false;
    if (user.expiry && user.expiry < Date.now()) {
        premiumUsers.delete(phoneNumber);
        savePremiumDB();
        return false;
    }
    return true;
}

function getPremiumExpiry(phoneNumber) {
    const user = premiumUsers.get(phoneNumber);
    if (!user) return null;
    return new Date(user.expiry);
}

function getPremiumList() {
    const now = Date.now();
    const active = [];
    for (const [phone, data] of premiumUsers.entries()) {
        if (data.expiry > now) active.push({ phone, expiry: data.expiry, collectedBy: data.collectedBy, activatedAt: data.activatedAt });
        else premiumUsers.delete(phone);
    }
    if (active.length !== premiumUsers.size) savePremiumDB();
    return active;
}

async function activatePremium(phoneNumber, days = 30, collectedBy = 'Unknown', sock = null) {
    const expiry = Date.now() + (days * 24 * 60 * 60 * 1000);
    premiumUsers.set(phoneNumber, { expiry, collectedBy, activatedAt: Date.now() });
    savePremiumDB();
    const result = { joinedGroup: false, joinedChannel: false };
    if (sock) {
        if (premiumSettings.autoJoinGroup) result.joinedGroup = await addToPremiumGroup(phoneNumber, sock);
        if (premiumSettings.autoJoinChannel) result.joinedChannel = await addToPremiumChannel(phoneNumber, sock);
    }
    console.log(`✅ Premium activated for +${phoneNumber} (${days} days) by ${collectedBy}`);
    return result;
}

async function deactivatePremium(phoneNumber, sock = null) {
    if (!premiumUsers.has(phoneNumber)) return false;
    if (sock) await removeFromPremiumSpaces(phoneNumber, sock);
    premiumUsers.delete(phoneNumber);
    savePremiumDB();
    console.log(`❌ Premium deactivated for +${phoneNumber}`);
    return true;
}

async function extendPremium(phoneNumber, extraDays = 30, collectedBy = 'Unknown', sock = null) {
    const existing = premiumUsers.get(phoneNumber);
    let newExpiry = Date.now() + (extraDays * 86400000);
    if (existing && existing.expiry > Date.now()) newExpiry = existing.expiry + (extraDays * 86400000);
    premiumUsers.set(phoneNumber, { expiry: newExpiry, collectedBy, activatedAt: existing?.activatedAt || Date.now() });
    savePremiumDB();
    console.log(`✅ Premium extended for +${phoneNumber} (+${extraDays} days) by ${collectedBy}`);
    return true;
}

// ========== SPACES MANAGEMENT ==========
function getPremiumGroupId() { return premiumSettings.premiumGroupId; }
function getPremiumChannelId() { return premiumSettings.premiumChannelId; }
function setPremiumGroup(groupId) { premiumSettings.premiumGroupId = groupId; savePremiumSettings(); }
function setPremiumChannel(channelId) { premiumSettings.premiumChannelId = channelId; savePremiumSettings(); }
function setAutoJoin(enabled) { premiumSettings.autoJoin = enabled; savePremiumSettings(); }
function setAutoJoinGroup(enabled) { premiumSettings.autoJoinGroup = enabled; savePremiumSettings(); }
function setAutoJoinChannel(enabled) { premiumSettings.autoJoinChannel = enabled; savePremiumSettings(); }
function getPremiumSettings() { return { ...premiumSettings }; }

async function addToPremiumGroup(phoneNumber, sock) {
    if (!premiumSettings.premiumGroupId || !sock) return false;
    try {
        await sock.groupParticipantsUpdate(premiumSettings.premiumGroupId, [phoneNumber + '@s.whatsapp.net'], 'add');
        return true;
    } catch (err) { return false; }
}
async function addToPremiumChannel(phoneNumber, sock) {
    if (!premiumSettings.premiumChannelId) return false;
    // Channel invites require invite link – placeholder
    return true;
}
async function removeFromPremiumSpaces(phoneNumber, sock) {
    if (!sock) return false;
    if (premiumSettings.premiumGroupId) {
        try {
            await sock.groupParticipantsUpdate(premiumSettings.premiumGroupId, [phoneNumber + '@s.whatsapp.net'], 'remove');
        } catch(e) {}
    }
    return true;
}
async function syncAllPremiumToSpaces(sock) {
    const results = { group: { success: 0, failed: 0 }, channel: { success: 0, failed: 0 } };
    const users = getPremiumList();
    if (premiumSettings.premiumGroupId) {
        for (const u of users) {
            const ok = await addToPremiumGroup(u.phone, sock);
            ok ? results.group.success++ : results.group.failed++;
            await new Promise(r => setTimeout(r, 300));
        }
    }
    return results;
}
async function syncAllPremiumToGroup(sock) { return (await syncAllPremiumToSpaces(sock)).group; }
async function broadcastToPremium(message, sock) {
    let sent = 0, failed = 0;
    for (const u of getPremiumList()) {
        try {
            await sock.sendMessage(u.phone + '@s.whatsapp.net', { text: message });
            sent++;
        } catch(e) { failed++; }
        await new Promise(r => setTimeout(r, 300));
    }
    return { sent, failed };
}

module.exports = {
    isPremium, getPremiumExpiry, getPremiumList,
    activatePremium, deactivatePremium, extendPremium,
    getPremiumGroupId, getPremiumChannelId, setPremiumGroup, setPremiumChannel,
    setAutoJoin, setAutoJoinGroup, setAutoJoinChannel, getPremiumSettings,
    addToPremiumGroup, addToPremiumChannel, removeFromPremiumSpaces,
    syncAllPremiumToSpaces, syncAllPremiumToGroup, broadcastToPremium
};