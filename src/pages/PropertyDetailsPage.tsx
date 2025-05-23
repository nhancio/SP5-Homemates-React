import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPropertyById } from '../services/listings';
import { Phone, Share2, Heart, Building, Loader, ArrowLeft } from 'lucide-react';
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
  const { favoriteProperties, toggleFavorite, isAuthenticated, login } = useAppContext();

  // Determine listing type from URL
  const listingType = location.pathname.startsWith('/rent') ? 'rent' : 'sell';

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const propertyData = await getPropertyById(listingType, propertyId);
        setProperty(propertyData);
      } catch (error) {
        console.error('Error fetching property:', error);
        setError(error instanceof Error ? error.message : 'Failed to load property');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, listingType]);

  const handleLoginPrompt = () => {
    if (window.confirm('Please login to use this feature. Would you like to login now?')) {
      login();
    }
  };

  const handleCall = () => {
    if (!isAuthenticated) {
      handleLoginPrompt();
      return;
    }

    if (property?.contactNumber) {
      window.location.href = `tel:${property.contactNumber}`;
    } else {
      alert('Contact number not available');
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
              <div>
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

        {/* Property Type Badge */}
        <div className="mb-4">
          <span className="bg-primary-600 text-white text-sm font-medium px-3 py-1 rounded">
            {listingType === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className="h-[400px] rounded-lg overflow-hidden"
          >
            {(property.images?.length ? property.images : ['placeholder']).map((image: string, index: number) => (
              <SwiperSlide key={index}>
                {image === 'placeholder' ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Building className="w-16 h-16 text-gray-400" />
                  </div>
                ) : (
                  <img 
                    src={image} 
                    alt={`Property ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Property Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Basic Info */}
              <div className="p-6 border-b">
                <h1 className="text-2xl font-bold mb-2">
                  {property.address?.buildingName}
                </h1>
                <p className="text-gray-600 mb-4">
                  {property.address?.locality}, {property.address?.city}
                </p>
                <div className="flex items-center text-2xl font-bold text-primary-600">
                  ₹{formatCurrency(listingType === 'rent' ? property.rentDetails?.costs?.rent : property.sellDetails?.price)}
                  {listingType === 'rent' && <span className="text-sm text-gray-500 ml-1">/month</span>}
                </div>
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
                  <h2 className="text-lg font-semibold mb-4">Cost Details</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-gray-600">Monthly Rent</span>
                      <p className="font-semibold">₹{formatCurrency(property.rentDetails?.costs?.rent)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Maintenance</span>
                      <p className="font-semibold">₹{formatCurrency(property.rentDetails?.costs?.maintenance)}</p>
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
                            .reduce((sum, value) => sum + (Number(value) || 0), 0)
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

              {/* Amenities - Only for Rent */}
              {listingType === 'rent' && property.amenities && (
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold mb-4">Amenities</h2>
                  {Object.entries(property.amenities).map(([category, items]) => items.length > 0 && (
                    <div key={category} className="mb-4 last:mb-0">
                      <h3 className="text-md font-medium mb-2 capitalize">{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {(items as string[]).map((item: string) => (
                          <span key={item} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

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
    </div>
  );
};

export default PropertyDetailsPage;
