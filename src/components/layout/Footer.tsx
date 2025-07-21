import React from 'react';
import { Mail, Instagram, Linkedin, Home, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-12">
      <div className="border-t border-gray-800 w-full mb-0" />
      <div className="container py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo & Copyright */}
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <img 
              src="/images/homemates-logo.jpeg" 
              alt="Homemates Logo" 
              className="h-8 w-8"
            />
            <span className="text-xl font-semibold text-white">Homemates</span>
          </div>
          {/* Social Media Links */}
          <div className="flex items-center space-x-6 bg-gray-800 rounded-full px-6 py-3 shadow-lg">
            <a href="https://www.instagram.com/homemates.ai" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition" title="Instagram">
              <Instagram className="w-7 h-7" />
            </a>
            <a href="https://www.linkedin.com/company/homemates-ai" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition" title="LinkedIn">
              <Linkedin className="w-7 h-7" />
            </a>
            <a 
              href="https://chat.whatsapp.com/Iu4iWfmQEVZB6UHRqHKRYt" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-green-400 transition"
              title="WhatsApp Group"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-7 h-7 rounded-full" />
            </a>
          </div>
          {/* Quick Links */}
          <div className="flex flex-col md:flex-row md:space-x-8 space-y-2 md:space-y-0 items-center">
            <a href="mailto:nithindidigam@gmail.com" className="flex items-center hover:text-white transition">
              <Mail className="w-5 h-5 mr-2" />
              <span>Contact</span>
            </a>
            <a href="tel:7095288950" className="flex items-center hover:text-white transition">
              <Phone className="w-5 h-5 mr-2" />
              <span>Call Support</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;