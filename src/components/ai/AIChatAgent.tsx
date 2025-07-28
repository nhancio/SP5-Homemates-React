import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Mic, MicOff, Send } from 'lucide-react';

interface AIChatAgentProps {
  onFiltersExtracted: (filters: any) => void;
  placeholder?: string;
}

const AGENT_NAME = 'Homemate AI';
const AGENT_AVATAR = '/images/ai-avatar.png'; // Use your own avatar image

const initialMessages = [
  {
    sender: 'agent',
    text: 'Hi! I am your Homemate AI agent. How can I help you find a property today? You can type or use the mic.',
  },
];

const AIChatAgent: React.FC<AIChatAgentProps> = ({ onFiltersExtracted, placeholder }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setMessages(msgs => [...msgs, { sender: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      // Send to backend for intent extraction and agent response
      const response = await axios.post('/ai/parse-query', { query: text });
      // If filters found, call onFiltersExtracted
      if (response.data && Object.keys(response.data).length > 0) {
        onFiltersExtracted(response.data);
        setMessages(msgs => [
          ...msgs,
          {
            sender: 'agent',
            text: 'Here are some properties matching your request! (Scroll down to see results.)',
          },
        ]);
      } else {
        setMessages(msgs => [
          ...msgs,
          {
            sender: 'agent',
            text: "I'm sorry, I couldn't extract any property details from your message. Could you rephrase or provide more info?",
          },
        ]);
      }
    } catch (err) {
      setMessages(msgs => [
        ...msgs,
        {
          sender: 'agent',
          text: 'Sorry, there was an error processing your request. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Voice input logic
  const handleMicClick = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(msgs => [
        ...msgs,
        { sender: 'agent', text: 'Voice search not supported in this browser.' },
      ]);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
      setTimeout(() => sendMessage(transcript), 100);
    };
    recognition.onerror = () => {
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
    };
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  const handleSend = () => {
    sendMessage(input);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 rounded-2xl shadow-lg border border-gray-100 bg-white flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'agent' && (
              <img src={AGENT_AVATAR} alt={AGENT_NAME} className="w-8 h-8 rounded-full mr-2 self-end" />
            )}
            <div
              className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm shadow-md ${
                msg.sender === 'user'
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="flex items-center border-t border-gray-200 p-3 bg-white">
        <button
          onClick={handleMicClick}
          className={`mr-2 p-2 rounded-full ${listening ? 'bg-primary-100' : 'bg-gray-100'} hover:bg-primary-200 transition`}
          aria-label={listening ? 'Stop listening' : 'Start voice input'}
          type="button"
        >
          {listening ? <Mic className="w-5 h-5 text-primary-600 animate-pulse" /> : <MicOff className="w-5 h-5 text-gray-400" />}
        </button>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholder || 'Ask me to find a property for you!'}
          className="flex-1 bg-transparent outline-none text-base py-2 px-3"
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="ml-2 px-4 py-2 rounded-xl bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 transition disabled:opacity-60"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default AIChatAgent; 