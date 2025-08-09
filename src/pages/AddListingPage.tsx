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
  isImmediate: undefined,
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
  roomAvailable: '', // Add roomAvailable for RentForm

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
    
    console.log('=== VALIDATION DEBUG ===');
    console.log('listingType:', listingType);
    console.log('formData:', formData);
    
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
      console.log('Validating rent form...');
      
      // Property Type
      if (!formData.propertyType) newErrors.propertyType = 'Please select a property type.';
      
      // Home Details - Check the actual field names from RentForm
      if (!formData.roomType) newErrors.roomType = 'Please select a BHK.';
      if (!formData.roomAvailable) newErrors.roomAvailable = 'Please select Rooms Available.';
      if (!formData.furnishType) newErrors.furnishType = 'Please select a furnish type.';
      if (!formData.parking) newErrors.parking = 'Please select a parking type.';
      
      // Amenities
      if (!formData.rentDetails?.amenities || formData.rentDetails.amenities.length === 0) {
        newErrors.amenities = 'Please select at least one amenity.';
      }
      
      // Preferred Tenant
      if (!formData.rentDetails?.preferredTenant?.lookingFor) newErrors.lookingFor = 'Please select a gender.';
      
      // Move In
      if (formData.isImmediate === undefined) {
        newErrors.handoverDate = 'Please select a move-in option.';
        console.log('❌ Handover Date validation failed - no option selected');
      } else if (formData.isImmediate === false && !formData.handoverDate) {
        newErrors.handoverDate = 'Please select a move-in date.';
        console.log('❌ Handover Date validation failed - immediate false but no date');
      }
      
      // Rental Details - All fields required
      const rent = Number(formData.rentDetails?.costs?.rent);
      if (!formData.rentDetails?.costs?.rent || formData.rentDetails.costs.rent === '') {
        newErrors.rent = 'Please enter rent amount.';
      } else if (!rent || rent < 1000) {
        newErrors.rent = 'Rent must be at least ₹1,000.';
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
      console.log('Validating sell form...');
      console.log('=== SELL VALIDATION DEBUG ===');
      console.log('propertyType:', formData.propertyType);
      console.log('roomType:', formData.roomType);
      console.log('furnishType:', formData.furnishType);
      console.log('lookingFor:', formData.sellDetails?.lookingFor);
      console.log('parking:', formData.parking);
      console.log('amenities:', formData.sellDetails?.amenities);
      console.log('isImmediate:', formData.isImmediate);
      console.log('handoverDate:', formData.handoverDate);
      console.log('price:', formData.sellDetails?.price);
      console.log('description:', formData.description);
      console.log('images:', images);
      
      // Property Type
      if (!formData.propertyType) {
        newErrors.propertyType = 'Please select a property type.';
        console.log('❌ Property Type validation failed');
      }
      
      // Home Details - Check the actual field names from SellForm
      if (!formData.roomType) {
        newErrors.roomType = 'Please select a BHK.';
        console.log('❌ Room Type validation failed');
      }
      if (!formData.furnishType) {
        newErrors.furnishType = 'Please select a furnish type.';
        console.log('❌ Furnish Type validation failed');
      }
      
      // Details
      if (!formData.sellDetails?.lookingFor) {
        newErrors.lookingFor = 'Please select a gender.';
        console.log('❌ Looking For validation failed');
      }
      if (!formData.parking) {
        newErrors.parking = 'Please select a parking type.';
        console.log('❌ Parking validation failed');
      }
      
      // Amenities
      if (!formData.sellDetails?.amenities || formData.sellDetails.amenities.length === 0) {
        newErrors.amenities = 'Please select at least one amenity.';
        console.log('❌ Amenities validation failed');
      }
      
      // Move In
      if (formData.isImmediate === undefined) {
        newErrors.handoverDate = 'Please select a move-in option.';
        console.log('❌ Handover Date validation failed - no option selected');
      } else if (formData.isImmediate === false && !formData.handoverDate) {
        newErrors.handoverDate = 'Please select a move-in date.';
        console.log('❌ Handover Date validation failed - immediate false but no date');
      }
      
      // Price Details - Only Price is required
      const price = Number(formData.sellDetails?.price);
      if (!formData.sellDetails?.price || formData.sellDetails.price === '') {
        newErrors.price = 'Please enter price amount.';
        console.log('❌ Price validation failed - empty field');
      } else if (!price || price < 1000) {
        newErrors.price = 'Price must be at least ₹1,000.';
        console.log('❌ Price validation failed:', price);
      }
      
      // Numeric fields non-negative
      ['maintenance', 'securityDeposit', 'brokerage'].forEach(field => {
        const value = Number((formData.sellDetails as any)?.[field]);
        if (value < 0) {
          newErrors[field] = 'Cannot be negative.';
          console.log(`❌ ${field} validation failed:`, value);
        }
      });
    }
    
    // Common validation
    if (!images || images.length === 0) newErrors.images = 'Please upload at least one image.';
    if (!formData.description || formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters.';
    
    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('handleSubmit called');
    console.log('listingType:', listingType);
    console.log('formData:', formData);
    console.log('images:', images);
    
    setSubmitted(true);
    setIsSubmitting(true);
    setErrors({});

    // Validate the form before proceeding
    const isValid = validate();
    console.log('Validation result:', isValid);
    console.log('Validation errors:', errors);
    
    if (!isValid) {
      console.log('Validation failed, stopping submission');
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
          // Home Details - from RentForm (saved at root level)
          roomType: formData.roomType, // BHK (1BHK, 2BHK, etc.)
          furnishType: formData.furnishType, // Furnished status
          parking: formData.parking,
          roomAvailable: formData.roomAvailable, // Rooms Available (1 Room, 2 Rooms, etc.)
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
            // Preferred Tenant
            preferredTenant: {
              lookingFor: formData.rentDetails?.preferredTenant?.lookingFor || '',
              preferences: formData.rentDetails?.preferredTenant?.preferences || [],
            },
            // Rental Costs
            costs: {
              rent: Math.max(0, Number(formData.rentDetails?.costs?.rent || 0)),
              maintenance: formData.rentDetails?.costs?.maintenance || 0,
              securityDeposit: formData.rentDetails?.costs?.securityDeposit || 0,
              setupCost: formData.rentDetails?.costs?.setupCost || 0,
              brokerage: formData.rentDetails?.costs?.brokerage || 0,
            },
            // Amenities
            amenities: formData.rentDetails?.amenities || [],
          }),
        };
        console.log('Rent listing data before cleaning:', rentListingData);
        const cleanedRentListingData = cleanFormData(rentListingData);
        console.log('Rent listing data after cleaning:', cleanedRentListingData);
        console.log('=== RENT DATA DEBUG ===');
        console.log('roomType:', cleanedRentListingData.roomType);
        console.log('homeType:', cleanedRentListingData.homeType);
        console.log('furnishType:', cleanedRentListingData.furnishType);
        console.log('propertyType:', cleanedRentListingData.propertyType);
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
          // Home Details - BHK, Furnish Type
          roomType: formData.roomType, // BHK (1BHK, 2BHK, etc.)
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
          // Sell Details - match the SellListing interface exactly
          sellDetails: cleanFormData({
            // Price Details
            price: Number(formData.sellDetails?.price || formData.price || 0),
            gst: 0, // Default value
            isNegotiable: false, // Default value
            // Property Type for BHK display
            propertyType: formData.roomType, // Use roomType as propertyType for BHK display
            // Furnish Type
            furnishType: formData.furnishType,
            // Looking For (Family/Bachelor)
            lookingFor: formData.sellDetails?.lookingFor || '',
            // Cost Details
            maintenance: Number(formData.sellDetails?.maintenance || 0),
            securityDeposit: Number(formData.sellDetails?.securityDeposit || 0),
            brokerage: Number(formData.sellDetails?.brokerage || 0),
            // Amenities
            amenities: formData.sellDetails?.amenities || [],
            // Required fields for SellListing interface
            sqft: 0, // Default value
            direction: 'North' as const, // Default value
            ownership: '', // Default value
            ageOfProperty: '', // Default value
            totalFloors: '', // Default value
            floorNumber: '', // Default value
            waterSupply: '', // Default value
            approvals: [], // Default value
            highlights: [], // Default value
            description: formData.description || '', // Use root description
            propertyId: '', // Default value
            loanOnProperty: false, // Default value
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
        console.log('Final sell listing data:', cleanedSellListingData);
        console.log('User:', user);
        console.log('=== SELL LISTING DATA STRUCTURE DEBUG ===');
        console.log('Has sellDetails:', 'sellDetails' in cleanedSellListingData);
        console.log('sellDetails content:', cleanedSellListingData.sellDetails);
        console.log('Has rentDetails:', 'rentDetails' in cleanedSellListingData);
        console.log('listingType:', cleanedSellListingData.listingType);
        console.log('Data type being passed:', typeof cleanedSellListingData);
        console.log('Data keys:', Object.keys(cleanedSellListingData));
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

  const renderSellFields = () => (
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
  );

  const handleFormSubmit = () => {
    console.log('=== HANDLE FORM SUBMIT DEBUG ===');
    console.log('handleFormSubmit called');
    console.log('formData:', formData);
    console.log('errors:', errors);
    console.log('isSubmitting:', isSubmitting);
    console.log('listingType:', listingType);
    console.log('roomType:', formData.roomType);
    console.log('furnishType:', formData.furnishType);
    console.log('propertyType:', formData.propertyType);
    console.log('sellDetails:', formData.sellDetails);
    console.log('Calling handleSubmit...');
    try {
      handleSubmit(new Event('submit') as unknown as React.FormEvent);
      console.log('✅ handleSubmit called successfully');
    } catch (error) {
      console.error('❌ Error calling handleSubmit:', error);
    }
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
            renderSellFields()
          )}
          {/* No extra submit button here. Only the form component renders the button. */}
        </form>
      </div>
    </div>
  );
};

export default AddListingPage;