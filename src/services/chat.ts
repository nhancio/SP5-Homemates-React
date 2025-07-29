import { collection, addDoc, query, where, orderBy, getDocs, updateDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  timestamp: Date;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Date;
  lastMessageSenderId: string;
  unreadCount: number;
  isRead: boolean;
}

// Firebase collections
const MESSAGES_COLLECTION = 'messages';
const CONVERSATIONS_COLLECTION = 'conversations';

// Push notification function
const sendPushNotification = (title: string, body: string, icon?: string) => {
  // Check if browser supports notifications
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return;
  }

  // Request permission if not granted
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body, icon });
      }
    });
  } else if (Notification.permission === 'granted') {
    new Notification(title, { body, icon });
  }
};

export const saveMessage = async (message: Omit<Message, 'id' | 'timestamp' | 'isRead'>): Promise<Message> => {
  try {
    // Create message object with unique ID
    const newMessage: Message = {
      ...message,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      isRead: false,
    };

    // Save to Firebase first (for cross-device sync)
    try {
      const messageData = {
        ...message,
        timestamp: serverTimestamp(),
        isRead: false,
      };
      
      const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageData);
      console.log('Message saved to Firebase:', docRef.id);
      
      // Update conversation in Firebase immediately
      await updateConversation(newMessage);
      
      // Send push notification to recipient
      sendPushNotification(
        `New message from ${message.senderName}`,
        message.text,
        '/images/homemates-logo.png'
      );
      
      // Also update localStorage for immediate local access
      const existingMessages = JSON.parse(localStorage.getItem('homemates_chat_messages') || '[]');
      existingMessages.push(newMessage);
      localStorage.setItem('homemates_chat_messages', JSON.stringify(existingMessages));

      // Update conversation in localStorage
      const participants = [message.senderId, message.recipientId].sort();
      const conversationId = participants.join('_');
      
      const existingConversations = JSON.parse(localStorage.getItem('homemates_chat_conversations') || '[]');
      const conversationIndex = existingConversations.findIndex((conv: any) => conv.id === conversationId);
      
      const conversationData = {
        id: conversationId,
        participants,
        lastMessage: message.text,
        lastMessageTime: newMessage.timestamp,
        lastMessageSenderId: message.senderId,
        unreadCount: 0,
        isRead: true,
      };
      
      if (conversationIndex >= 0) {
        existingConversations[conversationIndex] = conversationData;
      } else {
        existingConversations.push(conversationData);
      }
      
      localStorage.setItem('homemates_chat_conversations', JSON.stringify(existingConversations));
      
      return newMessage;
    } catch (firebaseError) {
      console.error('Firebase save failed:', firebaseError);
      
      // Fallback to localStorage only if Firebase fails
      const existingMessages = JSON.parse(localStorage.getItem('homemates_chat_messages') || '[]');
      existingMessages.push(newMessage);
      localStorage.setItem('homemates_chat_messages', JSON.stringify(existingMessages));

      // Update conversation in localStorage
      const participants = [message.senderId, message.recipientId].sort();
      const conversationId = participants.join('_');
      
      const existingConversations = JSON.parse(localStorage.getItem('homemates_chat_conversations') || '[]');
      const conversationIndex = existingConversations.findIndex((conv: any) => conv.id === conversationId);
      
      const conversationData = {
        id: conversationId,
        participants,
        lastMessage: message.text,
        lastMessageTime: newMessage.timestamp,
        lastMessageSenderId: message.senderId,
        unreadCount: 0,
        isRead: true,
      };
      
      if (conversationIndex >= 0) {
        existingConversations[conversationIndex] = conversationData;
      } else {
        existingConversations.push(conversationData);
      }
      
      localStorage.setItem('homemates_chat_conversations', JSON.stringify(existingConversations));
      
      return newMessage;
    }
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

export const getMessages = async (userId1: string, userId2: string): Promise<Message[]> => {
  try {
    // Try Firebase first (for cross-device sync)
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('senderId', 'in', [userId1, userId2]),
      where('recipientId', 'in', [userId1, userId2]),
      orderBy('timestamp', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const messages: Message[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        text: data.text,
        senderId: data.senderId,
        senderName: data.senderName,
        recipientId: data.recipientId,
        recipientName: data.recipientName,
        timestamp: data.timestamp?.toDate() || new Date(),
        isRead: data.isRead,
      });
    });
    
    return messages;
  } catch (error) {
    console.error('Firebase failed, using localStorage fallback:', error);
    
    // Fallback to localStorage only if Firebase fails
    const allMessages = JSON.parse(localStorage.getItem('homemates_chat_messages') || '[]');
    const filteredMessages = allMessages.filter((msg: any) => {
      return (msg.senderId === userId1 && msg.recipientId === userId2) ||
             (msg.senderId === userId2 && msg.recipientId === userId1);
    });
    
    return filteredMessages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  }
};

