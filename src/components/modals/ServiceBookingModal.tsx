import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, MapPin } from 'lucide-react';
import { Service } from '../../types/service';
import * as Yup from 'yup';

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

const bookingSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  phone: Yup.string()
    .matches(/^[6-9][0-9]{9}$/, 'Enter a valid 10-digit mobile number')
    .required('Phone number is required'),
  date: Yup.string().required('Date is required'),
  time: Yup.string().required('Time is required'),
  address: Yup.string().min(10, 'Address should be at least 10 characters').required('Address is required'),
});

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

  const [errors, setErrors] = useState<any>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate with Yup
    try {
      await bookingSchema.validate(bookingData, { abortEarly: false });
      setErrors({});
      onBook(bookingData);
      onClose();
    } catch (err: any) {
      const errorMap: any = {};
      if (err.inner && err.inner.length > 0) {
        err.inner.forEach((e: any) => {
          if (e.path && e.message) errorMap[e.path] = e.message;
        });
      } else if (err.message) {
        errorMap.general = err.message;
      }
      setErrors(errorMap);
    }
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
                spellCheck={true}
                autoCorrect="on"
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
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
                spellCheck={true}
                autoCorrect="on"
              />
              {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
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
              spellCheck={true}
              autoCorrect="on"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
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
              spellCheck={false}
              autoCorrect="off"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
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
              spellCheck={true}
              autoCorrect="on"
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
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
              spellCheck={true}
              autoCorrect="on"
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