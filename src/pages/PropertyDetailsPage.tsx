import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPropertyById } from '../services/listings';
import { Phone, Share2, Heart, Building, Loader, ArrowLeft, Wifi, Car, Droplet, Utensils, Dumbbell, Snowflake, Shield, Tv, Flame, Fan, Lightbulb, Lock, Refrigerator, WashingMachine, BedDouble, ShowerHead, PawPrint, Users, KeyRound, Plug, Speaker, ParkingCircle, Bike, Leaf, Sun, Thermometer, AirVent, Home, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/format';
import { getShareableUrl } from '../utils/share';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

const PropertyDetailsPage = () => {
  const { propertyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { favoriteProperties, toggleFavorite, isAuthenticated, login, user, filters } = useAppContext();
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState<number>(0);

  // Determine listing type from URL
  const listingType = location.pathname.startsWith('/rent') ? 'rent' : 'sell';

  // Helper to get applied filters as chips
  const getAppliedFilters = () => {
    const activeType = filters.activeType || listingType;
    const f = filters[activeType] || {};
    const chips: { label: string, value: string }[] = [];
    if (f.city) chips.push({ label: 'City', value: f.city });
    if (f.locality) chips.push({ label: 'Locality', value: f.locality });
    if (f.propertyType) chips.push({ label: 'Type', value: f.propertyType });
    if (f.bhk) chips.push({ label: 'BHK', value: f.bhk });
    if (f.furnishingType) chips.push({ label: 'Furnishing', value: f.furnishingType });
    if (f.bathrooms) chips.push({ label: 'Bathrooms', value: f.bathrooms });
    if (f.minRent) chips.push({ label: 'Min Rent', value: `₹${f.minRent}` });
    if (f.maxRent && f.maxRent !== 10000000) chips.push({ label: 'Max Rent', value: `₹${f.maxRent}` });
    if (f.minPrice) chips.push({ label: 'Min Price', value: `₹${f.minPrice}` });
    if (f.maxPrice && f.maxPrice !== 10000000) chips.push({ label: 'Max Price', value: `₹${f.maxPrice}` });
    if (f.amenities) chips.push({ label: 'Amenities', value: f.amenities });
    if (f.availability) chips.push({ label: 'Availability', value: f.availability });
    if (f.availableFrom) chips.push({ label: 'Available From', value: f.availableFrom });
    if (f.ageOfProperty) chips.push({ label: 'Age', value: f.ageOfProperty });
    if (f.possessionStatus) chips.push({ label: 'Possession', value: f.possessionStatus });
    return chips;
  };

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return;
      setIsLoading(true);
      setError(null);
      try {
        // Try fetching as rent first
        let propertyData = null;
        try {
          propertyData = await getPropertyById('rent', propertyId);
          setProperty(propertyData);
        } catch (err) {
          // If not found as rent, try as sell
          try {
            propertyData = await getPropertyById('sell', propertyId);
            setProperty(propertyData);
          } catch (err2) {
            setError('Property not found');
            setProperty(null);
          }
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        setError(error instanceof Error ? error.message : 'Failed to load property');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);

  const handleLoginPrompt = () => {
    if (window.confirm('Please login to use this feature. Would you like to login now?')) {
      login();
    }
  };

  const handleCall = async () => {
    if (!isAuthenticated) {
      handleLoginPrompt();
      return;
    }

    try {
      // Check and use credits
      const { useCredits } = await import('../services/credits');
      const creditUsed = await useCredits(user!.id, 'call');
      
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

  const handleShare = async () => {
    try {
      const url = getShareableUrl(property.id, listingType);
      const shareText = 
`Hey, check this property on Homemates!
Name: ${property.address?.buildingName || 'Property'}
${listingType === 'rent' ? 'Rent' : 'Price'}: ₹${formatCurrency(listingType === 'rent' ? property.rentDetails?.costs?.rent : property.sellDetails?.price || 0)}
Type: ${property.propertyType || '-'}
Location: ${property.address?.locality}, ${property.address?.city}
Link: ${url}`;

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

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      handleLoginPrompt();
      return;
    }

    toggleFavorite(property.id);
  };

  // Amenity icon mapping
  const amenityIconMap: Record<string, React.ReactNode> = {
    wifi: <Wifi className="w-4 h-4 mr-1 text-primary-600" />,
    parking: <Car className="w-4 h-4 mr-1 text-primary-600" />,
    water: <Droplet className="w-4 h-4 mr-1 text-primary-600" />,
    kitchen: <Utensils className="w-4 h-4 mr-1 text-primary-600" />,
    gym: <Dumbbell className="w-4 h-4 mr-1 text-primary-600" />,
    ac: <Snowflake className="w-4 h-4 mr-1 text-primary-600" />,
    security: <Shield className="w-4 h-4 mr-1 text-primary-600" />,
    tv: <Tv className="w-4 h-4 mr-1 text-primary-600" />,
    gas: <Flame className="w-4 h-4 mr-1 text-primary-600" />,
    fan: <Fan className="w-4 h-4 mr-1 text-primary-600" />,
    light: <Lightbulb className="w-4 h-4 mr-1 text-primary-600" />,
    lock: <Lock className="w-4 h-4 mr-1 text-primary-600" />,
    fridge: <Refrigerator className="w-4 h-4 mr-1 text-primary-600" />,
    washing: <WashingMachine className="w-4 h-4 mr-1 text-primary-600" />,
    bed: <BedDouble className="w-4 h-4 mr-1 text-primary-600" />,
    shower: <ShowerHead className="w-4 h-4 mr-1 text-primary-600" />,
    pet: <PawPrint className="w-4 h-4 mr-1 text-primary-600" />,
    roommate: <Users className="w-4 h-4 mr-1 text-primary-600" />,
    key: <KeyRound className="w-4 h-4 mr-1 text-primary-600" />,
    power: <Plug className="w-4 h-4 mr-1 text-primary-600" />,
    music: <Speaker className="w-4 h-4 mr-1 text-primary-600" />,
    car: <ParkingCircle className="w-4 h-4 mr-1 text-primary-600" />,
    bike: <Bike className="w-4 h-4 mr-1 text-primary-600" />,
    garden: <Leaf className="w-4 h-4 mr-1 text-primary-600" />,
    sunlight: <Sun className="w-4 h-4 mr-1 text-primary-600" />,
    temperature: <Thermometer className="w-4 h-4 mr-1 text-primary-600" />,
    ventilation: <AirVent className="w-4 h-4 mr-1 text-primary-600" />,
    purifiedwater: <Droplet className="w-4 h-4 mr-1 text-primary-600" />,
    house: <Home className="w-4 h-4 mr-1 text-primary-600" />,
    // Add more mappings as needed
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <Building className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold mb-4">
            {error || 'Property Not Found'}
          </h1>
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-primary flex items-center justify-center mx-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container">
        {/* Add a CTA banner for non-authenticated users */}
        {!isAuthenticated && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-primary-700">Sign in to contact property owners</h2>
              <p className="text-primary-600">Create an account to get full access to all features</p>
            </div>
            <button 
              onClick={() => login()}
              className="btn btn-primary"
            >
              Sign in with Google
            </button>
          </div>
        )}

        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to {listingType === 'rent' ? 'Rental' : 'Sale'} Properties
        </button>

        {/* Applied Filters Row */}
        <div className="mb-4 flex flex-wrap gap-2">
          {getAppliedFilters().map((chip, i) => (
            <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold border border-primary-200">
              {chip.label}: {chip.value}
            </span>
          ))}
        </div>

        {/* Property Type Badge */}
        <div className="mb-4">
          <span className="bg-primary-600 text-white text-sm font-medium px-3 py-1 rounded">
            {listingType === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          <div className="aspect-[16/9] w-full rounded-lg overflow-hidden bg-gray-100">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              className="w-full h-full"
            >
              {(property.images?.length ? property.images : ['placeholder']).map((image: string, index: number) => (
                <SwiperSlide key={index}>
                  {image === 'placeholder' ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Building className="w-16 h-16 text-gray-400" />
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <img 
                        src={image} 
                        alt={`Property ${index + 1}`} 
                        className="w-full h-full object-contain rounded-lg bg-white cursor-zoom-in"
                        onClick={() => {
                          setModalImage(image);
                          setModalImageIndex(index);
                          setShowImageModal(true);
                        }}
                      />
                      {/* Zoom/Expand Button */}
                      <button
                        className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white rounded-full p-2 hover:bg-opacity-80 focus:outline-none"
                        onClick={e => {
                          e.stopPropagation();
                          setModalImage(image);
                          setModalImageIndex(index);
                          setShowImageModal(true);
                        }}
                        aria-label="Expand image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6m0 0v6m0-6L10 14m-1 7H3m0 0v-6m0 6l11-11" />
                        </svg>
                      </button>
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Property Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Basic Info */}
              <div className="p-6 border-b">
                <div className="flex items-center text-2xl font-bold text-primary-600 mb-2">
                  ₹{formatCurrency(listingType === 'rent' ? property.rentDetails?.costs?.rent : property.sellDetails?.price)}
                  {listingType === 'rent' && <span className="text-sm text-gray-500 ml-1">/month</span>}
                </div>
                <h1 className="text-2xl font-bold mb-2">
                  {property.address?.buildingName}
                </h1>
                <p className="text-gray-600 mb-4">
                  {property.address?.locality}, {property.address?.city}
                </p>
              </div>

              {/* Property Details */}
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold mb-4">Property Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-gray-600">Type</span>
                    <p className="font-semibold">{property.propertyType}</p>
                  </div>
                  {listingType === 'sell' ? (
                    <>
                      <div>
                        <span className="text-gray-600">Built Up Area</span>
                        <p className="font-semibold">{property.sellDetails?.sqft || '-'} Sq.ft</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Direction</span>
                        <p className="font-semibold">{property.sellDetails?.direction || '-'}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-gray-600">Room Type</span>
                        <p className="font-semibold">{property.rentDetails?.roomDetails?.roomType || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Bathroom Type</span>
                        <p className="font-semibold">{property.rentDetails?.roomDetails?.bathroomType || '-'}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <span className="text-gray-600">Furnishing</span>
                    <p className="font-semibold">{property.furnishingType}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Building Type</span>
                    <p className="font-semibold">{property.buildingType}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Available From</span>
                    <p className="font-semibold">
                      {property.isImmediate ? 'Immediate' : property.handoverDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cost Details - Only for Rent */}
              {listingType === 'rent' && (
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold mb-4">Rent Details</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-gray-600">Monthly Rent</span>
                      <p className="font-semibold">₹{formatCurrency(property.rentDetails?.costs?.rent)} <span className="text-xs text-gray-500">/month</span></p>
                    </div>
                    <div>
                      <span className="text-gray-600">Maintenance</span>
                      <p className="font-semibold">₹{formatCurrency(property.rentDetails?.costs?.maintenance)} <span className="text-xs text-gray-500">/month</span></p>
                    </div>
                    <div>
                      <span className="text-gray-600">Security Deposit</span>
                      <p className="font-semibold">₹{formatCurrency(property.rentDetails?.costs?.securityDeposit)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Setup Cost</span>
                      <p className="font-semibold">₹{formatCurrency(property.rentDetails?.costs?.setupCost)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Brokerage</span>
                      <p className="font-semibold">₹{formatCurrency(property.rentDetails?.costs?.brokerage)}</p>
                    </div>
                  </div>
                </div>
              )}
              {/* Contact Number - Show if available */}
              {property.contactNumber && (
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold mb-4">Contact Number</h2>
                  <p className="font-semibold text-primary-700 text-lg">{property.contactNumber}</p>
                </div>
              )}

              {/* Additional Bills - Only for Rent */}
              {listingType === 'rent' && property.rentDetails?.additionalBills && (
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold mb-4">Additional Bills</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(property.rentDetails.additionalBills).map(([key, value]) => (
                      value ? (
                        <div key={key}>
                          <span className="text-gray-600">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                          <p className="font-semibold">₹{formatCurrency(Number(value))}</p>
                        </div>
                      ) : null
                    ))}
                    <div className="col-span-full mt-4 pt-4 border-t">
                      <span className="text-gray-600">Total Additional Bills</span>
                      <p className="font-semibold text-lg text-primary-600">
                        ₹{formatCurrency(
                          Object.values(property.rentDetails.additionalBills)
                            .reduce((sum: number, value) => sum + (Number(value) || 0), 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tenant Preferences - Only for Rent */}
              {listingType === 'rent' && property.rentDetails?.preferredTenant && (
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold mb-4">Tenant Preferences</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">Looking for</span>
                      <p className="font-semibold">{property.rentDetails.preferredTenant.lookingFor || 'Any'}</p>
                    </div>
                    {property.rentDetails.preferredTenant.preferences?.length > 0 && (
                      <div>
                        <span className="text-gray-600">Preferences</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {property.rentDetails.preferredTenant.preferences.map((pref: string) => (
                            <span key={pref} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                              {pref}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Amenities Section */}
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold mb-4">Amenities</h2>
                {listingType === 'rent' && property.amenities && (
                  <div className="space-y-2">
                    {property.amenities.appliances?.length > 0 && (
                      <div>
                        <span className="text-gray-600 font-medium">Appliances:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {property.amenities.appliances.map((amenity: string) => (
                            <span key={amenity} className="flex items-center px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold border border-primary-100">
                              {amenityIconMap[amenity.toLowerCase()] || null}
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {property.amenities.furniture?.length > 0 && (
                      <div>
                        <span className="text-gray-600 font-medium">Furniture:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {property.amenities.furniture.map((amenity: string) => (
                            <span key={amenity} className="flex items-center px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold border border-primary-100">
                              {amenityIconMap[amenity.toLowerCase()] || null}
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {property.amenities.building?.length > 0 && (
                      <div>
                        <span className="text-gray-600 font-medium">Building:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {property.amenities.building.map((amenity: string) => (
                            <span key={amenity} className="flex items-center px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold border border-primary-100">
                              {amenityIconMap[amenity.toLowerCase()] || null}
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(!property.amenities.appliances?.length && !property.amenities.furniture?.length && !property.amenities.building?.length) && (
                      <span className="text-gray-500">No amenities listed.</span>
                    )}
                  </div>
                )}
                {listingType === 'sell' && property.sellDetails?.amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {property.sellDetails.amenities.map((amenity: string) => (
                      <span key={amenity} className="flex items-center px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold border border-primary-100">
                        {amenityIconMap[amenity.toLowerCase()] || null}
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
                {listingType === 'sell' && (!property.sellDetails?.amenities || property.sellDetails.amenities.length === 0) && (
                  <span className="text-gray-500">No amenities listed.</span>
                )}
              </div>

              {/* Description */}
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleCall}
                  className="btn btn-primary flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Contact Owner
                </button>
                <button
                  onClick={handleFavoriteClick}
                  className="btn btn-secondary flex items-center justify-center gap-2"
                >
                  <Heart className={isAuthenticated && favoriteProperties.includes(property.id) ? 'fill-red-500' : ''} />
                  {isAuthenticated && favoriteProperties.includes(property.id) ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={handleShare}
                  className="btn btn-outline flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showImageModal && modalImage && (
        // Defensive: fallback to [] if property.images is undefined
        (() => { const images = property.images?.length ? property.images : []; return (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={() => setShowImageModal(false)}
        >
          {/* Left Clickable Area */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1/2 cursor-pointer z-40"
            onClick={e => {
              e.stopPropagation();
              if (!images.length) return;
              const prevIndex = (modalImageIndex - 1 + images.length) % images.length;
              setModalImage(images[prevIndex]);
              setModalImageIndex(prevIndex);
            }}
            aria-label="Previous image"
          >
            <span className="absolute left-8 top-1/2 -translate-y-1/2">
              <span className="flex items-center justify-center w-12 h-12 bg-black bg-opacity-60 rounded-full text-white hover:bg-opacity-80 pointer-events-none select-none">
                <ChevronLeft className="w-8 h-8" />
              </span>
            </span>
          </div>
          {/* Right Clickable Area */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1/2 cursor-pointer z-40"
            onClick={e => {
              e.stopPropagation();
              if (!images.length) return;
              const nextIndex = (modalImageIndex + 1) % images.length;
              setModalImage(images[nextIndex]);
              setModalImageIndex(nextIndex);
            }}
            aria-label="Next image"
          >
            <span className="absolute right-8 top-1/2 -translate-y-1/2">
              <span className="flex items-center justify-center w-12 h-12 bg-black bg-opacity-60 rounded-full text-white hover:bg-opacity-80 pointer-events-none select-none">
                <ChevronRight className="w-8 h-8" />
              </span>
            </span>
          </div>
          {/* Image (centered, above click areas) */}
          <img
            src={modalImage}
            alt="Property Full"
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg z-50"
            onClick={e => e.stopPropagation()}
          />
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 text-white text-3xl font-bold z-50"
            onClick={() => setShowImageModal(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        )})()
      )}
    </div>
  );
};

export default PropertyDetailsPage;