export const getConversations = async (userId: string): Promise<ChatConversation[]> => {
  try {
    // Try Firebase first (for cross-device sync)
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const conversations: ChatConversation[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      conversations.push({
        id: doc.id,
        participants: data.participants,
        lastMessage: data.lastMessage,
        lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
        lastMessageSenderId: data.lastMessageSenderId,
        unreadCount: data.unreadCount || 0,
        isRead: data.isRead || false,
      });
    });
    
    return conversations;
  } catch (error) {
    console.error('Firebase failed, using localStorage fallback:', error);
    
    // Fallback to localStorage only if Firebase fails
    const storedConversations = JSON.parse(localStorage.getItem('homemates_chat_conversations') || '[]');
    const userConversations = storedConversations.filter((conv: any) => 
      conv.participants.includes(userId)
    );
    
    if (userConversations.length > 0) {
      // Remove duplicates by conversation ID
      const uniqueConversations = userConversations.reduce((acc: any[], conv: any) => {
        const existingIndex = acc.findIndex(existing => existing.id === conv.id);
        if (existingIndex >= 0) {
          // Keep the most recent one
          if (new Date(conv.lastMessageTime) > new Date(acc[existingIndex].lastMessageTime)) {
            acc[existingIndex] = conv;
          }
        } else {
          acc.push(conv);
        }
        return acc;
      }, []);
      
      return uniqueConversations.map((conv: any) => ({
        ...conv,
        lastMessageTime: new Date(conv.lastMessageTime),
      })).sort((a: any, b: any) => 
        b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
      );
    }
    
    // Fallback to creating conversations from messages
    const allMessages = JSON.parse(localStorage.getItem('homemates_chat_messages') || '[]');
    const userMessages = allMessages.filter((msg: any) => 
      msg.senderId === userId || msg.recipientId === userId
    );
    
    // Group messages by conversation
    const conversationMap = new Map();
    
    userMessages.forEach((msg: any) => {
      const otherUserId = msg.senderId === userId ? msg.recipientId : msg.senderId;
      const conversationId = [userId, otherUserId].sort().join('_');
      
      if (!conversationMap.has(conversationId)) {
        conversationMap.set(conversationId, {
          id: conversationId,
          participants: [userId, otherUserId].sort(),
          lastMessage: msg.text,
          lastMessageTime: new Date(msg.timestamp),
          lastMessageSenderId: msg.senderId,
          unreadCount: msg.senderId === userId ? 0 : 1,
          isRead: msg.senderId === userId,
        });
      } else {
        const existing = conversationMap.get(conversationId);
        if (new Date(msg.timestamp) > existing.lastMessageTime) {
          existing.lastMessage = msg.text;
          existing.lastMessageTime = new Date(msg.timestamp);
          existing.lastMessageSenderId = msg.senderId;
          existing.unreadCount = msg.senderId === userId ? 0 : 1;
          existing.isRead = msg.senderId === userId;
        }
      }
    });
    
    return Array.from(conversationMap.values()).sort((a, b) => 
      b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
    );
  }
};

const updateConversation = async (message: Message) => {
  try {
    const participants = [message.senderId, message.recipientId].sort();
    const conversationId = participants.join('_');
    
    // Get current conversation data
    const conversationDoc = await getDocs(query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('participants', '==', participants)
    ));
    
    if (!conversationDoc.empty) {
      // Update existing conversation
      const existingConversation = conversationDoc.docs[0];
      const currentData = existingConversation.data();
      
      const conversationData = {
        lastMessage: message.text,
        lastMessageTime: serverTimestamp(),
        lastMessageSenderId: message.senderId,
        // Increment unread count only if message is from other person
        unreadCount: message.senderId === currentData.participants[0] 
          ? currentData.unreadCount || 0 
          : (currentData.unreadCount || 0) + 1,
        isRead: message.senderId === currentData.participants[0],
      };
      
      await updateDoc(existingConversation.ref, conversationData);
    } else {
      // Create new conversation
      const conversationData = {
        participants,
        lastMessage: message.text,
        lastMessageTime: serverTimestamp(),
        lastMessageSenderId: message.senderId,
        unreadCount: 0,
        isRead: true,
      };
      
      await addDoc(collection(db, CONVERSATIONS_COLLECTION), conversationData);
    }
  } catch (error) {
    console.error('Error updating conversation:', error);
  }
};

export const markConversationAsRead = async (conversationId: string) => {
  try {
    // Find the conversation by participants
    const participants = conversationId.split('_').sort();
    const conversationDoc = await getDocs(query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('participants', '==', participants)
    ));
    
    if (!conversationDoc.empty) {
      const conversationRef = conversationDoc.docs[0].ref;
      await updateDoc(conversationRef, {
        unreadCount: 0,
        isRead: true,
      });
    }
  } catch (error) {
    console.error('Error marking conversation as read:', error);
  }
};

