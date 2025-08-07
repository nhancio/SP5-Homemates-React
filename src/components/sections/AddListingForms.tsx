import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import {
  Wifi, Car, Droplet, Utensils, Dumbbell, Snowflake, Shield, Tv, Flame, Fan, Lightbulb, Lock, Refrigerator, WashingMachine, BedDouble, ShowerHead, PawPrint, Users, KeyRound, Plug, Speaker, ParkingCircle, Bike, Leaf, Sun, Thermometer, AirVent, Home, Check, ChevronLeft, ChevronRight
} from 'lucide-react';
import { USER_PREFERENCES } from '../../constants/theme';
import * as LucideIcons from 'lucide-react';
import { getMarkets, getLocalitiesByCity } from '../../services/markets';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import InputMask from 'react-input-mask';
import { useAppContext } from '../../context/AppContext';
import { getUserCredits, useCredits, addCredits } from '../../services/credits';

// Amenities options for shared home (rent) with icons
const rentAmenitiesOptions = [
  { key: 'AC', label: 'AC', icon: Snowflake },
  { key: 'Bed', label: 'Bed', icon: BedDouble },
  { key: 'Power Backup', label: 'Power Backup', icon: Plug },
  { key: 'Gym', label: 'Gym', icon: Dumbbell },
  { key: 'Fridge', label: 'Fridge', icon: Refrigerator },
  { key: 'Washing Machine', label: 'Washing Machine', icon: WashingMachine }
];

// Amenities options for full home (sell) with icons
const sellAmenitiesOptions = [
  { key: 'Security', label: 'Security', icon: Shield },
  { key: 'Power Backup', label: 'Power Backup', icon: Plug },
  { key: 'Gym', label: 'Gym', icon: Dumbbell },
  { key: 'Lift', label: 'Lift', icon: Home },
  { key: 'Balcony', label: 'Balcony', icon: Sun }
];

interface AddListingFormsProps {
  listingType: 'rent' | 'sell';
  formData: any;
  setFormData: (data: any) => void;
  images: string[];
  setImages: (images: string[] | ((prev: string[]) => string[])) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  onSubmit?: () => void; // Made optional for edit page
  errors?: any; // Optional errors prop for inline error display
  setErrors?: (errors: any) => void; // Optional setErrors for edit page
  submitted?: boolean; // Optional submitted prop for error display
  isSubmitting?: boolean; // Optional isSubmitting prop for submit button state
  hideSubmitButton?: boolean; // Optional prop to hide submit button (for edit pages)
}

export const AddressFields = ({ formData, setFormData, errors = {}, listingType, images, setImages, handleImageUpload, removeImage, submitted = false }: AddListingFormsProps & { errors?: any, submitted?: boolean }) => {
  const [markets, setMarkets] = useState<any[]>([]); // Changed to any[] to avoid linter error
  const [cities, setCities] = useState<string[]>([]);
  const [localities, setLocalities] = useState<any[]>([]); // Changed to any[] to avoid linter error
  const [marketsLoading, setMarketsLoading] = useState(true);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const marketsData = await getMarkets();
        setMarkets(marketsData);
        // Extract unique cities (case-insensitive, trimmed)
        const cityMap = new Map<string, string>();
        marketsData.forEach(m => {
          if (m.city) {
            const key = m.city.trim().toLowerCase();
            if (!cityMap.has(key)) {
              cityMap.set(key, m.city.trim());
            }
          }
        });
        // Sort cities alphabetically (display original value)
        const uniqueCities = Array.from(cityMap.values()).sort((a, b) => a.localeCompare(b));
        setCities(uniqueCities);
        setMarketsLoading(false);
      } catch (error) {
        console.error('AddressFields: Error fetching markets:', error);
      }
    };
    fetchMarkets();
  }, []);

  useEffect(() => {
    if (formData.address.city) {
      // Case-insensitive, trimmed comparison for city
      const selectedCity = formData.address.city.trim().toLowerCase();
      const filteredMarkets = markets.filter(m => (m.city || '').trim().toLowerCase() === selectedCity);
      // Unique localities (case-insensitive, trimmed)
      const localityMap = new Map<string, string>();
      filteredMarkets.forEach(m => {
        if (m.market) {
          const key = m.market.trim().toLowerCase();
          if (!localityMap.has(key)) {
            localityMap.set(key, m.market.trim());
          }
        }
      });
      // Sort localities alphabetically (display original value)
      const uniqueLocalities = Array.from(localityMap.entries()).map(([key, value], i) => {
        // Find the original market object for id and city
        const marketObj = filteredMarkets.find(m => m.market && m.market.trim().toLowerCase() === key);
        return {
          id: marketObj?.id || key + i,
          market: value,
          city: marketObj?.city || formData.address.city || '',
        };
      }).sort((a, b) => a.market.localeCompare(b.market));
      setLocalities(uniqueLocalities);
    } else {
      setLocalities([]);
    }
  }, [formData.address.city, markets]);

  return (
    <section className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Address</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Building Name first, full width */}
        <div className="col-span-1 md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Building Name</label>
          <input
            type="text"
            placeholder="Building Name"
            className={`input w-full${errors['address.buildingName'] ? ' border-pink-500 bg-pink-50' : ''}`}
            value={formData.address.buildingName}
            onChange={e => setFormData({
              ...formData,
              address: {
                ...formData.address,
                buildingName: e.target.value,
              },
            })}
            spellCheck={true}
            autoCorrect="on"
          />
          {errors['address.buildingName'] && (
            <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              Please enter building name
            </p>
          )}
        </div>
        {/* City and Locality side by side on desktop, stacked on mobile */}
        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <select
            className={`input w-full${errors['address.city'] ? ' border-pink-500 bg-pink-50' : ''}`}
            value={formData.address.city || ''}
            onChange={e => {
              setFormData({
                ...formData,
                address: {
                  ...formData.address,
                  city: e.target.value,
                  locality: '', // Clear locality when city changes
                },
              });
            }}
            disabled={marketsLoading}
          >
            <option value="">Select City</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {errors['address.city'] && (
            <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              Please select city
            </p>
          )}
        </div>
        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Locality</label>
          <select
            className={`input w-full${errors['address.locality'] ? ' border-pink-500 bg-pink-50' : ''}`}
            value={formData.address.locality || ''}
            onChange={e => {
              setFormData({
                ...formData,
                address: {
                  ...formData.address,
                  locality: e.target.value,
                },
              });
            }}
            disabled={!formData.address.city || marketsLoading}
          >
            <option value="">Select Locality</option>
            {localities.length === 0 && formData.address.city && !marketsLoading && (
              <option value="" disabled>No localities found for this city</option>
            )}
            {localities.map(market => (
              <option key={market.id} value={market.market}>{market.market}</option>
            ))}
          </select>
          {errors['address.locality'] && (
            <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              Please select locality
            </p>
          )}
        </div>
        {/* Google Maps Link (optional) */}
        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps Link</label>
          <input
            type="text"
            className={`input w-full${errors.googleMapsLink ? ' border-pink-500 bg-pink-50' : ''}`}
            placeholder="Paste Google Maps link (optional)"
            value={formData.address.googleMapsLink || ''}
            onChange={e => setFormData({
              ...formData,
              address: {
                ...formData.address,
                googleMapsLink: e.target.value,
              },
            })}
            spellCheck={false}
            autoCorrect="off"
          />
          {formData.address.googleMapsLink && !formData.address.googleMapsLink.startsWith('https://maps.google.') && (
            <p className="text-red-600 text-xs mt-1">Please enter a valid Google Maps link.</p>
          )}
        </div>
      </div>
    </section>
  );
};

