import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import {
  Wifi, Car, Droplet, Utensils, Dumbbell, Snowflake, Shield, Tv, Flame, Fan, Lightbulb, Lock, Refrigerator, WashingMachine, BedDouble, ShowerHead, PawPrint, Users, KeyRound, Plug, Speaker, ParkingCircle, Bike, Leaf, Sun, Thermometer, AirVent, Home
} from 'lucide-react';
import { USER_PREFERENCES } from '../../constants/theme';
import * as LucideIcons from 'lucide-react';
import { getMarkets, getLocalitiesByCity } from '../../services/markets';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import InputMask from 'react-input-mask';

// Amenity/feature options with icon and label (same as PropertyFilters)
const AMENITY_OPTIONS = [
  { key: 'ac', label: 'AC', icon: Snowflake },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'fridge', label: 'Fridge', icon: Refrigerator },
  { key: 'washing', label: 'Washing', icon: WashingMachine },
  { key: 'bed', label: 'Bed', icon: BedDouble },
  { key: 'pet', label: 'Pet Friendly', icon: PawPrint },
  { key: 'power', label: 'Power Backup', icon: Plug },
];

// Services available options
const SERVICES = [
  { key: 'maid', label: 'Maid' },
  { key: 'cook', label: 'Cook' },
  { key: 'laundry', label: 'Laundry' },
  { key: 'wifi', label: 'WiFi' },
  { key: 'security', label: 'Security' },
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
            className={`input w-full${errors['address.buildingName'] ? ' border-red-500 bg-red-50' : ''}`}
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
          {submitted && errors['address.buildingName'] && (
            <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              Please enter building name
            </p>
          )}
        </div>
        {/* City and Locality side by side on desktop, stacked on mobile */}
        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <select
            className={`input w-full${errors['address.city'] ? ' border-red-500 bg-red-50' : ''}`}
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
          {submitted && errors['address.city'] && (
            <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              Please select city
            </p>
          )}
        </div>
        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Locality</label>
          <select
            className={`input w-full${errors['address.locality'] ? ' border-red-500 bg-red-50' : ''}`}
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
          {submitted && errors['address.locality'] && (
            <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              Please select locality
            </p>
          )}
        </div>
        {/* Google Maps Link (optional) */}
        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps Link</label>
          <input
            type="text"
            className={`input w-full${errors.googleMapsLink ? ' border-red-500 bg-red-50' : ''}`}
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
        className={`input${errors.contactNumber ? ' border-red-500 bg-red-50' : ''}`}
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
      {errors.contactNumber && <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
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
  const { formData, setFormData, images, setImages, handleImageUpload, removeImage, errors: propErrors, setErrors: propSetErrors, onSubmit } = props;
  const [isDragActive, setIsDragActive] = useState(false);
  const [localErrors, setLocalErrors] = useState<any>({});
  const errors: Record<string, any> = propErrors || localErrors;
  const setErrors = propSetErrors || setLocalErrors;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const year = today.getFullYear();
  const maxRadiusDays = 90;
  const maxDate = new Date(tomorrow);
  maxDate.setDate(tomorrow.getDate() + maxRadiusDays);
  const minDateStr = tomorrow.toISOString().split('T')[0];
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const getDaysInMonth = (month: number, year: number) => new Date(year, month, 0).getDate();

  // Add state for city and locality dropdowns
  const [cities, setCities] = useState<string[]>([]);
  const [localities, setLocalities] = useState<string[]>([]);
  const [marketsLoading, setMarketsLoading] = useState(true);

  // Fetch cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const marketsData = await getMarkets();
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
        // Sort cities alphabetically
        const uniqueCities = Array.from(cityMap.values()).sort((a, b) => a.localeCompare(b));
        setCities(uniqueCities);
        setMarketsLoading(false);
      } catch (error) {
        console.error('RentForm: Error fetching cities:', error);
        setMarketsLoading(false);
      }
    };
    fetchCities();
  }, []);

  // Update localities when city changes
  useEffect(() => {
    const fetchLocalities = async () => {
      if (formData.address.city) {
        try {
          const localitiesData = await getLocalitiesByCity(formData.address.city);
          setLocalities(localitiesData);
        } catch (error) {
          console.error('RentForm: Error fetching localities:', error);
          setLocalities([]);
        }
      } else {
        setLocalities([]);
      }
    };
    fetchLocalities();
  }, [formData.address.city]);

  // Replace the validate function with Yup validation
  const validate = async () => {
    const errs: any = {};
    if (!formData.address?.city) errs['address.city'] = 'Please select city';
    if (!formData.address?.locality) errs['address.locality'] = 'Please select locality';
    if (!formData.address?.buildingName) errs['address.buildingName'] = 'Please enter building name';
    if (!formData.rentDetails?.roomDetails?.flatType) errs.flatType = 'Please select a flat type.';
    if (!formData.rentDetails?.roomDetails?.availableRooms) errs.availableRooms = 'Please select available rooms.';
    if (!formData.rentDetails?.roomDetails?.roomType) errs.roomType = 'Please select a room type.';
    if (!formData.rentDetails?.roomDetails?.bathroomType) errs.bathroomType = 'Please select a bathroom type.';
    if (!formData.propertyType) errs.propertyType = 'Property type is required';
    if (!formData.furnishingType) errs.furnishingType = 'Furnishing type is required';
    if (!formData.parking) errs.parking = 'Parking is required';
    if (!formData.rentDetails?.costs?.rent) errs.rent = 'Rent is required';
    if (!formData.rentDetails?.costs?.maintenance) errs.maintenance = 'Maintenance is required';
    if (!formData.rentDetails?.costs?.securityDeposit) errs.securityDeposit = 'Security deposit is required';
    if (!formData.rentDetails?.costs?.setupCost) errs.setupCost = 'Setup cost is required';
    if (!formData.rentDetails?.costs?.brokerage) errs.brokerage = 'Brokerage is required';
    if (!formData.contactNumber || !/^[6-9][0-9]{9}$/.test(formData.contactNumber)) errs.contactNumber = 'Enter a valid 10-digit mobile number';
    if (!formData.description || formData.description.length < 10) errs.description = 'Description must be at least 10 characters.';
    if (!images || images.length === 0) errs.images = 'Please upload at least one image.';
    if (!formData.rentDetails?.amenities || formData.rentDetails.amenities.length === 0) errs.amenities = 'Please select at least one amenity.';
    if (!formData.rentDetails?.preferredTenant?.lookingFor) errs.lookingFor = 'Looking for is required';
    if (!formData.isImmediate) {
      const handoverDate = formData.handoverDate || '';
      if (!handoverDate) {
        errs.handoverDate = 'Move-in date is required.';
      } else if (handoverDate < minDateStr || handoverDate > maxDateStr) {
        errs.handoverDate = `Move-in date must be between today and the next 90 days.`;
      }
    }
    setLocalErrors(errs);
    if (setErrors) setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Only show errors after form submission
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('RentForm handleSubmit called');
    setSubmitted(true);
    const isValid = await validate();
    console.log('After submit. isValid:', isValid, errors);
    if (isValid) {
      if (props.onSubmit) props.onSubmit();
    }
  };

  // Helper to mark a field as touched
  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

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

  const [moveInDate, setMoveInDate] = useState<Date | null>(null);
  const minYear = tomorrow.getFullYear();
  const maxYear = maxDate.getFullYear();
  const fixedYear = minYear === maxYear ? String(minYear) : "202_";
  const mask = `99/99/${fixedYear}`;
  const [inputValue, setInputValue] = useState(`__/__/${fixedYear}`);
  const [inputMaskError, setInputMaskError] = useState<string | null>(null);
  const [lastValidInputValue, setLastValidInputValue] = useState(`__/__/${fixedYear}`);

  useEffect(() => {
    if (formData.handoverDate) {
      const d = new Date(formData.handoverDate);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const formatted = `${day}/${month}/${year}`;
        setInputValue(formatted);
        setLastValidInputValue(formatted);
        setMoveInDate(d);
      }
    } else {
      // Only reset to mask if the form is explicitly reset (not after save)
      setInputValue(lastValidInputValue);
      setMoveInDate(null);
    }
  }, [formData.handoverDate, fixedYear]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Always keep the year part fixed
    if (!val.endsWith(`/${fixedYear}`)) {
      val = val.slice(0, 5) + `/${fixedYear}`;
    }
    setInputValue(val);

    // Parse only if both day and month are filled
    const match = val.match(/^\d{2}\/\d{2}\/\d{4}$/);
    if (match) {
      const d = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const y = parseInt(match[3], 10);
      const typedDate = new Date(y, m - 1, d);
      if (
        !isNaN(typedDate.getTime()) &&
        typedDate.getDate() === d &&
        typedDate.getMonth() === m - 1 &&
        typedDate.getTime() >= tomorrow.getTime() &&
        typedDate.getTime() <= maxDate.getTime()
      ) {
        setMoveInDate(typedDate);
        setFormData({ ...formData, handoverDate: typedDate.toISOString().split('T')[0] });
        setInputMaskError(null);
        // Always keep inputValue in sync with the valid date
        const formatted = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
        setInputValue(formatted);
        setLastValidInputValue(formatted);
      } else {
        setInputMaskError('Please enter a valid date within the allowed range.');
      }
    } else if (val.replace(/_/g, '').length === mask.length) {
      setInputMaskError('Please enter a valid date in the format DD/MM/YYYY.');
    } else {
      setInputMaskError(null);
    }
  };

  const handleMoveInDateChange = (date: Date | null) => {
    setMoveInDate(date);
    if (date) {
      // Clamp to allowed range using getTime() for comparison
      if (date.getTime() >= tomorrow.getTime() && date.getTime() <= maxDate.getTime()) {
        setFormData({ ...formData, handoverDate: date.toISOString().split('T')[0] });
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        setInputValue(`${day}/${month}/${year}`);
      }
    }
  };

  let placeholder = '';
  if (minYear === maxYear) {
    placeholder = `__/__/${minYear}`;
  } else {
    placeholder = `__/__/202_`;
  }

  // Icon mapping for safe dynamic rendering
  const ICON_MAP: Record<string, React.ComponentType<any>> = {
    Leaf,
    Sun,
    // Add more icons here as needed
  };

  // Use 'submitted' or 'touched' to control error display for all fields
  const displayErrors: typeof errors = {};
  for (const key in errors) {
    if (submitted || touched[key]) {
      displayErrors[key] = errors[key];
    }
  }
  


  // Define property type and BHK options for Shared Homes
  const propertyTypes = [
    'Flat',
    'Gated Community',
    'Independent House',
    'Villa'
  ];
  const flatTypes = [
    'Single Room',
    '1RK',
    '2BHK',
    '3BHK',
    '4BHK',
    '4BHK+'
  ];

  console.log('Rendering RentForm. submitted:', submitted, 'displayErrors:', displayErrors);

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
      {/* Section-level error for Address (only show after submission) */}
      {submitted && (displayErrors['address.city'] || displayErrors['address.locality'] || displayErrors['address.buildingName']) && (
        <div className="mb-4">
          <div className="text-red-700 bg-red-100 border border-red-300 rounded px-3 py-2 font-semibold">
            Please complete all Address fields marked in red.
          </div>
        </div>
      )}
      {/* Property Type */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">Property Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
            <select
              className={`input w-full${displayErrors.propertyType ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.propertyType || ''}
              onChange={e => setFormData({ ...formData, propertyType: e.target.value })}
              onBlur={() => markTouched('propertyType')}
            >
              <option value="">Select Property Type</option>
              {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {displayErrors.propertyType && <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">{displayErrors.propertyType}</p>}
          </div>
        </div>
      </section>
      {/* Home Details section (remove Property Type dropdown from here) */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-6 bg-gray-50 p-2 rounded">Home Details</h2>
        {/* Section-level error for Home Details (only show after submission) */}
        {submitted && (displayErrors.flatType || displayErrors.availableRooms || displayErrors.roomType || displayErrors.bathroomType || displayErrors.furnishingType || displayErrors.parking) && (
          <div className="mb-4">
            <div className="text-red-700 bg-red-100 border border-red-300 rounded px-3 py-2 font-semibold">
              Please complete all Home Details fields marked in red.
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
          {/* Row 1 - Home Type (NEW for Shared Listing) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Home Type</label>
            <select
              ref={fieldRefs['rentDetails.roomDetails.flatType']}
              className={`input w-full${displayErrors.flatType ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.rentDetails.roomDetails.flatType || ''}
              onChange={e => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  roomDetails: {
                    ...formData.rentDetails.roomDetails,
                    flatType: e.target.value
                  }
                }
              })}
              onBlur={() => markTouched('flatType')}
            >
              <option value="">Select Home Type</option>
              {flatTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {displayErrors.flatType && (
              <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
                {displayErrors.flatType}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Rooms</label>
            <select
              ref={fieldRefs['rentDetails.roomDetails.availableRooms']}
              className={`input w-full${displayErrors.availableRooms ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.rentDetails.roomDetails.availableRooms}
              onChange={e => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  roomDetails: {
                    ...formData.rentDetails.roomDetails,
                    availableRooms: e.target.value
                  }
                }
              })}
              onBlur={() => markTouched('availableRooms')}
            >
              <option value="">Select</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            {displayErrors.availableRooms && <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {displayErrors.availableRooms}
            </p>}
          </div>
          {/* Row 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
            <select 
              ref={fieldRefs['rentDetails.roomDetails.roomType']}
              className={`input w-full${displayErrors.roomType ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.rentDetails.roomDetails.roomType}
              onChange={e => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  roomDetails: {
                    ...formData.rentDetails.roomDetails,
                    roomType: e.target.value
                  }
                }
              })}
              onBlur={() => markTouched('roomType')}
            >
              <option value="">Select Room Type</option>
              <option value="private">Private</option>
              <option value="shared">Shared</option>
            </select>
            {displayErrors.roomType && (
              <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
                {displayErrors.roomType}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Washroom Type</label>
            <select
              ref={fieldRefs['rentDetails.roomDetails.bathroomType']}
              className={`input w-full${displayErrors.bathroomType ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.rentDetails.roomDetails.bathroomType}
              onChange={e => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  roomDetails: {
                    ...formData.rentDetails.roomDetails,
                    bathroomType: e.target.value
                  }
                }
              })}
              onBlur={() => markTouched('bathroomType')}
            >
              <option value="">Select Bathroom Type</option>
              <option value="attached">Attached</option>
              <option value="common">Common</option>
            </select>
            {displayErrors.bathroomType && <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {displayErrors.bathroomType}
            </p>}
          </div>
          {/* Remove Property Type dropdown from here */}
          {/* <div> ...Property Type... </div> */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Furnish Type</label>
            <select
              ref={fieldRefs['furnishingType']}
              className={`input w-full${displayErrors.furnishingType ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.furnishingType}
              onChange={e => setFormData({
                ...formData,
                furnishingType: e.target.value
              })}
              onBlur={() => markTouched('furnishingType')}
            >
              <option value="">Select Furnishing</option>
              <option value="fully">Fully Furnished</option>
              <option value="semi">Semi Furnished</option>
              <option value="unfurnished">Unfurnished</option>
            </select>
            {displayErrors.furnishingType && <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {displayErrors.furnishingType}
            </p>}
          </div>
          {/* Row 4 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parking</label>
            <select 
              ref={fieldRefs['parking']}
              className={`input w-full${displayErrors.parking ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.parking}
              onChange={e => setFormData({
                ...formData,
                parking: e.target.value
              })}
              onBlur={() => markTouched('parking')}
            >
              <option value="">Select Parking Type</option>
              <option value="both">Both</option>
              <option value="car">Car Parking</option>
              <option value="bike">Bike Parking</option>
            </select>
            {displayErrors.parking && <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {displayErrors.parking}
            </p>}
          </div>
        </div>
      </section>
      {/* 7. Amenities */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-4">
        <h2 className="text-lg font-semibold mb-4 bg-gray-50 p-2 rounded">Amenities</h2>
        {/* Section-level error for Amenities (only show after submission) */}
        {submitted && displayErrors.amenities && (
          <div className="mb-4">
            <div className="text-red-700 bg-red-100 border border-red-300 rounded px-3 py-2 font-semibold">
              Please select at least one amenity.
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          {AMENITY_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const selected = Array.isArray(formData.rentDetails.amenities) && formData.rentDetails.amenities.includes(opt.key);
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  const amenities = formData.rentDetails.amenities || [];
                  setFormData({
                ...formData,
                    rentDetails: {
                      ...formData.rentDetails,
                      amenities: amenities.includes(opt.key)
                        ? amenities.filter((a: string) => a !== opt.key)
                        : [...amenities, opt.key]
                    }
                  });
                }}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-full border transition min-w-[70px] text-xs font-medium focus:outline-none ${selected
                  ? 'bg-primary-600 text-white border-primary-600 shadow'
                  : 'bg-white text-primary-600 border-primary-200 hover:bg-primary-50'}`}
                tabIndex={0}
              >
                <Icon className={`w-5 h-5 mb-1 ${selected ? 'text-white' : 'text-primary-600'}`} />
                <span className="whitespace-nowrap">{opt.label}</span>
              </button>
            );
          })}
          </div>
        {displayErrors.amenities && (
          <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full">
            {displayErrors.amenities}
          </p>
        )}
      </section>
      {/* 8. Preferred Tenant */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-4">
        <h2 className="text-lg font-semibold mb-4">Preferred Tenant</h2>
        {/* Section-level error for Preferred Tenant (only show after submission) */}
        {submitted && displayErrors.lookingFor && (
          <div className="mb-4">
            <div className="text-red-700 bg-red-100 border border-red-300 rounded px-3 py-2 font-semibold">
              Please select a preferred tenant.
            </div>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Looking for</label>
            <select 
              className={`input w-full${displayErrors.lookingFor ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.rentDetails.preferredTenant.lookingFor}
              onChange={e => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  preferredTenant: {
                    ...formData.rentDetails.preferredTenant,
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
              <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full">
                {displayErrors.lookingFor}
              </p>
            )}
          </div>
          {/* Preferences Multi-select */}
          <div className="flex flex-wrap gap-3 mt-2">
            {USER_PREFERENCES.map(opt => {
              const IconComponent = ICON_MAP[opt.icon] || Sun;
              const selected = Array.isArray(formData.rentDetails.preferredTenant.preferences) && formData.rentDetails.preferredTenant.preferences.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    const prefs = formData.rentDetails.preferredTenant.preferences || [];
                    setFormData({
                      ...formData,
                      rentDetails: {
                        ...formData.rentDetails,
                        preferredTenant: {
                          ...formData.rentDetails.preferredTenant,
                          preferences: prefs.includes(opt.id)
                            ? prefs.filter((p: string) => p !== opt.id)
                            : [...prefs, opt.id]
                        }
                      }
                    });
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 text-sm font-medium focus:outline-none min-w-[120px] shadow-sm
                    ${selected
                      ? 'bg-primary-600 text-white border-primary-700 shadow-md scale-105'
                      : 'bg-white text-primary-700 border-primary-200 hover:bg-primary-100 hover:border-primary-400 hover:shadow-lg active:bg-primary-200'}
                  `}
                  tabIndex={0}
                  style={{ boxShadow: selected ? '0 2px 8px 0 rgba(220,38,120,0.10)' : undefined }}
                  onBlur={() => markTouched('preferences')}
                >
                  {typeof IconComponent === 'function' && (
                    <IconComponent className={`w-5 h-5 ${selected ? 'text-white' : 'text-primary-600'} transition-all duration-200`} />
                  )}
                  <span className="ml-1">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
      {/* Move In Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-4">
        <h2 className="text-lg font-semibold mb-4">Move In</h2>
        {/* Section-level error for Move In (only show after submission) */}
        {submitted && displayErrors.handoverDate && (
          <div className="mb-4">
            <div className="text-red-700 bg-red-100 border border-red-300 rounded px-3 py-2 font-semibold">
              Please select a move-in date.
            </div>
          </div>
        )}
        <div className="flex items-center gap-8 mb-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="moveInOption"
              checked={formData.isImmediate === true}
              onChange={() => setFormData({ ...formData, isImmediate: true, handoverDate: '' })}
            />
            Immediate
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="moveInOption"
              checked={formData.isImmediate === false}
              onChange={() => setFormData({ ...formData, isImmediate: false })}
            />
            Specific Date
          </label>
        </div>
        {formData.isImmediate === false && (
          <div className="mb-2">
            <input
              type="date"
              className={`input max-w-xs${displayErrors.handoverDate ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.handoverDate || ''}
              min={minDateStr}
              max={maxDateStr}
              onChange={e => handleMoveInDateChange(e.target.value ? new Date(e.target.value) : null)}
              onBlur={() => markTouched('handoverDate')}
            />
            <span className="block text-xs text-gray-500 mt-1">Select your move-in date.</span>
            {displayErrors.handoverDate && (
              <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full">
                {displayErrors.handoverDate}
              </p>
            )}
          </div>
        )}
      </section>
      {/* 10. Rental Details */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 bg-gray-50 p-2 rounded">Rental Details</h2>
        {/* Section-level error for Rental Details (only show after submission) */}
        {submitted && (displayErrors.rent || displayErrors.maintenance || displayErrors.securityDeposit || displayErrors.setupCost || displayErrors.brokerage) && (
          <div className="mb-4">
            <div className="text-red-700 bg-red-100 border border-red-300 rounded px-3 py-2 font-semibold">
              Please complete all Rental Details fields marked in red.
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rent (₹/month)</label>
            <input
              ref={fieldRefs['rentDetails.costs.rent']}
              type="number"
              className={`input w-full${displayErrors.rent ? ' border-red-500 bg-red-50' : ''}`}
              placeholder="Enter rent amount"
              min={0}
              value={formData.rentDetails.costs.rent || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const rent = Number(e.target.value);
                setFormData({
                  ...formData,
                  rentDetails: {
                    ...formData.rentDetails,
                    costs: {
                      ...formData.rentDetails.costs,
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
              <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full">
                {displayErrors.rent}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance (₹/month)</label>
            <input
              type="number"
              className={`input w-full${displayErrors.maintenance ? ' border-red-500 bg-red-50' : ''}`}
              placeholder="Enter maintenance amount"
              value={formData.rentDetails.costs.maintenance}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  costs: {
                    ...formData.rentDetails.costs,
                    maintenance: e.target.value
                  }
                }
              })}
              spellCheck={false}
              autoCorrect="off"
              onBlur={() => markTouched('maintenance')}
            />
            {displayErrors.maintenance && (
              <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full">
                {displayErrors.maintenance}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (₹)</label>
            <input
              type="number"
              className={`input w-full${displayErrors.securityDeposit ? ' border-red-500 bg-red-50' : ''}`}
              placeholder="Enter security deposit"
              value={formData.rentDetails.costs.securityDeposit}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  costs: {
                    ...formData.rentDetails.costs,
                    securityDeposit: e.target.value
                  }
                }
              })}
              spellCheck={false}
              autoCorrect="off"
              onBlur={() => markTouched('securityDeposit')}
            />
            {displayErrors.securityDeposit && (
              <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full">
                {displayErrors.securityDeposit}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Setup Cost (₹)</label>
            <input
              type="number"
              className={`input w-full${displayErrors.setupCost ? ' border-red-500 bg-red-50' : ''}`}
              placeholder="Enter setup cost"
              value={formData.rentDetails.costs.setupCost}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  costs: {
                    ...formData.rentDetails.costs,
                    setupCost: e.target.value
                  }
                }
              })}
              spellCheck={false}
              autoCorrect="off"
              onBlur={() => markTouched('setupCost')}
            />
            {displayErrors.setupCost && (
              <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full">
                {displayErrors.setupCost}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brokerage (₹)</label>
            <input
              type="number"
              className={`input w-full${displayErrors.brokerage ? ' border-red-500 bg-red-50' : ''}`}
              placeholder="Enter brokerage amount"
              value={formData.rentDetails.costs.brokerage}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  costs: {
                    ...formData.rentDetails.costs,
                    brokerage: e.target.value
                  }
                }
              })}
              spellCheck={false}
              autoCorrect="off"
              onBlur={() => markTouched('brokerage')}
            />
            {displayErrors.brokerage && (
              <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full">
                {displayErrors.brokerage}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 11. Description */}
      <section className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-lg font-bold mb-6 bg-gray-50 p-2 rounded">Description</h2>
        <textarea
          ref={fieldRefs['description']}
          className={`input min-h-[100px] focus:ring-2 focus:ring-primary-300${displayErrors.description ? ' border-red-500 bg-red-50' : ''}`}
          placeholder="Add property description..."
          value={formData.description}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({
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
        {displayErrors.description && <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full">
          {displayErrors.description}
        </p>}
      </section>

      {/* 12. Upload Images */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 bg-gray-50 p-2 rounded">Upload Images</h2>
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-2 border-2 border-dashed rounded-lg p-2 transition ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-primary-300 bg-white'}`}
          onDragOver={e => { e.preventDefault(); setIsDragActive(true); }}
          onDragLeave={e => { e.preventDefault(); setIsDragActive(false); }}
          onDrop={e => {
            e.preventDefault();
            setIsDragActive(false);
            const files = Array.from(e.dataTransfer.files || []);
            if (files.length + images.length > 5) {
              alert('Maximum 5 images allowed');
              return;
            }
            files.forEach(file => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const result = e.target?.result as string;
                setImages(prev => [...prev, result]);
              };
              reader.readAsDataURL(file);
            });
          }}
        >
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
        {displayErrors.images && <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full">
          {displayErrors.images}
        </p>}
      </section>
      {/* 13. Mobile Number at the bottom */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
              <input
          type="tel"
          ref={fieldRefs['contactNumber']}
          className={`input${displayErrors.contactNumber ? ' border-red-500 bg-red-50' : ''}`}
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
        {displayErrors.contactNumber && <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
          {displayErrors.contactNumber}
        </p>}
        <p className="text-xs text-gray-500 mt-1">This number will be displayed to interested users</p>
        </div>

      {/* Submit Button */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={submitted}
          onClick={async (e) => {
            e.preventDefault();
            setSubmitted(true);
            
            // Validate form
            const validationErrors = await validate();
            if (Object.keys(validationErrors).length > 0) {
              if (setErrors) {
                setErrors(validationErrors);
              }
              setSubmitted(false);
              return;
            }
            
            // Call parent onSubmit if provided
            if (onSubmit) {
              onSubmit();
            }
          }}
        >
          {submitted ? 'Creating Listing...' : 'Submit Listing'}
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          By submitting, you agree to our terms and conditions
        </p>
      </div>
    </>
  );
};

// Minimal SellForm implementation to resolve missing export
export const SellForm: React.FC<AddListingFormsProps> = (props) => {
  const { formData, setFormData, images, setImages, handleImageUpload, removeImage, errors = {}, setErrors, onSubmit } = props;
  const [moveInDate, setMoveInDate] = useState<Date | null>(null);
  const [isImmediate, setIsImmediate] = useState(formData.isImmediate ?? true);
  const [localErrors, setLocalErrors] = useState<any>({});
  // Only show errors after form submission
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Property type options - same as BuyPropertiesPage (Full Homes)
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
  const minDate = today.toISOString().split('T')[0];
  const maxDateObj = new Date(today);
  maxDateObj.setDate(today.getDate() + 90);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  // Validation
  const validate = async () => {
    const errs: any = {};
    console.log('SellForm validation - formData:', formData);
    
    if (!formData.address?.city) errs['address.city'] = 'Please select city';
    if (!formData.address?.locality) errs['address.locality'] = 'Please select locality';
    if (!formData.address?.buildingName) errs['address.buildingName'] = 'Please enter building name';
    if (!formData.contactNumber || !/^[6-9][0-9]{9}$/.test(formData.contactNumber)) errs.contactNumber = 'Enter a valid 10-digit mobile number';
    if (!formData.propertyType) errs.propertyType = 'Property type is required';
    if (!formData.homeType) errs.homeType = 'Home type is required';
    if (!formData.roomType) errs.roomType = 'Flat type is required';
    if (!formData.furnishType) errs.furnishType = 'Furnish type is required';
    if (!formData.description || formData.description.length < 10) errs.description = 'Description must be at least 10 characters.';
    if (!images || images.length === 0) errs.images = 'Please upload at least one image.';
    if (!formData.sellDetails?.amenities || formData.sellDetails.amenities.length === 0) errs.amenities = 'Please select at least one amenity.';
    if (!formData.parking) errs.parking = 'Parking is required';
    if (!formData.price || formData.price === '') {
      errs.price = 'Price is required';
    } else if (Number(formData.price) < 1000 || Number(formData.price) > 100000) {
      errs.price = 'Price must be between ₹1,000 and ₹100,000';
    }
    
    // Validate new cost fields
    if (!formData.rent || formData.rent === '') {
      errs.rent = 'Rent amount is required';
    } else if (Number(formData.rent) < 1000 || Number(formData.rent) > 100000) {
      errs.rent = 'Rent must be between ₹1,000 and ₹100,000';
    }
    
    if (!formData.maintenance || formData.maintenance === '') {
      errs.maintenance = 'Maintenance amount is required';
    } else if (Number(formData.maintenance) < 0 || Number(formData.maintenance) > 50000) {
      errs.maintenance = 'Maintenance must be between ₹0 and ₹50,000';
    }
    
    if (!formData.brokerage || formData.brokerage === '') {
      errs.brokerage = 'Brokerage amount is required';
    } else if (Number(formData.brokerage) < 0 || Number(formData.brokerage) > 50000) {
      errs.brokerage = 'Brokerage must be between ₹0 and ₹50,000';
    }
    
    if (!formData.securityDeposit || formData.securityDeposit === '') {
      errs.securityDeposit = 'Security deposit is required';
    } else if (Number(formData.securityDeposit) < 1000 || Number(formData.securityDeposit) > 200000) {
      errs.securityDeposit = 'Security deposit must be between ₹1,000 and ₹200,000';
    }
    
    if (!isImmediate) {
      const handoverDate = formData.handoverDate || '';
      if (!handoverDate) {
        errs.handoverDate = 'Move-in date is required.';
      } else if (handoverDate < minDate || handoverDate > maxDate) {
        errs.handoverDate = `Move-in date must be between today and the next 90 days.`;
      }
    }
    
    console.log('SellForm validation - errors found:', errs);
    setLocalErrors(errs);
    if (setErrors) setErrors(errs);
    return Object.keys(errs).length === 0;
  };



  // Mark field as touched for validation
  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  // Use localErrors for error display
  const displayErrors = { ...errors, ...localErrors };

  // Options for Home Type, Room Type, and Furnish Type
  const homeTypeOptions = [
    'Apartment',
    'Villa',
    'Independent House',
    'Gated Community',
    'Penthouse',
    'Studio'
  ];
  const roomTypeOptions = [
    '1RK',
    '1BHK',
    '2BHK',
    '3BHK',
    '4BHK',
    '4BHK+'
  ];
  const furnishTypeOptions = [
    'Fully Furnished',
    'Semi Furnished',
    'Unfurnished'
  ];

  return (
    <>
      {/* Address Section */}
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
      {/* Section-level error for Address (only show after submission) */}
      {submitted && (displayErrors['address.city'] || displayErrors['address.locality'] || displayErrors['address.buildingName']) && (
        <div className="mb-4">
          <div className="text-red-700 bg-red-100 border border-red-300 rounded px-3 py-2 font-semibold">
            Please complete all Address fields marked in red.
          </div>
        </div>
      )}

      {/* Property Type */}
      
      {/* Home Details Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">Home Details</h2>
        {submitted && (displayErrors.homeType || displayErrors.roomType || displayErrors.furnishType) && (
          <div className="mb-4">
            <div className="text-red-700 bg-red-100 border border-red-300 rounded px-3 py-2 font-semibold">
              Please select Home Type, Room Type, and Furnish Type.
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Home Type</label>
            <select
              className={`input w-full${displayErrors.homeType ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.homeType || ''}
              onChange={e => setFormData({ ...formData, homeType: e.target.value })}
              onBlur={() => markTouched('homeType')}
            >
              <option value="">Select Home Type</option>
              {homeTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {displayErrors.homeType && <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">{displayErrors.homeType}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Flat Type</label>
            <select
              className={`input w-full${displayErrors.roomType ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.roomType || ''}
              onChange={e => setFormData({ ...formData, roomType: e.target.value })}
              onBlur={() => markTouched('roomType')}
            >
              <option value="">Select Flat Type</option>
              {roomTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {displayErrors.roomType && <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">{displayErrors.roomType}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Furnish Type</label>
            <select
              className={`input w-full${displayErrors.furnishType ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.furnishType || ''}
              onChange={e => setFormData({ ...formData, furnishType: e.target.value })}
              onBlur={() => markTouched('furnishType')}
            >
              <option value="">Select Furnishing</option>
              {furnishTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {displayErrors.furnishType && <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">{displayErrors.furnishType}</p>}
          </div>
        </div>
      </section>
      {/* Details */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">Details</h2>
        {submitted && (displayErrors.lookingFor || displayErrors.parking) && (
          <div className="mb-4">
            <div className="text-red-700 bg-red-100 border border-red-300 rounded px-3 py-2 font-semibold">
              Please complete all Details fields.
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Looking for</label>
            <select
              className={`input w-full${displayErrors.lookingFor ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.lookingFor || ''}
              onChange={e => setFormData({ ...formData, lookingFor: e.target.value })}
              onBlur={() => markTouched('lookingFor')}
            >
              <option value="">Select</option>
              <option value="Anyone">Anyone</option>
              <option value="Family">Family</option>
              <option value="Bachelors">Bachelors</option>
            </select>
            {displayErrors.lookingFor && <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {displayErrors.lookingFor}
            </p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parking</label>
            <select
              className={`input w-full${displayErrors.parking ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.parking || ''}
              onChange={e => setFormData({ ...formData, parking: e.target.value })}
              onBlur={() => markTouched('parking')}
            >
              <option value="">Select Parking Type</option>
              <option value="Bike">Bike</option>
              <option value="Car">Car</option>
              <option value="Both">Both</option>
            </select>
            {displayErrors.parking && <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {displayErrors.parking}
            </p>}
          </div>
        </div>
      </section>
      {/* Amenities */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">Amenities</h2>
        {submitted && displayErrors.amenities && (
          <div className="mb-4">
            <div className="text-red-700 bg-red-100 border border-red-300 rounded px-3 py-2 font-semibold">
              Please select at least one amenity.
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          {AMENITY_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const selected = Array.isArray(formData.sellDetails?.amenities) && formData.sellDetails.amenities.includes(opt.key);
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  const amenities = formData.sellDetails?.amenities || [];
                  setFormData({
                    ...formData,
                    sellDetails: {
                      ...formData.sellDetails,
                      amenities: amenities.includes(opt.key)
                        ? amenities.filter((a: string) => a !== opt.key)
                        : [...amenities, opt.key]
                    }
                  });
                }}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-full border transition min-w-[70px] text-xs font-medium focus:outline-none ${selected
                  ? 'bg-primary-600 text-white border-primary-600 shadow'
                  : 'bg-white text-primary-600 border-primary-200 hover:bg-primary-50'}`}
                tabIndex={0}
              >
                <Icon className={`w-5 h-5 mb-1 ${selected ? 'text-white' : 'text-primary-600'}`} />
                <span className="whitespace-nowrap">{opt.label}</span>
              </button>
            );
          })}
        </div>
        {displayErrors.amenities && (
          <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full">
            {displayErrors.amenities}
          </p>
        )}
      </section>
      {/* Move In */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">Move In</h2>
        {/* Section-level error for Move In (always show if any error) */}
        {submitted && displayErrors.handoverDate && (
          <div className="mb-4">
            <div className="text-red-700 bg-red-100 border border-red-300 rounded px-3 py-2 font-semibold">
              Please select a move-in date.
            </div>
          </div>
        )}
        <div className="flex items-center gap-8 mb-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="moveInOption"
              checked={isImmediate === true}
              onChange={() => handleMoveInOption(true)}
            />
            Immediate
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="moveInOption"
              checked={isImmediate === false}
              onChange={() => handleMoveInOption(false)}
            />
            Specific Date
          </label>
        </div>
        {isImmediate === false && (
          <div className="mb-2">
            <input
              type="date"
              className={`input max-w-xs${displayErrors.handoverDate ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.handoverDate || ''}
              min={minDate}
              max={maxDate}
              onChange={e => handleMoveInDateChange(e.target.value ? new Date(e.target.value) : null)}
              onBlur={() => markTouched('handoverDate')}
            />
            <span className="block text-xs text-gray-500 mt-1">Select your move-in date.</span>
            {displayErrors.handoverDate && (
              <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full">
                {displayErrors.handoverDate}
              </p>
            )}
          </div>
        )}
      </section>
      {/* Price Details */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">Rent Details</h2>
        {submitted && displayErrors.price && (
          <div className="mb-4">
            <div className="text-red-700 bg-red-100 border border-red-300 rounded px-3 py-2 font-semibold">
              Please enter a valid price (₹1,000 - ₹100,000).
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              className={`input w-full${displayErrors.price ? ' border-red-500 bg-red-50' : ''}`}
              placeholder="Enter price"
              value={formData.price || ''}
              onChange={e => setFormData({ ...formData, price: e.target.value })}
              min={0}
              onBlur={() => markTouched('price')}
            />
            {displayErrors.price && <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full">
              {displayErrors.price}
            </p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance</label>
            <input
              type="number"
              className="input w-full"
              placeholder="Enter maintenance"
              value={formData.maintenance || ''}
              onChange={e => setFormData({ ...formData, maintenance: e.target.value })}
              min={0}
              onBlur={() => markTouched('maintenance')}
            />
            {displayErrors.maintenance && <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full">
              {displayErrors.maintenance}
            </p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit</label>
            <input
              type="number"
              className="input w-full"
              placeholder="Enter security deposit"
              value={formData.securityDeposit || ''}
              onChange={e => setFormData({ ...formData, securityDeposit: e.target.value })}
              min={0}
              onBlur={() => markTouched('securityDeposit')}
            />
            {displayErrors.securityDeposit && <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full">
              {displayErrors.securityDeposit}
            </p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brokerage</label>
            <input
              type="number"
              className="input w-full"
              placeholder="Enter brokerage"
              value={formData.brokerage || ''}
              onChange={e => setFormData({ ...formData, brokerage: e.target.value })}
              min={0}
              onBlur={() => markTouched('brokerage')}
            />
            {displayErrors.brokerage && <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full">
              {displayErrors.brokerage}
            </p>}
          </div>
        </div>
      </section>
      {/* Description */}
      <section className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-lg font-bold mb-6 bg-gray-50 p-2 rounded">Description</h2>
        <textarea
          className={`input min-h-[100px] focus:ring-2 focus:ring-primary-300${displayErrors.description ? ' border-red-500 bg-red-50' : ''}`}
          placeholder="Add property description..."
          value={formData.description || ''}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          spellCheck={true}
          autoCorrect="on"
          onBlur={() => markTouched('description')}
        />
        <p className="text-xs text-gray-500 mt-1">Tip: Add clear, well-lit photos for better responses.</p>
        {displayErrors.description && <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full">
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
        {displayErrors.images && <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full">
          {displayErrors.images}
        </p>}
      </section>

      {/* Contact Details */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number*</label>
        <input
          type="tel"
          className={`input w-full${displayErrors.contactNumber ? ' border-red-500 bg-red-50' : ''}`}
          placeholder="Enter your 10-digit mobile number"
          value={formData.contactNumber || ''}
          onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
          pattern="[0-9]{10}"
          maxLength={10}
          spellCheck={false}
          autoCorrect="off"
          onBlur={() => markTouched('contactNumber')}
        />
        <p className="text-xs text-gray-500 mt-1">This number will be displayed to interested users</p>
        {displayErrors.contactNumber && <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
          {displayErrors.contactNumber}
        </p>}
      </div>

      {/* Submit Button */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={submitted}
          onClick={async (e) => {
            e.preventDefault();
            setSubmitted(true);
            
            // Validate form
            const validationErrors = await validate();
            if (Object.keys(validationErrors).length > 0) {
              if (setErrors) {
                setErrors(validationErrors);
              }
              setSubmitted(false);
              return;
            }
            
            // Call parent onSubmit if provided
            if (onSubmit) {
              onSubmit();
            }
          }}
        >
          {submitted ? 'Creating Listing...' : 'Submit Listing'}
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          By submitting, you agree to our terms and conditions
        </p>
      </div>
    </>
  );
};