import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/chat.api';
import websocketService from '../services/websocket';
import './ChatBox.css';

const ChatBox = ({ targetUser, onClose, initialMessage = null }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversationId, setConversationId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);
    const chatContainerRef = useRef(null);
    const propertyLinkSentRef = useRef(false);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle paste image
    useEffect(() => {
        const handlePaste = (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (file) {
                        handleImageFile(file);
                        e.preventDefault();
                    }
                }
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [conversationId]);

    // Handle drag and drop
    useEffect(() => {
        const container = chatContainerRef.current;
        if (!container) return;

        const handleDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
        };

        const handleDragLeave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.target === container) {
                setIsDragging(false);
            }
        };

        const handleDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    handleImageFile(file);
                }
            }
        };

        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('dragleave', handleDragLeave);
        container.addEventListener('drop', handleDrop);

        return () => {
            container.removeEventListener('dragover', handleDragOver);
            container.removeEventListener('dragleave', handleDragLeave);
            container.removeEventListener('drop', handleDrop);
        };
    }, [conversationId]);

    // Load conversation và messages
    useEffect(() => {
        // Kết nối WebSocket nếu chưa kết nối
        const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
        if (token && !websocketService.isConnected()) {
            websocketService.connect(token);
        }

        loadConversation();
        return () => {
            if (conversationId) {
                websocketService.leaveConversation(conversationId);
            }
        };
    }, [targetUser]);

    // Lắng nghe new messages
    useEffect(() => {
        if (!conversationId) return;

        const handleNewMessage = (message) => {
            console.log('📨 [ChatBox] Received new message:', message);
            console.log('📨 Message text:', message.messageText);
            console.log('📨 Message type:', message.messageType);
            
            const msgConvId = message.conversationId || message.ConversationID;
            if (msgConvId == conversationId) {
                // Lấy current user để xác định isMine
                const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
                let currentUserId = null;
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        currentUserId = payload.userId;
                    } catch (e) {
                        console.error('Error parsing token:', e);
                    }
                }

                // Set isMine dựa trên senderId
                const messageSenderId = message.senderId || message.sender?.userId;
                message.isMine = currentUserId && messageSenderId == currentUserId;

                setMessages(prev => {
                    const exists = prev.some(m => 
                        (m.messageId === message.messageId || m.MessageID === message.MessageID)
                    );
                    if (exists) return prev;
                    return [...prev, message];
                });
                
                // Đánh dấu đã đọc nếu không phải tin nhắn của mình
                if (!message.isMine) {
                    chatAPI.markAsRead(conversationId);
                }
            }
        };

        const handleTyping = (data) => {
            console.log('⌨️ [ChatBox] Typing indicator:', data);
            const targetId = targetUser.userId || targetUser.UserID;
            if (data.userId == targetId) {
                setIsTyping(data.isTyping);
            }
        };

        websocketService.on('new_message', handleNewMessage);
        websocketService.on('user_typing', handleTyping);

        return () => {
            websocketService.off('new_message', handleNewMessage);
            websocketService.off('user_typing', handleTyping);
        };
    }, [conversationId, targetUser]);

    const loadConversation = async () => {
        try {
            setIsLoading(true);
            console.log('Loading conversation with user:', targetUser);
            
            // Bắt đầu hoặc lấy conversation
            const convResult = await chatAPI.startConversation(targetUser.userId || targetUser.UserID);
            console.log('Start conversation result:', convResult);
            
            if (convResult.success) {
                const convId = convResult.data.conversationId;
                console.log('Conversation ID:', convId);
                setConversationId(convId);
                
                // Join conversation qua WebSocket
                websocketService.joinConversation(convId);
                console.log('Joined conversation via WebSocket');
                
                // Load messages
                const messagesResult = await chatAPI.getMessages(convId);
                console.log('Messages result:', messagesResult);
                console.log('First message text:', messagesResult.data[0]?.messageText);
                
                if (messagesResult.success) {
                    setMessages(messagesResult.data);
                    
                    // Gửi tin nhắn property link nếu có initialMessage
                    if (initialMessage && initialMessage.type === 'property_link' && !propertyLinkSentRef.current) {
                        // Kiểm tra xem property link này đã được gửi chưa (dựa vào URL)
                        const propertyLinkExists = messagesResult.data.some(m => 
                            m.messageType === 'property_link' && 
                            m.messageText === initialMessage.text
                        );
                        
                        if (!propertyLinkExists) {
                            console.log('Sending property link message:', initialMessage);
                            propertyLinkSentRef.current = true; // Đánh dấu đã gửi
                            
                            try {
                                // Gửi trực tiếp qua API
                                const result = await chatAPI.sendMessage(
                                    convId, 
                                    initialMessage.text, 
                                    initialMessage.type,
                                    initialMessage.metadata
                                );
                                if (result.success) {
                                    console.log('Property link sent successfully, will be received via WebSocket');
                                    // Không thêm vào messages ở đây, để WebSocket xử lý
                                    // Tin nhắn sẽ được thêm qua event 'new_message'
                                }
                            } catch (err) {
                                console.error('Error sending property link:', err);
                                propertyLinkSentRef.current = false; // Reset nếu lỗi
                            }
                        } else {
                            console.log('Property link already exists, skipping');
                            propertyLinkSentRef.current = true; // Đánh dấu đã có rồi
                        }
                    }
                }
                
                // Mark as read
                await chatAPI.markAsRead(convId);
            } else {
                console.error('Failed to start conversation:', convResult);
                alert('Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
            alert('Lỗi khi tải cuộc trò chuyện: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e, customMessage = null) => {
        if (e) e.preventDefault();
        
        const msgToSend = customMessage || { 
            text: newMessage.trim(), 
            type: 'text', 
            metadata: null 
        };
        
        if (!msgToSend.text || !conversationId) return;

        const messageText = msgToSend.text;
        const messageType = msgToSend.type || 'text';
        const metadata = msgToSend.metadata || null;
        
        setNewMessage(''); // Clear input ngay lập tức
        setSelectedImage(null); // Clear selected image

        try {
            const result = await chatAPI.sendMessage(conversationId, messageText, messageType, metadata);
            if (result.success) {
                console.log('Message sent successfully:', result.data);
                
                // Set isMine = true cho tin nhắn của mình
                result.data.isMine = true;
                
                // Thêm tin nhắn vào local ngay lập tức
                setMessages(prev => {
                    const exists = prev.some(m => 
                        (m.messageId === result.data.messageId || m.MessageID === result.data.MessageID)
                    );
                    if (!exists) {
                        return [...prev, result.data];
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Không thể gửi tin nhắn. Vui lòng thử lại.');
            setNewMessage(messageText); // Restore message nếu lỗi
        }
    };

    const handleImageFile = (file) => {
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert('Kích thước ảnh không được vượt quá 5MB');
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('Chỉ hỗ trợ file ảnh');
            return;
        }

        setSelectedImage(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageFile(file);
        }
    };

    const clearSelectedImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSendImage = async () => {
        if (!selectedImage || !conversationId) return;

        try {
            console.log('📤 Uploading image:', selectedImage.name);
            
            // Upload ảnh
            const uploadResult = await chatAPI.uploadImage(selectedImage);
            console.log('✅ Upload result:', uploadResult);
            
            if (uploadResult.success) {
                const imageUrl = uploadResult.data.imageUrl;
                console.log('🖼️ Image URL:', imageUrl);
                
                // Gửi tin nhắn với link ảnh
                await handleSendMessage(null, {
                    text: imageUrl,
                    type: 'image',
                    metadata: {
                        fileName: selectedImage.name,
                        fileSize: selectedImage.size
                    }
                });
                
                // Clear selected image
                clearSelectedImage();
            } else {
                console.error('❌ Upload failed:', uploadResult);
                alert('Upload ảnh thất bại: ' + (uploadResult.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('❌ Error sending image:', error);
            alert('Không thể gửi ảnh. Vui lòng thử lại.');
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        
        // Send typing indicator
        if (conversationId) {
            websocketService.sendTypingIndicator(conversationId, true);
            
            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            
            // Stop typing after 2 seconds
            typingTimeoutRef.current = setTimeout(() => {
                websocketService.sendTypingIndicator(conversationId, false);
            }, 2000);
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return '';
            }
            return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        } catch (err) {
            console.error('Error formatting time:', err);
            return '';
        }
    };

    return (
        <div className="chatbox-container" ref={chatContainerRef}>
            {isDragging && (
                <div className="chatbox-drag-overlay">
                    <div className="chatbox-drag-content">
                        <i className="fas fa-image" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                        <p>Thả ảnh vào đây</p>
                    </div>
                </div>
            )}
            
            <div className="chatbox-header">
                <div className="chatbox-header-info">
                    <div className="chatbox-avatar">
                        {(targetUser.fullName || targetUser.FullName || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                        <div className="chatbox-header-name">
                            {targetUser.fullName || targetUser.FullName}
                        </div>
                        <div className="chatbox-header-role">
                            {targetUser.role || targetUser.Role}
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="chatbox-close-btn">
                    ✕
                </button>
            </div>

            <div className="chatbox-messages">
                {isLoading ? (
                    <div className="chatbox-loading">Đang tải...</div>
                ) : messages.length === 0 ? (
                    <div className="chatbox-empty">
                        Bắt đầu cuộc trò chuyện
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        // Debug log
                        if (msg.messageType === 'image') {
                            console.log('🖼️ Rendering image message:', {
                                messageType: msg.messageType,
                                messageText: msg.messageText,
                                url: msg.messageText
                            });
                        }
                        
                        return (
                            <div 
                                key={msg.messageId || index} 
                                className={`chatbox-message ${msg.isMine ? 'mine' : 'theirs'}`}
                            >
                                <div className="chatbox-message-content">
                                    {msg.messageType === 'image' ? (
                                        <img 
                                            src={msg.messageText} 
                                            alt="Shared image" 
                                            className="chatbox-message-image"
                                            onClick={() => window.open(msg.messageText, '_blank')}
                                            onError={(e) => {
                                                console.error('❌ Image load error:', msg.messageText);
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = `<span style="color: red;">Không thể tải ảnh: ${msg.messageText}</span>`;
                                            }}
                                        />
                                    ) : msg.messageType === 'property_link' && msg.metadata ? (
                                    <div className="chatbox-property-link" style={{ color: msg.isMine ? 'white' : '#1f2937' }}>
                                        <div className="property-link-header">
                                            <i className="fas fa-home"></i>
                                            <span>Thông tin nhà</span>
                                        </div>
                                        <div className="property-link-content">
                                            {msg.metadata.title && <strong style={{ color: msg.isMine ? 'white' : '#1f2937' }}>{msg.metadata.title}</strong>}
                                            {msg.metadata.address && <p style={{ color: msg.isMine ? 'rgba(255,255,255,0.9)' : '#6b7280' }}>{msg.metadata.address}</p>}
                                            {msg.metadata.price && <p className="property-price" style={{ color: msg.isMine ? 'white' : '#0084ff' }}>{msg.metadata.price}</p>}
                                        </div>
                                        <a 
                                            href={msg.messageText} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="property-link-button"
                                        >
                                            Xem chi tiết
                                        </a>
                                    </div>
                                    ) : (
                                        <span>{msg.messageText || ''}</span>
                                    )}
                                </div>
                                <div className="chatbox-message-time">
                                    {formatTime(msg.createdAt)}
                                </div>
                            </div>
                        );
                    })
                )}
                {isTyping && (
                    <div className="chatbox-typing">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {imagePreview && (
                <div className="chatbox-image-preview">
                    <div className="chatbox-image-preview-content">
                        <img src={imagePreview} alt="Preview" />
                        <button 
                            className="chatbox-image-preview-close"
                            onClick={clearSelectedImage}
                            type="button"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="chatbox-image-preview-info">
                        <span>{selectedImage?.name}</span>
                        <span>{(selectedImage?.size / 1024).toFixed(1)} KB</span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="chatbox-input-form">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
                <button
                    type="button"
                    className="chatbox-attach-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    title="Gửi ảnh (hoặc paste/kéo thả)"
                >
                    <i className="fas fa-image"></i>
                </button>
                <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder={selectedImage ? `Đã chọn: ${selectedImage.name}` : "Nhập tin nhắn... (Ctrl+V để paste ảnh)"}
                    className="chatbox-input"
                    disabled={isLoading}
                />
                <button 
                    type="button"
                    className="chatbox-send-btn"
                    disabled={(!newMessage.trim() && !selectedImage) || isLoading}
                    onClick={(e) => {
                        e.preventDefault();
                        if (selectedImage) {
                            handleSendImage();
                        } else {
                            handleSendMessage(e);
                        }
                    }}
                >
                    <i className="fas fa-paper-plane"></i>
                </button>
            </form>
        </div>
    );
};

export default ChatBox;

