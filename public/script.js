const socket = io();

// DOM Elements
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const themeToggle = document.getElementById('theme-toggle');
const usernameEntry = document.getElementById('username-entry');
const startChat = document.getElementById('start-chat');
const chatBox = document.getElementById('chat-box');
const usernameInput = document.getElementById('username');
const imageUpload = document.getElementById('image-upload');

let myId = null;

// Connect and store ID
socket.on('connect', () => {
  myId = socket.id;
});

// Start chat
startChat.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (username !== '') {
    usernameEntry.classList.add('hidden');
    chatBox.classList.remove('hidden');
    input.focus();
    socket.emit('join', username);
  }
});

// Send message
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = input.value.trim();
  if (!value) return;

  const time = getCurrentTime();

  if (isImageURL(value)) {
    socket.emit('chat image', { src: value, time, id: myId });
  } else {
    socket.emit('chat message', { msg: value, time, id: myId });
  }

  input.value = '';
});

// Send image from file upload
imageUpload.addEventListener('change', () => {
  const file = imageUpload.files[0];
  if (!file || !file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const base64 = e.target.result;
    socket.emit('chat image', {
      src: base64,
      time: getCurrentTime(),
      id: myId,
    });
  };
  reader.readAsDataURL(file);
});

// Receive text message
socket.on('chat message', (data) => {
  const li = document.createElement('li');
  li.className = data.id === myId ? 'self' : 'other';
  li.innerHTML = `
    <div class="bubble">
      ${parseEmojis(data.msg)}<br>
      <small>${data.time}</small>
    </div>
  `;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
  setTimeout(() => li.remove(), 60000);
});

// Receive image message
socket.on('chat image', (data) => {
  const li = document.createElement('li');
  li.className = data.id === myId ? 'self' : 'other';
  li.innerHTML = `
    <div class="bubble">
      <img src="${data.src}" class="chat-image" alt="Image" /><br>
      <small>${data.time}</small>
    </div>
  `;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
  setTimeout(() => li.remove(), 60000);
});

// Theme toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  themeToggle.textContent = document.body.classList.contains('light') ? '🌙' : '🌞';
});

// Helpers
function isImageURL(url) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
}

function getCurrentTime() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseEmojis(text) {
  return text
    .replace(/:smile:/g, '😄')
    .replace(/:heart:/g, '❤️')
    .replace(/:fire:/g, '🔥')
    .replace(/:thumbsup:/g, '👍')
    .replace(/:sad:/g, '😢')
    .replace(/:laugh:/g, '😂');
}
