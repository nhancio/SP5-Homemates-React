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
  price: '', // Add price field for sell listings
  homeType: '', // Add homeType for SellForm
  roomType: '', // Add roomType for SellForm
  furnishType: '', // Add furnishType for SellForm
  rent: '', // Add rent field for sell listings
  maintenance: '', // Add maintenance field for sell listings
  brokerage: '', // Add brokerage field for sell listings
  securityDeposit: '', // Add security deposit field for sell listings

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
      flatType: '',
      roomType: '',
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
    maintenance: '',
    securityDeposit: '',
    brokerage: '',
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
      // Convert numeric fields to numbers
      if (['price', 'maintenance', 'securityDeposit', 'brokerage', 'rent', 'sqft'].includes(key) && typeof value === 'string') {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          cleaned[key] = numValue;
        } else {
          cleaned[key] = value;
        }
      } else {
        cleaned[key] = value;
      }
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
  const [errors, setErrors] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  
  // Image handling state
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/profile');
    }
    
    window.scrollTo(0, 0);
    document.title = 'Add Listing | Homemates';
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const newErrors: any = {};
    
    // Mobile validation
    const mobile = formData.contactNumber || '';
    if (!/^[6-9][0-9]{9}$/.test(mobile)) {
      newErrors.contactNumber = 'Please enter a valid mobile number.';
    }
    
    // Address validation (for both rent and sell)
    if (!formData.address.city) newErrors['address.city'] = 'Please select city';
    if (!formData.address.locality) newErrors['address.locality'] = 'Please select locality';
    if (!formData.address.buildingName) newErrors['address.buildingName'] = 'Please enter building name';
    
    // Rent validation
    if (listingType === 'rent') {
      // Property Type
      if (!formData.propertyType) newErrors.propertyType = 'Please select a property type.';
      
      // Home Details - All fields required
      if (!formData.rentDetails?.roomDetails?.flatType) newErrors.flatType = 'Please select a flat type.';
      if (!formData.rentDetails?.roomDetails?.availableRooms) newErrors.availableRooms = 'Please select available rooms.';
      if (!formData.rentDetails?.roomDetails?.roomType) newErrors.roomType = 'Please select a room type.';
      if (!formData.rentDetails?.roomDetails?.bathroomType) newErrors.bathroomType = 'Please select a washroom type.';
      if (!formData.furnishingType) newErrors.furnishingType = 'Please select a furnish type.';
      if (!formData.parking) newErrors.parking = 'Please select a parking type.';
      
      // Home Type validation (for Shared Home form)
      if (!formData.rentDetails?.roomDetails?.flatType) newErrors.homeType = 'Please select a home type.';
      
      // Amenities
      if (!formData.rentDetails?.amenities || formData.rentDetails.amenities.length === 0) {
        newErrors.amenities = 'Please select at least one amenity.';
      }
      
      // Preferred Tenant
      if (!formData.rentDetails?.preferredTenant?.lookingFor) newErrors.lookingFor = 'Please select a gender.';
      
      // Move In
      if (formData.isImmediate === undefined || (formData.isImmediate === false && !formData.handoverDate)) {
        newErrors.handoverDate = 'Please select a move-in option.';
      }
      
      // Rental Details - All fields required
      const rent = Number(formData.rentDetails?.costs?.rent);
      if (!rent || rent < 1000) {
        newErrors.rent = 'Rent must be at least ₹1,000.';
      }
      
      // Price validation for Shared Home form
      if (!formData.rentDetails?.costs?.rent || formData.rentDetails.costs.rent === '') {
        newErrors.price = 'Please enter price amount.';
      }
      
      // Required fields for rental details
      if (!formData.rentDetails?.costs?.maintenance || formData.rentDetails.costs.maintenance === '') {
        newErrors.maintenance = 'Please enter maintenance amount.';
      }
      
      if (!formData.rentDetails?.costs?.securityDeposit || formData.rentDetails.costs.securityDeposit === '') {
        newErrors.securityDeposit = 'Please enter security deposit amount.';
      }
      
      if (!formData.rentDetails?.costs?.setupCost || formData.rentDetails.costs.setupCost === '') {
        newErrors.setupCost = 'Please enter setup cost amount.';
      }
      
      if (!formData.rentDetails?.costs?.brokerage || formData.rentDetails.costs.brokerage === '') {
        newErrors.brokerage = 'Please enter brokerage amount.';
      }
      
      // Numeric fields non-negative
      ['rent', 'maintenance', 'securityDeposit', 'setupCost', 'brokerage'].forEach(field => {
        const value = Number((formData.rentDetails?.costs as any)?.[field]);
        if (value < 0) newErrors[field] = 'Cannot be negative.';
      });
    }
    
    // Sell validation
    if (listingType === 'sell') {
      // Home Details - All fields required
      if (!formData.homeType) newErrors.homeType = 'Please select a home type.';
      if (!formData.roomType) newErrors.roomType = 'Please select a room type.';
      if (!formData.furnishType) newErrors.furnishType = 'Please select a furnish type.';
      
      // Details
      if (!formData.sellDetails?.lookingFor) newErrors.lookingFor = 'Please select a gender.';
      if (!formData.parking) newErrors.parking = 'Please select a parking type.';
      
      // Amenities
      if (!formData.sellDetails?.amenities || formData.sellDetails.amenities.length === 0) {
        newErrors.amenities = 'Please select at least one amenity.';
      }
      
      // Move In
      if (formData.isImmediate === undefined || (formData.isImmediate === false && !formData.handoverDate)) {
        newErrors.handoverDate = 'Please select a move-in option.';
      }
      
      // Price Details - Only Price is required
      const price = Number(formData.price);
      if (!price || price < 1000) {
        newErrors.price = 'Price must be at least ₹1,000.';
      }
      
      // Numeric fields non-negative
      ['maintenance', 'securityDeposit', 'brokerage'].forEach(field => {
        const value = Number((formData as any)?.[field]);
        if (value < 0) newErrors[field] = 'Cannot be negative.';
      });
    }
    
    // Common validation
    if (!images || images.length === 0) newErrors.images = 'Please upload at least one image.';
    if (!formData.description || formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSubmitted(true);
    setIsSubmitting(true);
    setErrors({});

    // Validate the form before proceeding
    const isValid = validate();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Validation passed, creating listing...');
      
      if (!user) {
        console.error('No user found - cannot create listing');
        alert('Please login to create a listing');
        setIsSubmitting(false);
        return;
      }

      if (listingType === 'rent') {
        console.log('Creating RENT listing...');
        // Prepare rent listing data with only the fields that are actually in the RentForm
        const rentListingData = {
          // Address fields (from AddressFields component)
          address: cleanFormData({
            city: formData.address.city,
            locality: formData.address.locality,
            buildingName: formData.address.buildingName,
          }),
          // Property Type
          propertyType: formData.propertyType,
          // Furnish Type (from Home Details)
          furnishingType: formData.furnishingType,
          // Parking (from Home Details)
          parking: formData.parking,
          // Move In details
          handoverDate: formData.handoverDate,
          isImmediate: formData.isImmediate,
          // Description
          description: formData.description,
          // Contact Number
          contactNumber: formData.contactNumber,
          // Images
          images,
          createdAt: Date.now(),
          status: 'active' as const,
          listingType: 'rent',
          // Set price to 0 for rent listings (price is in rentDetails.costs.rent)
          price: 0,
          // Rent Details - only the fields that are actually in the form
          rentDetails: cleanFormData({
            // Home Details
            roomDetails: {
              flatType: formData.rentDetails.roomDetails.flatType, // Home Type
              availableRooms: formData.rentDetails.roomDetails.availableRooms,
              roomType: formData.rentDetails.roomDetails.roomType,
              bathroomType: formData.rentDetails.roomDetails.bathroomType,
            },
            // Preferred Tenant
            preferredTenant: {
              lookingFor: formData.rentDetails.preferredTenant.lookingFor,
              preferences: formData.rentDetails.preferredTenant.preferences,
            },
            // Rental Costs
            costs: {
              rent: formData.rentDetails.costs.rent,
              maintenance: formData.rentDetails.costs.maintenance,
              securityDeposit: formData.rentDetails.costs.securityDeposit,
              setupCost: formData.rentDetails.costs.setupCost,
              brokerage: formData.rentDetails.costs.brokerage,
            },
            // Amenities
            amenities: formData.rentDetails.amenities,
          }),
        };
        console.log('Rent listing data before cleaning:', rentListingData);
        const cleanedRentListingData = cleanFormData(rentListingData);
        console.log('Rent listing data after cleaning:', cleanedRentListingData);
        console.log('Calling createListing for rent...');
        const result = await createListing('rent', cleanedRentListingData);
        console.log('Rent listing created successfully:', result);
      } else {
        console.log('Creating SELL listing...');
        // Prepare sell listing data with only the fields that are actually in the SellForm
        const sellListingData = {
          // Address fields (from AddressFields component)
          address: cleanFormData({
            city: formData.address.city,
            locality: formData.address.locality,
            buildingName: formData.address.buildingName,
          }),
          // Property Type
          propertyType: formData.propertyType,
          // Home Details - BHK, Flat Type, Furnish Type
          homeType: formData.homeType, // BHK (1BHK, 2BHK, etc.)
          roomType: formData.roomType, // Flat Type (1BHK, 2BHK, etc.)
          furnishType: formData.furnishType, // Furnished status
          // Details
          lookingFor: formData.sellDetails?.lookingFor || '', // Family/Bachelor preference
          parking: formData.parking,
          // Move In details
          handoverDate: formData.handoverDate,
          isImmediate: formData.isImmediate,
          // Description
          description: formData.description,
          // Contact Number
          contactNumber: formData.contactNumber,
          // Images
          images,
          createdAt: Date.now(),
          status: 'active' as const,
          listingType: 'sell',
          // Sell Details - only the fields that are actually in the form
          sellDetails: cleanFormData({
            // Price Details (moved to sellDetails to match interface)
            price: formData.sellDetails?.price || formData.price,
            // Square Feet
            sqft: (formData as any).sqft,
            // Direction
            direction: (formData as any).direction,
            // Property Type for BHK display
            propertyType: formData.roomType || formData.homeType, // Use roomType as propertyType for BHK display
            // Home Type for BHK display
            homeType: formData.homeType,
            // Furnish Type
            furnishType: formData.furnishType,
            // Looking For (Family/Bachelor)
            lookingFor: formData.sellDetails?.lookingFor || '',
            // Cost Details
            maintenance: formData.sellDetails?.maintenance,
            securityDeposit: formData.sellDetails?.securityDeposit,
            brokerage: formData.sellDetails?.brokerage,
            // Amenities
            amenities: formData.sellDetails?.amenities || [],
          }),
        };
        console.log('sellDetails before cleaning:', {
          price: formData.sellDetails?.price || formData.price,
          maintenance: formData.sellDetails?.maintenance,
          securityDeposit: formData.sellDetails?.securityDeposit,
          brokerage: formData.sellDetails?.brokerage,
        });
        console.log('Sell listing data before cleaning:', sellListingData);
        const cleanedSellListingData = cleanFormData(sellListingData);
        console.log('Sell listing data after cleaning:', cleanedSellListingData);
        console.log('Cleaned sellDetails:', cleanedSellListingData.sellDetails);
        console.log('Form data debug:', {
          homeType: formData.homeType,
          roomType: formData.roomType,
          furnishType: formData.furnishType,
          lookingFor: formData.sellDetails?.lookingFor,
          parking: formData.parking,
          sqft: (formData as any).sqft,
          direction: (formData as any).direction,
          maintenance: formData.sellDetails?.maintenance,
          securityDeposit: formData.sellDetails?.securityDeposit,
          brokerage: formData.sellDetails?.brokerage,
        });
        console.log('Full formData object:', formData);
        console.log('Calling createListing for sell...');
        const result = await createListing('sell', cleanedSellListingData);
        console.log('Sale listing created successfully:', result);
      }

      console.log('=== LISTING CREATION COMPLETE ===');
      console.log('Showing success alert and navigating...');
      alert('Listing created successfully!');
      console.log('Navigating to:', listingType === 'rent' ? '/rent' : '/buy');
      navigate(listingType === 'rent' ? '/rent' : '/buy');
    } catch (error) {
      console.error('=== ERROR IN LISTING CREATION ===');
      console.error('Error creating listing:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      alert(error instanceof Error ? error.message : 'Failed to create listing. Please try again.');
    } finally {
      console.log('=== ADD LISTING DEBUG END ===');
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
    console.log('removeImage called with index:', index);
    setImages((prev: string[]) => prev.filter((_: string, i: number) => i !== index));
  };

  // Toggle functions and handlers

  const renderRentFields = () => (
    <>
      <AddressFields 
        listingType={listingType}
        formData={formData}
        setFormData={setFormData}
        images={images}
        setImages={setImages}
        handleImageUpload={handleImageUpload}
        removeImage={removeImage}
        onSubmit={() => handleSubmit(new Event('submit') as unknown as React.FormEvent)}
      />
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
              min={(() => {
                const d = new Date();
                d.setDate(d.getDate() + 1);
                return d.toISOString().split('T')[0];
              })()}
            />
            {errors.handoverDate && <p className="text-red-500 text-xs mt-1">{errors.handoverDate}</p>}
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
                spellCheck={false}
                autoCorrect="off"
              />
              {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
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
                spellCheck={false}
                autoCorrect="off"
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
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
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
        {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
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
            spellCheck={false}
            autoCorrect="off"
          />
          {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
        </div>
      </section>
    </>
  );

  const renderSellFields = () => (
    <SellForm
      listingType="sell"
      formData={formData}
      setFormData={setFormData}
      images={images}
      setImages={setImages}
      handleImageUpload={handleImageUpload}
      removeImage={removeImage}
      errors={errors}
      setErrors={setErrors}
    />
  );

  const handleFormSubmit = () => {
    handleSubmit(new Event('submit') as unknown as React.FormEvent);
  };

  return (
    <div className="py-8 bg-white min-h-screen flex flex-col">
      <div className="container flex flex-col flex-1">
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

        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col flex-1">
          {listingType === 'rent' ? (
            <RentForm
              listingType={listingType}
              formData={formData}
              setFormData={setFormData}
              images={images}
              setImages={setImages}
              handleImageUpload={handleImageUpload}
              removeImage={removeImage}
              errors={errors}
              setErrors={setErrors}
              onSubmit={handleFormSubmit}
              submitted={submitted}
              isSubmitting={isSubmitting}
            />
          ) : (
            <SellForm
              listingType={listingType}
              formData={formData}
              setFormData={setFormData}
              images={images}
              setImages={setImages}
              handleImageUpload={handleImageUpload}
              removeImage={removeImage}
              errors={errors}
              setErrors={setErrors}
              onSubmit={handleFormSubmit}
              submitted={submitted}
              isSubmitting={isSubmitting}
            />
          )}
          {/* No extra submit button here. Only the form component renders the button. */}
        </form>
      </div>
    </div>
  );
};

export default AddListingPage;