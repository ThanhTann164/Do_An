const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const { Op } = require('sequelize');
const initModels = require('../models/init-models');
const { encrypt, decrypt } = require('../Utils/encryption');

const models = initModels(sequelize);
const { conversations, messages, users } = models;

class ChatRepository {
    // Tìm hoặc tạo conversation giữa 2 users
    async findOrCreateConversation(user1Id, user2Id) {
        try {
            // Luôn lưu userId nhỏ hơn làm Participant1
            const [participant1, participant2] = user1Id < user2Id 
                ? [user1Id, user2Id] 
                : [user2Id, user1Id];

            // Tìm conversation hiện có
            let conversation = await conversations.findOne({
                where: {
                    Participant1ID: participant1,
                    Participant2ID: participant2
                }
            });

            if (!conversation) {
                try {
                    // Thử tạo conversation mới
                    conversation = await conversations.create({
                        Participant1ID: participant1,
                        Participant2ID: participant2,
                        LastMessageAt: new Date()
                    });
                } catch (createError) {
                    // Nếu lỗi duplicate (race condition), tìm lại
                    if (createError.name === 'SequelizeUniqueConstraintError') {
                        conversation = await conversations.findOne({
                            where: {
                                Participant1ID: participant1,
                                Participant2ID: participant2
                            }
                        });
                        if (!conversation) {
                            throw new Error('Không thể tạo hoặc tìm conversation');
                        }
                    } else {
                        throw createError;
                    }
                }
            }

            return conversation;
        } catch (error) {
            console.error('Error in findOrCreateConversation:', error);
            throw error;
        }
    }

    // Lấy tất cả conversations của user
    async getUserConversations(userId) {
        try {
            const userConversations = await conversations.findAll({
                where: {
                    [Op.or]: [
                        { Participant1ID: userId },
                        { Participant2ID: userId }
                    ]
                },
                include: [
                    {
                        model: users,
                        as: 'Participant1',
                        attributes: ['UserID', 'FullName', 'Email', 'Role']
                    },
                    {
                        model: users,
                        as: 'Participant2',
                        attributes: ['UserID', 'FullName', 'Email', 'Role']
                    }
                ],
                order: [['LastMessageAt', 'DESC']]
            });

            // Lấy tin nhắn cuối cùng và số tin chưa đọc cho mỗi conversation
            const conversationsWithDetails = await Promise.all(
                userConversations.map(async (conv) => {
                    const lastMessage = await messages.findOne({
                        where: { ConversationID: conv.ConversationID },
                        order: [['CreatedAt', 'DESC']],
                        limit: 1
                    });

                    const unreadCount = await messages.count({
                        where: {
                            ConversationID: conv.ConversationID,
                            SenderID: { [Op.ne]: userId },
                            IsRead: false
                        }
                    });

                    // Xác định người chat với user hiện tại
                    const otherUser = conv.Participant1ID === userId 
                        ? conv.Participant2 
                        : conv.Participant1;

                    return {
                        conversationId: conv.ConversationID,
                        otherUser: {
                            userId: otherUser.UserID,
                            fullName: otherUser.FullName,
                            email: otherUser.Email,
                            role: otherUser.Role
                        },
                        lastMessage: lastMessage ? {
                            text: lastMessage.MessageText,
                            createdAt: lastMessage.CreatedAt,
                            senderId: lastMessage.SenderID
                        } : null,
                        unreadCount,
                        lastMessageAt: conv.LastMessageAt
                    };
                })
            );

            return conversationsWithDetails;
        } catch (error) {
            console.error('Error in getUserConversations:', error);
            throw error;
        }
    }

    // Tạo message mới
    async createMessage(conversationId, senderId, messageText, messageType = 'text', metadata = null) {
        try {
            // Không mã hóa URL ảnh và property links
            const shouldEncrypt = messageType !== 'image' && messageType !== 'property_link';
            const messageTextToStore = shouldEncrypt ? encrypt(messageText) : messageText;

            const message = await messages.create({
                ConversationID: conversationId,
                SenderID: senderId,
                MessageText: messageTextToStore,
                MessageType: messageType,
                Metadata: metadata ? JSON.stringify(metadata) : null,
                IsEncrypted: shouldEncrypt,
                IsRead: false,
                CreatedAt: new Date()
            });

            // Cập nhật LastMessageAt trong conversation
            await conversations.update(
                { LastMessageAt: new Date() },
                { where: { ConversationID: conversationId } }
            );

            // Lấy thông tin sender
            const sender = await users.findOne({
                where: { UserID: senderId },
                attributes: ['UserID', 'FullName', 'Email', 'Role']
            });

            const messageData = {
                messageId: message.MessageID,
                MessageID: message.MessageID,
                conversationId: message.ConversationID,
                ConversationID: message.ConversationID,
                senderId: senderId,
                sender: {
                    userId: sender.UserID,
                    fullName: sender.FullName,
                    email: sender.Email,
                    role: sender.Role
                },
                messageText: messageText, // Trả về text đã giải mã
                messageType: messageType,
                metadata: metadata,
                isRead: message.IsRead,
                createdAt: message.CreatedAt || new Date().toISOString()
            };

            console.log('✅ Message created:', messageData);
            return messageData;
        } catch (error) {
            console.error('Error in createMessage:', error);
            throw error;
        }
    }

