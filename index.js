// ==================================================================
// DARKWEB AI – MULTI‑SESSION (Up to 30 Users + Web Pairing)
// ==================================================================

const fs = require('fs');
const path = require('path');
const pino = require('pino');
const chalk = require('chalk');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@ostyado/baileys');

const config = require('./config');
const { handleCommand, checkSpam, spamShield } = require('./commands');
const { 
    addBotUser, getBotUser, 
    loadSettings, saveSettings, 
    loadBans, loadPaired, loadBotUsers, loadPayments, loadGroups, loadPremium, 
    cleanupExpiredData 
} = require('./database');
const { getNumber } = require('./utils');

// ========== CONFIGURATION ==========
const MAX_SESSIONS = parseInt(process.env.MAX_SESSIONS) || 30;
const SESSIONS_DIR = './sessions';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'darkweb2024';

if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });

// Global storage for active sessions
const activeSessions = new Map(); // phone -> { sock, startTime, status }

// Load global data
let settings = loadSettings();
const bans = loadBans();
const pairedUsers = loadPaired();
const botUsers = loadBotUsers();
const payments = loadPayments();
const groupSettings = loadGroups();
const premiumUsers = loadPremium();

// ========== EXPRESS WEB SERVER ==========
const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());

// Serve the main HTML file from root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API: get bot status (sessions count, max, uptime)
app.get('/api/status', (req, res) => {
    const sessions = activeSessions.size;
    const uptime = Math.floor(process.uptime());
    res.json({ sessions, maxSessions: MAX_SESSIONS, uptime });
});

// API: list all active sessions
app.get('/api/sessions', (req, res) => {
    const sessionsList = [];
    for (const [phone, data] of activeSessions.entries()) {
        sessionsList.push({
            phoneNumber: phone,
            status: data.status || 'connected',
            connectedAt: data.startTime
        });
    }
    res.json({ sessions: sessionsList });
});

// API: generate pairing code for a new user
app.post('/api/connect', async (req, res) => {
    const { phone } = req.body;
    if (!phone || !/^\d{7,15}$/.test(phone)) {
        return res.status(400).json({ error: 'Invalid phone number' });
    }
    if (activeSessions.has(phone)) {
        return res.status(409).json({ error: 'Session already active for this number' });
    }
    if (activeSessions.size >= MAX_SESSIONS) {
        return res.status(429).json({ error: `Maximum sessions (${MAX_SESSIONS}) reached` });
    }
    try {
        const code = await startNewSession(phone);
        res.json({ code });
    } catch (err) {
        console.error('Pairing error:', err);
        res.status(500).json({ error: err.message || 'Failed to generate pairing code' });
    }
});

// API: delete a session (requires admin password)
app.post('/api/delsession', async (req, res) => {
    const { phone, password } = req.body;
    if (password !== ADMIN_PASSWORD) {
        return res.status(403).json({ error: 'Invalid password' });
    }
    if (!activeSessions.has(phone)) {
        return res.status(404).json({ error: 'Session not found' });
    }
    await killSession(phone);
    res.json({ ok: true, message: `Session for ${phone} terminated` });
});

// ========== SESSION MANAGEMENT ==========
async function startNewSession(phone) {
    const sessionDir = path.join(SESSIONS_DIR, phone);
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ["Darkweb AI", "Chrome", "120.0.0.0"],
        markOnlineOnConnect: true,
    });
    sock.ev.on('creds.update', saveCreds);

    // Store session data
    const sessionData = {
        sock,
        startTime: Date.now(),
        status: 'pairing',
        phone
    };
    activeSessions.set(phone, sessionData);

    // Request pairing code
    let pairingCode;
    try {
        pairingCode = await sock.requestPairingCode(phone);
        sessionData.status = 'paired';
        console.log(chalk.green(`✅ Pairing code for ${phone}: ${pairingCode}`));
    } catch (err) {
        activeSessions.delete(phone);
        throw new Error('Failed to generate pairing code');
    }

    // Set up event handlers
    setupSessionEvents(sock, phone);
    return pairingCode;
}

