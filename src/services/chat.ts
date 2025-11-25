/**
 * WhatsApp Chat Service
 * Redirects to WhatsApp instead of using in-app chat
 */

/**
 * Open WhatsApp chat with a phone number
 * @param phoneNumber - Phone number with country code (e.g., "919876543210")
 * @param message - Optional pre-filled message
 */
export const openWhatsAppChat = (phoneNumber: string, message?: string): void => {
  try {
    // Remove any non-digit characters
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    if (!cleanNumber) {
      alert('Invalid phone number');
      return;
    }

    // Format: https://wa.me/PHONENUMBER?text=MESSAGE
    let whatsappUrl = `https://wa.me/${cleanNumber}`;
    
    if (message) {
      const encodedMessage = encodeURIComponent(message);
      whatsappUrl += `?text=${encodedMessage}`;
    }

    // Open in new tab/window
    window.open(whatsappUrl, '_blank');
  } catch (error) {
    console.error('Error opening WhatsApp:', error);
    alert('Failed to open WhatsApp. Please check the phone number.');
  }
};

/**
 * Open WhatsApp chat from property listing
 * @param contactNumber - Contact number from property
 * @param propertyName - Optional property name for pre-filled message
 */
export const openWhatsAppFromProperty = (contactNumber: string, propertyName?: string): void => {
  const message = propertyName 
    ? `Hi, I'm interested in ${propertyName}. Can you provide more details?`
    : 'Hi, I\'m interested in your property listing. Can you provide more details?';
  
  openWhatsAppChat(contactNumber, message);
};

/**
 * Open WhatsApp chat from user profile
 * @param phoneNumber - User's phone number
 * @param userName - Optional user name for pre-filled message
 */
export const openWhatsAppFromUser = (phoneNumber: string, userName?: string): void => {
  const message = userName
    ? `Hi ${userName}, I found your profile on Homemates. Would like to connect!`
    : 'Hi, I found your profile on Homemates. Would like to connect!';
  
  openWhatsAppChat(phoneNumber, message);
};

// Legacy exports for backward compatibility (if any components still use these)
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

// Stub functions for backward compatibility
export const saveMessage = async (message: Omit<Message, 'id' | 'timestamp' | 'isRead'>): Promise<Message> => {
  // Redirect to WhatsApp instead
  openWhatsAppChat(message.recipientId, message.text);
  return {
    ...message,
    id: Date.now().toString(),
    timestamp: new Date(),
    isRead: false,
  };
};

export const getMessages = async (userId1: string, userId2: string): Promise<Message[]> => {
  // No messages stored, return empty array
  return [];
};

export const getConversations = async (userId: string): Promise<ChatConversation[]> => {
  // No conversations stored, return empty array
  return [];
};

export const markConversationAsRead = async (conversationId: string) => {
  // No-op
};

export const subscribeToMessages = (
  userId1: string, 
  userId2: string, 
  callback: (messages: Message[]) => void
): (() => void) => {
  // No-op, return cleanup function
  return () => {};
};

export const subscribeToConversations = (
  userId: string,
  callback: (conversations: ChatConversation[]) => void
): (() => void) => {
  // No-op, return cleanup function
  return () => {};
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  // No notifications needed for WhatsApp
  return false;
};
