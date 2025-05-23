import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import PropertyCard from '../components/ui/PropertyCard';
import { getListingsByIds } from '../services/listings';

const SavedPage = () => {
  const { favoriteProperties, user } = useAppContext();
  const [activeFilter, setActiveFilter] = useState('all');
  const [savedProperties, setSavedProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Saved Properties | Homemates';
  }, []);
  
  useEffect(() => {
    const fetchSavedProperties = async () => {
      if (!user || !favoriteProperties.length) {
        setSavedProperties([]);
        setIsLoading(false);
        return;
      }

      try {
        const properties = await getListingsByIds(favoriteProperties);
        setSavedProperties(properties);
      } catch (error) {
        console.error('Error fetching saved properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedProperties();
  }, [favoriteProperties, user]);
  
  const filteredProperties = activeFilter === 'all' 
    ? savedProperties
    : savedProperties.filter(property => {
        const displayType = property.listingType === 'sell' ? 'buy' : property.listingType;
        return displayType === activeFilter;
      });
  
  return (
    <div className="py-8">
      <div className="container">
        <h1 className="text-2xl font-bold mb-6">Saved Properties</h1>
        
        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-6">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeFilter === 'all' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveFilter('buy')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeFilter === 'buy' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Buy
          </button>
          <button 
            onClick={() => setActiveFilter('rent')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeFilter === 'rent' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rent
          </button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Loading saved properties...</p>
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map(property => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                listingType={property.listingType === 'sell' ? 'buy' : 'rent'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No saved properties yet</h3>
            <p className="text-gray-600 mb-6">
              Start exploring and save properties that catch your interest.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/buy" className="btn btn-primary">Buy Properties</Link>
              <Link to="/rent" className="btn btn-secondary">Rent Properties</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPage;