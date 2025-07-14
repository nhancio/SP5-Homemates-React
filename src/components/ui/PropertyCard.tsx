import React, { useState, useRef } from 'react';
import { Phone, Share2, Heart, Building, MapPin, Calendar, Car, Home } from 'lucide-react';
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
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  listingType = 'rent',
  variant = 'small'
}) => {
  const { favoriteProperties, toggleFavorite, user } = useAppContext();
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const swiperRef = useRef<any>(null);

  const isFavorite = favoriteProperties.includes(property.id);

  const handleImageLoad = () => setIsLoaded(true);

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.contactNumber) {
      window.location.href = `tel:${property.contactNumber}`;
    } else {
      alert('Contact number not available for this property');
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const type = listingType === 'buy' ? 'sell' : 'rent';
    const url = getShareableUrl(property.id, type);
    const price = listingType === 'rent' ? property.rentDetails?.costs?.rent : property.sellDetails?.price;

    const shareText = `Hey, check this property on Homemates!\nName: ${property.address?.buildingName || 'Property'}\n${listingType === 'rent' ? 'Rent' : 'Price'}: ₹${formatCurrency(price || 0)}\nType: ${property.propertyType || property.type || '-'}\nLocation: ${property.address?.locality}, ${property.address?.city}\nLink: ${url}`;

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

    try {
      await updateUserFavorites(user.id, property.id, !isFavorite);
      toggleFavorite(property.id);
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

  const renderSmallCard = () => (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-property-card hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination]}
          pagination={{ clickable: true }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          loop={(property.images?.length || 0) > 1}
          className="h-52"
        >
          {(property.images?.length ? property.images : ['placeholder']).map((img, idx) => (
            <SwiperSlide key={idx}>
              <div className={`h-52 bg-gray-200 ${!isLoaded ? 'animate-pulse' : ''}`}>
                {img === 'placeholder' ? (
                  <div className="w-full h-full flex justify-center items-center text-gray-400">
                    <Building className="w-12 h-12" />
                  </div>
                ) : (
                  <img src={img} alt="" className="w-full h-full object-cover rounded-lg" onLoad={handleImageLoad} loading="lazy" />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div
          className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow z-10 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            swiperRef.current?.slidePrev();
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </div>

        <div
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow z-10 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            swiperRef.current?.slideNext();
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>

        <div className="absolute top-3 left-3 z-10">
          <span className="bg-primary-600 text-white text-xs font-semibold px-2 py-1 rounded">
            {property.propertyType || property.type}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold line-clamp-1">
            {property.address?.buildingName || 'Property'}
          </h3>
          <span className="text-lg font-bold text-primary-600">
            ₹{formatCurrency(property.rentDetails?.costs?.rent || property.sellDetails?.price || 0)}
          </span>
        </div>

        <p className="text-gray-600 text-sm mt-1 line-clamp-1">
          {property.address?.locality}, {property.address?.city}
        </p>

        {listingType === 'rent' && (
          <div className="flex gap-4 mt-3 text-sm text-gray-700">
            <div className="flex flex-col items-center">
              <span className="font-semibold">
                {property.isImmediate ? 'Immediate' : formatAvailabilityDate(property.handoverDate)}
              </span>
              <span className="text-xs text-gray-500">Available</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold">{property.furnishingType || '-'}</span>
              <span className="text-xs text-gray-500">Furnishing</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold">{property.parking || '-'}</span>
              <span className="text-xs text-gray-500">Parking</span>
            </div>
          </div>
        )}

        {listingType === 'buy' && (
          <div className="flex gap-4 mt-3 text-sm text-gray-700">
            <div className="flex flex-col items-center">
              <span className="font-semibold">{property.sellDetails?.sqft || '-'}</span>
              <span className="text-xs text-gray-500">Sq.ft</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold">{property.sellDetails?.direction || '-'}</span>
              <span className="text-xs text-gray-500">Direction</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex border-t border-gray-200">
        <button
          onClick={handleFavoriteClick}
          className="flex items-center justify-center w-1/3 py-3 hover:bg-gray-50 transition"
        >
          <Heart
            className={`w-4 h-4 mr-1 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
          <span className="text-sm text-black">{isFavorite ? 'Saved' : 'Save'}</span>
        </button>
        <button
          onClick={handleCall}
          className="flex items-center justify-center w-1/3 py-3 text-primary-600 hover:bg-primary-50 transition border-l border-r border-gray-200"
        >
          <Phone className="w-4 h-4 mr-1" />
          <span className="text-sm text-black">Call</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center w-1/3 py-3 text-gray-600 hover:bg-gray-50 transition"
        >
          <Share2 className="w-4 h-4 mr-1" />
          <span className="text-sm text-black">Share</span>
        </button>
      </div>
    </div>
  );

  const renderLargeCard = () => (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-gray-100"
      onClick={handleCardClick}
    >
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination]}
          pagination={{ clickable: true }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
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
                  <img src={img} alt="" className="w-full h-full object-cover" onLoad={handleImageLoad} loading="lazy" />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg z-10 cursor-pointer hover:bg-gray-50"
          onClick={(e) => {
            e.stopPropagation();
            swiperRef.current?.slidePrev();
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </div>

        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg z-10 cursor-pointer hover:bg-gray-50"
          onClick={(e) => {
            e.stopPropagation();
            swiperRef.current?.slideNext();
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>

        <div className="absolute top-4 left-4 z-10">
          <span className="bg-primary-600 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
            {property.propertyType || property.type}
          </span>
        </div>

        <button
          onClick={handleFavoriteClick}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition"
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </button>
      </div>

      <div className="p-6">
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
            <div className="text-2xl font-bold text-primary-600">
              ₹{formatCurrency(property.rentDetails?.costs?.rent || property.sellDetails?.price || 0)}
            </div>
            <div className="text-sm text-gray-500">
              {listingType === 'rent' ? 'per month' : 'total price'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {listingType === 'rent' ? (
            <>
              <div className="flex items-center text-sm text-gray-700">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span>
                  {property.isImmediate ? 'Immediate' : formatAvailabilityDate(property.handoverDate)}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <Home className="w-4 h-4 mr-2 text-gray-500" />
                <span>{property.furnishingType || 'Not specified'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <Car className="w-4 h-4 mr-2 text-gray-500" />
                <span>{property.parking || 'Not specified'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <Building className="w-4 h-4 mr-2 text-gray-500" />
                <span>{property.bedrooms || '-'} BHK</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center text-sm text-gray-700">
                <Building className="w-4 h-4 mr-2 text-gray-500" />
                <span>{property.sellDetails?.sqft || '-'} sq.ft</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                <span>{property.sellDetails?.direction || '-'}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCall}
            className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center"
          >
            <Phone className="w-4 h-4 mr-2" />
            Contact Owner
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return variant === 'large' ? renderLargeCard() : renderSmallCard();
};

export default PropertyCard;
