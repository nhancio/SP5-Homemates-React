import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyFilters from '../components/filters/PropertyFilters';
import PropertyCard from '../components/ui/PropertyCard';
import { Building, Loader, User, Search, X, SlidersHorizontal } from 'lucide-react';
import { getListings } from '../services/listings';
import { useAppContext } from '../context/AppContext';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

const propertyTypes = [
  'Flat',
  'Gated Community',
  'Independent House',
  'Villa'
];
const bhkTypes = [
  'Single Room',
  '1RK',
  '2BHK',
  '3BHK',
  '4BHK',
  '4BHK+'
];

const PROPERTIES_PER_PAGE = 9;

const RentPropertiesPage = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { filters, isAuthenticated, login, loginError, clearLoginError, user } = useAppContext();
  const [userGender, setUserGender] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showFloatingFilter, setShowFloatingFilter] = useState(false);
  const filterSectionRef = React.useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleScroll = () => {
      if (!filterSectionRef.current) return;
      const rect = filterSectionRef.current.getBoundingClientRect();
      setShowFloatingFilter(rect.bottom < 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const listings = await getListings('rent', filters.rent);
      setProperties(listings);
      setCurrentPage(1); // Reset to first page on new fetch
    } catch (err) {
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

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Shared Homes</h1>
          <p className="text-gray-600">
            Plug and play homes which are in your comfort zone.
          </p>
          <h2 className="text-xl font-bold text-primary-700 mt-2 mb-2">Showing {filteredProperties.length} rooms</h2>
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
        <div ref={filterSectionRef}>
          <PropertyFilters 
            propertyTypes={propertyTypes} 
            bhkTypes={bhkTypes}
            listingType="rent"
          />
        </div>
        
        {showFloatingFilter && (
          <button
            style={{ zIndex: 9999, bottom: '30vh', background: 'linear-gradient(90deg, #C2185B 60%, #FF80AB 100%)' }}
            className="fixed right-24 text-white p-5 rounded-full flex items-center justify-center hover:bg-primary-700 transition group"
            onClick={() => setShowFilterModal(true)}
            aria-label="Open Filters"
            title="Filters"
          >
            <SlidersHorizontal className="w-8 h-8 text-white" />
            <span className="ml-2 text-base font-semibold hidden sm:inline group-hover:inline">Filters</span>
          </button>
        )}

        {showFilterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-2xl relative">
              <button
                className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white text-3xl font-bold hover:bg-red-500 hover:text-white transition"
                onClick={() => setShowFilterModal(false)}
                aria-label="Close"
              >
                <X className="w-8 h-8" />
              </button>
              <PropertyFilters 
                propertyTypes={propertyTypes} 
                bhkTypes={bhkTypes}
                listingType="rent"
              />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProperties.map(property => (
                <PropertyCard 
                  key={property.id} 
                  property={property}
                  listingType="rent"
                  variant="small"
                  onClick={() => handlePropertyClick(property.id)}
                />
              ))}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  className="px-3 py-1 rounded border bg-white text-primary-600 hover:bg-primary-50 disabled:opacity-50"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`px-3 py-1 rounded border ${page === currentPage ? 'bg-primary-600 text-white' : 'bg-white text-primary-600 hover:bg-primary-50'}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="px-3 py-1 rounded border bg-white text-primary-600 hover:bg-primary-50 disabled:opacity-50"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
        
        {filteredProperties.length === 0 && !isLoading && !error && (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No properties found</h3>
            <p className="text-gray-600">
              No properties available for your profile at this time due to privacy settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentPropertiesPage;