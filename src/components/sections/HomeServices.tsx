import React from 'react';
import { Link } from 'react-router-dom';
import ServiceCard from '../ui/ServiceCard';
import { ArrowRight } from 'lucide-react';
import { getMockServices } from '../../data/services';

const HomeServices = () => {
  const services = getMockServices().slice(0, 6);
  
  const handleBookService = (serviceId: string) => {
    console.log(`Booking service with ID: ${serviceId}`);
    // Here we would navigate to a booking page or open a modal
  };
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Professional Home Services</h2>
            <p className="text-gray-600">Book verified professionals for all your home service needs</p>
          </div>
          <Link 
            to="/services" 
            className="flex items-center text-primary-600 hover:text-primary-700 mt-2 md:mt-0"
          >
            <span className="font-medium">View all services</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              onBook={handleBookService} 
            />
          ))}
        </div>
        
        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No services available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeServices;