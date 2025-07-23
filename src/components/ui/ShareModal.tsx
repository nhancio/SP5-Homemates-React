import React, { useState } from 'react';
import { X, Share2, Mail, Smartphone, Copy, Check } from 'lucide-react';
import QRCode from 'react-qr-code';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: {
    title: string;
    text: string;
    url: string;
  };
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareData }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(`${shareData.text}\n${shareData.url}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(shareData.title);
    const body = encodeURIComponent(`${shareData.text}\n\n${shareData.url}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const shareOptions = [
    {
      icon: <Share2 className="w-5 h-5" />,
      label: 'Share',
      onClick: handleNativeShare,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      icon: <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5" />,
      label: 'WhatsApp',
      onClick: handleWhatsAppShare,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: 'Email',
      onClick: handleEmailShare,
      color: 'bg-gray-500 hover:bg-gray-600',
    },
    {
      icon: copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />,
      label: copied ? 'Copied!' : 'Copy Link',
      onClick: handleCopyLink,
      color: copied ? 'bg-green-500' : 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-black dark:text-white">Share Property</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* QR Code Section */}
        <div className="mb-6 text-center">
          <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block">
            <QRCode
              value={shareData.url}
              size={120}
              level="M"
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
          </div>
          <p className="text-sm text-black dark:text-white mt-2">Scan to view property</p>
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {shareOptions.map((option, index) => (
            <button
              key={index}
              onClick={option.onClick}
              className={`${option.color} text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        {/* Property Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-black dark:text-white mb-2">{shareData.title}</h3>
          <p className="text-sm text-black dark:text-white line-clamp-2">{shareData.text}</p>
          <div className="mt-2 text-xs text-black dark:text-white break-all">{shareData.url}</div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal; 