import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPropertyById } from '../services/listings';
import { Phone, Share2, Heart, Building, Loader, ArrowLeft, Wifi, Car, Droplet, Utensils, Dumbbell, Snowflake, Shield, Tv, Flame, Fan, Lightbulb, Lock, Refrigerator, WashingMachine, BedDouble, ShowerHead, PawPrint, Users, KeyRound, Plug, Speaker, ParkingCircle, Bike, Leaf, Sun, Thermometer, AirVent, Home, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/format';
import { getShareableUrl } from '../utils/share';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

const SERVICES = [
  { key: 'maid', label: 'Maid' },
  { key: 'cook', label: 'Cook' },
  { key: 'laundry', label: 'Laundry' },
  { key: 'wifi', label: 'WiFi' },
  { key: 'security', label: 'Security' },
];

const PropertyDetailsPage = () => {
  const { propertyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { favoriteProperties, toggleFavorite, isAuthenticated, login, loginError, clearLoginError, user, filters } = useAppContext();
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
    // Define possible fields for each filter type
    const fieldMap: Record<string, Array<{ key: string, label: string, isCurrency?: boolean }>> = {
      fullHome: [
        { key: 'city', label: 'City' },
        { key: 'locality', label: 'Locality' },
        { key: 'propertyType', label: 'Type' },
        { key: 'furnishingType', label: 'Furnishing' },
        { key: 'bhk', label: 'BHK' },
        { key: 'bathrooms', label: 'Bathrooms' },
        { key: 'minPrice', label: 'Min Price', isCurrency: true },
        { key: 'maxPrice', label: 'Max Price', isCurrency: true },
        { key: 'minSqft', label: 'Min Sqft' },
        { key: 'maxSqft', label: 'Max Sqft' },
        { key: 'amenities', label: 'Amenities' },
        { key: 'availability', label: 'Availability' },
        { key: 'availableFrom', label: 'Available From' },
        { key: 'ageOfProperty', label: 'Age' },
        { key: 'possessionStatus', label: 'Possession' },
      ],
      rent: [
        { key: 'city', label: 'City' },
        { key: 'locality', label: 'Locality' },
        { key: 'propertyType', label: 'Type' },
        { key: 'furnishingType', label: 'Furnishing' },
        { key: 'bhk', label: 'BHK' },
        { key: 'bathrooms', label: 'Bathrooms' },
        { key: 'minRent', label: 'Min Rent', isCurrency: true },
        { key: 'maxRent', label: 'Max Rent', isCurrency: true },
        { key: 'minSqft', label: 'Min Sqft' },
        { key: 'maxSqft', label: 'Max Sqft' },
        { key: 'amenities', label: 'Amenities' },
        { key: 'availability', label: 'Availability' },
        { key: 'availableFrom', label: 'Available From' },
        { key: 'ageOfProperty', label: 'Age' },
        { key: 'possessionStatus', label: 'Possession' },
      ],
      buy: [
        { key: 'city', label: 'City' },
        { key: 'locality', label: 'Locality' },
        { key: 'propertyType', label: 'Type' },
        { key: 'bhk', label: 'BHK' },
        { key: 'bathrooms', label: 'Bathrooms' },
        { key: 'minPrice', label: 'Min Price', isCurrency: true },
        { key: 'maxPrice', label: 'Max Price', isCurrency: true },
        { key: 'minSqft', label: 'Min Sqft' },
        { key: 'maxSqft', label: 'Max Sqft' },
        { key: 'ageOfProperty', label: 'Age' },
        { key: 'possessionStatus', label: 'Possession' },
      ],
    };
    const fields = fieldMap[activeType] || [];
    fields.forEach(({ key, label, isCurrency }) => {
      const value = (f as any)[key];
      if (value !== undefined && value !== '' && value !== null) {
        if (isCurrency) {
          chips.push({ label, value: `₹${value}` });
        } else {
          chips.push({ label, value });
        }
      }
    });
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
${listingType === 'rent' ? 'Rent' : 'Price'}: ₹${formatCurrency(
  listingType === 'rent' 
    ? (property.rentDetails?.costs?.rent || 0) 
    : (property.sellDetails?.price || property.price || 0)
)}
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

  const handleLogin = async () => {
    clearLoginError(); // Clear any previous errors
    await login();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // Debug: Log the property data to see its structure
  console.log('PropertyDetailsPage - Property data:', property);
  console.log('PropertyDetailsPage - Listing type:', listingType);
  console.log('PropertyDetailsPage - Rent details:', property?.rentDetails);
  console.log('PropertyDetailsPage - Sell details:', property?.sellDetails);

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
    <div className="py-4 md:py-8">
      <div className="container">
        {/* Add a CTA banner for non-authenticated users */}
        {!isAuthenticated && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-primary-700">Sign in to contact property owners</h2>
              <p className="text-primary-600">Create an account to get full access to all features</p>
            </div>
            <div className="relative">
              <button 
                onClick={handleLogin}
                className="btn btn-primary w-full sm:w-auto"
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
        )}

        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 text-sm md:text-base"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Back to {listingType === 'rent' ? 'Rental' : 'Sale'} Properties</span>
          <span className="sm:hidden">Back</span>
        </button>

        {/* Image Gallery */}
        <div className="mb-6 md:mb-8">
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

        {/* Property Details Grid - Mobile Optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Basic Info */}
              <div className="p-4 md:p-6 border-b">
                <div className="flex items-center text-xl md:text-2xl font-bold text-primary-600 mb-2">
                  ₹{formatCurrency(
                    listingType === 'rent' 
                      ? (property.rentDetails?.costs?.rent || 0) 
                      : (property.sellDetails?.price || property.price || 0)
                  )}
                  {listingType === 'rent' && <span className="text-sm text-gray-500 ml-1">/month</span>}
                </div>
                <h1 className="text-xl md:text-2xl font-bold mb-2">
                  {property.address?.buildingName}
                </h1>
                <p className="text-gray-600 mb-4 text-sm md:text-base">
                  {property.address?.locality}, {property.address?.city}
                </p>
                {property.address?.googleMapsLink && property.address.googleMapsLink.startsWith('https://maps.google.') && (
                  <>
                    <a
                      href={property.address.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full font-medium border border-primary-200 hover:bg-primary-100 transition text-sm"
                    >
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10.5V6a2 2 0 0 0-2-2h-4.5" /><path d="M3 14.5V18a2 2 0 0 0 2 2h4.5" /><path d="M21 3l-9 9-9-9" /></svg>
                      View on Google Maps
                    </a>
                    <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm w-full" style={{ aspectRatio: '16/9', maxWidth: '100%' }}>
                      <iframe
                        src={property.address.googleMapsLink}
                        width="100%"
                        height="100%"
                        style={{ border: 0, borderRadius: '12px', width: '100%', height: '100%' }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Google Maps Preview"
                      >
                        Your browser does not support iframes or the map could not be loaded.
                      </iframe>
                    </div>
                  </>
                )}
              </div>

              {/* Property Details */}
              <div className="p-4 md:p-6 border-b">
                <h2 className="text-lg font-semibold mb-4">Property Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-gray-600 text-sm">Type</span>
                    <p className="font-semibold text-sm md:text-base">{property.propertyType}</p>
                  </div>
                  {listingType === 'sell' ? (
                    <>
                      <div>
                        <span className="text-gray-600 text-sm">Built Up Area</span>
                        <p className="font-semibold text-sm md:text-base">{property.sellDetails?.sqft || '-'} Sq.ft</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Direction</span>
                        <p className="font-semibold text-sm md:text-base">{property.sellDetails?.direction || '-'}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-gray-600 text-sm">Room Type</span>
                        <p className="font-semibold text-sm md:text-base">{property.rentDetails?.roomDetails?.availability || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Bathroom Type</span>
                        <p className="font-semibold text-sm md:text-base">{property.rentDetails?.roomDetails?.bathroomType || '-'}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <span className="text-gray-600 text-sm">Furnishing</span>
                    <p className="font-semibold text-sm md:text-base">{property.furnishingType}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 text-sm">Available From</span>
                    <p className="font-semibold text-sm md:text-base">
                      {property.isImmediate ? 'Immediate' : property.handoverDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cost Details - Only for Rent */}
              {listingType === 'rent' && (
                <div className="p-4 md:p-6 border-b">
                  <h2 className="text-lg font-semibold mb-4">Rent Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-gray-600 text-sm">Monthly Rent</span>
                      <p className="font-semibold text-sm md:text-base">₹{formatCurrency(property.rentDetails?.costs?.rent || 0)} <span className="text-xs text-gray-500">/month</span></p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Maintenance</span>
                      <p className="font-semibold text-sm md:text-base">₹{formatCurrency(property.rentDetails?.costs?.maintenance || 0)} <span className="text-xs text-gray-500">/month</span></p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Security Deposit</span>
                      <p className="font-semibold text-sm md:text-base">₹{formatCurrency(property.rentDetails?.costs?.securityDeposit || 0)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Setup Cost</span>
                      <p className="font-semibold text-sm md:text-base">₹{formatCurrency(property.rentDetails?.costs?.setupCost || 0)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Brokerage</span>
                      <p className="font-semibold text-sm md:text-base">₹{formatCurrency(property.rentDetails?.costs?.brokerage || 0)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cost Details - Only for Sell */}
              {listingType === 'sell' && (
                <div className="p-4 md:p-6 border-b">
                  <h2 className="text-lg font-semibold mb-4">Cost Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-gray-600 text-sm">Rent</span>
                      <p className="font-semibold text-sm md:text-base">₹{formatCurrency(property.sellDetails?.rent || 0)} <span className="text-xs text-gray-500">/month</span></p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Maintenance</span>
                      <p className="font-semibold text-sm md:text-base">₹{formatCurrency(property.sellDetails?.maintenance || 0)} <span className="text-xs text-gray-500">/month</span></p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Security Deposit</span>
                      <p className="font-semibold text-sm md:text-base">₹{formatCurrency(property.sellDetails?.securityDeposit || 0)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Brokerage</span>
                      <p className="font-semibold text-sm md:text-base">₹{formatCurrency(property.sellDetails?.brokerage || 0)}</p>
                    </div>
                  </div>
                </div>
              )}
              {/* Contact Number - Show if available */}
              {/* Removed contact number display for privacy */}

              {/* Additional Bills - Only for Rent */}
              {listingType === 'rent' && property.rentDetails?.additionalBills && (
                <div className="p-4 md:p-6 border-b">
                  <h2 className="text-lg font-semibold mb-4">Additional Bills</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(property.rentDetails.additionalBills).map(([key, value]) => (
                      value ? (
                        <div key={key}>
                          <span className="text-gray-600 text-sm">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                          <p className="font-semibold text-sm md:text-base">₹{formatCurrency(Number(value))}</p>
                        </div>
                      ) : null
                    ))}
                    <div className="col-span-full mt-4 pt-4 border-t">
                      <span className="text-gray-600 text-sm">Total Additional Bills</span>
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
                <div className="p-4 md:p-6 border-b">
                  <h2 className="text-lg font-semibold mb-4">Tenant Preferences</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600 text-sm">Looking for</span>
                      <p className="font-semibold text-sm md:text-base">{property.rentDetails.preferredTenant.lookingFor || 'Any'}</p>
                    </div>
                    {property.rentDetails.preferredTenant.preferences?.length > 0 && (
                      <div>
                        <span className="text-gray-600 text-sm">Preferences</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {property.rentDetails.preferredTenant.preferences.map((pref: string) => (
                            <span key={pref} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
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
              <div className="p-4 md:p-6 border-b">
                <h2 className="text-lg font-semibold mb-4">Amenities</h2>
                {listingType === 'rent' && property.amenities && (
                  <div className="space-y-2">
                    {property.amenities.appliances?.length > 0 && (
                      <div>
                        <span className="text-gray-600 font-medium text-sm">Appliances:</span>
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
                        <span className="text-gray-600 font-medium text-sm">Furniture:</span>
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
                        <span className="text-gray-600 font-medium text-sm">Building:</span>
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
              <div className="p-4 md:p-6">
                <h2 className="text-lg font-semibold mb-4">Description</h2>
                {/* <div className="mb-4">
                  <h3 className="font-bold mb-1 text-sm md:text-base">Location</h3>
                  <div className="text-sm md:text-base">City: {property.address?.city}</div>
                  <div className="text-sm md:text-base">Locality: {property.address?.locality}</div>
                  {property.address?.buildingName && <div className="text-sm md:text-base">Address: {property.address.buildingName}</div>}
                </div> */}
                {/* <div className="mb-4">
                  <h3 className="font-bold mb-1 text-sm md:text-base">Services</h3>
                  {/* <div className="text-sm md:text-base">{property.services?.length ? property.services.map((s: string) => SERVICES.find(x => x.key === s)?.label).join(', ') : 'None'}</div>
                </div> */} 
                <p className="text-gray-700 whitespace-pre-line text-sm md:text-base">{property.description}</p>
              </div>
            </div>
          </div>

          {/* Sidebar - Mobile Optimized */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 sticky top-4">
              <div className="flex flex-col gap-3 md:gap-4">
                <button
                  onClick={handleCall}
                  className="btn btn-primary flex items-center justify-center gap-2 py-3 md:py-2 text-sm md:text-base"
                >
                  <Phone className="w-5 h-5" />
                  Contact Owner
                </button>
                <button
                  onClick={handleFavoriteClick}
                  className="btn btn-secondary flex items-center justify-center gap-2 py-3 md:py-2 text-sm md:text-base"
                >
                  <Heart className={isAuthenticated && favoriteProperties.includes(property.id) ? 'fill-red-500' : ''} />
                  {isAuthenticated && favoriteProperties.includes(property.id) ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={handleShare}
                  className="btn btn-outline flex items-center justify-center gap-2 py-3 md:py-2 text-sm md:text-base"
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
        (() => { 
          const images = property.images?.length ? property.images : []; 
          return (
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
                  if (!images.length) return;
                  const prevIndex = (modalImageIndex - 1 + images.length) % images.length;
                  setModalImage(images[prevIndex]);
                  setModalImageIndex(prevIndex);
                } else {
                  // Swipe left - go to next image
                  if (!images.length) return;
                  const nextIndex = (modalImageIndex + 1) % images.length;
                  setModalImage(images[nextIndex]);
                  setModalImageIndex(nextIndex);
                }
              }
              
              document.removeEventListener('touchend', handleTouchEnd);
            };
            
            document.addEventListener('touchend', handleTouchEnd);
          }}
        >
          {/* Image (centered, below navigation buttons) */}
          <img
            src={modalImage}
            alt="Property Full"
            className="max-h-[90vh] max-w-[90vw] rounded-lg z-10"
            onClick={e => e.stopPropagation()}
          />
          {/* Left Navigation Button - Always show for testing */}
          <button
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 sm:p-3 transition-all duration-200 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg border border-white border-opacity-30 z-[9999]"
            onClick={e => {
              e.stopPropagation();
              console.log('Left button clicked!');
              if (!images.length) return;
              const prevIndex = (modalImageIndex - 1 + images.length) % images.length;
              setModalImage(images[prevIndex]);
              setModalImageIndex(prevIndex);
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
              console.log('Right button clicked!');
              if (!images.length) return;
              const nextIndex = (modalImageIndex + 1) % images.length;
              setModalImage(images[nextIndex]);
              setModalImageIndex(nextIndex);
            }}
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
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
