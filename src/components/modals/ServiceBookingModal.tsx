import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, MapPin } from 'lucide-react';
import { Service } from '../../types/service';

interface ServiceBookingModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (bookingData: BookingData) => void;
}

interface BookingData {
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  address: string;
  specialInstructions: string;
}

const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({
  service,
  isOpen,
  onClose,
  onBook
}) => {
  const [bookingData, setBookingData] = useState<BookingData>({
    serviceId: service?.id || '',
    serviceName: service?.name || '',
    date: '',
    time: '',
    name: '',
    phone: '',
    address: '',
    specialInstructions: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBook(bookingData);
    onClose();
  };

  const handleInputChange = (field: keyof BookingData, value: string) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Book Service</h2>
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="font-medium text-gray-900">{service.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
            <div className="flex items-center mt-2 text-sm text-gray-700">
              <Clock className="w-4 h-4 mr-1" />
              <span>{service.duration}</span>
              <span className="mx-2">•</span>
              <span className="font-medium text-primary-600">₹{service.price}/hr</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={bookingData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Time
              </label>
              <input
                type="time"
                required
                value={bookingData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="w-full input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Your Name
            </label>
            <input
              type="text"
              required
              value={bookingData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full input"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={bookingData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full input"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Service Address
            </label>
            <textarea
              required
              value={bookingData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full input"
              rows={3}
              placeholder="Enter the address where you need the service"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Instructions (Optional)
            </label>
            <textarea
              value={bookingData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              className="w-full input"
              rows={2}
              placeholder="Any special requirements or instructions"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
            >
              Book Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceBookingModal; 