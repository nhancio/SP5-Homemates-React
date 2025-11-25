import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPropertyById } from '../services/listings';
import { Phone, Share2, Heart, Building, Loader, ArrowLeft, Wifi, Car, Droplet, Utensils, Dumbbell, Snowflake, Shield, Tv, Flame, Fan, Lightbulb, Lock, Refrigerator, WashingMachine, BedDouble, ShowerHead, PawPrint, Users, KeyRound, Plug, Speaker, ParkingCircle, Bike, Leaf, Sun, Thermometer, AirVent, Home, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/format';
import { getShareableUrl } from '../utils/share';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { getBhkLabel } from '../utils/property';
import { openWhatsAppFromProperty } from '../services/chat';

// Helper: safe amount parsing similar to PropertyCard
function parseAmount(value: any): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : null;
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned) return null;
    const num = Number(cleaned);
    return Number.isFinite(num) && num > 0 ? num : null;
  }
  return null;
}

// const SERVICES = [...]; // not used currently

const PropertyDetailsPage = () => {
  const { propertyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { favoriteProperties, toggleFavorite, isAuthenticated, login, loginError, clearLoginError, user } = useAppContext();
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState<number>(0);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState<number>(0); // Track selected room tab

  // Determine listing type from URL
  const listingType = location.pathname.startsWith('/rent') ? 'rent' : 'sell';

  // getAppliedFilters not used on details page

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return;
      
      try {
        setIsLoading(true);
        const fetchedProperty = await getPropertyById(listingType, propertyId);
        console.log('PropertyDetailsPage Debug - Fetched property data:', {
          id: fetchedProperty.id,
          roomType: (fetchedProperty as any).roomType,
          homeType: (fetchedProperty as any).homeType,
          furnishType: (fetchedProperty as any).furnishType,
          lookingFor: (fetchedProperty as any).lookingFor,
          sellDetails: (fetchedProperty as any).sellDetails,
          parking: (fetchedProperty as any).parking,
          handoverDate: (fetchedProperty as any).handoverDate,
          isImmediate: (fetchedProperty as any).isImmediate,
          rooms: (fetchedProperty as any).rooms,
          // Add more detailed debugging
          fullProperty: fetchedProperty,
          listingType: listingType,
        });
        console.log('Property fetched successfully:', fetchedProperty);
        console.log('Property sellDetails:', (fetchedProperty as any).sellDetails);
        console.log('Property sellDetails maintenance:', (fetchedProperty as any).sellDetails?.maintenance);
        console.log('Property sellDetails securityDeposit:', (fetchedProperty as any).sellDetails?.securityDeposit);
        console.log('Property sellDetails brokerage:', (fetchedProperty as any).sellDetails?.brokerage);
        setProperty(fetchedProperty);
        // Initialize selected room to first room if rooms exist
        if (fetchedProperty.rooms && fetchedProperty.rooms.length > 0) {
          setSelectedRoomIndex(0);
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        setError('Failed to load property details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);

  // Debug cost details
  useEffect(() => {
    if (property && listingType === 'sell') {
      console.log('Cost Details Debug:');
      console.log('Property object:', property);
      console.log('sellDetails:', property.sellDetails);
      console.log('Maintenance from sellDetails:', property.sellDetails?.maintenance);
      console.log('Security Deposit from sellDetails:', property.sellDetails?.securityDeposit);
      console.log('Brokerage from sellDetails:', property.sellDetails?.brokerage);
      console.log('Maintenance from root:', (property as any).maintenance);
      console.log('Security Deposit from root:', (property as any).securityDeposit);
      console.log('Brokerage from root:', (property as any).brokerage);
    }
  }, [property, listingType]);

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
      console.log('Share function called');
      console.log('Property:', property);
      console.log('Listing type:', listingType);
      
      const url = getShareableUrl(property.id, listingType);
      console.log('Generated URL:', url);
      
      // Get the correct price/rent based on listing type
      let amount: number | null = null;
      let amountLabel = 'Price';
      if (listingType === 'rent') {
        amount = parseAmount(property.rentDetails?.costs?.rent);
        amountLabel = 'Rent';
      } else {
        amount = parseAmount(property.sellDetails?.price || property.price);
        amountLabel = 'Price';
      }
      console.log('Amount:', amount);
      
      // Get the correct BHK type based on listing type
      const bhkType = getBhkLabel(property, listingType === 'sell' ? 'buy' : (listingType as 'rent' | 'buy')) || '-';
      
      const shareTitle = 'Check out this property on Homemates';
      const shareBody = `Name: ${property.address?.buildingName || 'Property'}
${amountLabel}: ${amount ? `₹${formatCurrency(amount)}` : 'On request'}
Type: ${bhkType}
${listingType === 'rent' ? `Rooms Available: ${(property as any).roomAvailable || '-'}` : ''}
Location: ${property.address?.locality}, ${property.address?.city}
Link: ${url}`;

      console.log('Share text:', `${shareTitle} -> ${shareBody}`);

      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareBody });
      } else {
        await navigator.clipboard.writeText(`${shareTitle}\n\n${shareBody}`);
        alert('Property details copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing property:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        error: err
      });
      alert('Failed to share property. Please try again.');
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
    'AC': <Snowflake className="w-4 h-4 mr-1 text-primary-600" />,
    'Bed': <BedDouble className="w-4 h-4 mr-1 text-primary-600" />,
    'Power Backup': <Plug className="w-4 h-4 mr-1 text-primary-600" />,
    'Gym': <Dumbbell className="w-4 h-4 mr-1 text-primary-600" />,
    'Fridge': <Refrigerator className="w-4 h-4 mr-1 text-primary-600" />,
    'Washing Machine': <WashingMachine className="w-4 h-4 mr-1 text-primary-600" />,
    'Security': <Shield className="w-4 h-4 mr-1 text-primary-600" />,
    'Lift': <Home className="w-4 h-4 mr-1 text-primary-600" />,
    'Balcony': <Sun className="w-4 h-4 mr-1 text-primary-600" />,
    wifi: <Wifi className="w-4 h-4 mr-1 text-primary-600" />,
    parking: <Car className="w-4 h-4 mr-1 text-primary-600" />,
    water: <Droplet className="w-4 h-4 mr-1 text-primary-600" />,
    kitchen: <Utensils className="w-4 h-4 mr-1 text-primary-600" />,
    ac: <Snowflake className="w-4 h-4 mr-1 text-primary-600" />,
    tv: <Tv className="w-4 h-4 mr-1 text-primary-600" />,
    gas: <Flame className="w-4 h-4 mr-1 text-primary-600" />,
    fan: <Fan className="w-4 h-4 mr-1 text-primary-600" />,
    light: <Lightbulb className="w-4 h-4 mr-1 text-primary-600" />,
    lock: <Lock className="w-4 h-4 mr-1 text-primary-600" />,
    shower: <ShowerHead className="w-4 h-4 mr-1 text-primary-600" />,
    pet: <PawPrint className="w-4 h-4 mr-1 text-primary-600" />,
    roommate: <Users className="w-4 h-4 mr-1 text-primary-600" />,
    key: <KeyRound className="w-4 h-4 mr-1 text-primary-600" />,
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
                  {(() => {
                    const rentAmt = parseAmount(property.rentDetails?.costs?.rent);
                    const priceAmt = parseAmount(property.sellDetails?.price || property.price);
                    if (listingType === 'rent') {
                      return rentAmt ? (
                        <>
                          ₹{formatCurrency(rentAmt)}<span className="text-sm text-gray-500 ml-1">/month</span>
                        </>
                      ) : (
                        <span>Rent on request</span>
                      );
                    }
                    return priceAmt ? (
                      <>₹{formatCurrency(priceAmt)}</>
                    ) : (
                      <span>Price on request</span>
                    );
                  })()}
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
                  {listingType === 'rent' ? (
                    <>
                      <div>
                        <span className="text-gray-600 text-sm">Property Type</span>
                        <p className="font-semibold text-sm md:text-base">{property.propertyType || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Room Type</span>
                        <p className="font-semibold text-sm md:text-base">
                          {(property as any).roomType || 
                           property.rentDetails?.roomDetails?.roomType || 
                           property.rentDetails?.roomDetails?.availability || 
                           '-'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Furnishing</span>
                        <p className="font-semibold text-sm md:text-base">
                          {(property as any).furnishType || 
                           property.furnishingType || 
                           property.rentDetails?.roomDetails?.furnishing || 
                           '-'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Parking</span>
                        <p className="font-semibold text-sm md:text-base">
                          {property.parking || 
                           property.rentDetails?.roomDetails?.parking || 
                           '-'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Available From</span>
                        <p className="font-semibold text-sm md:text-base">
                          {property.isImmediate ? 'Immediate' : (property.handoverDate || '-')}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Rooms Available</span>
                        <p className="font-semibold text-sm md:text-base">
                          {(property as any).roomAvailable || '-'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      
                      <div>
                        <span className="text-gray-600 text-sm">Property Type</span>
                        <p className="font-semibold text-sm md:text-base">{(property as any).homeType || property.sellDetails?.propertyType || property.propertyType || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Furnishing</span>
                        <p className="font-semibold text-sm md:text-base">{(property as any).furnishType || property.sellDetails?.furnishType || property.furnishingType || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Parking</span>
                        <p className="font-semibold text-sm md:text-base">{property.parking || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Looking For</span>
                        <p className="font-semibold text-sm md:text-base">{(property.sellDetails as any)?.lookingFor || (property as any).lookingFor || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Available From</span>
                        <p className="font-semibold text-sm md:text-base">
                          {property.isImmediate ? 'Immediate' : (property.handoverDate || '-')}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Cost Details - Only for Rent */}
              {listingType === 'rent' && (
                <div className="p-4 md:p-6 border-b">
                  <h2 className="text-lg font-semibold mb-4">Rent Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-gray-600 text-sm">Monthly Rent</span>
                      <p className="font-semibold text-sm md:text-base">{(() => {
                        const v = parseAmount(property.rentDetails?.costs?.rent);
                        return v ? `₹${formatCurrency(v)} /month` : '-';
                      })()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Maintenance</span>
                      <p className="font-semibold text-sm md:text-base">{(() => {
                        const v = parseAmount(property.rentDetails?.costs?.maintenance);
                        return v ? `₹${formatCurrency(v)} /month` : '-';
                      })()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Security Deposit</span>
                      <p className="font-semibold text-sm md:text-base">{(() => {
                        const v = parseAmount(property.rentDetails?.costs?.securityDeposit);
                        return v ? `₹${formatCurrency(v)}` : '-';
                      })()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Setup Cost</span>
                      <p className="font-semibold text-sm md:text-base">{(() => {
                        const v = parseAmount(property.rentDetails?.costs?.setupCost);
                        return v ? `₹${formatCurrency(v)}` : '-';
                      })()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Brokerage</span>
                      <p className="font-semibold text-sm md:text-base">{(() => {
                        const v = parseAmount(property.rentDetails?.costs?.brokerage);
                        return v ? `₹${formatCurrency(v)}` : '-';
                      })()}</p>
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
                      <span className="text-gray-600 text-sm">Price</span>
                      <p className="font-semibold text-sm md:text-base">{(() => {
                        const v = parseAmount(property.sellDetails?.price || property.price);
                        return v ? `₹${formatCurrency(v)}` : '-';
                      })()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Maintenance</span>
                      <p className="font-semibold text-sm md:text-base">{(() => {
                        const v = parseAmount(property.sellDetails?.maintenance || (property as any).maintenance);
                        return v ? `₹${formatCurrency(v)} /month` : '-';
                      })()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Security Deposit</span>
                      <p className="font-semibold text-sm md:text-base">{(() => {
                        const v = parseAmount(property.sellDetails?.securityDeposit || (property as any).securityDeposit);
                        return v ? `₹${formatCurrency(v)}` : '-';
                      })()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Brokerage</span>
                      <p className="font-semibold text-sm md:text-base">{(() => {
                        const v = parseAmount(property.sellDetails?.brokerage || (property as any).brokerage);
                        return v ? `₹${formatCurrency(v)}` : '-';
                      })()}</p>
                    </div>
                  </div>
                </div>
              )}
              {/* Contact Number - Show if available */}
              {/* Removed contact number display for privacy */}



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
                {listingType === 'rent' && property.rentDetails?.amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {property.rentDetails.amenities.map((amenity: string) => (
                      <span key={amenity} className="flex flex-col items-center justify-center px-3 py-2 rounded-full border border-primary-200 bg-primary-50 text-primary-700 text-xs font-semibold min-w-[70px]">
                        <span className="mb-1">{amenityIconMap[amenity] || amenityIconMap[amenity.toLowerCase()] || null}</span>
                        <span className="whitespace-nowrap">{amenity}</span>
                      </span>
                    ))}
                  </div>
                )}
                {listingType === 'rent' && (!property.rentDetails?.amenities || property.rentDetails.amenities.length === 0) && (
                  <span className="text-gray-500">No amenities listed.</span>
                )}
                {listingType === 'sell' && property.sellDetails?.amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {property.sellDetails.amenities.map((amenity: string) => (
                      <span key={amenity} className="flex flex-col items-center justify-center px-3 py-2 rounded-full border border-primary-200 bg-primary-50 text-primary-700 text-xs font-semibold min-w-[70px]">
                        <span className="mb-1">{amenityIconMap[amenity] || amenityIconMap[amenity.toLowerCase()] || null}</span>
                        <span className="whitespace-nowrap">{amenity}</span>
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
            <div className="space-y-4">
              {/* Property Rooms Section - Only for Full Flat with rooms */}
              {listingType === 'rent' && property.rooms && property.rooms.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 sticky top-4">
                  <h2 className="text-lg font-semibold mb-4">Property Rooms</h2>
                  
                  {/* Room Tabs */}
                  <div className="flex gap-2 mb-4 overflow-x-auto">
                    {property.rooms.map((room: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedRoomIndex(index)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                          selectedRoomIndex === index
                            ? 'text-white bg-gradient-to-br from-primary-600 to-primary-700 shadow-[6px_6px_12px_rgba(194,24,91,0.3),-6px_-6px_12px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[8px_8px_16px_rgba(194,24,91,0.4),-8px_-8px_16px_rgba(255,255,255,0.1)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.1)]'
                            : 'text-gray-700 bg-[#F5F5F5] shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.8)] hover:bg-[#EEEEEE] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.12),-8px_-8px_16px_rgba(255,255,255,0.9)] hover:-translate-y-0.5 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] active:translate-y-0.5'
                        }`}
                      >
                        Room {room.roomNumber}
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedRoomIndex(-1)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                        selectedRoomIndex === -1
                          ? 'text-white bg-gradient-to-br from-primary-600 to-primary-700 shadow-[6px_6px_12px_rgba(194,24,91,0.3),-6px_-6px_12px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[8px_8px_16px_rgba(194,24,91,0.4),-8px_-8px_16px_rgba(255,255,255,0.1)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.1)]'
                          : 'text-gray-700 bg-[#F5F5F5] shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.8)] hover:bg-[#EEEEEE] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.12),-8px_-8px_16px_rgba(255,255,255,0.9)] hover:-translate-y-0.5 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] active:translate-y-0.5'
                      }`}
                    >
                      Full House
                    </button>
                  </div>

                  {/* Room Details */}
                  {selectedRoomIndex >= 0 && selectedRoomIndex < property.rooms.length && (
                    <div className="space-y-4">
                      {(() => {
                        const room = property.rooms[selectedRoomIndex];
                        return (
                          <>
                            <div>
                              <h3 className="text-lg font-semibold">Room {room.roomNumber}</h3>
                              {room.available !== false && (
                                <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                  Available
                                </span>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              {room.hasBalcony && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Sun className="w-4 h-4 text-primary-600" />
                                  <span>Balcony</span>
                                </div>
                              )}
                              {room.hasWashroom && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <ShowerHead className="w-4 h-4 text-primary-600" />
                                  <span>Attached</span>
                                </div>
                              )}
                            </div>

                            {room.lockInPeriod && (
                              <div className="text-sm text-gray-600">
                                <span>{room.lockInPeriod} lock-in</span>
                              </div>
                            )}

                            {room.rent && (
                              <div className="text-lg font-semibold text-primary-600">
                                ₹{formatCurrency(room.rent)} /mo
                              </div>
                            )}

                            {/* Room Images */}
                            {room.images && room.images.length > 0 && (
                              <div className="mt-4">
                                <div className="grid grid-cols-2 gap-2">
                                  {room.images.map((img: string, imgIndex: number) => (
                                    <img
                                      key={imgIndex}
                                      src={img}
                                      alt={`Room ${room.roomNumber} ${imgIndex + 1}`}
                                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
                                      onClick={() => {
                                        setModalImage(img);
                                        setModalImageIndex(imgIndex);
                                        setShowImageModal(true);
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Full House View */}
                  {selectedRoomIndex === -1 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Full House</h3>
                        <p className="text-sm text-gray-600 mt-2">
                          All {property.rooms.length} rooms available
                        </p>
                      </div>
                      {(() => {
                        const totalRent = property.rooms.reduce((sum: number, room: any) => sum + (room.rent || 0), 0);
                        const rentAmount = parseAmount(property.rentDetails?.costs?.rent);
                        return (
                          <div className="text-lg font-semibold text-primary-600">
                            ₹{formatCurrency(rentAmount || totalRent)} /mo
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Chat Button - WhatsApp */}
                  {property.contactNumber && (
                    <button
                      onClick={() => openWhatsAppFromProperty(property.contactNumber, property.address?.buildingName)}
                      className="w-full mt-4 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-br from-[#25D366] to-[#128C7E] shadow-[6px_6px_12px_rgba(37,211,102,0.3),-6px_-6px_12px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[8px_8px_16px_rgba(37,211,102,0.4),-8px_-8px_16px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 active:shadow-[inset_4px_4px_8px_rgba(18,140,126,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.1)] active:translate-y-0.5"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Chat on WhatsApp
                    </button>
                  )}
                </div>
              )}

              {/* Contact Buttons */}
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
      </div>
      {showImageModal && modalImage && (
        // Defensive: fallback to [] if property.images is undefined
        (() => { 
          // Determine which images to use: room images if viewing a room, otherwise property images
          let images: string[] = [];
          if (selectedRoomIndex >= 0 && selectedRoomIndex < (property.rooms?.length || 0)) {
            images = property.rooms[selectedRoomIndex]?.images || [];
          } else {
            images = property.images?.length ? property.images : [];
          }
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