// Real-time listeners
export const subscribeToMessages = (
  userId1: string, 
  userId2: string, 
  callback: (messages: Message[]) => void
) => {
  try {
    // Try Firebase first (for cross-device sync)
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('senderId', 'in', [userId1, userId2]),
      where('recipientId', 'in', [userId1, userId2]),
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const messages: Message[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          text: data.text,
          senderId: data.senderId,
          senderName: data.senderName,
          recipientId: data.recipientId,
          recipientName: data.recipientName,
          timestamp: data.timestamp?.toDate() || new Date(),
          isRead: data.isRead,
        });
      });
      callback(messages);
    });
  } catch (error) {
    console.error('Firebase subscription failed, using localStorage polling:', error);
    
    // Fallback to localStorage polling (device-specific only)
    const pollInterval = setInterval(() => {
      try {
        const allMessages = JSON.parse(localStorage.getItem('homemates_chat_messages') || '[]');
        const filteredMessages = allMessages.filter((msg: any) => {
          return (msg.senderId === userId1 && msg.recipientId === userId2) ||
                 (msg.senderId === userId2 && msg.recipientId === userId1);
        });
        
        const messages = filteredMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        
        callback(messages);
      } catch (pollError) {
        console.error('Error polling localStorage:', pollError);
      }
         }, 500); // Poll every 500ms for faster sync
    
    return () => {
      clearInterval(pollInterval);
    };
  }
};

export const subscribeToConversations = (
  userId: string,
  callback: (conversations: ChatConversation[]) => void
) => {
  try {
    // Try Firebase first (for cross-device sync)
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const conversations: ChatConversation[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        conversations.push({
          id: doc.id,
          participants: data.participants,
          lastMessage: data.lastMessage,
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
          lastMessageSenderId: data.lastMessageSenderId,
          unreadCount: data.unreadCount || 0,
          isRead: data.isRead || false,
        });
      });
      callback(conversations);
    }, (error) => {
      console.error('Firebase onSnapshot error:', error);
      // If Firebase fails, fall back to polling
      startPolling();
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Firebase subscription failed, using localStorage polling:', error);
    return startPolling();
  }
  
  function startPolling() {
    // Fallback to localStorage polling (device-specific only) - like WhatsApp
    const pollInterval = setInterval(() => {
      try {
        // Try to get conversations from localStorage first
        const storedConversations = JSON.parse(localStorage.getItem('homemates_chat_conversations') || '[]');
        const userConversations = storedConversations.filter((conv: any) => 
          conv.participants.includes(userId)
        );
        
        if (userConversations.length > 0) {
          // Remove duplicates by conversation ID
          const uniqueConversations = userConversations.reduce((acc: any[], conv: any) => {
            const existingIndex = acc.findIndex(existing => existing.id === conv.id);
            if (existingIndex >= 0) {
              // Keep the most recent one
              if (new Date(conv.lastMessageTime) > new Date(acc[existingIndex].lastMessageTime)) {
                acc[existingIndex] = conv;
              }
            } else {
              acc.push(conv);
            }
            return acc;
          }, []);
          
          const conversations = uniqueConversations.map((conv: any) => ({
            ...conv,
            lastMessageTime: new Date(conv.lastMessageTime),
          })).sort((a: any, b: any) => 
            b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
          );
          
          callback(conversations);
          return;
        }
        
        // Fallback to creating conversations from messages
        const allMessages = JSON.parse(localStorage.getItem('homemates_chat_messages') || '[]');
        const userMessages = allMessages.filter((msg: any) => 
          msg.senderId === userId || msg.recipientId === userId
        );
        
        // Group messages by conversation
        const conversationMap = new Map();
        
        userMessages.forEach((msg: any) => {
          const otherUserId = msg.senderId === userId ? msg.recipientId : msg.senderId;
          const conversationId = [userId, otherUserId].sort().join('_');
          
          if (!conversationMap.has(conversationId)) {
            conversationMap.set(conversationId, {
              id: conversationId,
              participants: [userId, otherUserId].sort(),
              lastMessage: msg.text,
              lastMessageTime: new Date(msg.timestamp),
              lastMessageSenderId: msg.senderId,
              unreadCount: msg.senderId === userId ? 0 : 1,
              isRead: msg.senderId === userId,
            });
          } else {
            const existing = conversationMap.get(conversationId);
            if (new Date(msg.timestamp) > existing.lastMessageTime) {
              existing.lastMessage = msg.text;
              existing.lastMessageTime = new Date(msg.timestamp);
              existing.lastMessageSenderId = msg.senderId;
              existing.unreadCount = msg.senderId === userId ? 0 : 1;
              existing.isRead = msg.senderId === userId;
            }
          }
        });
        
        const conversations = Array.from(conversationMap.values()).sort((a, b) => 
          b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
        );
        
        callback(conversations);
      } catch (pollError) {
        console.error('Error polling localStorage:', pollError);
      }
    }, 500); // Poll every 500ms for faster sync
    
    // Return cleanup function
    return () => {
      clearInterval(pollInterval);
    };
  }
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.log('Notification permission denied');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}; 