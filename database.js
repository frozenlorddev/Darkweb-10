// ==================================================================
// DATABASE.JS – Neon PostgreSQL Version (with loadSettings/saveSettings)
// ==================================================================

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// ========== INITIALIZE TABLES ==========
async function initDatabase() {
    const queries = [
        `CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value JSONB
        )`,
        `CREATE TABLE IF NOT EXISTS bans (
            phone TEXT PRIMARY KEY,
            level INT,
            reason TEXT,
            date TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS paired_users (
            phone TEXT PRIMARY KEY,
            code TEXT,
            timestamp BIGINT,
            expires BIGINT
        )`,
        `CREATE TABLE IF NOT EXISTS bot_users (
            phone TEXT PRIMARY KEY,
            name TEXT,
            first_seen BIGINT,
            last_seen BIGINT,
            interactions INT,
            is_premium BOOLEAN,
            premium_expiry BIGINT,
            groups_joined TEXT[],
            from_group BOOLEAN
        )`,
        `CREATE TABLE IF NOT EXISTS payments (
            id TEXT PRIMARY KEY,
            phone TEXT,
            amount INT,
            status TEXT,
            requested_on BIGINT,
            approved_by TEXT,
            approved_on BIGINT
        )`,
        `CREATE TABLE IF NOT EXISTS group_settings (
            group_id TEXT PRIMARY KEY,
            settings JSONB
        )`,
        `CREATE TABLE IF NOT EXISTS user_gold (
            phone TEXT PRIMARY KEY,
            gold INT DEFAULT 0,
            vault INT DEFAULT 0,
            hp INT DEFAULT 100,
            last_daily BIGINT DEFAULT 0,
            last_work BIGINT DEFAULT 0,
            last_crime BIGINT DEFAULT 0,
            last_rob BIGINT DEFAULT 0,
            last_gamble BIGINT DEFAULT 0,
            last_hijack BIGINT DEFAULT 0,
            hijack_count INT DEFAULT 0,
            referrals TEXT[] DEFAULT '{}',
            achievements TEXT[] DEFAULT '{}',
            items TEXT[] DEFAULT '{}'
        )`,
        `CREATE TABLE IF NOT EXISTS premium_users (
            phone TEXT PRIMARY KEY,
            activated_on BIGINT,
            expiry BIGINT,
            days INT,
            collected_by TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS warning_counts (
            phone TEXT,
            type TEXT,
            count INT,
            PRIMARY KEY (phone, type)
        )`
    ];
    for (const query of queries) {
        await pool.query(query);
    }
    console.log('✅ PostgreSQL tables ready');
}
initDatabase().catch(console.error);

// ========== SETTINGS (full object load/save) ==========
let settingsCache = null;

async function loadSettings() {
    if (settingsCache) return settingsCache;
    const res = await pool.query('SELECT key, value FROM settings');
    const settings = {
        prefix: '.',
        botName: '𝐃𝐀𝐑𝐊𝐖𝐄𝐁 𝐀𝐈',
        welcome: false,
        goodbye: false,
        antilink: 'off',
        antileft: false,
        antibot: false,
        antigroupmention: 'off',
        antitagall: 'off',
        reactall: false,
        antebug: false,
        linkWarnings: new Map(),
        mentionWarnings: new Map(),
        tagallWarnings: new Map(),
        tempbans: new Map()
    };
    for (const row of res.rows) {
        if (row.key === 'linkWarnings' || row.key === 'mentionWarnings' || row.key === 'tagallWarnings' || row.key === 'tempbans') {
            settings[row.key] = new Map(Object.entries(row.value || {}));
        } else {
            settings[row.key] = row.value;
        }
    }
    settingsCache = settings;
    return settings;
}

async function saveSettings(settings) {
    settingsCache = settings;
    for (const [key, value] of Object.entries(settings)) {
        let storeValue = value;
        if (value instanceof Map) {
            storeValue = Object.fromEntries(value);
        }
        await pool.query(
            'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
            [key, storeValue]
        );
    }
}

