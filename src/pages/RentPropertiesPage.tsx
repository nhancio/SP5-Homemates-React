import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '../components/ui/PropertyCard';
import { Building, Loader, User, Search, X } from 'lucide-react';
import { getListings } from '../services/listings';
import { useAppContext } from '../context/AppContext';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

const PROPERTIES_PER_PAGE = 9;

const RentPropertiesPage = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { filters, setFilters, isAuthenticated, login, loginError, clearLoginError, user } = useAppContext();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [userGender, setUserGender] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

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
    fetchProperties();
  }, [filters.rent]); // Re-fetch when filters change

  useEffect(() => {
    if (user && user.id) {
      // Fetch logged-in user's gender
      getDoc(doc(db, 'u', user.id)).then(userDoc => {
        setUserGender(userDoc.exists() ? (userDoc.data().gender || '').toLowerCase() : null);
      });
    } else {
      setUserGender(null);
    }
  }, [user]);

  const fetchProperties = async () => {
    try {
      console.log('=== RENT PROPERTIES DEBUG START ===');
      console.log('Fetching rent properties...');
      console.log('Current filters:', filters.rent);
      setIsLoading(true);
      setError(null);
      const listings = await getListings('rent', filters.rent);
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
      setCurrentPage(1); // Reset to first page on new fetch
      // Fallback: if city set and no results, fetch broader suggestions
      if ((filters.rent.city || '').trim() && listings.length === 0) {
        const broader = await getListings('rent', { ...filters.rent, city: '' });
        setSuggestions(broader);
      } else {
        setSuggestions([]);
      }
      console.log('=== RENT PROPERTIES DEBUG END ===');
    } catch (err) {
      console.error('=== RENT PROPERTIES ERROR ===');
      console.error('Error fetching rent properties:', err);
      setError('Failed to load properties. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/rent/${propertyId}`);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Shared Home Listings | Homemates';
  }, []);

  const handleLogin = async () => {
    clearLoginError(); // Clear any previous errors
    await login();
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredProperties.length / PROPERTIES_PER_PAGE);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * PROPERTIES_PER_PAGE,
    currentPage * PROPERTIES_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="py-8">
      <div className="container">
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-primary-700">Sign in to unlock more features</h2>
                <p className="text-primary-600">Save properties, contact owners, and more!</p>
              </div>
              <div className="relative">
                <button 
                  onClick={handleLogin}
                  className="btn btn-primary shadow-lg hover:shadow-xl transition-shadow"
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

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 text-gray-900">Shared Homes</h1>
          <p className="text-lg text-gray-600 mb-4">
            Plug and play homes which are in your comfort zone.
          </p>
          <h2 className="text-xl font-bold text-primary-700">Showing {filteredProperties.length} rooms</h2>
        </div>
        
        {/* Search Bar */}
        <div className="mb-8 flex items-center gap-2">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              className="input w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-base shadow-sm"
              placeholder="Search by location, building, or description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              spellCheck={true}
            />
            {searchQuery && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        {/* Properties Grid */}
        <div className="pb-24 lg:pb-0">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading properties...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
              <Building className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Error Loading Properties</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : (
            <>
              {filteredProperties.length === 0 ? (
                suggestions.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
                    <Building className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                    <p className="text-gray-600">Try adjusting your search or check back later for new listings.</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center py-10 mb-6 bg-primary-50 border border-primary-100 rounded-xl">
                      <h3 className="text-lg font-semibold text-primary-700">No properties in {filters.rent.city}. Showing other cities instead.</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                      {suggestions.map(property => (
                        <div key={property.id} className="min-w-[300px]">
                          <PropertyCard
                            property={property}
                            listingType="rent"
                            variant="small"
                            onClick={() => handlePropertyClick(property.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                    {paginatedProperties.map(property => (
                      <div key={property.id} className="min-w-[300px]">
                        <PropertyCard
                          property={property}
                          listingType="rent"
                          variant="small"
                          onClick={() => handlePropertyClick(property.id)}
                        />
                      </div>
                    ))}
                  </div>
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12">
                      <button
                        className="px-4 py-2 rounded-lg border bg-white text-primary-600 hover:bg-primary-50 disabled:opacity-50 transition-colors shadow-sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          className={`px-4 py-2 rounded-lg border transition-colors shadow-sm ${
                            currentPage === page
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-primary-600 hover:bg-primary-50'
                          }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        className="px-4 py-2 rounded-lg border bg-white text-primary-600 hover:bg-primary-50 disabled:opacity-50 transition-colors shadow-sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentPropertiesPage;