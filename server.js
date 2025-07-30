const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve static files from "public"
app.use(express.static('public'));

// Handle socket events
io.on('connection', (socket) => {
  console.log('✅ New user connected');

  socket.on('chat message', (data) => {
    data.id = socket.id;
    io.emit('chat message', data);
  });

  socket.on('chat image', (data) => {
    data.id = socket.id;
    io.emit('chat image', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
