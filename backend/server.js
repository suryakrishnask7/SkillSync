require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const app = require('./src/app');
const Request = require('./src/models/Request');
const Message = require('./src/models/Message');
const { processSessionCompletion } = require('./src/services/gamificationService');

const PORT = process.env.PORT || 5000;

// Create HTTP server with Express app
const server = http.createServer(app);

// Create Socket.io instance
const io = new Server(server, {
  cors: {
    origin: '*', // allows client connections in dev
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Socket Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
  if (!token) {
    return next(new Error('Authentication required for socket connection'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // { id, name }
    next();
  } catch (err) {
    next(new Error('Invalid or expired socket token'));
  }
});

// Store connected users in memory: userId -> Set of socketIds
const connectedUsers = new Map();

io.on('connection', (socket) => {
  const userId = socket.user.id;
  const username = socket.user.name;

  if (!connectedUsers.has(userId)) {
    connectedUsers.set(userId, new Set());
  }
  connectedUsers.get(userId).add(socket.id);

  // Join personal user room for direct notifications
  socket.join(`user_${userId}`);

  // Handle joining a private session room
  socket.on('joinRoom', async ({ roomId }) => {
    try {
      if (!roomId) {
        return socket.emit('error', { message: 'Invalid roomId' });
      }

      const request = await Request.findById(roomId)
        .populate('requester', 'name email reputation')
        .populate('helper', 'name email reputation');

      if (!request) {
        return socket.emit('error', { message: 'Session not found' });
      }

      const isRequester = request.requester?._id?.toString() === userId;
      const isHelper = request.helper?._id?.toString() === userId;

      if (!isRequester && !isHelper) {
        return socket.emit('error', { message: 'Unauthorized: You are not a participant in this session' });
      }

      socket.join(roomId);

      // Load persisted message history
      const history = await Message.find({ roomId })
        .sort({ createdAt: 1 })
        .limit(200);

      socket.emit('roomHistory', {
        request,
        messages: history
      });

      // Broadcast presence
      socket.to(roomId).emit('message', {
        _id: 'sys_' + Date.now(),
        system: true,
        username: 'System',
        text: `${username} joined the chat.`,
        createdAt: new Date()
      });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // Handle sending a message
  socket.on('sendMessage', async ({ roomId, text }) => {
    try {
      if (!roomId || !text || !text.trim()) return;

      const request = await Request.findById(roomId);
      if (!request) {
        return socket.emit('error', { message: 'Session not found' });
      }

      const isRequester = request.requester?.toString() === userId;
      const isHelper = request.helper && request.helper.toString() === userId;

      if (!isRequester && !isHelper) {
        return socket.emit('error', { message: 'Unauthorized to send message' });
      }

      if (request.status === 'closed') {
        return socket.emit('error', { message: 'Session is closed. Further messages cannot be sent.' });
      }

      // Persist message to MongoDB
      const savedMessage = new Message({
        roomId,
        sender: userId,
        senderName: username,
        text: text.trim().slice(0, 2000),
        createdAt: new Date()
      });
      await savedMessage.save();

      // Broadcast to room participants
      io.to(roomId).emit('message', {
        _id: savedMessage._id,
        roomId,
        sender: userId,
        username,
        text: savedMessage.text,
        createdAt: savedMessage.createdAt
      });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // Handle ending the session from chat
  socket.on('endSession', async ({ roomId }) => {
    try {
      if (!roomId) return;

      const request = await Request.findById(roomId);
      if (!request) return socket.emit('error', { message: 'Session not found' });

      const isRequester = request.requester?.toString() === userId;

      if (!isRequester) {
        return socket.emit('error', { message: 'Only the learner/requester can end this session' });
      }

      if (request.status !== 'closed') {
        request.status = 'closed';
        request.active = false;
        request.closedAt = new Date();
        await request.save();

        if (request.helper) {
          await processSessionCompletion(request.helper, 'helper');
        }
        await processSessionCompletion(request.requester, 'learner');
      }

      const updated = await Request.findById(roomId)
        .populate('requester', 'name email reputation stats badges')
        .populate('helper', 'name email reputation stats badges');

      io.to(roomId).emit('sessionEnded', {
        request: updated,
        message: 'This session has been closed.'
      });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // Handle leaving room
  socket.on('leaveRoom', ({ roomId }) => {
    if (roomId) {
      socket.leave(roomId);
      socket.to(roomId).emit('message', {
        _id: 'sys_' + Date.now(),
        system: true,
        username: 'System',
        text: `${username} left the chat.`,
        createdAt: new Date()
      });
    }
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    if (connectedUsers.has(userId)) {
      const userSockets = connectedUsers.get(userId);
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        connectedUsers.delete(userId);
      }
    }
  });
});

// Attach io instance to express app for controller access (e.g., notifying user on acceptance)
app.set('io', io);

server.listen(PORT, () => {
  console.log(`SkillSync backend server running on port ${PORT}`);
});