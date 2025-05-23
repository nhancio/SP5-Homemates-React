import React from 'react';
import { Mail, Instagram, Linkedin, MessageCircle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo & Copyright */}
          <div className="flex items-center space-x-2">
            <img 
              src="/images/homemates-logo.jpeg" 
              alt="Homemates Logo" 
              className="h-6 w-6"
            />
            <span className="text-lg font-semibold text-white">Homemates</span>
          </div>
          
          {/* Social Media Links */}
          <div className="flex items-center space-x-4">
            <a href="https://www.instagram.com/homemates.ai/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://www.linkedin.com/company/homemates-ai" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              <Linkedin className="w-5 h-5" />
            </a>
            <a 
              href="https://chat.whatsapp.com/Iu4iWfmQEVZB6UHRqHKRYt" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
          
          {/* Quick Links */}
          <div className="flex space-x-6">
            <a href="mailto:nithindidigam@gmail.com" className="flex items-center hover:text-white transition">
              <Mail className="w-4 h-4 mr-1" />
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;