import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyFilters from '../components/filters/PropertyFilters';
import PropertyCard from '../components/ui/PropertyCard';
import { Building, Loader, User } from 'lucide-react';
import { getListings } from '../services/listings';
import { useAppContext } from '../context/AppContext';

const propertyTypes = ['Flat', 'Gated Community', 'Independent House', 'Villa'];

const BuyPropertiesPage = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { filters, isAuthenticated, login } = useAppContext();

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const listings = await getListings('sell', filters.buy);
      setProperties(listings);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to load properties. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/buy/${propertyId}`);
  };

  useEffect(() => {
    fetchProperties();
  }, [filters.buy]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Buy Properties | Homemates';
  }, []);

  return (
    <div className="py-8">
      <div className="container">
        {isAuthenticated ? null : (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-primary-700">Sign in to unlock more features</h2>
                <p className="text-primary-600">Save properties, contact owners, and more!</p>
              </div>
              <button 
                onClick={() => login()}
                className="btn btn-primary"
              >
                Sign in with Google
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Error Loading Properties</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Properties for Sale</h1>
              <p className="text-gray-600">
                Find your dream home from our curated list of properties for sale
              </p>
            </div>
            
            <PropertyFilters 
              propertyTypes={propertyTypes} 
              listingType="buy"
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(property => (
                <PropertyCard 
                  key={property.id} 
                  property={property}
                  listingType="buy"
                  onClick={() => handlePropertyClick(property.id)}
                />
              ))}
            </div>
            
            {properties.length === 0 && !isLoading && (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                <p className="text-gray-600">
                  Try adjusting your filters or check back later for new listings
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BuyPropertiesPage;