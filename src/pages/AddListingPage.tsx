import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Calendar, X, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { createListing } from '../services/listings';
import { AddressFields, RentForm, SellForm } from '../components/sections/AddListingForms';

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Independent House', 'Gated Community'];
const CITY_OPTIONS = ['Hyderabad', 'Bangalore', 'Mumbai', 'Ahmedabad', 'Gandhinagar', 'Rajkot', 'Others'];
const DIRECTIONS = ['East Facing', 'West Facing', 'North Facing', 'South Facing'];
const OWNERSHIP_TYPES = ['Freehold', 'Leasehold', 'Power of Attorney'];
const WATER_SUPPLY = ['Municipal', 'Borewell', 'Both'];

const AMENITIES_OPTIONS = [
  'Lift',
  'Car Parking',
  '2 Car Parking', 
  'Play Zone',
  'Generator',
  'Club House',
  'Swimming Pool',
  'Gym',
  'Garden',
  'Security',
  'Power Backup',
  'Water Supply 24x7'
];

const HIGHLIGHTS_OPTIONS = [
  'Bank Approved',
  'OC Received',
  'HMDA',
  'Near to Metro',
  'Gated Community',
  'Corner Property',
  'Main Road Property',
  'OTP(One time Payment)'
];

const PREFERRED_TENANT_OPTIONS = {
  preferences: [
    'Vegetarian',
    'Non-smoker',
    'Non-alcoholic',
    'Pet friendly',
    'Party Friendly',
    'Night owl'
  ]
};

const amenityOptions = {
  appliances: ['TV', 'Fridge', 'AC', 'Washing Machine', 'Water Purifier', 'Geyser'],
  furniture: ['Bed', 'Wardrobe', 'Study Table', 'Dining Table', 'Sofa', 'Mattress'],
  building: ['Lift', 'Power Backup', 'Security', 'Parking', 'Gym', 'Swimming Pool', 'Garden', 'CCTV']
};

const initialFormData = {
  // Common fields
  address: {
    city: '',
    locality: '',
    buildingName: '',
  },
  propertyType: '',
  furnishingType: '',
  parking: '',
  buildingType: '',
  handoverDate: '',
  isImmediate: false,
  description: '',
  contactNumber: '',

  // Rent specific fields
  rentDetails: {
    preferredTenant: {
      lookingFor: '',
      preferences: [] as string[],
    },
    roomDetails: {
      availableRooms: '',
      availability: '',
      bathroomType: '',
    },
    amenities: [], // <-- Add this line!
    costs: {
      rent: '',
      maintenance: '',
      securityDeposit: '',
      setupCost: '',
      brokerage: '',
    },
    additionalBills: {
      wifi: '',
      water: '',
      gas: '',
      cook: '',
      maid: '',
      others: '',
    }
  },

  // Sell specific fields
  sellDetails: {
    price: '',
    gst: '',
    sqft: '',  // Add this field
    direction: '',  // Add this field
    isNegotiable: false,
    propertyType: '',
    ownership: '',
    ageOfProperty: '',
    totalFloors: '',
    floorNumber: '',
    waterSupply: '',
    approvals: [] as string[],
    amenities: [] as string[],
    highlights: [] as string[],
    description: '',
    propertyId: '',
    loanOnProperty: false,
    lookingFor: '',
  },
  builtUpArea: '',
  ageOfProperty: '',
};

// Utility function to clean form data and only include fields with actual values
const cleanFormData = (obj: any): any => {
  if (obj === null || obj === undefined) return undefined;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    const cleanedArray = obj
      .map(item => cleanFormData(item))
      .filter(item => item !== undefined && item !== null && item !== '');
    return cleanedArray.length > 0 ? cleanedArray : undefined;
  }

  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === '' || value === null || value === undefined) continue;
    if (typeof value === 'object') {
      const cleanedValue = cleanFormData(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    } else {
      cleaned[key] = value;
    }
  }
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
};

