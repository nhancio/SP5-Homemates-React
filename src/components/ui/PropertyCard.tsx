import React, { useState, useRef } from 'react';
import { Phone, Share2, Heart, Building, MapPin, Calendar, Car, Home, KeyRound, BedDouble, Snowflake, Shield, Refrigerator, WashingMachine, Plug, X, Check } from 'lucide-react';
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

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  listingType = 'rent',
  variant = 'small',
  onClick
}) => {
  const { favoriteProperties, toggleFavorite, user } = useAppContext();
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const swiperRef = useRef<any>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [showSavedAnimation, setShowSavedAnimation] = useState(false);

  const isFavorite = favoriteProperties.includes(property.id);

  const handleImageLoad = () => setIsLoaded(true);

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.contactInfo?.phone) {
      window.location.href = `tel:${property.contactInfo.phone}`;
    } else {
      alert('Contact number not available for this property');
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.contactInfo?.phone) {
      const url = `https://wa.me/${property.contactInfo.phone.replace(/\D/g, '')}`;
      window.open(url, '_blank');
    } else {
      alert('Contact number not available for this property');
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const type = listingType === 'buy' ? 'sell' : 'rent';
    const url = getShareableUrl(property.id, type);
    const price = listingType === 'rent' ? property.rentDetails?.costs?.rent : property.price;

    const shareText = `Hey, check this property on Homemates!\nName: ${property.address?.buildingName || 'Property'}\n${listingType === 'rent' ? 'Rent' : 'Price'}: ₹${formatCurrency(price || 0)}\nType: ${property.type || '-'}\nLocation: ${property.address?.locality}, ${property.address?.city}\nLink: ${url}`;

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
    navigate(`/${listingType}/${property.id}`);
  };

  const formatAvailabilityDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });
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
              <div className={`h-48 bg-gray-200 ${!isLoaded ? 'animate-pulse' : ''}`}>
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
            {property.type}
          </span>
        </div>
        {/* Left Arrow */}
        <div
          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow z-10 cursor-pointer hover:bg-primary-50"
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
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow z-10 cursor-pointer hover:bg-primary-50"
          onClick={e => {
            e.stopPropagation();
            swiperRef.current?.slideNext();
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
      {/* Main Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-bold line-clamp-1 text-gray-900">
              {listingType === 'buy'
                ? (property.address?.buildingName || 'No Building Name')
                : (property.address?.buildingName || 'Property')}
            </h3>
            <span className="text-lg font-extrabold text-primary-600">
              ₹{formatCurrency(property.rentDetails?.costs?.rent || property.price || 0)}
            </span>
          </div>
          <div className="text-xs text-primary-600 font-semibold mb-1">
            {(property.rentDetails?.roomDetails?.availableRooms ?? '-')} room(s) available in {property.address?.buildingName ?? '-'}, {property.address?.locality ?? '-'}, {property.address?.city ?? '-'}
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="line-clamp-1">{property.address?.locality}, {property.address?.city}</span>
          </div>
          {/* Amenity Icons Row */}
          <div className="flex gap-2 mt-2 mb-2">
            {Object.entries(AMENITY_ICONS).map(([key, icon]) => (
              <span key={key} className={`rounded-full p-1 bg-gray-100 ${property.features?.includes(key) ? 'text-primary-600' : 'text-gray-400'}`}>{icon}</span>
            ))}
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex border-t border-gray-200 pt-2 mt-2">
          <button
            onClick={handleFavoriteClick}
            className="flex-1 flex items-center justify-center py-2 hover:bg-gray-50 transition rounded-l-lg"
          >
            <Heart className={`w-4 h-4 mr-1 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            <span className="text-xs text-black">{isFavorite ? 'Saved' : 'Save'}</span>
            {showSavedAnimation && (
              <span className="ml-2 animate-fade-in-out text-green-600">
                <Check className="w-4 h-4" />
              </span>
            )}
          </button>
          <button
            onClick={handleCall}
            className="flex-1 flex items-center justify-center py-2 text-primary-600 hover:bg-primary-50 transition border-l border-r border-gray-200"
          >
            <Phone className="w-4 h-4 mr-1" />
            <span className="text-xs text-black">Call</span>
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex-1 flex items-center justify-center py-2 text-green-600 hover:bg-green-50 transition border-l border-r border-gray-200"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5 mr-1" />
            <span className="text-xs text-black">WhatsApp</span>
          </button>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center py-2 text-gray-600 hover:bg-gray-50 transition rounded-r-lg"
          >
            <Share2 className="w-4 h-4 mr-1" />
            <span className="text-xs text-black">Share</span>
          </button>
        </div>
      </div>
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
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {property.address?.buildingName || 'Property'}
              </h3>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{property.address?.locality}, {property.address?.city}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-primary-600">
                ₹{formatCurrency(property.rentDetails?.costs?.rent || property.price || 0)}
              </div>
              <div className="text-sm text-gray-500">
                {listingType === 'rent' ? 'per month' : 'total price'}
              </div>
            </div>
          </div>
          <div className="text-sm text-primary-600 font-semibold mb-2">
            {(property.rentDetails?.roomDetails?.availableRooms ?? '-')} room(s) available in {property.address?.buildingName ?? '-'}, {property.address?.locality ?? '-'}, {property.address?.city ?? '-'}
          </div>
          {/* Amenity Icons Row */}
          <div className="flex gap-3 mb-4">
            {Object.entries(AMENITY_ICONS).map(([key, icon]) => (
              <span key={key} className={`rounded-full p-2 bg-gray-100 ${property.features?.includes(key) ? 'text-primary-600' : 'text-gray-400'}`}>{icon}</span>
            ))}
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-3 mt-auto">
          <button
            onClick={handleCall}
            className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center"
          >
            <Phone className="w-4 h-4 mr-2" />
            Contact Owner
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-4 h-4 mr-2" />
            WhatsApp
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Full-page image modal */}
      {showImageModal && modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={() => setShowImageModal(false)}
        >
          <img
            src={modalImage}
            alt="Property"
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute top-6 right-6 text-white text-3xl font-bold"
            onClick={() => setShowImageModal(false)}
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );

  // --- Render Variant ---
  return variant === 'large' ? renderLargeCard() : renderSmallCard();
};

export default PropertyCard;