const ContactNumberField = ({ formData, setFormData, errors = {} }: { formData: any; setFormData: (data: any) => void; errors?: any }) => (
  <section className="bg-white p-6 rounded-lg shadow-sm">
    <h2 className="text-lg font-semibold mb-4">Contact Details</h2>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
      <input
        type="tel"
        className={`input${errors.contactNumber ? ' border-pink-500 bg-pink-50' : ''}`}
        placeholder="Enter your 10-digit mobile number"
        value={formData.contactNumber || ''}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({
          ...formData,
          contactNumber: e.target.value
        })}
        pattern="[0-9]{10}"
        maxLength={10}
        spellCheck={false}
        autoCorrect="off"
      />
      <p className="text-xs text-gray-500 mt-1">This number will be displayed to interested users</p>
              {errors.contactNumber && <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
          {errors.contactNumber}
        </p>}
    </div>
  </section>
);

// Yup validation schema for Add Listing
const listingSchema = Yup.object().shape({
  address: Yup.object().shape({
    city: Yup.string().required('City is required'),
    locality: Yup.string().required('Locality is required'),
    buildingName: Yup.string().required('Building name is required'),
  }),
  propertyType: Yup.string().required('Property type is required'),
  furnishingType: Yup.string().required('Furnishing type is required'),
  contactNumber: Yup.string()
    .matches(/^[6-9][0-9]{9}$/, 'Enter a valid 10-digit mobile number')
    .required('Contact number is required'),
  description: Yup.string().min(10, 'Description should be at least 10 characters').required('Description is required'),
  rentDetails: Yup.object().shape({
    roomDetails: Yup.object().shape({
      flatType: Yup.string().required('Please select a flat type.'),
    }),
    costs: Yup.object().shape({
      rent: Yup.number().min(1000, 'Rent must be at least ₹1,000').required('Rent is required'),
    }),
    preferredTenant: Yup.object().shape({
      lookingFor: Yup.string().required('Looking for is required'),
      preferences: Yup.array().of(Yup.string()),
    }),
  }),
  sellDetails: Yup.object().shape({
    price: Yup.number().min(1000, 'Price must be at least ₹1,000').required('Price is required'),
  }),
});