// ========== SINGLE KEY GET/SET (alternative) ==========
async function getSetting(key, defaultValue = null) {
    const res = await pool.query('SELECT value FROM settings WHERE key = $1', [key]);
    return res.rows[0]?.value ?? defaultValue;
}
async function setSetting(key, value) {
    await pool.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
        [key, value]
    );
    if (settingsCache) settingsCache[key] = value;
}

// ========== BANS ==========
async function setBan(phone, level = 1, reason = 'Violation') {
    await pool.query(
        'INSERT INTO bans (phone, level, reason, date) VALUES ($1, $2, $3, NOW()) ON CONFLICT (phone) DO UPDATE SET level = $2, reason = $3, date = NOW()',
        [phone, level, reason]
    );
}
async function removeBan(phone) {
    await pool.query('DELETE FROM bans WHERE phone = $1', [phone]);
}
async function getBan(phone) {
    const res = await pool.query('SELECT * FROM bans WHERE phone = $1', [phone]);
    return res.rows[0] || null;
}
async function isBanned(phone) {
    const res = await pool.query('SELECT 1 FROM bans WHERE phone = $1', [phone]);
    return res.rowCount > 0;
}
let bansCache = new Map();
async function loadBans() {
    const res = await pool.query('SELECT * FROM bans');
    bansCache.clear();
    for (const row of res.rows) bansCache.set(row.phone, row);
    return bansCache;
}
function saveBans() {}

// ========== PAIRED DEVICES ==========
async function setPairedUser(phone, code) {
    await pool.query(
        'INSERT INTO paired_users (phone, code, timestamp, expires) VALUES ($1, $2, $3, $4) ON CONFLICT (phone) DO UPDATE SET code = $2, timestamp = $3, expires = $4',
        [phone, code, Date.now(), Date.now() + 300000]
    );
}
async function getPairedUser(phone) {
    const res = await pool.query('SELECT * FROM paired_users WHERE phone = $1 AND expires > $2', [phone, Date.now()]);
    return res.rows[0] || null;
}
async function removePairedUser(phone) {
    await pool.query('DELETE FROM paired_users WHERE phone = $1', [phone]);
}
async function loadPaired() {
    const res = await pool.query('SELECT * FROM paired_users');
    const pairedMap = new Map();
    for (const row of res.rows) pairedMap.set(row.phone, row);
    return pairedMap;
}
function savePaired() {}

// ========== BOT USERS ==========
async function addBotUser(phone, name = '', fromGroup = false) {
    const exists = await pool.query('SELECT 1 FROM bot_users WHERE phone = $1', [phone]);
    if (exists.rowCount === 0) {
        await pool.query(
            'INSERT INTO bot_users (phone, name, first_seen, last_seen, interactions, is_premium, premium_expiry, groups_joined, from_group) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [phone, name, Date.now(), Date.now(), 1, false, null, [], fromGroup]
        );
    } else {
        await pool.query(
            'UPDATE bot_users SET last_seen = $1, interactions = interactions + 1 WHERE phone = $2',
            [Date.now(), phone]
        );
    }
}
async function getBotUser(phone) {
    const res = await pool.query('SELECT * FROM bot_users WHERE phone = $1', [phone]);
    return res.rows[0] || null;
}
async function getAllBotUsers() {
    const res = await pool.query('SELECT * FROM bot_users');
    return res.rows;
}
async function getBotUsersCount() {
    const res = await pool.query('SELECT COUNT(*) FROM bot_users');
    return parseInt(res.rows[0].count);
}
async function loadBotUsers() {
    const res = await pool.query('SELECT * FROM bot_users');
    const map = new Map();
    for (const row of res.rows) map.set(row.phone, row);
    return map;
}
function saveBotUsers() {}

