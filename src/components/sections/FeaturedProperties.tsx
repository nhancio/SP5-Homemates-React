import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '../ui/PropertyCard';
import { getListings } from '../../services/listings';
import { useAppContext } from '../../context/AppContext';
import { Loader, Building } from 'lucide-react';

const FeaturedProperties = () => {
  const navigate = useNavigate();
  const { filters } = useAppContext();
  const [featuredRent, setFeaturedRent] = useState<any[]>([]);
  const [featuredBuy, setFeaturedBuy] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        console.log('[FeaturedProperties] Fetching featured properties...');
        const startTime = Date.now();
        
        // Add timeout to prevent infinite loading
        const fetchPromise = Promise.all([
          getListings('rent', { ...filters.rent, limit: 6 }).catch(err => {
            console.error('[FeaturedProperties] Error fetching rent:', err);
            return [];
          }),
          getListings('sell', { ...filters.buy, limit: 6 }).catch(err => {
            console.error('[FeaturedProperties] Error fetching sell:', err);
            return [];
          })
        ]);
        
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => {
            console.warn('[FeaturedProperties] Fetch timeout - using empty arrays');
            resolve([[], []]);
          }, 10000); // 10 second timeout
        });
        
        const [rentListings, buyListings] = await Promise.race([fetchPromise, timeoutPromise]) as any[];
        const duration = Date.now() - startTime;
        console.log(`[FeaturedProperties] Fetched in ${duration}ms - Rent: ${rentListings?.length || 0}, Buy: ${buyListings?.length || 0}`);
        
        setFeaturedRent((rentListings || []).slice(0, 3));
        setFeaturedBuy((buyListings || []).slice(0, 3));
      } catch (error) {
        console.error('[FeaturedProperties] Error:', error);
        // Set empty arrays on error to show homepage
        setFeaturedRent([]);
        setFeaturedBuy([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader className="w-12 h-12 animate-spin text-pink-600" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-white via-pink-50/30 to-white overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative z-10">
        {/* Shared Flats Section */}
        {featuredRent.length > 0 && (
          <div className="mb-20 md:mb-24">
            <div className="relative mb-12">
              {/* Background Image with Overlay */}
              <div 
                className="absolute inset-0 rounded-3xl overflow-hidden opacity-10"
                style={{
                  backgroundImage: "url('/cards/room.jpg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              
              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 md:p-12 bg-white/80 backdrop-blur-sm rounded-3xl border border-pink-100 shadow-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                      Plug & Play Shared Flats
                    </h2>
                  </div>
                  <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
                    Walk in with a suitcase, not a U-Haul. Pre-furnished, pre-serviced, and pre-approved.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/rent')}
                  className="hidden md:flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105 shadow-lg"
                >
                  View All
                  <span className="text-xl">→</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRent.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  listingType="rent"
                  variant="small"
                  onClick={() => navigate(`/rent/${property.id}`)}
                />
              ))}
            </div>
            <div className="md:hidden mt-8 text-center">
              <button
                onClick={() => navigate('/rent')}
                className="px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                View All Shared Flats
              </button>
            </div>
          </div>
        )}

        {/* Full Flats Section */}
        {featuredBuy.length > 0 && (
          <div>
            <div className="relative mb-12">
              {/* Background Image with Overlay */}
              <div 
                className="absolute inset-0 rounded-3xl overflow-hidden opacity-10"
                style={{
                  backgroundImage: "url('/cards/fullflat.webp')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              
              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 md:p-12 bg-white/80 backdrop-blur-sm rounded-3xl border border-pink-100 shadow-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                      Your Private Sanctuary
                    </h2>
                  </div>
                  <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
                    Zero brokerage. Zero hassle. 100% ready to live.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/buy')}
                  className="hidden md:flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105 shadow-lg"
                >
                  View All
                  <span className="text-xl">→</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBuy.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  listingType="buy"
                  variant="small"
                  onClick={() => navigate(`/buy/${property.id}`)}
                />
              ))}
            </div>
            <div className="md:hidden mt-8 text-center">
              <button
                onClick={() => navigate('/buy')}
                className="px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                View All Full Flats
              </button>
            </div>
          </div>
        )}

        {featuredRent.length === 0 && featuredBuy.length === 0 && (
          <div className="relative text-center py-20">
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <Building className="w-64 h-64 text-pink-300" />
            </div>
            <div className="relative">
              <Building className="w-16 h-16 mx-auto text-pink-400 mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-gray-700">No properties available</h3>
              <p className="text-lg text-gray-600">Check back soon for new listings!</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;
