import React, { useState, useRef } from 'react';
import { Phone, Share2, Heart, Building, MapPin, Calendar, Car, Home, KeyRound, BedDouble, Snowflake, Shield, Refrigerator, WashingMachine, Plug, X, Check, ChevronLeft, ChevronRight, Pencil, Trash, Eye, Dumbbell, Sun } from 'lucide-react';
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
  // Rent form amenities (proper case keys)
  'AC': <Snowflake className="w-4 h-4" />,
  'Bed': <BedDouble className="w-4 h-4" />,
  'Power Backup': <Plug className="w-4 h-4" />,
  'Gym': <Dumbbell className="w-4 h-4" />,
  'Fridge': <Refrigerator className="w-4 h-4" />,
  'Washing Machine': <WashingMachine className="w-4 h-4" />,
  // Sell form amenities (proper case keys)
  'Security': <Shield className="w-4 h-4" />,
  'Lift': <Home className="w-4 h-4" />,
  'Balcony': <Sun className="w-4 h-4" />,
  // Additional amenities
  'Parking': <Car className="w-4 h-4" />,
  // Legacy support for lowercase keys (if any exist)
  ac: <Snowflake className="w-4 h-4" />,
  bed: <BedDouble className="w-4 h-4" />,
  power: <Plug className="w-4 h-4" />,
  gym: <Dumbbell className="w-4 h-4" />,
  fridge: <Refrigerator className="w-4 h-4" />,
  washing: <WashingMachine className="w-4 h-4" />,
  security: <Shield className="w-4 h-4" />,
  lift: <Home className="w-4 h-4" />,
  balcony: <Sun className="w-4 h-4" />,
  parking: <Car className="w-4 h-4" />,
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
  const { favoriteProperties, toggleFavorite, user } = useAppContext();
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const swiperRef = useRef<any>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState<number>(0);

  const handleImageLoad = () => setIsLoaded(true);

  const handleCall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('Please login to contact property owners');
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

      if (property?.contactNumber) {
        window.location.href = `tel:${property.contactNumber}`;
      } else {
        alert('Contact number not available');
      }
    } catch (error) {
      console.error('Error using credits:', error);
      alert('Failed to process request. Please try again.');
    }
  };

  const handleWhatsApp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('Please login to contact property owners');
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

      if (property?.contactNumber) {
        const message = `Hi, I'm interested in your property at ${property.address?.buildingName || 'your location'}. Can you provide more details?`;
        const whatsappUrl = `https://wa.me/${property.contactNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      } else {
        alert('Contact number not available');
      }
    } catch (error) {
      console.error('Error using credits:', error);
      alert('Failed to process request. Please try again.');
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { getShareableUrl } = await import('../../utils/share');
      const type = listingType === 'buy' ? 'sell' : 'rent';
      const url = getShareableUrl(property.id, type);
      
      // Get the correct price/rent based on listing type
      let amount = 0;
      let amountLabel = 'Price';
      if (listingType === 'rent') {
        amount = property.rentDetails?.costs?.rent || 0;
        amountLabel = 'Rent';
      } else {
        // For sell listings, try to get price from sellDetails first
        amount = property.sellDetails?.price || property.price || 0;
        amountLabel = 'Price';
      }

      // Get the correct BHK type based on listing type
      let bhkType = '-';
      let availableRooms = undefined;
      let flatType = undefined;
      if (listingType === 'rent') {
        // For rent listings, try to get BHK and available rooms
        availableRooms = property.rentDetails?.roomDetails?.availableRooms;
        flatType = property.rentDetails?.roomDetails?.flatType;
        if (property.bedrooms && typeof property.bedrooms === 'number' && property.bedrooms > 0) {
          bhkType = `${property.bedrooms}BHK`;
        } else if (flatType) {
          bhkType = flatType;
        } else if (property.rentDetails?.roomDetails?.availability) {
          const bhkRegex = /[1-9]BHK\+?/;
          const match = property.rentDetails.roomDetails.availability.match(bhkRegex);
          if (match) {
            bhkType = match[0];
          }
        } else if ((property.rentDetails?.roomDetails as any)?.roomType) {
          const bhkRegex = /[1-9]BHK\+?/;
          const match = (property.rentDetails?.roomDetails as any).roomType.match(bhkRegex);
          if (match) {
            bhkType = match[0];
          }
        } else if (property.sellDetails?.propertyType) {
          const bhkRegex = /[1-9]BHK\+?/;
          const match = property.sellDetails.propertyType.match(bhkRegex);
          if (match) {
            bhkType = match[0];
          }
        } else if ((property as any).flatType) {
          const bhkRegex = /[1-9]BHK\+?/;
          const match = (property as any).flatType.match(bhkRegex);
          if (match) bhkType = match[0];
        } else {
          const bhkRegex = /[1-9]BHK\+?/;
          const candidates = [
            property.type,
            property.title,
            property.description,
            (property as any).propertyType,
            (property as any).roomType,
            (property as any).flatType,
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
        if (property.bedrooms && typeof property.bedrooms === 'number' && property.bedrooms > 0) {
          bhkType = `${property.bedrooms}BHK`;
        } else if ((property as any).roomType) {
          const bhkRegex = /[1-9]BHK\+?/;
          const match = (property as any).roomType.match(bhkRegex);
          if (match) {
            bhkType = match[0];
          }
        } else if (property.sellDetails?.propertyType) {
          const bhkRegex = /[1-9]BHK\+?/;
          const match = property.sellDetails.propertyType.match(bhkRegex);
          if (match) {
            bhkType = match[0];
          }
        } else if ((property as any).flatType) {
          const bhkRegex = /[1-9]BHK\+?/;
          const match = (property as any).flatType.match(bhkRegex);
          if (match) bhkType = match[0];
        } else {
          const bhkRegex = /[1-9]BHK\+?/;
          const candidates = [
            property.type,
            property.title,
            property.description,
            (property as any).propertyType,
            (property as any).roomType,
            (property as any).flatType,
          ];
          for (const val of candidates) {
            if (typeof val === 'string' && bhkRegex.test(val)) {
              bhkType = val.match(bhkRegex)![0];
              break;
            }
          }
        }
      }
      
      // Compose shareText
      let shareText = '';
      if (listingType === 'rent') {
        // Shared home: show Type: {x} Room(s) available in {BHK}
        shareText = 
`Hey, check this property on Homemates!
Name: ${property.address?.buildingName || 'Property'}
${amountLabel}: ₹${formatCurrency(amount)}
Type: ${availableRooms ? `${availableRooms} Room(s) available in ${bhkType}` : bhkType}
Location: ${property.address?.locality}, ${property.address?.city}
Link: ${url}`;
      } else {
        // Full home: keep current logic
        shareText = 
`Hey, check this property on Homemates!
Name: ${property.address?.buildingName || 'Property'}
${amountLabel}: ₹${formatCurrency(amount)}
Type: ${bhkType}
Location: ${property.address?.locality}, ${property.address?.city}
Link: ${url}`;
      }

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
      alert('Failed to share property. Please try again.');
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('Please login to save properties');
      return;
    }
    toggleFavorite(property.id);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Force scroll to top immediately
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      
      // Navigate after ensuring scroll position
      const actualListingType = (property as any).listingType || listingType;
      const displayType = actualListingType === 'sell' ? 'buy' : 'rent';
      navigate(displayType === 'rent' ? `/rent/${property.id}` : `/buy/${property.id}`);
    }
  };

  const formatAvailabilityDate = (date: string | undefined) => {
    if (!date) return 'Immediate';
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return date;
    }
  };

  const matchScore = React.useMemo(() => {
    if (!user || !user.preferences || !user.preferences.length) return null;
    let propertyPrefs: string[] = [];
    if (listingType === 'rent') {
      propertyPrefs = property.rentDetails?.preferredTenant?.preferences || [];
    } else {
      propertyPrefs = property.features || [];
    }
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
                ? `${property.rentDetails?.roomDetails?.availableRooms ?? property.roomAvailable ?? '-'} room(s) available in ${property.address?.locality}, ${property.address?.city}`
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
              // Only show icons for amenities that are actually selected
              if (hasAmenity) {
                return (
                  <span key={key} className="rounded-full p-1 bg-gray-100 text-primary-600">{icon}</span>
                );
              }
              return null;
            })}
          </div>
        </div>
        {/* Action Buttons - Icon Only */}
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={handleFavoriteClick}
            className="flex-1 flex items-center justify-center py-3 text-gray-600 hover:bg-gray-50 transition min-h-[44px]"
          >
            <Heart className={`w-5 h-5 ${favoriteProperties.includes(property.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
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
                 {/* BHK Badge */}
         <div className="absolute top-4 left-4 z-10">
           <span className="bg-primary-600 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
             {(() => {
               // For buy listings (full homes)
               if (listingType === 'buy') {
                 // 1. Try bedrooms field
                 if (typeof property.bedrooms === 'number' && property.bedrooms > 0) {
                   return `${property.bedrooms}BHK`;
                 }
                 // 2. Try roomType (BHK from form) - this is where the BHK data is saved
                 if ((property as any).roomType) {
                   const bhkRegex = /[1-9]BHK\+?/;
                   const match = (property as any).roomType.match(bhkRegex);
                   if (match) return match[0];
                 }
                 // 3. Try homeType (Home Type from form)
                 if ((property as any).homeType) {
                   const bhkRegex = /[1-9]BHK\+?/;
                   const match = (property as any).homeType.match(bhkRegex);
                   if (match) return match[0];
                 }
                 // 4. Try sellDetails.propertyType
                 if (property.sellDetails?.propertyType) {
                   const bhkRegex = /[1-9]BHK\+?/;
                   const match = property.sellDetails.propertyType.match(bhkRegex);
                   if (match) return match[0];
                 }
                 // 5. Try other BHK fields
                 const bhkRegex = /[1-9]BHK\+?/;
                 const candidates = [
                   property.type,
                   property.title,
                   property.description,
                 ];
                 for (const val of candidates) {
                   if (typeof val === 'string' && bhkRegex.test(val)) {
                     return val.match(bhkRegex)![0];
                   }
                 }
               }
               // For rent listings (shared homes)
               else if (listingType === 'rent') {
                 // 1. Try bedrooms field
                 if (typeof property.bedrooms === 'number' && property.bedrooms > 0) {
                   return `${property.bedrooms}BHK`;
                 }
                 // 2. Try rentDetails.roomDetails.availability
                 if (property.rentDetails?.roomDetails?.availability) {
                   const bhkRegex = /[1-9]BHK\+?/;
                   const match = property.rentDetails.roomDetails.availability.match(bhkRegex);
                   if (match) return match[0];
                 }
                 // 3. Try other BHK fields
                 const bhkRegex = /[1-9]BHK\+?/;
                 const candidates = [
                   property.type,
                   property.title,
                   property.description,
                 ];
                 for (const val of candidates) {
                   if (typeof val === 'string' && bhkRegex.test(val)) {
                     return val.match(bhkRegex)![0];
                   }
                 }
               }
               // Fallback
               return '-';
             })()}
           </span>
         </div>
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition"
        >
          <Heart className={`w-5 h-5 ${favoriteProperties.includes(property.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
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
                    : (property.sellDetails?.price || property.price || 0)
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
          
          {/* Property Details Section */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Property Details</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {/* BHK */}
              <div>
                <span className="text-gray-600">BHK:</span>
                <span className="font-medium ml-1">
                  {(() => {
                    // For buy listings (full homes)
                    if (listingType === 'buy') {
                      // 1. Try bedrooms field
                      if (property.bedrooms && typeof property.bedrooms === 'number' && property.bedrooms > 0) {
                        return `${property.bedrooms}BHK`;
                      }
                      // 2. Try roomType (BHK from form) - this is where the BHK data is saved
                      if ((property as any).roomType) {
                        const bhkRegex = /[1-9]BHK\+?/;
                        const match = (property as any).roomType.match(bhkRegex);
                        if (match) return match[0];
                      }
                      // 3. Try homeType (Home Type from form)
                      if ((property as any).homeType) {
                        const bhkRegex = /[1-9]BHK\+?/;
                        const match = (property as any).homeType.match(bhkRegex);
                        if (match) return match[0];
                      }
                      // 4. Try sellDetails.propertyType
                      if (property.sellDetails?.propertyType) {
                        const bhkRegex = /[1-9]BHK\+?/;
                        const match = property.sellDetails.propertyType.match(bhkRegex);
                        if (match) return match[0];
                      }
                      // 5. Try other BHK fields
                      const bhkRegex = /[1-9]BHK\+?/;
                      const candidates = [
                        property.type,
                        property.title,
                        property.description,
                      ];
                      for (const val of candidates) {
                        if (typeof val === 'string' && bhkRegex.test(val)) {
                          return val.match(bhkRegex)![0];
                        }
                      }
                    }
                    // For rent listings (shared homes)
                    else if (listingType === 'rent') {
                      // 1. Try bedrooms field
                      if (property.bedrooms && typeof property.bedrooms === 'number' && property.bedrooms > 0) {
                        return `${property.bedrooms}BHK`;
                      }
                      // 2. Try rentDetails.roomDetails.availability
                      if (property.rentDetails?.roomDetails?.availability) {
                        const bhkRegex = /[1-9]BHK\+?/;
                        const match = property.rentDetails.roomDetails.availability.match(bhkRegex);
                        if (match) return match[0];
                      }
                      // 3. Try other BHK fields
                      const bhkRegex = /[1-9]BHK\+?/;
                      const candidates = [
                        property.type,
                        property.title,
                        property.description,
                      ];
                      for (const val of candidates) {
                        if (typeof val === 'string' && bhkRegex.test(val)) {
                          return val.match(bhkRegex)![0];
                        }
                      }
                    }
                    // Fallback
                    return '-';
                  })()}
                </span>
              </div>
              
              {/* Property Type */}
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="font-medium ml-1">
                  {listingType === 'rent' 
                    ? ((property.rentDetails?.roomDetails as any)?.roomType || property.type || '-')
                    : ((property as any).homeType || property.sellDetails?.propertyType || (property as any).roomType || property.type || '-')
                  }
                </span>
              </div>
              
              {/* Bathrooms */}
              <div>
                <span className="text-gray-600">Bathrooms:</span>
                <span className="font-medium ml-1">{property.bathrooms || '-'}</span>
              </div>
              
              {/* Area */}
              <div>
                <span className="text-gray-600">Area:</span>
                <span className="font-medium ml-1">
                  {listingType === 'buy' 
                    ? `${property.sellDetails?.sqft || property.area || '-'} sq ft`
                    : `${property.area || '-'} sq ft`
                  }
                </span>
              </div>
              
              {/* Furnishing */}
              <div>
                <span className="text-gray-600">Furnishing:</span>
                <span className="font-medium ml-1">
                  {listingType === 'buy' 
                    ? ((property as any).furnishType || (property.sellDetails as any)?.furnishType || (property as any).furnishingType || '-')
                    : ((property as any).furnishingType || '-')
                  }
                </span>
              </div>
              
              {/* Parking */}
              <div>
                <span className="text-gray-600">Parking:</span>
                <span className="font-medium ml-1">{(property as any).parking || '-'}</span>
              </div>
              
              {/* Available From */}
              <div>
                <span className="text-gray-600">Available:</span>
                <span className="font-medium ml-1">
                  {(property as any).isImmediate ? 'Immediate' : formatAvailabilityDate((property as any).handoverDate)}
                </span>
              </div>
              
              {/* Contact Info */}
              <div>
                <span className="text-gray-600">Contact:</span>
                <span className="font-medium ml-1">{property.contactNumber || '-'}</span>
              </div>
              
              {/* Looking For (Family/Bachelor) */}
              <div>
                <span className="text-gray-600">Looking For:</span>
                <span className="font-medium ml-1">
                  {listingType === 'buy' 
                    ? ((property.sellDetails as any)?.lookingFor || (property as any).lookingFor || '-')
                    : (property.rentDetails?.preferredTenant?.lookingFor || '-')
                  }
                </span>
              </div>
            </div>
          </div>
          
          {/* Additional Details for Rent Listings */}
          {listingType === 'rent' && property.rentDetails && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Rent Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Rent:</span>
                  <span className="font-medium ml-1">₹{formatCurrency(property.rentDetails.costs?.rent || 0)}/month</span>
                </div>
                <div>
                  <span className="text-gray-600">Deposit:</span>
                  <span className="font-medium ml-1">₹{formatCurrency(property.rentDetails.costs?.securityDeposit || 0)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Maintenance:</span>
                  <span className="font-medium ml-1">₹{formatCurrency(property.rentDetails.costs?.maintenance || 0)}/month</span>
                </div>
                <div>
                  <span className="text-gray-600">Available Rooms:</span>
                  <span className="font-medium ml-1">{property.rentDetails.roomDetails?.availableRooms || '-'}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Additional Details for Buy Listings */}
          {listingType === 'buy' && property.sellDetails && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Sale Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium ml-1">₹{formatCurrency(property.sellDetails.price || 0)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Direction:</span>
                  <span className="font-medium ml-1">{property.sellDetails.direction || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Ownership:</span>
                  <span className="font-medium ml-1">{property.sellDetails.ownership || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium ml-1">{property.sellDetails.ageOfProperty || '-'}</span>
                </div>
              </div>
            </div>
          )}
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