    // Lấy tất cả messages trong conversation
    async getConversationMessages(conversationId, userId, limit = 50, offset = 0) {
        try {
            const messagesList = await messages.findAll({
                where: { ConversationID: conversationId },
                include: [
                    {
                        model: users,
                        as: 'Sender',
                        attributes: ['UserID', 'FullName', 'Email', 'Role']
                    }
                ],
                order: [['CreatedAt', 'DESC']],
                limit,
                offset
            });

            return messagesList.map(msg => {
                // Giải mã tin nhắn nếu được mã hóa
                let decryptedText = msg.MessageText;
                
                // Chỉ giải mã nếu IsEncrypted = true hoặc 1
                console.log(`🔐 Message ${msg.MessageID}: IsEncrypted=${msg.IsEncrypted} (type: ${typeof msg.IsEncrypted}), Text length=${msg.MessageText?.length}`);
                if (msg.IsEncrypted === true || msg.IsEncrypted === 1) {
                    try {
                        const result = decrypt(msg.MessageText);
                        // Chỉ dùng kết quả giải mã nếu khác với text gốc
                        if (result && result !== msg.MessageText) {
                            decryptedText = result;
                            console.log(`✅ Message ${msg.MessageID} decrypted: ${decryptedText.substring(0, 50)}...`);
                        } else {
                            console.log(`⚠️ Message ${msg.MessageID} decryption returned same text`);
                        }
                    } catch (err) {
                        console.error(`❌ Failed to decrypt message ${msg.MessageID}:`, err);
                        decryptedText = msg.MessageText;
                    }
                } else {
                    console.log(`ℹ️ Message ${msg.MessageID} not encrypted, using original text`);
                }

                // Parse metadata nếu có
                let metadata = null;
                if (msg.Metadata) {
                    try {
                        metadata = typeof msg.Metadata === 'string' 
                            ? JSON.parse(msg.Metadata) 
                            : msg.Metadata;
                    } catch (err) {
                        console.error('Failed to parse metadata:', err);
                    }
                }

                return {
                    messageId: msg.MessageID,
                    conversationId: msg.ConversationID,
                    sender: {
                        userId: msg.Sender.UserID,
                        fullName: msg.Sender.FullName,
                        email: msg.Sender.Email,
                        role: msg.Sender.Role
                    },
                    messageText: decryptedText,
                    messageType: msg.MessageType || 'text',
                    metadata: metadata,
                    isRead: msg.IsRead,
                    createdAt: msg.CreatedAt,
                    isMine: msg.SenderID === userId
                };
            }).reverse(); // Đảo ngược để tin nhắn cũ nhất ở trên
        } catch (error) {
            console.error('Error in getConversationMessages:', error);
            throw error;
        }
    }

    // Đánh dấu messages là đã đọc
    async markMessagesAsRead(conversationId, userId) {
        try {
            await messages.update(
                { IsRead: true },
                {
                    where: {
                        ConversationID: conversationId,
                        SenderID: { [Op.ne]: userId },
                        IsRead: false
                    }
                }
            );
            return true;
        } catch (error) {
            console.error('Error in markMessagesAsRead:', error);
            throw error;
        }
    }

    // Lấy tổng số tin chưa đọc của user
    async getUnreadCount(userId) {
        try {
            // Lấy tất cả conversations của user
            const userConversations = await conversations.findAll({
                where: {
                    [Op.or]: [
                        { Participant1ID: userId },
                        { Participant2ID: userId }
                    ]
                },
                attributes: ['ConversationID']
            });

            const conversationIds = userConversations.map(c => c.ConversationID);

            const count = await messages.count({
                where: {
                    ConversationID: { [Op.in]: conversationIds },
                    SenderID: { [Op.ne]: userId },
                    IsRead: false
                }
            });

            return count;
        } catch (error) {
            console.error('Error in getUnreadCount:', error);
            throw error;
        }
    }

    // Lấy thông tin user theo role
    async getUsersByRole(role) {
        try {
            const usersList = await users.findAll({
                where: { Role: role, Status: 'Active' },
                attributes: ['UserID', 'FullName', 'Email', 'Role']
            });
            return usersList;
        } catch (error) {
            console.error('Error in getUsersByRole:', error);
            throw error;
        }
    }
}

module.exports = new ChatRepository();

