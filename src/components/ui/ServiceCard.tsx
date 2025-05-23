import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Service } from '../../types/service';

interface ServiceCardProps {
  service: Service;
  onBook: (serviceId: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onBook }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-property-card hover:shadow-lg transition-shadow duration-300">
      {/* Service Image */}
      <div className="h-40 bg-gray-200 relative">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Service Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-accent-500 text-white text-xs font-semibold px-2 py-1 rounded">
            {service.type}
          </span>
        </div>
      </div>
      
      {/* Service Information */}
      <div className="p-4">
        <h3 className="text-lg font-semibold">{service.name}</h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{service.description}</p>
        
        {/* Service Details */}
        <div className="flex items-center mt-3 text-sm text-gray-700">
          <Clock className="w-4 h-4 mr-1 text-gray-400" />
          <span>{service.duration}</span>
          <span className="mx-2">•</span>
          <span className="font-medium text-primary-600">{service.price}/hr</span>
        </div>
        
        {/* Availability */}
        <div className="flex items-center mt-2 text-sm text-gray-700">
          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
          <span>Next Available: {service.nextAvailable}</span>
        </div>
        
        {/* Book Button */}
        <button
          onClick={() => onBook(service.id)}
          className="w-full mt-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-md transition"
        >
          Book Service
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;