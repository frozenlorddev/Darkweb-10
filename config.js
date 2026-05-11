// ========================== CONFIG.JS ==========================
// Darkweb AI – Telegram removed
require('dotenv').config();

const PREFIX = process.env.PREFIX || '.';
const BOT_NAME = process.env.BOT_NAME || '𝐃𝐀𝐑𝐊𝐖𝐄𝐁 𝐀𝐈';
const DEFAULT_PREFIX = '.';
const RESPONSE_IMAGE_URL = 'https://files.catbox.moe/9mdy9n.jpg';
const HIJACK_ICON_URL = 'https://i.ibb.co/62Jt2jLV/nuke.jpg';
const GROUP_INVITE_CODE = process.env.GROUP_INVITE_CODE || 'YOUR_INVITE_CODE_HERE';

// Owners and Developers – comma-separated numbers in environment variables
const OWNERS = process.env.OWNERS ? process.env.OWNERS.split(',') : ['254780438119'];
const DEVELOPERS = process.env.DEVELOPERS ? process.env.DEVELOPERS.split(',') : ['254739261187', '254799984735', '254750206452', '254718397511'];

module.exports = {
    PREFIX,
    BOT_NAME,
    DEFAULT_PREFIX,
    RESPONSE_IMAGE_URL,
    HIJACK_ICON_URL,
    GROUP_INVITE_CODE,
    OWNERS,
    DEVELOPERS
};