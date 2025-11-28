import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
        this.isConnecting = false;
    }

    connect(token) {
        if (this.socket?.connected) {
            console.log('✅ WebSocket already connected');
            return this.socket;
        }

        if (this.isConnecting) {
            console.log('⏳ WebSocket connection in progress...');
            return;
        }

        this.isConnecting = true;
        console.log('🔌 Connecting to WebSocket:', SOCKET_URL);
        console.log('🔑 Using token:', token ? 'Yes' : 'No');

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            console.log('✅ WebSocket connected! Socket ID:', this.socket.id);
            this.isConnecting = false;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ WebSocket disconnected:', reason);
            this.isConnecting = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ WebSocket connection error:', error.message);
            this.isConnecting = false;
        });

        // Xử lý các events từ server
        this.socket.on('new_message', (message) => {
            console.log('📨 [WebSocket] Received new_message:', {
                messageId: message.messageId || message.MessageID,
                conversationId: message.conversationId || message.ConversationID,
                text: message.messageText?.substring(0, 50)
            });
            this.emit('new_message', message);
        });

        this.socket.on('user_typing', (data) => {
            console.log('⌨️ [WebSocket] Received user_typing:', data);
            this.emit('user_typing', data);
        });

        this.socket.on('messages_read', (data) => {
            console.log('✓ [WebSocket] Received messages_read:', data);
            this.emit('messages_read', data);
        });

        // Xử lý thông báo mới
        this.socket.on('new_notification', (notification) => {
            console.log('🔔 [WebSocket] Received new_notification:', notification);
            this.emit('new_notification', notification);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            console.log('🔌 Disconnecting WebSocket');
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinConversation(conversationId) {
        if (this.socket?.connected) {
            console.log('🚪 [WebSocket] Joining conversation:', conversationId);
            this.socket.emit('join_conversation', conversationId);
        } else {
            console.error('❌ Cannot join conversation: Socket not connected');
        }
    }

    leaveConversation(conversationId) {
        if (this.socket?.connected) {
            console.log('🚪 [WebSocket] Leaving conversation:', conversationId);
            this.socket.emit('leave_conversation', conversationId);
        }
    }

    sendTypingIndicator(conversationId, isTyping) {
        if (this.socket?.connected) {
            this.socket.emit('typing', { conversationId, isTyping });
        }
    }

    // Event emitter pattern
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        console.log(`📝 Registered listener for event: ${event}`);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
                console.log(`📝 Removed listener for event: ${event}`);
            }
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            console.log(`📢 Emitting event '${event}' to ${callbacks.length} listener(s)`);
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in listener for ${event}:`, error);
                }
            });
        } else {
            console.warn(`⚠️ No listeners registered for event: ${event}`);
        }
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}

export default new WebSocketService();
