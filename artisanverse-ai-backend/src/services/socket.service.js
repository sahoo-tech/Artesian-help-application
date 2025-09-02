class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
    this.userRooms = new Map();
    this.activeChats = new Map();
  }

  initialize(io) {
    this.io = io;

    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        // Simple token verification for demo (in production, use JWT verification)
        socket.userId = token; // Using token as user ID for simplicity
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    console.log('✅ Socket.IO service initialized');
  }

  handleConnection(socket) {
    const userId = socket.userId;
    console.log(`📡 User ${userId} connected with socket ${socket.id}`);

    // Store user connection
    this.connectedUsers.set(userId, socket.id);

    // Join user-specific room
    socket.join(`user_${userId}`);

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Connected to ArtisanVerse real-time service',
      userId: userId,
      timestamp: new Date().toISOString()
    });

    // Setup event handlers
    this.setupEventHandlers(socket, userId);

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket, userId);
    });
  }

  setupEventHandlers(socket, userId) {
    // AI Chat events
    socket.on('ai_chat_message', (data) => {
      // Broadcast AI response to user
      socket.emit('ai_chat_response', {
        type: data.type || 'mentor',
        response: `AI Response to: ${data.message}`,
        timestamp: new Date().toISOString()
      });
    });

    // Product events
    socket.on('product_view', (productId) => {
      socket.to(`product_${productId}`).emit('product_activity', {
        type: 'view',
        productId,
        timestamp: new Date().toISOString()
      });
    });

    // Order events
    socket.on('order_update', (orderData) => {
      // Notify relevant users about order updates
      if (orderData.artisanId) {
        socket.to(`user_${orderData.artisanId}`).emit('new_order', {
          orderId: orderData.orderId,
          status: orderData.status,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Inventory events
    socket.on('inventory_check', (productId) => {
      // Simulate low inventory alert
      socket.emit('inventory_alert', {
        productId,
        message: 'Low stock alert',
        currentStock: Math.floor(Math.random() * 5),
        timestamp: new Date().toISOString()
      });
    });

    // General chat/messaging
    socket.on('join_room', (roomName) => {
      socket.join(roomName);
      socket.to(roomName).emit('user_joined', {
        userId,
        roomName,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('leave_room', (roomName) => {
      socket.leave(roomName);
      socket.to(roomName).emit('user_left', {
        userId,
        roomName,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('send_message', (data) => {
      const { roomName, message, type = 'text' } = data;

      socket.to(roomName).emit('new_message', {
        userId,
        message,
        type,
        roomName,
        timestamp: new Date().toISOString()
      });
    });

    // Workshop events
    socket.on('join_workshop', (workshopId) => {
      socket.join(`workshop_${workshopId}`);
      socket.to(`workshop_${workshopId}`).emit('participant_joined', {
        userId,
        workshopId,
        timestamp: new Date().toISOString()
      });
    });

    // Heartbeat for connection monitoring
    socket.on('heartbeat', () => {
      socket.emit('heartbeat_ack', { 
        timestamp: new Date().toISOString() 
      });
    });
  }

  handleDisconnection(socket, userId) {
    console.log(`📡 User ${userId} disconnected`);

    // Remove from connected users
    this.connectedUsers.delete(userId);

    // Clean up user rooms
    const userRooms = this.userRooms.get(userId);
    if (userRooms) {
      userRooms.forEach(room => {
        socket.leave(room);
      });
      this.userRooms.delete(userId);
    }
  }

  // Utility methods for sending notifications
  async sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId.toString());
    if (socketId) {
      this.io.to(socketId).emit(event, {
        ...data,
        timestamp: new Date().toISOString()
      });
      return true;
    }
    return false; // User not connected
  }

  async sendToRoom(roomName, event, data) {
    this.io.to(roomName).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  async broadcastToAll(event, data) {
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  async sendInventoryAlert(artisanId, products) {
    const alertData = {
      type: 'inventory_alert',
      products: products.map(p => ({
        id: p.id,
        title: p.title,
        currentStock: p.inStock || 0,
        threshold: p.lowStockThreshold || 5
      }))
    };

    await this.sendToUser(artisanId, 'inventory_alert', alertData);
  }

  async sendOrderUpdate(buyerId, order, status) {
    const updateData = {
      type: 'order_update',
      orderId: order.id,
      orderNumber: order.orderNumber,
      status
    };

    await this.sendToUser(buyerId, 'order_update', updateData);
  }

  async sendNewProductAlert(product) {
    // Broadcast to all connected users
    const alertData = {
      type: 'new_product',
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        category: product.category,
        artisanName: product.artisanName
      }
    };

    await this.broadcastToAll('new_product_alert', alertData);
  }

  getConnectionStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      activeChats: this.activeChats.size,
      totalRooms: Array.from(this.userRooms.values()).reduce((total, rooms) => total + rooms.size, 0)
    };
  }

  getUserStatus(userId) {
    return {
      isOnline: this.connectedUsers.has(userId.toString()),
      socketId: this.connectedUsers.get(userId.toString())
    };
  }
}

module.exports = new SocketService();