export const RentForm: React.FC<AddListingFormsProps> = (props) => {
  const { formData, setFormData, images, setImages, handleImageUpload, removeImage, errors: propErrors, setErrors: propSetErrors, onSubmit, submitted = false, isSubmitting = false, hideSubmitButton = false } = props;
  const [moveInDate, setMoveInDate] = useState<Date | null>(null);
  const [isImmediate, setIsImmediate] = useState(formData.isImmediate ?? true);
  const [localErrors, setLocalErrors] = useState<any>({});
  // Only show errors after form submission
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { user } = useAppContext();
  const [credits, setCredits] = useState<number | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [renewing, setRenewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCredits() {
      if (user) {
        setLoadingCredits(true);
        const res = await getUserCredits(user.id);
        setCredits(res.credits);
        setLoadingCredits(false);
      }
    }
    fetchCredits();
  }, [user]);

  const handleRenewPremium = async () => {
    if (!user) return;
    setRenewing(true);
    setError(null);
    const success = await addCredits(user.id, 5);
    if (success) {
      setCredits(5);
    } else {
      setError('Failed to renew premium. Please try again.');
    }
    setRenewing(false);
  };

  // Wrap the onSubmit to decrement credits
  const handleSubmit = async () => {
    if (!user || !credits || credits <= 0) return;
    const used = await useCredits(user.id, 'listing');
    if (used) {
      setCredits((c) => (c ? c - 1 : 0));
      if (props.onSubmit) props.onSubmit();
    } else {
      setError('You have no credits left. Please renew premium.');
    }
  };
  
  // Add missing variable definitions
  const roomTypeOptions = ['1BHK', '2BHK', '3BHK', '4BHK', '4+BHK'];
  const homeTypeOptions = ['Flat', 'Independent House', 'Villa', 'Gated Community'];
  const furnishTypeOptions = ['Fully Furnished', 'Semi Furnished', 'Unfurnished'];
  
  // Property type options
  const propertyTypes = [
    'Flat',
    'Gated Community',
    'Independent House',
    'Villa'
  ];
  const bhkTypes = ['1', '2', '3', '4', '4+'];
  const furnishingTypes = ['Fully Furnished', 'Semi Furnished', 'Unfurnished'];
  const parkingTypes = ['Both', 'Car Parking', 'Bike Parking'];

  // Handle move-in radio
  const handleMoveInOption = (immediate: boolean) => {
    setIsImmediate(immediate);
    setFormData({ ...formData, isImmediate: immediate, handoverDate: immediate ? '' : formData.handoverDate });
  };

  // Handle move-in date
  const handleMoveInDateChange = (date: Date | null) => {
    setMoveInDate(date);
    setFormData({ ...formData, handoverDate: date ? date.toISOString().split('T')[0] : '' });
  };

  // Calculate min and max dates for move-in
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  const maxDateObj = new Date(tomorrow);
  maxDateObj.setDate(tomorrow.getDate() + 90);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  // Mark field as touched for validation
  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  // Use localErrors for error display
  const errors: Record<string, any> = propErrors || localErrors;
  const setErrors = propSetErrors || setLocalErrors;
  const displayErrors = { ...errors, ...localErrors };

  // Refs for error fields
  const fieldRefs: Record<string, React.RefObject<any>> = {
    'address.buildingName': React.createRef(),
    'address.city': React.createRef(),
    'address.locality': React.createRef(),
    'rentDetails.roomDetails.flatType': React.createRef(),
    'rentDetails.roomDetails.availableRooms': React.createRef(),
    'rentDetails.roomDetails.roomType': React.createRef(),
    'rentDetails.roomDetails.bathroomType': React.createRef(),
    'propertyType': React.createRef(),
    'furnishingType': React.createRef(),
    'parking': React.createRef(),
    'rentDetails.costs.rent': React.createRef(),
    'contactNumber': React.createRef(),
    'description': React.createRef(),
  };

  return (
    <>
      {/* Address: Building Name, City, Locality in one row */}
      <AddressFields
        formData={formData}
        setFormData={setFormData}
        errors={displayErrors}
        listingType={props.listingType}
        images={images}
        setImages={setImages}
        handleImageUpload={handleImageUpload}
        removeImage={removeImage}
        submitted={submitted}
      />
      
      {/* Property Type */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">Property Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
            <select
              className={`input w-full${displayErrors.propertyType ? ' border-pink-500 bg-pink-50' : ''}`}
              value={formData.propertyType || ''}
              onChange={e => setFormData({ ...formData, propertyType: e.target.value })}
              onBlur={() => markTouched('propertyType')}
            >
              <option value="">Select Property Type</option>
              {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {displayErrors.propertyType && <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">{displayErrors.propertyType}</p>}
          </div>
        </div>
      </section>

      {/* Room Details section */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-6 bg-gray-50 p-2 rounded">Room Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">BHK</label>
            <select
              className={`input w-full${displayErrors.roomType ? ' border-pink-500 bg-pink-50' : ''}`}
              value={formData.roomType || ''}
              onChange={e => setFormData({ ...formData, roomType: e.target.value })}
              onBlur={() => markTouched('roomType')}
            >
              <option value="">Select BHK</option>
              {roomTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {displayErrors.roomType && <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">{displayErrors.roomType}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rooms Available</label>
            <select
              className={`input w-full${displayErrors.roomAvailable ? ' border-pink-500 bg-pink-50' : ''}`}
              value={formData.roomAvailable || ''}
              onChange={e => setFormData({ ...formData, roomAvailable: e.target.value })}
              onBlur={() => markTouched('roomAvailable')}
            >
              <option value="">Select Rooms Available</option>
              <option value="1 Room">1 Room</option>
              <option value="2 Rooms">2 Rooms</option>
              <option value="3 Rooms">3 Rooms</option>
              <option value="4+ Rooms">4+ Rooms</option>
            </select>
            {displayErrors.roomAvailable && <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">{displayErrors.roomAvailable}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing</label>
            <select
              className={`input w-full${displayErrors.furnishType ? ' border-pink-500 bg-pink-50' : ''}`}
              value={formData.furnishType || ''}
              onChange={e => setFormData({ ...formData, furnishType: e.target.value })}
              onBlur={() => markTouched('furnishType')}
            >
              <option value="">Select Furnishing</option>
              {furnishTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {displayErrors.furnishType && <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">{displayErrors.furnishType}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parking</label>
            <select
              className={`input w-full${displayErrors.parking ? ' border-pink-500 bg-pink-50' : ''}`}
              value={formData.parking || ''}
              onChange={e => setFormData({ ...formData, parking: e.target.value })}
              onBlur={() => markTouched('parking')}
            >
              <option value="">Select Parking Type</option>
              <option value="No Parking">No Parking</option>
              <option value="1 Car Parking">1 Car Parking</option>
              <option value="2 Car Parking">2 Car Parking</option>
              <option value="3+ Car Parking">3+ Car Parking</option>
              <option value="Bike Parking">Bike Parking</option>
              <option value="Both">Both</option>
            </select>
            {displayErrors.parking && <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">{displayErrors.parking}</p>}
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Amenities</h3>
        <div className="flex flex-wrap gap-3">
          {rentAmenitiesOptions.map((amenity) => {
            const selected = formData.rentDetails?.amenities?.includes(amenity.key) || false;
            return (
              <button
                key={amenity.key}
                type="button"
                onClick={() => {
                  const currentAmenities = formData.rentDetails?.amenities || [];
                  const newAmenities = selected
                    ? currentAmenities.filter((a: string) => a !== amenity.key)
                    : [...currentAmenities, amenity.key];
                  setFormData({
                    ...formData,
                    rentDetails: {
                      ...formData.rentDetails,
                      amenities: newAmenities
                    }
                  });
                }}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-full border transition min-w-[70px] text-xs font-medium focus:outline-none ${
                  selected
                    ? 'bg-primary-600 text-white border-primary-600 shadow'
                    : 'bg-white text-primary-600 border-primary-200 hover:bg-primary-50'
                }`}
                tabIndex={0}
              >
                <span className="mb-1">{React.createElement(amenity.icon, { className: "h-4 w-4" })}</span>
                <span className="whitespace-nowrap">{amenity.label}</span>
              </button>
            );
          })}
        </div>
        {displayErrors.amenities && (
          <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-2 w-full">
            {displayErrors.amenities}
          </p>
        )}
      </div>

      {/* Preferred Tenant */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-4">
        <h2 className="text-lg font-semibold mb-4">Preferred Tenant</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Looking for</label>
            <select 
              className={`input w-full${displayErrors.lookingFor ? ' border-pink-500 bg-pink-50' : ''}`}
              value={formData.rentDetails?.preferredTenant?.lookingFor || ''}
              onChange={e => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  preferredTenant: {
                    ...formData.rentDetails?.preferredTenant,
                    lookingFor: e.target.value
                  }
                }
              })}
              onBlur={() => markTouched('lookingFor')}
            >
              <option value="">Select Preferred Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Any Gender">Any Gender</option>
            </select>
            {displayErrors.lookingFor && (
              <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full">
                {displayErrors.lookingFor}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Move In Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-4">
        <h2 className="text-lg font-semibold mb-4">Move In</h2>
        <div className="flex items-center gap-8 mb-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="moveInOption"
              checked={formData.isImmediate === true}
              onChange={() => handleMoveInOption(true)}
            />
            Immediate
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="moveInOption"
              checked={formData.isImmediate === false}
              onChange={() => handleMoveInOption(false)}
            />
            Specific Date
          </label>
        </div>
        {displayErrors.handoverDate && (
          <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-2 w-full">
            {displayErrors.handoverDate}
          </p>
        )}
        {formData.isImmediate === false && (
          <div className="mb-2">
            <input
              type="date"
              className={`input max-w-xs${displayErrors.handoverDate ? ' border-pink-500 bg-pink-50' : ''}`}
              value={formData.handoverDate || ''}
              min={minDate}
              max={maxDate}
              onChange={e => handleMoveInDateChange(e.target.value ? new Date(e.target.value) : null)}
              onBlur={() => markTouched('handoverDate')}
            />
            <span className="block text-xs text-gray-500 mt-1">Select your move-in date.</span>
            {displayErrors.handoverDate && (
              <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full">
                {displayErrors.handoverDate}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Rental Details */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 bg-gray-50 p-2 rounded">Rental Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rent (₹/month)</label>
            <input
              ref={fieldRefs['rentDetails.costs.rent']}
              type="number"
              className={`input w-full${displayErrors.rent ? ' border-pink-500 bg-pink-50' : ''}`}
              placeholder="Enter rent amount"
              min={0}
              value={formData.rentDetails?.costs?.rent || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const rent = Number(e.target.value);
                setFormData({
                  ...formData,
                  rentDetails: {
                    ...formData.rentDetails,
                    costs: {
                      ...formData.rentDetails?.costs,
                      rent
                    }
                  }
                });
              }}
              spellCheck={false}
              autoCorrect="off"
              onBlur={() => markTouched('rent')}
            />
            {displayErrors.rent && (
              <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full">
                {displayErrors.rent}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance (₹/month)</label>
            <input
              type="number"
              className={`input w-full${displayErrors.maintenance ? ' border-pink-500 bg-pink-50' : ''}`}
              placeholder="Enter maintenance amount"
              value={formData.rentDetails?.costs?.maintenance || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  costs: {
                    ...formData.rentDetails?.costs,
                    maintenance: e.target.value
                  }
                }
              })}
              spellCheck={false}
              autoCorrect="off"
              onBlur={() => markTouched('maintenance')}
            />
            {displayErrors.maintenance && (
              <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full">
                {displayErrors.maintenance}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (₹)</label>
            <input
              type="number"
              className={`input w-full${displayErrors.securityDeposit ? ' border-pink-500 bg-pink-50' : ''}`}
              placeholder="Enter security deposit"
              value={formData.rentDetails?.costs?.securityDeposit || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  costs: {
                    ...formData.rentDetails?.costs,
                    securityDeposit: e.target.value
                  }
                }
              })}
              spellCheck={false}
              autoCorrect="off"
              onBlur={() => markTouched('securityDeposit')}
            />
            {displayErrors.securityDeposit && (
              <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full">
                {displayErrors.securityDeposit}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Setup Cost (₹)</label>
            <input
              type="number"
              className={`input w-full${displayErrors.setupCost ? ' border-pink-500 bg-pink-50' : ''}`}
              placeholder="Enter setup cost"
              value={formData.rentDetails?.costs?.setupCost || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  costs: {
                    ...formData.rentDetails?.costs,
                    setupCost: e.target.value
                  }
                }
              })}
              spellCheck={false}
              autoCorrect="off"
              onBlur={() => markTouched('setupCost')}
            />
            {displayErrors.setupCost && (
              <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full">
                {displayErrors.setupCost}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brokerage (₹)</label>
            <input
              type="number"
              className={`input w-full${displayErrors.brokerage ? ' border-pink-500 bg-pink-50' : ''}`}
              placeholder="Enter brokerage amount"
              value={formData.rentDetails?.costs?.brokerage || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  costs: {
                    ...formData.rentDetails?.costs,
                    brokerage: e.target.value
                  }
                }
              })}
              spellCheck={false}
              autoCorrect="off"
              onBlur={() => markTouched('brokerage')}
            />
            {displayErrors.brokerage && (
              <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full">
                {displayErrors.brokerage}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-lg font-bold mb-6 bg-gray-50 p-2 rounded">Description</h2>
        <textarea
          ref={fieldRefs['description']}
          className={`input min-h-[100px] focus:ring-2 focus:ring-primary-300${displayErrors.description ? ' border-pink-500 bg-pink-50' : ''}`}
          placeholder="Add property description..."
          value={formData.description || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({
            ...formData,
            description: e.target.value
          })}
          spellCheck={true}
          autoCorrect="on"
          onBlur={() => markTouched('description')}
        />
        <p className="text-xs text-gray-500 mt-1">
          Tip: Use this box to share unique details about your property, such as house rules, vibe, or anything not covered above. Avoid repeating amenities, phone number, or location.
        </p>
        {displayErrors.description && <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full">
          {displayErrors.description}
        </p>}
      </section>

      {/* Upload Images */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 bg-gray-50 p-2 rounded">Upload Images</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-2 border-2 border-dashed rounded-lg p-2">
          {images.map((image, index) => (
            <div key={index} className="relative rounded-lg shadow hover:shadow-lg transition overflow-hidden group bg-gray-50">
              <img src={image} alt={`Property ${index + 1}`} className="w-full h-24 sm:h-28 object-cover" />
              <button
                type="button"
                onClick={() => {
                  console.log('Remove button clicked for index:', index);
                  removeImage(index);
                }}
                className="absolute top-1 left-1 bg-white bg-opacity-80 text-red-600 rounded-full p-1 hover:bg-red-500 hover:text-white transition z-10"
                title="Remove Image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label htmlFor="image-upload" className="flex flex-col items-center justify-center h-24 sm:h-28 rounded-lg border-2 border-dashed border-primary-300 cursor-pointer hover:border-primary-500 bg-primary-50 text-primary-600 font-medium shadow group transition">
              <Camera className="h-7 w-7 mb-1 group-hover:text-primary-700" />
              <span className="text-xs">Add Photo</span>
              <input id="image-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            </label>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
          {images.length}/5 images uploaded
          {images.length >= 5 && <span className="text-red-500">(Maximum reached)</span>}
        </div>
        <div className="text-xs text-gray-400 mt-1">Tip: Add clear, well-lit photos for better responses.</div>
        {displayErrors.images && <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full">
          {displayErrors.images}
        </p>}
      </section>

      {/* Contact Number */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
        <input
          type="tel"
          ref={fieldRefs['contactNumber']}
          className={`input${displayErrors.contactNumber ? ' border-pink-500 bg-pink-50' : ''}`}
          placeholder="Enter your 10-digit mobile number"
          value={formData.contactNumber || ''}
          onChange={e => setFormData({
            ...formData,
            contactNumber: e.target.value
          })}
          pattern="[0-9]{10}"
          maxLength={10}
          spellCheck={false}
          autoCorrect="off"
          onBlur={() => markTouched('contactNumber')}
        />
        {displayErrors.contactNumber && <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
          {displayErrors.contactNumber}
        </p>}
        <p className="text-xs text-gray-500 mt-1">This number will be displayed to interested users</p>
      </div>

      {/* Credits Display */}
      <div className="mb-4 flex items-center gap-4">
        <span className="font-semibold text-primary-700">Credits: {loadingCredits ? '...' : credits !== null ? `${credits}/5` : 'N/A'}</span>
        {credits === 0 && (
          <button
            className="ml-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
            onClick={handleRenewPremium}
            disabled={renewing}
          >
            {renewing ? 'Renewing...' : 'Renew Premium'}
          </button>
        )}
        {error && <span className="text-red-600 ml-4">{error}</span>}
      </div>

      {/* Submit Button */}
      {!hideSubmitButton && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || credits === 0}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Creating Listing...' : 'Submit Listing'}
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            By submitting, you agree to our terms and conditions
          </p>
          {credits === 0 && (
            <p className="text-red-600 text-center mt-2 font-bold">You have no credits left. Please renew premium to continue.</p>
          )}
        </div>
      )}
    </>
  );
};

export const SellForm: React.FC<AddListingFormsProps> = (props) => {
  const { formData, setFormData, images, setImages, handleImageUpload, removeImage, errors: propErrors, setErrors: propSetErrors, onSubmit, submitted = false, isSubmitting = false, hideSubmitButton = false } = props;
  const { user } = useAppContext();
  const [credits, setCredits] = useState<number | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [renewing, setRenewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCredits() {
      if (user) {
        setLoadingCredits(true);
        const res = await getUserCredits(user.id);
        setCredits(res.credits);
        setLoadingCredits(false);
      }
    }
    fetchCredits();
  }, [user]);

  const handleRenewPremium = async () => {
    if (!user) return;
    setRenewing(true);
    setError(null);
    const success = await addCredits(user.id, 5);
    if (success) {
      setCredits(5);
    } else {
      setError('Failed to renew premium. Please try again.');
    }
    setRenewing(false);
  };

  // Wrap the onSubmit to decrement credits
  const handleSubmit = async () => {
    if (!user || !credits || credits <= 0) return;
    const used = await useCredits(user.id, 'listing');
    if (used) {
      setCredits((c) => (c ? c - 1 : 0));
      if (props.onSubmit) props.onSubmit();
    } else {
      setError('You have no credits left. Please renew premium.');
    }
  };
  
  // Add missing variable definitions
  const roomTypeOptions = ['1BHK', '2BHK', '3BHK', '4BHK', '4+BHK'];
  const homeTypeOptions = ['Flat', 'Independent House', 'Villa', 'Gated Community'];
  const furnishTypeOptions = ['Fully Furnished', 'Semi Furnished', 'Unfurnished'];
  
  // Property type options
  const propertyTypes = [
    'Flat',
    'Gated Community',
    'Independent House',
    'Villa'
  ];

  // Mark field as touched for validation
  const markTouched = (field: string) => {};

  // Move In date handling functions
  const handleMoveInOption = (immediate: boolean) => {
    setFormData({
      ...formData,
      isImmediate: immediate,
      handoverDate: immediate ? '' : formData.handoverDate
    });
  };

  const handleMoveInDateChange = (date: Date | null) => {
    setFormData({
      ...formData,
      handoverDate: date ? date.toISOString().split('T')[0] : ''
    });
  };

  // Date constraints for move-in
  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Use localErrors for error display
  const errors: Record<string, any> = propErrors || {};
  const setErrors = propSetErrors || (() => {});
  const displayErrors = errors;

  // Refs for error fields
  const fieldRefs: Record<string, React.RefObject<any>> = {
    'address.buildingName': React.createRef(),
    'address.city': React.createRef(),
    'address.locality': React.createRef(),
    'propertyType': React.createRef(),
    'sellDetails.price': React.createRef(),
    'contactNumber': React.createRef(),
    'description': React.createRef(),
  };

  return (
    <>
      {/* Address: Building Name, City, Locality in one row */}
      <AddressFields
        formData={formData}
        setFormData={setFormData}
        errors={displayErrors}
        listingType={props.listingType}
        images={images}
        setImages={setImages}
        handleImageUpload={handleImageUpload}
        removeImage={removeImage}
        submitted={submitted}
      />
      
      {/* Property Type */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">Property Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
            <select
              className={`input w-full${displayErrors.propertyType ? ' border-pink-500 bg-pink-50' : ''}`}
              value={formData.propertyType || ''}
              onChange={e => setFormData({ ...formData, propertyType: e.target.value })}
              onBlur={() => markTouched('propertyType')}
            >
              <option value="">Select Property Type</option>
              {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {displayErrors.propertyType && <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">{displayErrors.propertyType}</p>}
          </div>
        </div>
      </section>

      {/* Room Details section */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-6 bg-gray-50 p-2 rounded">Room Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">BHK</label>
            <select
              className={`input w-full${displayErrors.roomType ? ' border-pink-500 bg-pink-50' : ''}`}
              value={formData.roomType || ''}
              onChange={e => setFormData({ ...formData, roomType: e.target.value })}
              onBlur={() => markTouched('roomType')}
            >
              <option value="">Select BHK</option>
              {roomTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {displayErrors.roomType && <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">{displayErrors.roomType}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing</label>
            <select
              className={`input w-full${displayErrors.furnishType ? ' border-pink-500 bg-pink-50' : ''}`}
              value={formData.furnishType || ''}
              onChange={e => setFormData({ ...formData, furnishType: e.target.value })}
              onBlur={() => markTouched('furnishType')}
            >
              <option value="">Select Furnishing</option>
              {furnishTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {displayErrors.furnishType && <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">{displayErrors.furnishType}</p>}
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Amenities</h3>
        <div className="flex flex-wrap gap-3">
          {sellAmenitiesOptions.map((amenity) => {
            const selected = formData.sellDetails?.amenities?.includes(amenity.key) || false;
            return (
              <button
                key={amenity.key}
                type="button"
                onClick={() => {
                  const currentAmenities = formData.sellDetails?.amenities || [];
                  const newAmenities = selected
                    ? currentAmenities.filter((a: string) => a !== amenity.key)
                    : [...currentAmenities, amenity.key];
                  setFormData({
                    ...formData,
                    sellDetails: {
                      ...formData.sellDetails,
                      amenities: newAmenities
                    }
                  });
                }}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-full border transition min-w-[70px] text-xs font-medium focus:outline-none ${
                  selected
                    ? 'bg-primary-600 text-white border-primary-600 shadow'
                    : 'bg-white text-primary-600 border-primary-200 hover:bg-primary-50'
                }`}
                tabIndex={0}
              >
                <span className="mb-1">{React.createElement(amenity.icon, { className: "h-4 w-4" })}</span>
                <span className="whitespace-nowrap">{amenity.label}</span>
              </button>
            );
          })}
        </div>
        {displayErrors.amenities && (
          <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-2 w-full">
            {displayErrors.amenities}
          </p>
        )}
      </div>

      {/* Details */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Looking for</label>
            <select
              className={`input w-full${displayErrors.lookingFor ? ' border-pink-500 bg-pink-50' : ''}`}
              value={formData.sellDetails?.lookingFor || ''}
              onChange={e => setFormData({ 
                ...formData, 
                sellDetails: { 
                  ...formData.sellDetails, 
                  lookingFor: e.target.value 
                } 
              })}
              onBlur={() => markTouched('lookingFor')}
            >
              <option value="">Select</option>
              <option value="Anyone">Anyone</option>
              <option value="Family">Family</option>
              <option value="Bachelors">Bachelors</option>
            </select>
            {displayErrors.lookingFor && <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {displayErrors.lookingFor}
            </p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parking</label>
            <select
              className={`input w-full${displayErrors.parking ? ' border-pink-500 bg-pink-50' : ''}`}
              value={formData.parking || ''}
              onChange={e => setFormData({ ...formData, parking: e.target.value })}
              onBlur={() => markTouched('parking')}
            >
              <option value="">Select Parking Type</option>
              <option value="Bike">Bike</option>
              <option value="Car">Car</option>
              <option value="Both">Both</option>
            </select>
            {displayErrors.parking && <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {displayErrors.parking}
            </p>}
          </div>
        </div>
      </section>

      {/* Move In Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-4">
        <h2 className="text-lg font-semibold mb-4">Move In</h2>
        <div className="flex items-center gap-8 mb-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="moveInOption"
              checked={formData.isImmediate === true}
              onChange={() => handleMoveInOption(true)}
            />
            Immediate
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="moveInOption"
              checked={formData.isImmediate === false}
              onChange={() => handleMoveInOption(false)}
            />
            Specific Date
          </label>
        </div>
        {displayErrors.handoverDate && (
          <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-2 w-full">
            {displayErrors.handoverDate}
          </p>
        )}
        {formData.isImmediate === false && (
          <div className="mb-2">
            <input
              type="date"
              className={`input max-w-xs${displayErrors.handoverDate ? ' border-pink-500 bg-pink-50' : ''}`}
              value={formData.handoverDate || ''}
              min={minDate}
              max={maxDate}
              onChange={e => handleMoveInDateChange(e.target.value ? new Date(e.target.value) : null)}
              onBlur={() => markTouched('handoverDate')}
            />
            <span className="block text-xs text-gray-500 mt-1">Select your move-in date.</span>
            {displayErrors.handoverDate && (
              <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full">
                {displayErrors.handoverDate}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Price Details */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">Price Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              ref={fieldRefs['sellDetails.price']}
              type="number"
              className={`input w-full${displayErrors.price ? ' border-pink-500 bg-pink-50' : ''}`}
              placeholder="Enter price"
              value={formData.sellDetails?.price || ''}
              onChange={e => setFormData({ 
                ...formData, 
                sellDetails: { 
                  ...formData.sellDetails, 
                  price: e.target.value 
                } 
              })}
              min={0}
              onBlur={() => markTouched('price')}
            />
            {displayErrors.price && <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full">
              {displayErrors.price}
            </p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance</label>
            <input
              type="number"
              className="input w-full"
              placeholder="Enter maintenance"
              value={formData.sellDetails?.maintenance || ''}
              onChange={e => setFormData({ 
                ...formData, 
                sellDetails: { 
                  ...formData.sellDetails, 
                  maintenance: e.target.value 
                } 
              })}
              min={0}
              onBlur={() => markTouched('maintenance')}
            />
            {displayErrors.maintenance && <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full">
              {displayErrors.maintenance}
            </p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit</label>
            <input
              type="number"
              className="input w-full"
              placeholder="Enter security deposit"
              value={formData.sellDetails?.securityDeposit || ''}
              onChange={e => setFormData({ 
                ...formData, 
                sellDetails: { 
                  ...formData.sellDetails, 
                  securityDeposit: e.target.value 
                } 
              })}
              min={0}
              onBlur={() => markTouched('securityDeposit')}
            />
            {displayErrors.securityDeposit && <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full">
              {displayErrors.securityDeposit}
            </p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brokerage</label>
            <input
              type="number"
              className="input w-full"
              placeholder="Enter brokerage"
              value={formData.sellDetails?.brokerage || ''}
              onChange={e => setFormData({ 
                ...formData, 
                sellDetails: { 
                  ...formData.sellDetails, 
                  brokerage: e.target.value 
                } 
              })}
              min={0}
              onBlur={() => markTouched('brokerage')}
            />
            {displayErrors.brokerage && <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full">
              {displayErrors.brokerage}
            </p>}
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-lg font-bold mb-6 bg-gray-50 p-2 rounded">Description</h2>
        <textarea
          ref={fieldRefs['description']}
          className={`input min-h-[100px] focus:ring-2 focus:ring-primary-300${displayErrors.description ? ' border-pink-500 bg-pink-50' : ''}`}
          placeholder="Add property description..."
          value={formData.description || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({
            ...formData,
            description: e.target.value
          })}
          spellCheck={true}
          autoCorrect="on"
          onBlur={() => markTouched('description')}
        />
        <p className="text-xs text-gray-500 mt-1">
          Tip: Use this box to share unique details about your property, such as house rules, vibe, or anything not covered above. Avoid repeating amenities, phone number, or location.
        </p>
        {displayErrors.description && <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full">
          {displayErrors.description}
        </p>}
      </section>

      {/* Upload Images */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 bg-gray-50 p-2 rounded">Upload Images</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-2 border-2 border-dashed rounded-lg p-2">
          {images.map((image, index) => (
            <div key={index} className="relative rounded-lg shadow hover:shadow-lg transition overflow-hidden group bg-gray-50">
              <img src={image} alt={`Property ${index + 1}`} className="w-full h-24 sm:h-28 object-cover" />
              <button
                type="button"
                onClick={() => {
                  console.log('Remove button clicked for index:', index);
                  removeImage(index);
                }}
                className="absolute top-1 left-1 bg-white bg-opacity-80 text-red-600 rounded-full p-1 hover:bg-red-500 hover:text-white transition z-10"
                title="Remove Image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label htmlFor="image-upload-sell" className="flex flex-col items-center justify-center h-24 sm:h-28 rounded-lg border-2 border-dashed border-primary-300 cursor-pointer hover:border-primary-500 bg-primary-50 text-primary-600 font-medium shadow group transition">
              <Camera className="h-7 w-7 mb-1 group-hover:text-primary-700" />
              <span className="text-xs">Add Photo</span>
              <input id="image-upload-sell" type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            </label>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
          {images.length}/5 images uploaded
          {images.length >= 5 && <span className="text-red-500">(Maximum reached)</span>}
        </div>
        <div className="text-xs text-gray-400 mt-1">Tip: Add clear, well-lit photos for better responses.</div>
        {displayErrors.images && <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full">
          {displayErrors.images}
        </p>}
      </section>

      {/* Contact Number */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
        <input
          type="tel"
          ref={fieldRefs['contactNumber']}
          className={`input${displayErrors.contactNumber ? ' border-pink-500 bg-pink-50' : ''}`}
          placeholder="Enter your 10-digit mobile number"
          value={formData.contactNumber || ''}
          onChange={e => setFormData({
            ...formData,
            contactNumber: e.target.value
          })}
          pattern="[0-9]{10}"
          maxLength={10}
          spellCheck={false}
          autoCorrect="off"
          onBlur={() => markTouched('contactNumber')}
        />
        {displayErrors.contactNumber && <p className="text-red-600 text-sm font-bold bg-pink-100 border border-pink-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
          {displayErrors.contactNumber}
        </p>}
        <p className="text-xs text-gray-500 mt-1">This number will be displayed to interested users</p>
      </div>

      {/* Credits Display */}
      <div className="mb-4 flex items-center gap-4">
        <span className="font-semibold text-primary-700">Credits: {loadingCredits ? '...' : credits !== null ? `${credits}/5` : 'N/A'}</span>
        {credits === 0 && (
          <button
            className="ml-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
            onClick={handleRenewPremium}
            disabled={renewing}
          >
            {renewing ? 'Renewing...' : 'Renew Premium'}
          </button>
        )}
        {error && <span className="text-red-600 ml-4">{error}</span>}
      </div>

      {/* Submit Button */}
      {!hideSubmitButton && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || credits === 0}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
              isSubmitting || credits === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Listing'}
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            By submitting, you agree to our terms and conditions
          </p>
          {credits === 0 && (
            <p className="text-red-600 text-center mt-2 font-bold">You have no credits left. Please renew premium to continue.</p>
          )}
        </div>
      )}
    </>
  );
};