// ========== PREMIUM ==========
async function isPremium(phone) {
    const res = await pool.query('SELECT expiry FROM premium_users WHERE phone = $1 AND expiry > $2', [phone, Date.now()]);
    return res.rowCount > 0;
}
async function getPremiumExpiry(phone) {
    const res = await pool.query('SELECT expiry FROM premium_users WHERE phone = $1', [phone]);
    return res.rows[0] ? new Date(res.rows[0].expiry) : null;
}
async function getPremiumList() {
    const res = await pool.query('SELECT phone FROM premium_users WHERE expiry > $1', [Date.now()]);
    return res.rows.map(r => r.phone);
}
async function activatePremium(phone, days = 30, collectedBy = 'Unknown', sock = null) {
    const expiry = Date.now() + (days * 86400000);
    await pool.query(
        'INSERT INTO premium_users (phone, activated_on, expiry, days, collected_by) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (phone) DO UPDATE SET expiry = $3, days = $4, collected_by = $5',
        [phone, Date.now(), expiry, days, collectedBy]
    );
    return { joinedGroup: false, joinedChannel: false };
}
async function deactivatePremium(phone) {
    await pool.query('DELETE FROM premium_users WHERE phone = $1', [phone]);
}
async function loadPremium() {
    const res = await pool.query('SELECT * FROM premium_users');
    const map = new Map();
    for (const row of res.rows) map.set(row.phone, row);
    return map;
}
function savePremium() {}

// ========== USER GOLD ==========
async function getUserGold(phone) {
    const res = await pool.query('SELECT * FROM user_gold WHERE phone = $1', [phone]);
    if (res.rows[0]) return res.rows[0];
    return {
        phone,
        gold: 0,
        vault: 0,
        hp: 100,
        last_daily: 0,
        last_work: 0,
        last_crime: 0,
        last_rob: 0,
        last_gamble: 0,
        last_hijack: 0,
        hijack_count: 0,
        referrals: [],
        achievements: [],
        items: []
    };
}
async function saveUserGold(phone, data) {
    await pool.query(
        `INSERT INTO user_gold (phone, gold, vault, hp, last_daily, last_work, last_crime, last_rob, last_gamble, last_hijack, hijack_count, referrals, achievements, items)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (phone) DO UPDATE SET
         gold = $2, vault = $3, hp = $4, last_daily = $5, last_work = $6, last_crime = $7,
         last_rob = $8, last_gamble = $9, last_hijack = $10, hijack_count = $11,
         referrals = $12, achievements = $13, items = $14`,
        [phone, data.gold, data.vault, data.hp, data.last_daily, data.last_work, data.last_crime,
         data.last_rob, data.last_gamble, data.last_hijack, data.hijack_count,
         data.referrals, data.achievements, data.items]
    );
}

// ========== PAYMENTS ==========
async function addPaymentRequest(phone, amount = 100) {
    const id = Date.now() + '_' + Math.random().toString(36).substring(2);
    await pool.query(
        'INSERT INTO payments (id, phone, amount, status, requested_on) VALUES ($1, $2, $3, $4, $5)',
        [id, phone, amount, 'pending', Date.now()]
    );
    return id;
}
async function getPendingPayments() {
    const res = await pool.query("SELECT * FROM payments WHERE status = 'pending'");
    return res.rows;
}
async function getAllPayments() {
    const res = await pool.query('SELECT * FROM payments');
    return res.rows;
}
async function approvePayment(id, approvedBy) {
    await pool.query('UPDATE payments SET status = $1, approved_by = $2, approved_on = $3 WHERE id = $4', ['approved', approvedBy, Date.now(), id]);
}
async function rejectPayment(id) {
    await pool.query("UPDATE payments SET status = 'rejected' WHERE id = $1", [id]);
}
async function loadPayments() {
    const res = await pool.query('SELECT * FROM payments');
    const map = new Map();
    for (const row of res.rows) map.set(row.id, row);
    return map;
}
function savePayments() {}