async function killSession(phone) {
    const session = activeSessions.get(phone);
    if (session && session.sock) {
        try {
            await session.sock.end();
        } catch (e) {}
    }
    activeSessions.delete(phone);
    console.log(chalk.yellow(`🗑 Session terminated for ${phone}`));
}

function setupSessionEvents(sock, phone) {
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            console.log(chalk.yellow(`Session ${phone} closed: ${statusCode}`));
            if (statusCode !== DisconnectReason.loggedOut) {
                // Auto reconnect after delay
                setTimeout(() => reconnectSession(phone), 8000);
            } else {
                activeSessions.delete(phone);
            }
        } else if (connection === 'open') {
            const session = activeSessions.get(phone);
            if (session) session.status = 'connected';
            console.log(chalk.green(`✅ Session ${phone} is online`));
            // Send welcome message
            await sock.sendMessage(phone + '@s.whatsapp.net', { 
                text: `🔥 Darkweb AI is online for your number!\nUse .menu to see commands.` 
            }).catch(()=>{});
        }
    });

    // Message handler
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const msg = messages[0];
        if (!msg?.message) return;

        let body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || msg.message?.imageMessage?.caption || "";
        const chatId = msg.key.remoteJid;
        const participant = msg.key.participant || chatId;
        const senderNumber = getNumber(participant);
        const isGroup = chatId.endsWith('@g.us');

        // Add user to global database
        addBotUser(senderNumber, senderNumber, isGroup);

        // Spam shield (per chat)
        if (isGroup && !msg.key.fromMe) {
            const spamKicked = await checkSpam(sock, chatId, participant, senderNumber);
            if (spamKicked) return;
        }

        // Handle commands
        const prefix = config.PREFIX || '.';
        if (body && body.startsWith(prefix)) {
            console.log(chalk.yellow(`[${phone}] Executing: ${body}`));
            try {
                // Prepare shared state with REAL global data (not empty)
                const sharedState = {
                    prefix,
                    setPrefix: (p) => { config.PREFIX = p; },
                    setBotName: (n) => { config.BOT_NAME = n; },
                    bans: bans,
                    settings: settings,
                    pairedUsers: pairedUsers,
                    tempBans: settings.tempbans || new Map(),
                    saveBans: () => {},
                    saveSettings: saveSettings,
                    savePaired: () => {}
                };
                await handleCommand(sock, chatId, msg, body, participant, sharedState);
            } catch (err) {
                console.log(chalk.red(`[${phone}] Command error: ${err.message}`));
                await sock.sendMessage(chatId, { text: `❌ Error: ${err.message}` });
            }
        }
    });
}

async function reconnectSession(phone) {
    if (activeSessions.has(phone)) return;
    console.log(chalk.cyan(`Attempting to reconnect ${phone}...`));
    try {
        await startNewSession(phone);
    } catch (err) {
        console.error(`Reconnection failed for ${phone}:`, err);
    }
}

// ========== LOAD EXISTING SESSIONS ON START ==========
async function loadExistingSessions() {
    const folders = fs.readdirSync(SESSIONS_DIR).filter(f => 
        fs.statSync(path.join(SESSIONS_DIR, f)).isDirectory() && /^\d+$/.test(f)
    );
    for (const phone of folders) {
        if (activeSessions.size >= MAX_SESSIONS) break;
        console.log(chalk.cyan(`🔄 Restoring session for ${phone}...`));
        try {
            await startNewSession(phone);
            await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
            console.log(chalk.red(`Failed to restore ${phone}: ${err.message}`));
        }
    }
}

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(chalk.green(`✅ Darkweb AI Multi-Session Server running on http://localhost:${PORT}`));
    console.log(chalk.cyan(`📱 Max sessions: ${MAX_SESSIONS}`));
    console.log(chalk.yellow(`⚠️ Each user must pair their own number via the web interface.`));
});

// Global bot start time
global.botStartTime = Date.now();

// Load any previously paired sessions
loadExistingSessions().catch(console.error);

// Cleanup expired data every hour
setInterval(() => cleanupExpiredData(), 3600000);

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log(chalk.red('\n🛑 Shutting down...'));
    for (const [phone, session] of activeSessions) {
        try { await session.sock.end(); } catch(e) {}
    }
    process.exit(0);
});