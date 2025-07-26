import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyFilters from '../components/filters/PropertyFilters';
import PropertyCard from '../components/ui/PropertyCard';
import { Building, Loader, User, Search, X } from 'lucide-react';
import { getListings } from '../services/listings';
import { useAppContext } from '../context/AppContext';

const propertyTypes = ['Flat', 'Gated Community', 'Independent House', 'Villa'];
const bhkTypes = [
  '1RK',
  '2BHK',
  '3BHK',
  '4BHK',
  '4BHK+'
];

const BuyPropertiesPage = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { filters, isAuthenticated, login, loginError, clearLoginError } = useAppContext();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const fetchProperties = async () => {
    try {
      console.log('=== BUY PROPERTIES DEBUG START ===');
      console.log('Fetching buy properties...');
      console.log('Current filters:', filters.buy);
      setIsLoading(true);
      setError(null);
      const listings = await getListings('sell', filters.buy);
      console.log('Raw listings returned from getListings:', listings);
      console.log('Number of listings:', listings.length);
      console.log('Listings details:', listings.map(l => ({
        id: l.id,
        address: l.address,
        propertyType: l.propertyType,
        status: (l as any).status,
        createdAt: (l as any).createdAt,
        userId: (l as any).userId,
        listingType: (l as any).listingType
      })));
      setProperties(listings);
      console.log('=== BUY PROPERTIES DEBUG END ===');
    } catch (err) {
      console.error('=== BUY PROPERTIES ERROR ===');
      console.error('Error fetching buy properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to load properties. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertyClick = (property: any) => {
    // If the property has rentDetails, treat as rent listing
    if (property.rentDetails) {
      navigate(`/rent/${property.id}`);
    } else {
      navigate(`/buy/${property.id}`);
    }
  };

  const handleLogin = async () => {
    clearLoginError(); // Clear any previous errors
    await login();
  };

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
    fetchProperties();
    }, 400);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [filters.buy]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Filter properties by search query
  const filteredProperties = properties.filter((property) => {
    if (!debouncedQuery) return true;
    const q = debouncedQuery.toLowerCase();
    return (
      (property.address?.buildingName?.toLowerCase().includes(q)) ||
      (property.address?.locality?.toLowerCase().includes(q)) ||
      (property.address?.city?.toLowerCase().includes(q)) ||
      (property.description?.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Full Home Listings | Homemates';
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
              <div className="relative">
                <button 
                  onClick={handleLogin}
                  className="btn btn-primary"
                >
                  Sign in with Google
                </button>
                {loginError && (
                  <div className="absolute top-full left-0 right-0 mt-1 px-2 z-50">
                    <p className="text-red-600 text-xs font-bold bg-red-100 border border-red-200 rounded px-2 py-1 w-full" aria-live="polite">
                      {loginError}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Full Homes for Rent</h1>
          <p className="text-gray-600">
            Find full homes which are ready to be designed by you.
          </p>
          <h2 className="text-xl font-bold text-primary-700 mt-2 mb-2">Showing {filteredProperties.length} flats in full homes</h2>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex items-center gap-2">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              className="input w-full pl-10 pr-10 py-2 rounded-full border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-100 text-base"
              placeholder="Search by location, building, or description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              spellCheck={true}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        {/* Property Filters */}
        <PropertyFilters 
          propertyTypes={propertyTypes} 
          bhkTypes={bhkTypes}
          listingType="buy"
        />
            
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
            {/* Debug Section - Only show in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Debug Info (Development Only)</h3>
                <p className="text-sm text-yellow-700 mb-2">Total listings: {properties.length}</p>
                <p className="text-sm text-yellow-700 mb-2">Filtered listings: {filteredProperties.length}</p>
                <details className="mt-2">
                  <summary className="text-sm text-yellow-700 cursor-pointer">Raw Properties Data</summary>
                  <pre className="text-xs text-yellow-700 mt-2 bg-yellow-100 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(properties, null, 2)}
                  </pre>
                </details>
              </div>
            )}
            
            {filteredProperties.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                <p className="text-gray-600">
                  Try adjusting your filters or check back later for new listings
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map(property => (
                  <PropertyCard 
                    key={property.id} 
                    property={property}
                    listingType={property.rentDetails ? 'rent' : 'buy'}
                    variant="small"
                    onClick={() => handlePropertyClick(property)}
                    showBadge={false}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BuyPropertiesPage;