// ========== GROUP SETTINGS ==========
async function getGroupSettings(groupId) {
    const res = await pool.query('SELECT settings FROM group_settings WHERE group_id = $1', [groupId]);
    if (res.rows[0]) return res.rows[0].settings;
    const defaults = { antilink: 'off', welcome: false, goodbye: false, antibot: false, antigroupmention: 'off', antitagall: 'off' };
    await pool.query('INSERT INTO group_settings (group_id, settings) VALUES ($1, $2) ON CONFLICT DO NOTHING', [groupId, defaults]);
    return defaults;
}
async function setGroupSetting(groupId, key, value) {
    const settings = await getGroupSettings(groupId);
    settings[key] = value;
    await pool.query('UPDATE group_settings SET settings = $1 WHERE group_id = $2', [settings, groupId]);
}
async function loadGroups() {
    const res = await pool.query('SELECT * FROM group_settings');
    const map = new Map();
    for (const row of res.rows) map.set(row.group_id, row.settings);
    return map;
}
function saveGroups() {}

// ========== TEMP BANS (stored in settings table) ==========
async function getTempBan(phone) {
    const tempbans = (await getSetting('tempbans', {}));
    const expiry = tempbans[phone];
    if (!expiry) return null;
    if (expiry < Date.now()) {
        delete tempbans[phone];
        await setSetting('tempbans', tempbans);
        return null;
    }
    return expiry;
}
async function setTempBan(phone, minutes = 60) {
    const tempbans = (await getSetting('tempbans', {}));
    tempbans[phone] = Date.now() + (minutes * 60000);
    await setSetting('tempbans', tempbans);
}
async function removeTempBan(phone) {
    const tempbans = (await getSetting('tempbans', {}));
    delete tempbans[phone];
    await setSetting('tempbans', tempbans);
}
async function isTempBanned(phone) {
    return (await getTempBan(phone)) !== null;
}

// ========== CLEANUP ==========
async function cleanupExpiredData() {
    await pool.query('DELETE FROM premium_users WHERE expiry < $1', [Date.now()]);
    await pool.query('DELETE FROM paired_users WHERE expires < $1', [Date.now()]);
    const weekAgo = Date.now() - (7 * 86400000);
    await pool.query("DELETE FROM payments WHERE status = 'pending' AND requested_on < $1", [weekAgo]);
}

// ========== LOAD ALL (legacy compatibility) ==========
async function loadAll() {
    await loadBans();
    await loadPaired();
    await loadBotUsers();
    await loadPayments();
    await loadGroups();
    await loadPremium();
}
loadAll().catch(console.error);

// ========== EXPORTS ==========
module.exports = {
    // Core settings (load/save whole object)
    loadSettings,
    saveSettings,
    getSetting,
    setSetting,
    // Bans
    setBan, removeBan, getBan, isBanned, bans: bansCache, loadBans, saveBans,
    // Paired
    setPairedUser, getPairedUser, removePairedUser, loadPaired, savePaired, pairedUsers: new Map(),
    // Bot users
    addBotUser, getBotUser, getAllBotUsers, getBotUsersCount, loadBotUsers, saveBotUsers, botUsers: new Map(),
    // Payments
    addPaymentRequest, getPendingPayments, getAllPayments, approvePayment, rejectPayment, loadPayments, savePayments,
    // Groups
    getGroupSettings, setGroupSetting, loadGroups, saveGroups, groupSettings: new Map(),
    // Premium
    isPremium, getPremiumExpiry, getPremiumList, activatePremium, deactivatePremium, loadPremium, savePremium, premiumUsers: new Map(),
    // Gold economy
    getUserGold, saveUserGold,
    // Temp bans
    setTempBan, getTempBan, removeTempBan, isTempBanned,
    // Cleanup
    cleanupExpiredData
};
