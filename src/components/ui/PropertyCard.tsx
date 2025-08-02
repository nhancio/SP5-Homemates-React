import React, { useState, useRef } from 'react';
import { Phone, Share2, Heart, Building, MapPin, Calendar, Car, Home, KeyRound, BedDouble, Snowflake, Shield, Refrigerator, WashingMachine, Plug, X, Check, ChevronLeft, ChevronRight, Pencil, Trash, Eye } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useAppContext } from '../../context/AppContext';
import { Property } from '../../types/property';
import { formatCurrency } from '../../utils/format';
import { useNavigate } from 'react-router-dom';
import { getShareableUrl } from '../../utils/share';
import { updateUserFavorites } from '../../utils/userFavorites';

interface PropertyCardProps {
  property: Property;
  listingType?: 'rent' | 'buy';
  variant?: 'small' | 'large';
  onClick?: () => void;
  showBadge?: boolean;
  showManageActions?: boolean; // NEW PROP
  onDelete?: (id: string) => void; // NEW PROP: callback after delete
}

// Key amenities to show as icons
const AMENITY_ICONS: Record<string, React.ReactNode> = {
  parking: <Car className="w-4 h-4" />,
  ac: <Snowflake className="w-4 h-4" />,
  security: <Shield className="w-4 h-4" />,
  fridge: <Refrigerator className="w-4 h-4" />,
  washing: <WashingMachine className="w-4 h-4" />,
  bed: <BedDouble className="w-4 h-4" />,
  power: <Plug className="w-4 h-4" />,
};