const AddListingPage = () => {
  const { isAuthenticated, user } = useAppContext();
  const navigate = useNavigate();
  const [listingType, setListingType] = useState<'rent' | 'sell'>('rent');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  
  // Image handling state
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/profile');
    }
    
    window.scrollTo(0, 0);
    document.title = 'Add Listing | Homemates';
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to create a listing');
      return;
    }

    setIsSubmitting(true);
    try {
      // No validation checks, allow any data
      if (listingType === 'rent') {
        // Prepare rent listing data with only filled fields
        const rentListingData = {
          address: cleanFormData({
            city: formData.address.city,
            locality: formData.address.locality,
            buildingName: formData.address.buildingName,
          }),
          propertyType: formData.propertyType,
          furnishingType: formData.furnishingType,
          parking: formData.parking,
          buildingType: formData.buildingType,
          handoverDate: formData.handoverDate,
          isImmediate: formData.isImmediate,
          description: formData.description,
          contactNumber: formData.contactNumber,
          images,
          createdAt: Date.now(),
          status: 'active' as const,
          userId: user.id,
          createdByUser: user.id,
          listingType: 'rent',
          rentDetails: cleanFormData({
            preferredTenant: {
              lookingFor: formData.rentDetails.preferredTenant.lookingFor,
              preferences: formData.rentDetails.preferredTenant.preferences,
            },
            roomDetails: {
              availableRooms: formData.rentDetails.roomDetails.availableRooms,
              bathroomType: formData.rentDetails.roomDetails.bathroomType,
            },
            costs: {
              rent: formData.rentDetails.costs.rent,
              maintenance: formData.rentDetails.costs.maintenance,
              securityDeposit: formData.rentDetails.costs.securityDeposit,
              setupCost: formData.rentDetails.costs.setupCost,
              brokerage: formData.rentDetails.costs.brokerage,
            },
            additionalBills: {
              wifi: formData.rentDetails.additionalBills.wifi,
              water: formData.rentDetails.additionalBills.water,
              gas: formData.rentDetails.additionalBills.gas,
              cook: formData.rentDetails.additionalBills.cook,
              maid: formData.rentDetails.additionalBills.maid,
              others: formData.rentDetails.additionalBills.others,
            },
            amenities: formData.rentDetails.amenities,
          }),
        };
        const cleanedRentListingData = cleanFormData(rentListingData);
        const result = await createListing('rent', cleanedRentListingData);
        console.log('Rent listing created:', result);
      } else {
        // Prepare sell listing data with only filled fields
        const sellListingData = {
          address: cleanFormData({
            city: formData.address.city,
            locality: formData.address.locality,
            buildingName: formData.address.buildingName,
          }),
          propertyType: formData.propertyType,
          furnishingType: formData.furnishingType,
          parking: formData.parking,
          buildingType: formData.buildingType,
          handoverDate: formData.handoverDate,
          isImmediate: formData.isImmediate,
          description: formData.description,
          contactNumber: formData.contactNumber,
          images,
          createdAt: Date.now(),
          status: 'active' as const,
          userId: user.id,
          createdByUser: user.id,
          listingType: 'sell',
          sellDetails: cleanFormData({
            price: formData.sellDetails.price,
            gst: formData.sellDetails.gst,
            isNegotiable: formData.sellDetails.isNegotiable,
            propertyType: formData.sellDetails.propertyType,
            sqft: formData.sellDetails.sqft,
            direction: formData.sellDetails.direction,
            ownership: formData.sellDetails.ownership,
            ageOfProperty: formData.sellDetails.ageOfProperty,
            totalFloors: formData.sellDetails.totalFloors,
            floorNumber: formData.sellDetails.floorNumber,
            waterSupply: formData.sellDetails.waterSupply,
            approvals: formData.sellDetails.approvals,
            amenities: formData.sellDetails.amenities,
            highlights: formData.sellDetails.highlights,
            description: formData.sellDetails.description,
            propertyId: formData.sellDetails.propertyId,
            loanOnProperty: formData.sellDetails.loanOnProperty,
            lookingFor: formData.sellDetails.lookingFor,
          }),
          builtUpArea: formData.builtUpArea,
          ageOfProperty: formData.ageOfProperty,
        };
        const cleanedSellListingData = cleanFormData(sellListingData);
        const result = await createListing('sell', cleanedSellListingData);
        console.log('Sale listing created:', result);
      }

      alert('Listing created successfully!');
      navigate(listingType === 'rent' ? '/rent' : '/buy');
    } catch (error) {
      console.error('Error creating listing:', error);
      alert(error instanceof Error ? error.message : 'Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (images.length + files.length > 5) {
        alert('Maximum 5 images allowed');
        return;
      }
      
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Compress image before saving
          const img = new Image();
          img.src = reader.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set target width and maintain aspect ratio
            const maxWidth = 800;
            const scaleFactor = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scaleFactor;
            
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
            setImages((prev: string[]) => [...prev, compressedImage]);
          };
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev: string[]) => prev.filter((_: string, i: number) => i !== index));
  };

  // Toggle functions and handlers
  const handleAmenityToggle = (category: 'appliances' | 'furniture' | 'building', item: string) => {
    setFormData((prev: typeof initialFormData) => {
      const amenities = { ...prev.amenities };
      if (amenities[category].includes(item)) {
        amenities[category] = amenities[category].filter(i => i !== item);
      } else {
        amenities[category] = [...amenities[category], item];
      }
      return { ...prev, amenities };
    });
  };

  const renderRentFields = () => (
    <>
      <AddressFields formData={formData} setFormData={setFormData} />
      {/* Preferred Tenant Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Preferred Tenant</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Looking for</label>
            <select 
              className="input"
              value={formData.rentDetails.preferredTenant.lookingFor}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                rentDetails: {
                  ...prev.rentDetails,
                  preferredTenant: {
                    ...prev.rentDetails.preferredTenant,
                    lookingFor: e.target.value
                  }
                }
              }))}
            >
              <option value="">Select Option</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Couple">Couple</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferences</label>
            <div className="flex flex-wrap gap-3">
              {PREFERRED_TENANT_OPTIONS.preferences.map(pref => (
                <label 
                  key={pref}
                  className={`flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                    formData.rentDetails.preferredTenant.preferences.includes(pref) 
                      ? 'border-primary-500 bg-primary-50' 
                      : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.rentDetails.preferredTenant.preferences.includes(pref)}
                    onChange={() => {
                      const preferences = formData.rentDetails.preferredTenant.preferences;
                      setFormData(prev => ({
                        ...prev,
                        rentDetails: {
                          ...prev.rentDetails,
                          preferredTenant: {
                            ...prev.rentDetails.preferredTenant,
                            preferences: preferences.includes(pref)
                              ? preferences.filter(p => p !== pref)
                              : [...preferences, pref]
                          }
                        }
                      }));
                    }}
                    className="form-checkbox h-4 w-4 text-primary-600"
                  />
                  <span>{pref}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Property Details Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Property Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          {['1RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, propertyType: type }))}
              className={`p-3 rounded-full border-2 ${
                formData.propertyType === type 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-primary-500'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
            <select
              className="input"
              value={formData.rentDetails.roomDetails.availability}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                rentDetails: {
                  ...prev.rentDetails,
                  roomDetails: {
                    ...prev.rentDetails.roomDetails,
                    availability: e.target.value
                  }
                }
              }))}
            >
              <option value="">Select Availability</option>
              <option value="1 Room">1 Room</option>
              <option value="2 Rooms">2 Rooms</option>
              <option value="Full Flat">Full Flat</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Furnishing Type</label>
            <select 
              className="input"
              value={formData.furnishingType}
              onChange={(e) => setFormData(prev => ({ ...prev, furnishingType: e.target.value }))}
            >
              <option value="">Select Furnishing Type</option>
              <option value="fully">Fully Furnished</option>
              <option value="semi">Semi Furnished</option>
              <option value="unfurnished">Unfurnished</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parking</label>
            <select 
              className="input"
              value={formData.parking}
              onChange={(e) => setFormData(prev => ({ ...prev, parking: e.target.value }))}
            >
              <option value="">Select Parking Type</option>
              <option value="car">Car Parking</option>
              <option value="bike">Bike Parking</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>
      </section>

      {/* Move In Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Move In</h2>
        <div className="flex items-center gap-8 mb-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="moveInOption"
              checked={formData.isImmediate === true}
              onChange={() => setFormData(prev => ({ ...prev, isImmediate: true, handoverDate: '' }))}
            />
            Immediate
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="moveInOption"
              checked={formData.isImmediate === false}
              onChange={() => setFormData(prev => ({ ...prev, isImmediate: false }))}
            />
            Specific Date
          </label>
        </div>
        {formData.isImmediate === false && (
          <>
            <input
              type="date"
              className="input w-full mb-1"
              placeholder="dd-mm-yyyy"
              value={formData.handoverDate}
              onChange={e => setFormData(prev => ({ ...prev, handoverDate: e.target.value }))}
            />
            <span className="text-xs text-gray-500">Select your move-in date.</span>
          </>
        )}
      </section>

      {/* Rent Details Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Rent Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['rent', 'maintenance', 'securityDeposit', 'brokerage'].map(field => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase())}
              </label>
              <input
                type="number"
                className="input"
                value={formData.rentDetails.costs[field as keyof typeof formData.rentDetails.costs]}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  rentDetails: {
                    ...prev.rentDetails,
                    costs: {
                      ...prev.rentDetails.costs,
                      [field]: e.target.value
                    }
                  }
                }))}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Additional Bills Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Additional Bills</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(formData.rentDetails.additionalBills).map(bill => (
            <div key={bill}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {bill === 'others' ? 'Other bills' : bill.charAt(0).toUpperCase() + bill.slice(1)}
              </label>
              <input
                type="number"
                className="input"
                value={formData.rentDetails.additionalBills[bill as keyof typeof formData.rentDetails.additionalBills]}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  rentDetails: {
                    ...prev.rentDetails,
                    additionalBills: {
                      ...prev.rentDetails.additionalBills,
                      [bill]: e.target.value
                    }
                  }
                }))}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Description Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Description</h2>
        <textarea
          className="input min-h-[100px]"
          placeholder="Add property description..."
          value={formData.description}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            description: e.target.value
          }))}
        />
      </section>

      {/* Images Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Upload Images</h2>
        <p className="text-sm text-gray-600 mb-4">Upload up to 5 images (Max size: 5MB each)</p>
        
        {/* Image upload button */}
        {images.length < 5 && (
          <label className="mb-4 inline-block">
            <span className="btn btn-secondary flex items-center">
              <Camera className="w-4 h-4 mr-2" />
              Select Images
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              multiple
              onChange={handleImageUpload}
            />
          </label>
        )}

        {/* Image preview grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img, index) => (
            <div key={index} className="relative aspect-square">
              <img 
                src={img} 
                alt={`Upload ${index + 1}`} 
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Details Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Contact Details</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number*</label>
          <input
            type="tel"
            className="input"
            placeholder="Enter your 10-digit mobile number"
            value={formData.contactNumber}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              contactNumber: e.target.value
            }))}
            pattern="[0-9]{10}"
            maxLength={10}
            required
          />
        </div>
      </section>
    </>
  );

  const renderSellFields = () => (
    <SellForm
      formData={formData}
      setFormData={setFormData}
      images={images}
      handleImageUpload={handleImageUpload}
      removeImage={removeImage}
    />
  );

  return (
    <div className="py-8">
      <div className="container">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Add New Listing</h1>
          
          {/* Listing Type Toggle */}
          <div className="flex rounded-lg overflow-hidden w-64 border">
            <button
              onClick={() => setListingType('rent')}
              className={`flex-1 py-2 ${
                listingType === 'rent' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700'
              }`}
            >
              Shared Home
            </button>
            <button
              onClick={() => setListingType('sell')}
              className={`flex-1 py-2 ${
                listingType === 'sell' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700'
              }`}
            >
              Full Home
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {listingType === 'rent' ? (
            <RentForm
              formData={formData}
              setFormData={setFormData}
              images={images}
              handleImageUpload={handleImageUpload}
              removeImage={removeImage}
            />
          ) : (
            renderSellFields()
          )}

          <button 
          type="submit"
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          disabled={isSubmitting}
          onClick={() => {
            // Track submit/post button click
            import('../utils/analytics').then(({ trackEvent }) => {
              trackEvent({
                action: 'submit_listing',
                category: 'Button',
                label: listingType === 'sell' ? 'Full Home Submit' : 'Shared Home Post',
              });
            });
          }}
          >
            {isSubmitting
              ? 'Submitting...'
              : listingType === 'sell'
              ? 'Submit'
              : 'Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddListingPage;