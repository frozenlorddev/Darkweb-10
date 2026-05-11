// ========================== UTILS.JS ==========================
// Helper functions – Darkweb AI

const fs = require('fs');
const path = require('path');

// ========== CACHE ==========
const groupCache = new Map();
const CACHE_TTL = 60000; // 1 minute

// ========== CONFIG LOADER (cached) ==========
let configCache = null;
let configCacheTime = 0;
function getConfig() {
    const now = Date.now();
    if (configCache && now - configCacheTime < 300000) return configCache;
    try {
        configCache = require('./config');
        configCacheTime = now;
        return configCache;
    } catch(e) { return { OWNERS: [], DEVELOPERS: [], PREFIX: '.' }; }
}

// ========== NUMBER EXTRACTION ==========
function getNumber(jid) {
    if (!jid) return 'unknown';
    const atIndex = jid.indexOf('@');
    if (atIndex === -1) {
        let result = '';
        for (let i = 0; i < jid.length; i++) {
            const c = jid[i];
            if (c >= '0' && c <= '9') result += c;
        }
        return result || 'unknown';
    }
    let result = '';
    const beforeAt = jid.substring(0, atIndex);
    for (let i = 0; i < beforeAt.length; i++) {
        const c = beforeAt[i];
        if (c >= '0' && c <= '9') result += c;
    }
    return result || 'unknown';
}

// ========== ADMIN CHECKS (cached) ==========
async function isAdmin(sock, chatId, participant) {
    if (!sock || !chatId || !participant) return false;
    const cacheKey = `${chatId}_admin_${participant}`;
    const cached = groupCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.value;
    try {
        const meta = await sock.groupMetadata(chatId);
        const p = meta.participants.find(p => p.id === participant);
        const isAdminResult = p?.admin === 'admin' || p?.admin === 'superadmin';
        groupCache.set(cacheKey, { value: isAdminResult, timestamp: Date.now() });
        return isAdminResult;
    } catch(e) { return false; }
}
async function botIsAdmin(sock, chatId) {
    if (!sock || !chatId) return false;
    const cacheKey = `${chatId}_bot_admin`;
    const cached = groupCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.value;
    try {
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const meta = await sock.groupMetadata(chatId);
        const bot = meta.participants.find(p => p.id === botId);
        const isAdminResult = bot?.admin === 'admin' || bot?.admin === 'superadmin';
        groupCache.set(cacheKey, { value: isAdminResult, timestamp: Date.now() });
        return isAdminResult;
    } catch(e) { return false; }
}

// ========== OWNER / DEVELOPER CHECKS ==========
let ownersList = null, devsList = null;
function refreshAdminLists() {
    const cfg = getConfig();
    ownersList = cfg.OWNERS || [];
    devsList = cfg.DEVELOPERS || [];
}
function isOwner(phone) {
    if (!phone) return false;
    if (ownersList === null) refreshAdminLists();
    return ownersList.includes(phone) || ownersList.includes(phone.toString());
}
function isDeveloper(phone) {
    if (!phone) return false;
    if (devsList === null) refreshAdminLists();
    return devsList.includes(phone) || devsList.includes(phone.toString());
}
function isOwnerOrDeveloper(phone) { return isOwner(phone) || isDeveloper(phone); }
function getAccessLevel(phone) {
    if (isOwner(phone)) return 'OWNER';
    if (isDeveloper(phone)) return 'DEVELOPER';
    return 'USER';
}
function refreshAdminCache() { refreshAdminLists(); }

// ========== LINK DETECTION ==========
const URL_PATTERN = /https?:\/\/[^\s]+|www\.[^\s]+|\b[a-zA-Z0-9-]+\.(com|org|net|io|me|xyz|club|online|site|tech|space|app|live|link|fun|bid|top)\b/i;
function containsLink(text) {
    if (!text || text.length < 5) return false;
    const lower = text.toLowerCase();
    if (!lower.includes('http') && !lower.includes('www') && !lower.includes('.com')) return false;
    return URL_PATTERN.test(text);
}
function extractLink(text) {
    const match = text?.match(URL_PATTERN);
    return match ? match[0] : null;
}
const TAG_ALL_PATTERN = /@all|@everyone/i;
function containsTagAll(text) { return text ? TAG_ALL_PATTERN.test(text) : false; }
function isGroupMention(text) {
    if (!text || !text.includes('@')) return false;
    let count = 0;
    let idx = 0;
    while ((idx = text.indexOf('@', idx)) !== -1) { count++; idx++; if (count > 5) return true; }
    return false;
}
function extractMentions(text) {
    if (!text) return [];
    const mentions = [];
    const words = text.split(/\s+/);
    for (const w of words) {
        if (w.startsWith('@') && w.length > 1) {
            const num = w.substring(1).replace(/[^0-9]/g, '');
            if (num.length >= 8) mentions.push(num);
        }
    }
    return mentions;
}

// ========== DELAY ==========
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
function randomSleep(min, max) { return sleep(Math.floor(Math.random() * (max - min + 1)) + min); }

// ========== REPLY HELPERS ==========
async function rudeReply(sock, chatId, text) { await sock.sendMessage(chatId, { text: `❌ ${text}` }); }
async function successReply(sock, chatId, text) { await sock.sendMessage(chatId, { text: `✅ ${text}` }); }
async function warningReply(sock, chatId, text) { await sock.sendMessage(chatId, { text: `⚠️ ${text}` }); }

// ========== RANDOM ==========
function randomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let res = '';
    for (let i = 0; i < length; i++) res += chars[Math.floor(Math.random() * chars.length)];
    return res;
}
function randomNumber(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ========== CACHE MANAGEMENT ==========
function clearGroupCache() { groupCache.clear(); }
function clearAllCaches() { groupCache.clear(); refreshAdminCache(); }
function getCacheStats() { return { groupCacheSize: groupCache.size, ownersCount: ownersList?.length || 0 }; }

// ========== FORMATTING ==========
function formatNumber(number) {
    if (!number) return '';
    let clean = '';
    for (let i = 0; i < number.length; i++) { if (number[i] >= '0' && number[i] <= '9') clean += number[i]; }
    if (clean.startsWith('0')) return '254' + clean.substring(1);
    if (clean.startsWith('254')) return clean;
    return '254' + clean;
}
function toJid(phone) { return formatNumber(phone) + '@s.whatsapp.net'; }
function isGroupJid(jid) { return jid && jid.includes('@g.us'); }
function isUserJid(jid) { return jid && jid.includes('@s.whatsapp.net') && !jid.includes('@g.us'); }
function formatUptime(ms) {
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (sec > 0 || parts.length === 0) parts.push(`${sec}s`);
    return parts.join(' ');
}
function formatDate(date) { return new Date(date).toLocaleString(); }
function truncate(text, max = 100) {
    if (!text) return '';
    if (text.length <= max) return text;
    return text.substring(0, max - 3) + '...';
}
function escapeMarkdown(text) { return text?.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&') || ''; }

module.exports = {
    getNumber, formatNumber, toJid, isGroupJid, isUserJid,
    isAdmin, botIsAdmin, isOwner, isDeveloper, isOwnerOrDeveloper, getAccessLevel, refreshAdminCache,
    containsLink, extractLink, containsTagAll, isGroupMention, extractMentions,
    sleep, randomSleep, rudeReply, successReply, warningReply,
    randomString, randomNumber, randomItem,
    clearGroupCache, clearAllCaches, getCacheStats,
    formatUptime, formatDate, truncate, escapeMarkdown
};