// Matching score calculation helper
function getMatchScore(userPrefs: string[] = [], propertyPrefs: string[] = []) {
  if (!userPrefs.length || !propertyPrefs.length) return null;
  const userSet = new Set(userPrefs);
  let matches = 0;
  propertyPrefs.forEach(pref => {
    if (userSet.has(pref)) matches++;
  });
  const percent = Math.round((matches / userPrefs.length) * 100);
  return { matches, total: userPrefs.length, percent };
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  listingType = 'rent',
  variant = 'small',
  onClick,
  showBadge = true,
  showManageActions = false, // NEW PROP
  onDelete, // NEW PROP: callback after delete
}) => {
  console.log('PropertyCard property:', property);
  console.log('Rendering PropertyCard for property:', property?.id, property?.address?.buildingName);
  const { favoriteProperties, toggleFavorite, user } = useAppContext();
  console.log('User:', user);
  console.log('User preferences:', user?.preferences);
  console.log('Property preferences:', property.rentDetails?.preferredTenant?.preferences);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const swiperRef = useRef<any>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState<number>(0);
  const [showSavedAnimation, setShowSavedAnimation] = useState(false);

  const isFavorite = favoriteProperties.includes(property.id);

  const handleImageLoad = () => setIsLoaded(true);

  const handleCall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      alert('Please sign in to continue');
      return;
    }

    try {
      // Check and use credits
      const { useCredits } = await import('../../services/credits');
      const creditUsed = await useCredits(user.id, 'call');
      
      if (!creditUsed) {
        // No credits available, redirect to payment page
        if (window.confirm('You have no credits remaining. Would you like to buy more credits?')) {
          window.location.href = '/payment';
        }
        return;
      }

      const phone = property.contactNumber;
      if (phone) {
        window.location.href = `tel:${phone}`;
      } else {
        alert('Contact number not available for this property');
      }
    } catch (error) {
      console.error('Error using credits:', error);
      
      // Fallback: If credits service is unavailable, still allow calling
      // but show a warning that credits couldn't be deducted
      console.log('Credits service unavailable, proceeding with call without credit deduction');
      
      const phone = property.contactNumber;
      if (phone) {
        window.location.href = `tel:${phone}`;
      } else {
        alert('Contact number not available for this property');
      }
    }
  };

  const handleWhatsApp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      alert('Please sign in to continue');
      return;
    }

    try {
      // Check and use credits
      const { useCredits } = await import('../../services/credits');
      const creditUsed = await useCredits(user.id, 'whatsapp');
      
      if (!creditUsed) {
        // No credits available, redirect to payment page
        if (window.confirm('You have no credits remaining. Would you like to buy more credits?')) {
          window.location.href = '/payment';
        }
        return;
      }

      const phone = property.contactNumber;
      if (phone) {
        const message = `Hey, I want to know more about your flat listing I found at homematesapp.in/rent/${property.id}`;
        const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
      } else {
        alert('Contact number not available for this property');
      }
    } catch (error) {
      console.error('Error using credits:', error);
      
      // Fallback: If credits service is unavailable, still allow WhatsApp sharing
      // but show a warning that credits couldn't be deducted
      console.log('Credits service unavailable, proceeding with WhatsApp share without credit deduction');
      
      const phone = property.contactNumber;
      if (phone) {
        const message = `Hey, I want to know more about your flat listing I found at homematesapp.in/rent/${property.id}`;
        const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
      } else {
        alert('Contact number not available for this property');
      }
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const type = listingType === 'buy' ? 'sell' : 'rent';
    const url = getShareableUrl(property.id, type);
    
    // Get the correct price/rent based on listing type
    let price = 0;
    if (listingType === 'rent') {
      price = property.rentDetails?.costs?.rent || 0;
    } else {
      // For sell listings (full homes), use sellDetails.rent
      price = property.sellDetails?.rent || property.price || 0;
    }

    // Get the correct BHK type based on listing type
    let bhkType = '-';
    if (listingType === 'rent') {
      // For rent listings, try to get BHK from various sources
      if (property.bedrooms) {
        bhkType = `${property.bedrooms}BHK`;
      } else if (property.rentDetails?.roomDetails && (property.rentDetails.roomDetails as any)?.flatType) {
        // Use the flatType from the form (e.g., "2BHK", "3BHK")
        bhkType = (property.rentDetails.roomDetails as any).flatType;
      } else {
        // Try to extract BHK from various fields
        const bhkRegex = /[1-9]BHK\+?/;
        const candidates = [
          property.type,
          property.title,
          property.description,
          property.rentDetails?.roomDetails?.availability,
        ];
        for (const val of candidates) {
          if (typeof val === 'string' && bhkRegex.test(val)) {
            bhkType = val.match(bhkRegex)![0];
            break;
          }
        }
      }
    } else {
      // For sell listings, try to get BHK from various sources
      if (property.bedrooms) {
        bhkType = `${property.bedrooms}BHK`;
      } else if ((property as any).roomType) {
        // Use the roomType from the form (e.g., "2BHK", "3BHK")
        bhkType = (property as any).roomType;
      } else {
        // Try to extract BHK from various fields
        const bhkRegex = /[1-9]BHK\+?/;
        const candidates = [
          property.sellDetails?.propertyType,
          property.type,
          property.title,
          property.description,
        ];
        for (const val of candidates) {
          if (typeof val === 'string' && bhkRegex.test(val)) {
            bhkType = val.match(bhkRegex)![0];
            break;
          }
        }
      }
    }

    const shareText = `Hey, checkout this property on Homemates!\n\nName: ${property.address?.buildingName || 'Property'}\n${listingType === 'rent' ? 'Rent' : 'Rent'}: ₹${formatCurrency(price)}\nBHK: ${bhkType}\nLocation: ${property.address?.locality}, ${property.address?.city}\nLink: ${url}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this property on Homemates',
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert('Property details copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing property:', err);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('Please login to save properties');
      return;
    }
    // If already saved, confirm before un-saving
    if (isFavorite) {
      const confirmed = window.confirm('Are you sure you want to remove this property from your saved list?');
      if (!confirmed) return;
    }
    try {
      await updateUserFavorites(user.id, property.id, !isFavorite);
      toggleFavorite(property.id);
      if (!isFavorite) {
        setShowSavedAnimation(true);
        setTimeout(() => setShowSavedAnimation(false), 1200);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      alert('Failed to update favorites. Please try again.');
    }
  };

  const handleCardClick = () => {
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    // Navigate after ensuring scroll position
    navigate(`/${listingType}/${property.id}`);
  };

  const formatAvailabilityDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });
  };

  const matchScore = React.useMemo(() => {
    if (!user || !user.preferences || !user.preferences.length) return null;
    let propertyPrefs: string[] = [];
    if (listingType === 'rent') {
      propertyPrefs = property.rentDetails?.preferredTenant?.preferences || [];
    } else {
      propertyPrefs = property.features || [];
    }
    // Debug logs
    console.log('User preferences:', user.preferences);
    console.log('Property preferences/features:', propertyPrefs);
    return getMatchScore(user.preferences, propertyPrefs);
  }, [user, property, listingType]);

  // --- Management Actions ---
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Use the property's actual listing type
    const actualListingType = (property as any).listingType || listingType;
    navigate(`/edit-listing/${actualListingType}/${property.id}`, {
      state: { listing: property }
    });
  };
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const { deleteListing } = await import('../../services/listings');
      // Use the property's actual listing type
      const actualListingType = (property as any).listingType || listingType;
      await deleteListing(actualListingType, property.id);
      alert('Listing deleted successfully!');
      if (onDelete) onDelete(property.id);
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert('Failed to delete listing. Please try again.');
    }
  };
  
  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    // Navigate after ensuring scroll position
    const actualListingType = (property as any).listingType || listingType;
    const displayType = actualListingType === 'sell' ? 'buy' : 'rent';
    navigate(displayType === 'rent' ? `/rent/${property.id}` : `/buy/${property.id}`);
  };

  // --- Small Card Variant ---
  const renderSmallCard = () => (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-property-card hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-100 flex flex-col"
      onClick={onClick || handleCardClick}
    >
      {/* Image & Property Type Badge */}
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination]}
          pagination={{ clickable: true }}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          loop={(property.images?.length || 0) > 1}
          className="h-48"
        >
          {(property.images?.length ? property.images : ['placeholder']).map((img, idx) => (
            <SwiperSlide key={idx}>
              <div className={`h-48 bg-gray-200 ${!isLoaded ? 'animate-pulse' : ''}`}
                onClick={() => {
                  if (img !== 'placeholder') {
                    setModalImage(img);
                    setModalImageIndex(idx);
                    setShowImageModal(true);
                  }
                }}
                style={{ cursor: img !== 'placeholder' ? 'zoom-in' : 'default' }}
              >
                {img === 'placeholder' ? (
                  <div className="w-full h-full flex justify-center items-center text-gray-400">
                    <Building className="w-10 h-10" />
                  </div>
                ) : (
                  <img src={img} alt="" className="w-full h-full object-cover rounded-lg" onLoad={handleImageLoad} loading="lazy" />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Property Type Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-primary-600 text-white text-xs font-semibold px-2 py-1 rounded">
            {(() => {
              // 1. Try bedrooms
              if (typeof property.bedrooms === 'number' && property.bedrooms > 0) {
                return `${property.bedrooms}BHK`;
              }
              // 2. Try common BHK string fields
              const bhkRegex = /[1-9]BHK\+?/;
              const candidates = [
                property.rentDetails && property.rentDetails.roomDetails && (property.rentDetails.roomDetails as any).flatType,
                (property as any).flatType,
                property.type,
                property.type,
                property.title,
                property.description,
              ];
              for (const val of candidates) {
                if (typeof val === 'string' && bhkRegex.test(val)) {
                  return val.match(bhkRegex)![0];
                }
              }
              // 3. Fallback
              return '-';
            })()}
          </span>
        </div>
        {/* Management Actions (Edit/Delete/View) */}
        {showManageActions && (
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
            <button onClick={handleEdit} title="Edit" className="bg-white border border-gray-200 rounded-full p-1 shadow hover:bg-gray-100 transition"><Pencil className="w-4 h-4 text-primary-600" /></button>
            <button onClick={handleDelete} title="Delete" className="bg-white border border-gray-200 rounded-full p-1 shadow hover:bg-gray-100 transition"><Trash className="w-4 h-4 text-red-500" /></button>
            <button onClick={handleView} title="View" className="bg-white border border-gray-200 rounded-full p-1 shadow hover:bg-gray-100 transition"><Eye className="w-4 h-4 text-gray-600" /></button>
          </div>
        )}
        {/* Navigation Arrows - Only show when there are multiple images */}
        {(property.images?.length || 0) > 1 && (
          <>
            {/* Left Arrow */}
            <div
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow z-10 cursor-pointer hover:bg-primary-50"
              onClick={e => {
                e.stopPropagation();
                swiperRef.current?.slidePrev();
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </div>
            {/* Right Arrow */}
            <div
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow z-10 cursor-pointer hover:bg-primary-50"
              onClick={e => {
                e.stopPropagation();
                swiperRef.current?.slideNext();
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </>
        )}
      </div>
      {/* Main Info */}
      <div className="p-3 md:p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm md:text-base font-bold line-clamp-1 text-gray-900">
              {listingType === 'buy'
                ? (property.address?.buildingName || 'No Building Name')
                : (property.address?.buildingName || 'Property')}
            </h3>
            <span className="text-base md:text-lg font-extrabold text-primary-600">
              ₹{formatCurrency(
                listingType === 'rent' 
                  ? (property.rentDetails?.costs?.rent || 0)
                  : (property.sellDetails?.price || 0)
              )}
            </span>
          </div>
          <div className="text-xs text-primary-600 font-semibold mb-1 flex items-center">
            <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1 text-primary-600" />
            <span className="line-clamp-1 text-xs">
              {listingType === 'rent'
                ? `${property.rentDetails?.roomDetails?.availableRooms ?? '-'} room(s) available in ${property.address?.locality}, ${property.address?.city}`
                : `${property.address?.locality}, ${property.address?.city}`}
            </span>
          </div>
          {/* Match Score Badge */}
          {matchScore && (
            <div className="inline-block bg-green-50 text-green-700 text-xs font-semibold rounded-full px-2 py-1 mb-1 mt-1">
              {matchScore.matches}/{matchScore.total} match ({matchScore.percent}%)
            </div>
          )}
          {/* Amenity Icons Row */}
          <div className="flex gap-1 md:gap-2 mt-2 mb-2">
            {Object.entries(AMENITY_ICONS).map(([key, icon]) => {
              const hasAmenity = listingType === 'rent' 
                ? (property.rentDetails as any)?.amenities?.includes(key)
                : property.sellDetails?.amenities?.includes(key);
              return (
                <span key={key} className={`rounded-full p-1 bg-gray-100 ${hasAmenity ? 'text-primary-600' : 'text-gray-400'}`}>{icon}</span>
              );
            })}
          </div>
        </div>
        {/* Action Buttons - Icon Only */}
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={handleFavoriteClick}
            className="flex-1 flex items-center justify-center py-3 text-gray-600 hover:bg-gray-50 transition min-h-[44px]"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>
          <button
            onClick={handleCall}
            className="flex-1 flex items-center justify-center py-3 text-primary-600 hover:bg-primary-50 transition border-l border-r border-gray-200 min-h-[44px]"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex-1 flex items-center justify-center py-3 text-green-600 hover:bg-green-50 transition border-l border-r border-gray-200 min-h-[44px]"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5" />
          </button>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center py-3 text-gray-600 hover:bg-gray-50 transition min-h-[44px]"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      {/* Full-resolution Image Modal */}
      {showImageModal && modalImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" 
          onClick={() => setShowImageModal(false)}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            const startX = touch.clientX;
            const startY = touch.clientY;
            
            const handleTouchEnd = (e: TouchEvent) => {
              const touch = e.changedTouches[0];
              const endX = touch.clientX;
              const endY = touch.clientY;
              const deltaX = endX - startX;
              const deltaY = endY - startY;
              
              // Only handle horizontal swipes with minimal vertical movement
              if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100) {
                if (deltaX > 0) {
                  // Swipe right - go to previous image
                  setModalImageIndex(i => {
                    const total = property.images?.length || 1;
                    const next = (i - 1 + total) % total;
                    setModalImage(property.images?.[next] || modalImage);
                    return next;
                  });
                } else {
                  // Swipe left - go to next image
                  setModalImageIndex(i => {
                    const total = property.images?.length || 1;
                    const next = (i + 1) % total;
                    setModalImage(property.images?.[next] || modalImage);
                    return next;
                  });
                }
              }
              
              document.removeEventListener('touchend', handleTouchEnd);
            };
            
            document.addEventListener('touchend', handleTouchEnd);
          }}
        >
          <button
            className="absolute top-6 right-6 text-white text-3xl font-bold z-[9999]"
            onClick={e => { e.stopPropagation(); setShowImageModal(false); }}
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>
          {/* Image (below navigation buttons) */}
          <img
            src={modalImage}
            alt="Property"
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg z-10"
            onClick={e => e.stopPropagation()}
          />
          {/* Left Navigation Button - Always show for testing */}
          <button
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 sm:p-3 transition-all duration-200 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg border border-white border-opacity-30 z-[9999]"
            onClick={e => {
              e.stopPropagation();
              console.log('PropertyCard Left button clicked!');
              setModalImageIndex(i => {
                const total = property.images?.length || 1;
                const next = (i - 1 + total) % total;
                setModalImage(property.images?.[next] || modalImage);
                return next;
              });
            }}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          {/* Right Navigation Button - Always show for testing */}
          <button
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 sm:p-3 transition-all duration-200 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg border border-white border-opacity-30 z-[9999]"
            onClick={e => {
              e.stopPropagation();
              console.log('PropertyCard Right button clicked!');
              setModalImageIndex(i => {
                const total = property.images?.length || 1;
                const next = (i + 1) % total;
                setModalImage(property.images?.[next] || modalImage);
                return next;
              });
            }}
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      )}
    </div>
  );

  // --- Large Card Variant ---
  const renderLargeCard = () => (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-gray-100 flex flex-col"
      onClick={handleCardClick}
    >
      {/* Image & Property Type Badge */}
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination]}
          pagination={{ clickable: true }}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          loop={(property.images?.length || 0) > 1}
          className="h-80"
        >
          {(property.images?.length ? property.images : ['placeholder']).map((img, idx) => (
            <SwiperSlide key={idx}>
              <div className={`h-80 bg-gray-200 ${!isLoaded ? 'animate-pulse' : ''}`}>
                {img === 'placeholder' ? (
                  <div className="w-full h-full flex justify-center items-center text-gray-400">
                    <Building className="w-16 h-16" />
                  </div>
                ) : (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover cursor-zoom-in"
                    onClick={e => {
                      e.stopPropagation();
                      setModalImage(img);
                      setModalImageIndex(idx);
                      setShowImageModal(true);
                    }}
                    onLoad={handleImageLoad}
                    loading="lazy"
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Property Type Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-primary-600 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
            {property.type}
          </span>
        </div>
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
      </div>
      {/* Main Info */}
      <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                {property.address?.buildingName || 'Property'}
              </h3>
              <div className="flex items-center text-primary-600 mb-2 text-sm font-semibold">
                <MapPin className="w-4 h-4 mr-1 text-primary-600" />
                <span>
                  {listingType === 'rent'
                    ? `${property.rentDetails?.roomDetails?.availableRooms ?? '-'} room(s) available in ${property.address?.locality}, ${property.address?.city}`
                    : `${property.address?.locality}, ${property.address?.city}`}
                </span>
              </div>
              {/* Match Score Badge */}
              {matchScore && (
                <div className="inline-block bg-green-50 text-green-700 text-xs font-semibold rounded-full px-3 py-1 mb-2 mt-1">
                  {matchScore.matches}/{matchScore.total} match ({matchScore.percent}%)
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xl md:text-2xl font-extrabold text-primary-600">
                ₹{formatCurrency(
                  listingType === 'rent' 
                    ? (property.rentDetails?.costs?.rent || 0)
                    : (property.sellDetails?.price || 0)
                )}
              </div>
              <div className="text-sm text-gray-500">
                {listingType === 'rent' ? 'per month' : 'total price'}
              </div>
            </div>
          </div>
          {/* Amenity Icons Row */}
          <div className="flex gap-3 mb-4">
            {Object.entries(AMENITY_ICONS).map(([key, icon]) => {
              const hasAmenity = listingType === 'rent' 
                ? (property.rentDetails as any)?.amenities?.includes(key)
                : property.sellDetails?.amenities?.includes(key);
              return (
                <span key={key} className={`rounded-full p-2 bg-gray-100 ${hasAmenity ? 'text-primary-600' : 'text-gray-400'}`}>{icon}</span>
              );
            })}
          </div>
        </div>
        {/* Action Buttons - Icon Only */}
        <div className="flex gap-3 mt-auto">
          <button
            onClick={handleCall}
            className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center min-h-[44px]"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center min-h-[44px]"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5" />
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center min-h-[44px]"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      {/* Full-page image modal */}
      {showImageModal && modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={() => setShowImageModal(false)}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            const startX = touch.clientX;
            const startY = touch.clientY;
            
            const handleTouchEnd = (e: TouchEvent) => {
              const touch = e.changedTouches[0];
              const endX = touch.clientX;
              const endY = touch.clientY;
              const deltaX = endX - startX;
              const deltaY = endY - startY;
              
              // Only handle horizontal swipes with minimal vertical movement
              if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100) {
                if (deltaX > 0) {
                  // Swipe right - go to previous image
                  setModalImageIndex(i => {
                    const total = property.images?.length || 1;
                    const next = (i - 1 + total) % total;
                    setModalImage(property.images?.[next] || modalImage);
                    return next;
                  });
                } else {
                  // Swipe left - go to next image
                  setModalImageIndex(i => {
                    const total = property.images?.length || 1;
                    const next = (i + 1) % total;
                    setModalImage(property.images?.[next] || modalImage);
                    return next;
                  });
                }
              }
              
              document.removeEventListener('touchend', handleTouchEnd);
            };
            
            document.addEventListener('touchend', handleTouchEnd);
          }}
        >
          <button
            className="absolute top-6 right-6 text-white text-3xl font-bold z-[9999]"
            onClick={() => setShowImageModal(false)}
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>
          {/* Image (below navigation buttons) */}
          <img
            src={modalImage}
            alt="Property"
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg z-10"
            onClick={e => e.stopPropagation()}
          />
          {/* Left Navigation Button - Always show for testing */}
          <button
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 sm:p-3 transition-all duration-200 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg border border-white border-opacity-30 z-[9999]"
            onClick={e => {
              e.stopPropagation();
              console.log('PropertyCard Large Left button clicked!');
              setModalImageIndex(i => {
                const total = property.images?.length || 1;
                const next = (i - 1 + total) % total;
                setModalImage(property.images?.[next] || modalImage);
                return next;
              });
            }}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          {/* Right Navigation Button - Always show for testing */}
          <button
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 sm:p-3 transition-all duration-200 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg border border-white border-opacity-30 z-[9999]"
            onClick={e => {
              e.stopPropagation();
              console.log('PropertyCard Large Right button clicked!');
              setModalImageIndex(i => {
                const total = property.images?.length || 1;
                const next = (i + 1) % total;
                setModalImage(property.images?.[next] || modalImage);
                return next;
              });
            }}
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      )}
    </div>
  );

  // --- Render Variant ---
  return variant === 'large' ? renderLargeCard() : renderSmallCard();
};

export default PropertyCard;
