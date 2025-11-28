import websocketService from '../services/websocket';
import { chatAPI } from '../services/chat.api';

// Khởi tạo WebSocket connection khi app load
export async function initializeWebSocket() {
    const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
    
    if (!token) {
        console.warn('⚠️ [WebSocketInit] No token found, skipping WebSocket connection');
        return;
    }

    console.log('🔌 [WebSocketInit] Initializing WebSocket connection...');
    
    if (websocketService.isConnected()) {
        console.log('✅ [WebSocketInit] WebSocket already connected');
        await joinAllConversations();
        return;
    }

    // Kết nối WebSocket
    const socket = websocketService.connect(token);
    
    if (!socket) {
        console.error('❌ [WebSocketInit] Failed to create socket');
        return;
    }

    // Đợi kết nối thành công
    socket.once('connect', async () => {
        console.log('✅ [WebSocketInit] Connected successfully!');
        
        // Đợi 500ms để đảm bảo kết nối ổn định
        setTimeout(async () => {
            await joinAllConversations();
        }, 500);
    });

    socket.on('connect_error', (error) => {
        console.error('❌ [WebSocketInit] Connection error:', error.message);
    });
}

// Join tất cả conversations của user
async function joinAllConversations() {
    if (!websocketService.isConnected()) {
        console.warn('⚠️ [WebSocketInit] Socket not connected, cannot join conversations');
        return;
    }

    try {
        console.log('📋 [WebSocketInit] Fetching conversations...');
        const result = await chatAPI.getConversations();
        
        if (result.success && result.data && result.data.length > 0) {
            console.log(`🚪 [WebSocketInit] Joining ${result.data.length} conversation(s)...`);
            
            result.data.forEach((conv, index) => {
                setTimeout(() => {
                    websocketService.joinConversation(conv.conversationId);
                }, index * 100); // Stagger joins by 100ms
            });
        } else {
            console.log('📭 [WebSocketInit] No conversations to join');
        }
    } catch (error) {
        console.error('❌ [WebSocketInit] Error joining conversations:', error);
    }
}

// Reconnect function
export function reconnectWebSocket() {
    const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
    
    if (token && !websocketService.isConnected()) {
        console.log('🔄 [WebSocketInit] Reconnecting WebSocket...');
        initializeWebSocket();
    }
}

