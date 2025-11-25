import React, { useState, useEffect, useRef } from 'react';
import { Send, X, User } from 'lucide-react';
import { saveMessage, getMessages, Message, subscribeToMessages } from '../../services/chat';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: {
    id: string;
    name: string;
    photoURL?: string;
    isOnline?: boolean;
  };
  currentUser: {
    id: string;
    name: string;
  };
  onMessageSent?: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  recipient,
  currentUser,
  onMessageSent
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load existing messages and subscribe to real-time updates when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadMessages = async () => {
        try {
          const existingMessages = await getMessages(currentUser.id, recipient.id);
          setMessages(existingMessages);
        } catch (error) {
          console.error('Error loading messages:', error);
        }
      };
      loadMessages();

      // Subscribe to real-time message updates
      const unsubscribe = subscribeToMessages(currentUser.id, recipient.id, (updatedMessages) => {
        setMessages(updatedMessages);
      });

      // Focus the input field when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      // Cleanup subscription when modal closes
      return () => {
        unsubscribe();
      };
    }
  }, [isOpen, currentUser.id, recipient.id]);

  const handleSendMessage = async () => {
    console.log('handleSendMessage called with:', newMessage);
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        text: newMessage.trim(),
        senderId: currentUser.id,
        senderName: currentUser.name,
        recipientId: recipient.id,
        recipientName: recipient.name,
      };

      const savedMessage = await saveMessage(messageData);
      setMessages(prev => [...prev, savedMessage]);
      setNewMessage('');
      setIsLoading(true);
      setIsTyping(false);
      
      // Also save to localStorage as backup
      const existingMessages = JSON.parse(localStorage.getItem('homemates_chat_messages') || '[]');
      existingMessages.push(savedMessage);
      localStorage.setItem('homemates_chat_messages', JSON.stringify(existingMessages));

      // Call onMessageSent callback to refresh recent chats immediately (like WhatsApp)
      if (onMessageSent) {
        // Call immediately for instant update
        onMessageSent();
        // Call again after 200ms for faster sync
        setTimeout(() => {
          onMessageSent();
        }, 200);
        // Call again after 500ms to ensure sync
        setTimeout(() => {
          onMessageSent();
        }, 500);
        // Call again after 1 second for final sync
        setTimeout(() => {
          onMessageSent();
        }, 1000);
      }

      // Simulate message sending delay
      setTimeout(() => {
        setIsLoading(false);
        // Only show typing if recipient is online
        if (recipient.isOnline) {
          // Random chance to show typing (30% chance)
          if (Math.random() < 0.3) {
            setTimeout(() => {
              setIsRecipientTyping(true);
              setTimeout(() => {
                setIsRecipientTyping(false);
              }, 2000);
            }, 1000);
          }
        }
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Enter key pressed - calling handleSendMessage');
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
    } else if (isTyping && !e.target.value.trim()) {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {recipient.photoURL ? (
              <img
                src={recipient.photoURL}
                alt={recipient.name}
                className="w-10 h-10 rounded-full object-cover"
                onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/default-avatar.png'; }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{recipient.name}</h3>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${recipient.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <p className="text-sm text-gray-500">
                  {recipient.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>Start a conversation with {recipient.name}</p>
              <p className="text-sm mt-1">Send a message to begin chatting</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.senderId === currentUser.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.senderId === currentUser.id ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          {isRecipientTyping && recipient.isOnline && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 max-w-xs px-4 py-2 rounded-lg">
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500 ml-2">{recipient.name} is typing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
                         <textarea
               ref={inputRef}
               value={newMessage}
               onChange={handleInputChange}
               onKeyDown={handleKeyDown}
               placeholder="Type a message..."
               className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
               rows={2}
             />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
              className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal; 