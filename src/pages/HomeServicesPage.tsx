import React, { useEffect, useState } from 'react';
import ServiceCard from '../components/ui/ServiceCard';
import { Wrench, Search } from 'lucide-react';
import { getMockServices } from '../data/services';

const HomeServicesPage = () => {
  const allServices = getMockServices();
  const [services, setServices] = useState(allServices);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Update page title
    document.title = 'Home Services | Homemates';
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterServices(activeFilter, searchQuery);
  };
  
  const filterServices = (filter: string, query = searchQuery) => {
    let filteredServices = allServices;
    
    // Filter by type
    if (filter !== 'all') {
      filteredServices = filteredServices.filter(service => 
        service.type.toLowerCase() === filter.toLowerCase()
      );
    }
    
    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredServices = filteredServices.filter(service => 
        service.name.toLowerCase().includes(lowerQuery) ||
        service.description.toLowerCase().includes(lowerQuery)
      );
    }
    
    setServices(filteredServices);
    setActiveFilter(filter);
  };
  
  const handleBookService = (serviceId: string) => {
    console.log(`Booking service with ID: ${serviceId}`);
    // Here we would navigate to a booking page or open a modal
  };
  
  return (
    <div className="py-8">
      <div className="container">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Home Services</h1>
          <p className="text-gray-600">
            Book professional home services from verified service providers
          </p>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white shadow-sm rounded-lg mb-8">
          <div className="p-4">
            <form onSubmit={handleSearch} className="flex">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search services..." 
                  className="pl-10 input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                className="ml-2 btn btn-primary"
              >
                Search
              </button>
            </form>
          </div>
          
          <div className="border-t border-gray-100 p-4">
            <div className="flex overflow-x-auto space-x-2 pb-2">
              <button 
                onClick={() => filterServices('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeFilter === 'all' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Services
              </button>
              <button 
                onClick={() => filterServices('cleaning')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeFilter === 'cleaning' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cleaning
              </button>
              <button 
                onClick={() => filterServices('cooking')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeFilter === 'cooking' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cooking
              </button>
              <button 
                onClick={() => filterServices('repair')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeFilter === 'repair' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Repair
              </button>
              <button 
                onClick={() => filterServices('painting')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeFilter === 'painting' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Painting
              </button>
            </div>
          </div>
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
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <Wrench className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No services found</h3>
            <p className="text-gray-600">
              Try adjusting your search or check back later for new services
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeServicesPage;