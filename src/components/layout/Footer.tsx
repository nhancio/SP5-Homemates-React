import React from 'react';
import { Mail, Instagram, Linkedin, Home, Phone, FileText, Shield, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-8 pb-16 md:pb-0">
      <div className="border-t border-gray-800 w-full mb-0" />
      <div className="container py-6 max-w-4xl mx-auto">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6">
          {/* Logo & Description */}
          <div className="flex flex-col space-y-3 mb-4 lg:mb-0 lg:w-1/3">
            <div className="flex items-center space-x-3">
              <img 
                src="/images/homemates-logo.jpeg" 
                alt="Homemates Logo" 
                className="h-6 w-6"
              />
              <span className="text-lg font-semibold text-white">Homemates</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs">
              Find your perfect home and flatmate with our smart matching algorithm.
            </p>
          </div>

          {/* Mobile: 2-column layout for policies and contact/socials */}
          <div className="lg:hidden w-full">
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column: Policies */}
              <div className="flex flex-col space-y-3">
                <h3 className="text-white font-semibold text-sm mb-2">Legal</h3>
                <div className="flex flex-col space-y-2">
                  <Link 
                    to="/privacy-policy" 
                    className="flex items-center hover:text-white transition text-sm"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    <span>Privacy Policy</span>
                  </Link>
                  <Link 
                    to="/terms-and-conditions" 
                    className="flex items-center hover:text-white transition text-sm"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Terms & Conditions</span>
                  </Link>
                  <Link 
                    to="/refund-policy" 
                    className="flex items-center hover:text-white transition text-sm"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    <span>Refund Policy</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Contact & Socials */}
              <div className="flex flex-col space-y-3">
                <h3 className="text-white font-semibold text-sm mb-2">Contact & Social</h3>
                <div className="flex flex-col space-y-2">
                  <a href="mailto:nithindidigam@gmail.com" className="flex items-center hover:text-white transition text-sm">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>Email Support</span>
                  </a>
                  <a href="tel:7095288950" className="flex items-center hover:text-white transition text-sm">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>Call Support</span>
                  </a>
                  {/* Social Media Links */}
                  <div className="flex items-center space-x-3 mt-2">
                    <a href="https://www.instagram.com/homemates.ai" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition" title="Instagram">
                      <Instagram className="w-5 h-5" />
                    </a>
                    <a href="https://www.linkedin.com/company/homemates-ai" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition" title="LinkedIn">
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a 
                      href="https://chat.whatsapp.com/Iu4iWfmQEVZB6UHRqHKRYt" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-green-400 transition"
                      title="WhatsApp Group"
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5 rounded-full" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Contact & Socials together */}
          <div className="hidden lg:flex lg:w-1/3">
            <div className="flex flex-col space-y-3">
              <h3 className="text-white font-semibold text-sm mb-2">Contact & Social</h3>
              <div className="flex flex-col space-y-2">
                <a href="mailto:nithindidigam@gmail.com" className="flex items-center hover:text-white transition text-sm">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>Email Support</span>
                </a>
                <a href="tel:7095288950" className="flex items-center hover:text-white transition text-sm">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>Call Support</span>
                </a>
                {/* Social Media Links */}
                <div className="flex items-center space-x-3 mt-2">
                  <a href="https://www.instagram.com/homemates.ai" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition" title="Instagram">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="https://www.linkedin.com/company/homemates-ai" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition" title="LinkedIn">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a 
                    href="https://chat.whatsapp.com/Iu4iWfmQEVZB6UHRqHKRYt" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-green-400 transition"
                    title="WhatsApp Group"
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5 rounded-full" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Policy Links */}
          <div className="hidden lg:flex lg:w-1/3">
            <div className="flex flex-col space-y-3">
              <h3 className="text-white font-semibold text-sm mb-2">Legal</h3>
              <div className="flex flex-col space-y-2">
                <Link 
                  to="/privacy-policy" 
                  className="flex items-center hover:text-white transition text-sm"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  <span>Privacy Policy</span>
                </Link>
                <Link 
                  to="/terms-and-conditions" 
                  className="flex items-center hover:text-white transition text-sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  <span>Terms & Conditions</span>
                </Link>
                <Link 
                  to="/refund-policy" 
                  className="flex items-center hover:text-white transition text-sm"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  <span>Refund Policy</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section with Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-800">
          {/* Copyright */}
          <div className="text-sm text-gray-500 text-center md:text-left">
            © 2024 Homemates. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;