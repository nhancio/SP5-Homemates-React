import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Search, X, Mic, MicOff } from 'lucide-react';

const SUGGESTIONS = [
  '2BHK in Bangalore under 30k',
  'Female flatmates in Hyderabad',
  'Software engineers in Pune',
  'Friends who like cricket in Mumbai',
  'Male, 25-30, in Chennai',
  'Shared homes in Delhi for students',
  'Flats for rent in Noida',
  'People interested in music in Kolkata',
];

interface AIQueryBoxProps {
  onFiltersExtracted: (filters: any) => void;
  placeholder?: string;
  suggestions?: string[];
}

const AIQueryBox: React.FC<AIQueryBoxProps> = ({ onFiltersExtracted, placeholder, suggestions }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/ai/parse-query', { query });
      onFiltersExtracted(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to parse query');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setError(null);
  };

  const handleSuggestion = (s: string) => {
    setQuery(s);
    setTimeout(handleSearch, 100);
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
      setError('Voice search not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setListening(false);
      setTimeout(handleSearch, 100);
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

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="flex items-center bg-white rounded-2xl shadow-md border border-gray-200 px-4 py-2 focus-within:ring-2 focus-within:ring-primary-200 transition">
        <Search className="w-5 h-5 text-primary-500 mr-2" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder || 'Ask for properties or friends, e.g. 2BHK in Bangalore under 30k'}
          className="flex-1 bg-transparent outline-none text-base py-2"
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
        />
        <button
          onClick={handleMicClick}
          className={`ml-2 p-1 rounded-full ${listening ? 'bg-primary-100' : 'bg-gray-100'} hover:bg-primary-200 transition`}
          aria-label={listening ? 'Stop listening' : 'Start voice input'}
          type="button"
        >
          {listening ? <Mic className="w-5 h-5 text-primary-600 animate-pulse" /> : <MicOff className="w-5 h-5 text-gray-400" />}
        </button>
        {query && !loading && (
          <button onClick={handleClear} className="ml-2 text-gray-400 hover:text-primary-600 transition">
            <X className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={handleSearch}
          disabled={loading}
          className="ml-2 px-4 py-2 rounded-xl bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 transition disabled:opacity-60"
        >
          {loading ? 'Searching...' : 'Ask AI'}
        </button>
      </div>
      {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {(suggestions || SUGGESTIONS).map((s, i) => (
          <button
            key={i}
            className="px-3 py-1 rounded-full bg-gray-100 hover:bg-primary-50 text-gray-700 hover:text-primary-700 border border-gray-200 text-xs font-medium transition"
            onClick={() => handleSuggestion(s)}
            type="button"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AIQueryBox; 