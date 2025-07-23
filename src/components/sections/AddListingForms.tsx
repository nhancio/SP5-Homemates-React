import React, { useState, useEffect, ChangeEvent } from 'react';
import { Camera, X } from 'lucide-react';
import {
  Wifi, Car, Droplet, Utensils, Dumbbell, Snowflake, Shield, Tv, Flame, Fan, Lightbulb, Lock, Refrigerator, WashingMachine, BedDouble, ShowerHead, PawPrint, Users, KeyRound, Plug, Speaker, ParkingCircle, Bike, Leaf, Sun, Thermometer, AirVent, Home
} from 'lucide-react';
import { USER_PREFERENCES } from '../../constants/theme';
import * as LucideIcons from 'lucide-react';
import { getMarkets, Market, testFirebaseConnection, getLocalitiesByCity } from '../../services/markets';
import * as Yup from 'yup';

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

export const AddressFields = ({ formData, setFormData }: AddListingFormsProps) => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [localities, setLocalities] = useState<Market[]>([]);
  const [marketsLoading, setMarketsLoading] = useState(true);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        await testFirebaseConnection();
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
        <div className="col-span-2 flex flex-col gap-3">
          {/* City Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <select
              className={`input w-full${formData.address.city ? '' : ' border-red-500 bg-red-50'}`}
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
            {formData.address.city && errors.city && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.city}
            </p>}
          </div>
          {/* Locality Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Locality</label>
            <select
              className={`input w-full${formData.address.locality ? '' : ' border-red-500 bg-red-50'}`}
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
            {formData.address.locality && errors.locality && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.locality}
            </p>}
        </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Building Name</label>
      <input
        type="text"
        placeholder="Building Name"
            className={`input w-full${errors.buildingName ? ' border-red-500 bg-red-50' : ''}`}
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
          {errors.buildingName && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
            <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
            {errors.buildingName}
          </p>}
        </div>
        <div>
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

const ContactNumberField = ({ formData, setFormData }: { formData: any; setFormData: (data: any) => void }) => (
  <section className="bg-white p-6 rounded-lg shadow-sm">
    <h2 className="text-lg font-semibold mb-4">Contact Details</h2>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
      <input
        type="tel"
        className="input"
        placeholder="Enter your 10-digit mobile number"
        value={formData.contactNumber || ''}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({
          ...formData,
          contactNumber: e.target.value
        })}
        pattern="[0-9]{10}"
        maxLength={10}
        required
        spellCheck={false}
        autoCorrect="off"
      />
      <p className="text-xs text-gray-500 mt-1">This number will be displayed to interested users</p>
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
  const { formData, setFormData, images, setImages, handleImageUpload, removeImage, errors: propErrors, setErrors: propSetErrors } = props;
  const [isDragActive, setIsDragActive] = useState(false);
  const [localErrors, setLocalErrors] = useState<any>({});
  const errors = propErrors || localErrors;
  const setErrors = propSetErrors || setLocalErrors;
  const today = new Date();
  const minDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // tomorrow
  const maxDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days from now

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
    try {
      await listingSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err: any) {
      const errors: any = {};
      if (err.inner) {
        err.inner.forEach((e: any) => {
          if (e.path) {
            // Support nested errors
            const path = e.path.split('.');
            if (path.length === 2) {
              errors[path[1]] = e.message;
            } else if (path.length === 3) {
              if (!errors[path[1]]) errors[path[1]] = {};
              errors[path[1]][path[2]] = e.message;
            } else {
              errors[e.path] = e.message;
            }
          }
        });
      } else if (err.path) {
        errors[err.path] = err.message;
      }
      setErrors(errors);
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (props.onSubmit) props.onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Address: Building Name, City, Locality in one row */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Building Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Building Name</label>
            <input
              type="text"
              placeholder="Building Name"
              className={`input w-full${errors.buildingName ? ' border-red-500 bg-red-50' : ''}`}
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
            {errors.buildingName && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.buildingName}
            </p>}
          </div>
          {/* City Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <select
              className={`input w-full${errors.city ? ' border-red-500 bg-red-50' : ''}`}
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
            {errors.city && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.city}
            </p>}
        </div>
          {/* Locality Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Locality</label>
            <select 
              className={`input w-full${errors.locality ? ' border-red-500 bg-red-50' : ''}`}
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
              {localities.map(locality => (
                <option key={locality.id} value={locality.market}>{locality.market}</option>
              ))}
            </select>
            {errors.locality && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.locality}
            </p>}
          </div>
        </div>
      </section>
      {/* 2-column, 3-row grid for main fields */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-6 bg-gray-50 p-2 rounded">Home Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
          {/* Row 1 - Flat Type (NEW for Shared Listing) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Flat Type</label>
            <select
              className={`input w-full${errors.flatType ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.flatType || ''}
              onChange={e => setFormData({
                ...formData,
                flatType: e.target.value
              })}
              required
            >
              <option value="">Select Flat Type</option>
              <option value="1BHK">1BHK</option>
              <option value="2BHK">2BHK</option>
              <option value="3BHK">3BHK</option>
              <option value="4BHK">4BHK</option>
              <option value="4BHK+">4BHK+</option>
            </select>
            {errors.flatType && (
              <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
                <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
                {errors.flatType}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Rooms</label>
            <select
              className={`input w-full${errors.availableRooms ? ' border-red-500 bg-red-50' : ''}`}
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
            >
              <option value="">Select</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            {errors.availableRooms && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.availableRooms}
            </p>}
          </div>
          {/* Row 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
            <select 
              className={`input w-full${errors.roomType ? ' border-red-500 bg-red-50' : ''}`}
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
            >
              <option value="">Select Room Type</option>
              <option value="private">Private</option>
              <option value="shared">Shared</option>
            </select>
            {errors.roomType && (
              <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
                <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
                {errors.roomType}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Washroom Type</label>
            <select
              className={`input w-full${errors.bathroomType ? ' border-red-500 bg-red-50' : ''}`}
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
            >
              <option value="">Select Bathroom Type</option>
              <option value="attached">Attached</option>
              <option value="common">Common</option>
            </select>
            {errors.bathroomType && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.bathroomType}
            </p>}
          </div>
          {/* Row 3 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
            <select
              className={`input w-full${errors.propertyType ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.propertyType}
              onChange={e => setFormData({
                ...formData,
                propertyType: e.target.value
              })}
            >
              <option value="">Select Property Type</option>
              <option value="standalone">Standalone Apartment</option>
              <option value="gated">Gated Community</option>
              <option value="individual">Individual House</option>
              <option value="villa">Villa</option>
            </select>
            {errors.propertyType && (
              <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
                <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
                {errors.propertyType}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Furnish Type</label>
            <select
              className={`input w-full${errors.furnishingType ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.furnishingType}
              onChange={e => setFormData({
                ...formData,
                furnishingType: e.target.value
              })}
            >
              <option value="">Select Furnishing</option>
              <option value="fully">Fully Furnished</option>
              <option value="semi">Semi Furnished</option>
              <option value="unfurnished">Unfurnished</option>
            </select>
            {errors.furnishingType && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.furnishingType}
            </p>}
          </div>
          {/* Row 4 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parking</label>
            <select 
              className={`input w-full${errors.parking ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.parking}
              onChange={e => setFormData({
                ...formData,
                parking: e.target.value
              })}
            >
              <option value="">Select Parking Type</option>
              <option value="both">Both</option>
              <option value="car">Car Parking</option>
              <option value="bike">Bike Parking</option>
            </select>
            {errors.parking && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.parking}
            </p>}
          </div>
        </div>
      </section>
      {/* 7. Amenities */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-4">
        <h2 className="text-lg font-semibold mb-4 bg-gray-50 p-2 rounded">Amenities</h2>
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
        {errors.amenities && (
          <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
            <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
            {errors.amenities}
          </p>
        )}
      </section>
      {/* 8. Preferred Tenant */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-4">
        <h2 className="text-lg font-semibold mb-4">Preferred Tenant</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Looking for</label>
            <select 
              className={`input w-full${errors.gender ? ' border-red-500 bg-red-50' : ''}`}
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
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && (
              <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
                <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
                {errors.gender}
              </p>
            )}
          </div>
          {/* Preferences Multi-select */}
          <div className="flex flex-wrap gap-3 mt-2">
            {USER_PREFERENCES.map(opt => {
              const LucideIcon = LucideIcons[opt.icon] || LucideIcons.Sparkles;
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
                >
                  <LucideIcon className={`w-5 h-5 ${selected ? 'text-white' : 'text-primary-600'} transition-all duration-200`} />
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
          <>
            <input
              type="date"
              className="input w-full mb-1"
              placeholder="dd-mm-yyyy"
              value={formData.handoverDate}
              onChange={e => setFormData({ ...formData, handoverDate: e.target.value })}
              min={minDate.toISOString().split('T')[0]}
              max={maxDate.toISOString().split('T')[0]}
            />
            {errors.handoverDate && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.handoverDate}
            </p>}
            <span className="text-xs text-gray-500">Select your move-in date.</span>
          </>
        )}
        {errors.isImmediate && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
          <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
          {errors.isImmediate}
        </p>}
        {errors.moveIn && (
          <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
            <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
            {errors.moveIn}
          </p>
        )}
      </section>
      {/* 10. Rental Details */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 bg-gray-50 p-2 rounded">Rental Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rent (₹/month)</label>
            <input
              type="number"
              className={`input w-full${errors.rent ? ' border-red-500 bg-red-50' : ''}`}
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
            />
            {errors.rent && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.rent}
            </p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance (₹/month)</label>
            <input
              type="number"
              className={`input w-full${errors.maintenance ? ' border-red-500 bg-red-50' : ''}`}
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
            />
            {errors.maintenance && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.maintenance}
            </p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (₹)</label>
            <input
              type="number"
              className={`input w-full${errors.securityDeposit ? ' border-red-500 bg-red-50' : ''}`}
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
            />
            {errors.securityDeposit && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.securityDeposit}
            </p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Setup Cost (₹)</label>
            <input
              type="number"
              className={`input w-full${errors.setupCost ? ' border-red-500 bg-red-50' : ''}`}
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
            />
            {errors.setupCost && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.setupCost}
            </p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brokerage (₹)</label>
            <input
              type="number"
              className={`input w-full${errors.brokerage ? ' border-red-500 bg-red-50' : ''}`}
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
            />
            {errors.brokerage && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.brokerage}
            </p>}
          </div>
        </div>
      </section>

      {/* 11. Description */}
      <section className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-lg font-bold mb-6 bg-gray-50 p-2 rounded">Description</h2>
        <textarea
          className={`input min-h-[100px] focus:ring-2 focus:ring-primary-300${errors.description ? ' border-red-500 bg-red-50' : ''}`}
          placeholder="Add property description..."
          value={formData.description}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({
            ...formData,
            description: e.target.value
          })}
          spellCheck={true}
          autoCorrect="on"
        />
        <p className="text-xs text-gray-500 mt-1">
          Tip: Use this box to share unique details about your property, such as house rules, vibe, or anything not covered above. Avoid repeating amenities, phone number, or location.
        </p>
        {errors.description && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
          <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
          {errors.description}
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
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-white bg-opacity-80 text-red-600 rounded-full p-1 hover:bg-red-500 hover:text-white transition"
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
      </section>
      {/* 13. Mobile Number at the bottom */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
              <input
          type="tel"
          className={`input${errors.contactNumber ? ' border-red-500 bg-red-50' : ''}`}
          placeholder="Enter your 10-digit mobile number"
          value={formData.contactNumber || ''}
          onChange={e => setFormData({
                    ...formData,
            contactNumber: e.target.value
          })}
          pattern="[0-9]{10}"
          maxLength={10}
          required
          spellCheck={false}
          autoCorrect="off"
        />
        {errors.contactNumber && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
          <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
          {errors.contactNumber}
        </p>}
        <p className="text-xs text-gray-500 mt-1">This number will be displayed to interested users</p>
        </div>
    </form>
  );
};

export const SellForm: React.FC<AddListingFormsProps> = (props) => {
  const { formData, setFormData, images, handleImageUpload, removeImage, errors: propErrors, setErrors: propSetErrors } = props;
  
  // Add state for city and locality dropdowns
  const [cities, setCities] = useState<string[]>([]);
  const [localities, setLocalities] = useState<string[]>([]);
  const [marketsLoading, setMarketsLoading] = useState(true);
  const [localErrors, setLocalErrors] = useState<any>({});
  const errors = propErrors || localErrors;
  const setErrors = propSetErrors || setLocalErrors;

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
        console.error('SellForm: Error fetching cities:', error);
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
          console.error('SellForm: Error fetching localities:', error);
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
    try {
      await listingSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err: any) {
      const errors: any = {};
      if (err.inner) {
        err.inner.forEach((e: any) => {
          if (e.path) {
            // Support nested errors
            const path = e.path.split('.');
            if (path.length === 2) {
              errors[path[1]] = e.message;
            } else if (path.length === 3) {
              if (!errors[path[1]]) errors[path[1]] = {};
              errors[path[1]][path[2]] = e.message;
            } else {
              errors[e.path] = e.message;
            }
          }
        });
      } else if (err.path) {
        errors[err.path] = err.message;
      }
      setErrors(errors);
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (props.onSubmit) props.onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Address: Building Name, City, Locality in one row */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Building Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Building Name</label>
            <input
              type="text"
              placeholder="Building Name"
              className={`input w-full${errors.buildingName ? ' border-red-500 bg-red-50' : ''}`}
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
            {errors.buildingName && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.buildingName}
            </p>}
          </div>
          {/* City Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <select
              className={`input w-full${errors.city ? ' border-red-500 bg-red-50' : ''}`}
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
            {errors.city && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.city}
            </p>}
          </div>
          {/* Locality Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Locality</label>
            <select
              className={`input w-full${errors.locality ? ' border-red-500 bg-red-50' : ''}`}
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
              {localities.map(locality => (
                <option key={locality.id} value={locality.market}>{locality.market}</option>
              ))}
            </select>
            {errors.locality && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.locality}
            </p>}
          </div>
        </div>
      </section>

      {/* 2-column, 3-row grid for main fields */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-6 bg-gray-50 p-2 rounded">Home Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
          {/* Row 1 - Flat Type (NEW for Full Home) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Flat Type</label>
            <select
              className={`input w-full${errors.flatType ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.flatType || ''}
              onChange={e => setFormData({
                ...formData,
                flatType: e.target.value
              })}
              required
            >
              <option value="">Select Flat Type</option>
              <option value="1BHK">1BHK</option>
              <option value="2BHK">2BHK</option>
              <option value="4BHK">4BHK</option>
              <option value="4BHK+">4BHK+</option>
              <option value="7BHK">7BHK</option>
            </select>
            {errors.flatType && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.flatType}
            </p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
            <select
              className={`input w-full${errors.propertyType ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.sellDetails.propertyType || ''}
              onChange={e => setFormData({
                ...formData,
                sellDetails: {
                  ...formData.sellDetails,
                  propertyType: e.target.value
                }
              })}
            >
              <option value="">Select Property Type</option>
              <option value="standalone">Standalone Apartment</option>
              <option value="gated">Gated Community</option>
              <option value="individual">Individual House</option>
              <option value="villa">Villa</option>
            </select>
            {errors.propertyType && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.propertyType}
            </p>}
          </div>
          {/* Row 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Furnish Type</label>
            <select 
              className={`input w-full${errors.furnishingType ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.sellDetails.furnishingType || ''}
              onChange={e => setFormData({
                ...formData,
                sellDetails: {
                  ...formData.sellDetails,
                furnishingType: e.target.value
                }
              })}
            >
              <option value="">Select Furnishing</option>
              <option value="fully">Fully Furnished</option>
              <option value="semi">Semi Furnished</option>
              <option value="unfurnished">Unfurnished</option>
            </select>
            {errors.furnishingType && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.furnishingType}
            </p>}
          </div>
          {/* Row 3 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parking</label>
            <select 
              className={`input w-full${errors.parking ? ' border-red-500 bg-red-50' : ''}`}
              value={formData.sellDetails.parking || ''}
              onChange={e => setFormData({
                ...formData,
                sellDetails: {
                  ...formData.sellDetails,
                parking: e.target.value
                }
              })}
            >
              <option value="">Select Parking Type</option>
              <option value="car">Car Parking</option>
              <option value="bike">Bike Parking</option>
              <option value="both">Both</option>
            </select>
            {errors.parking && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.parking}
            </p>}
          </div>
        </div>
      </section>

      {/* Amenities Section for SellForm (Full Homes) */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 bg-gray-50 p-2 rounded">Amenities</h2>
        <div className="flex flex-wrap gap-3">
          {AMENITY_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const selected = Array.isArray(formData.sellDetails.amenities) && formData.sellDetails.amenities.includes(opt.key);
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  const amenities = formData.sellDetails.amenities || [];
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
      </section>

      {/* Move In Section (for both RentForm and SellForm) */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 bg-gray-50 p-2 rounded">Move In</h2>
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
          <div className="flex flex-col gap-2 mt-2">
            <input
              type="date"
              className="input w-full"
              placeholder="dd-mm-yyyy"
              value={formData.handoverDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, handoverDate: e.target.value })}
            />
            <span className="text-xs text-gray-500">Select your move-in date.</span>
          </div>
        )}
        {errors.handoverDate && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
          <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
          {errors.handoverDate}
        </p>}
        {errors.moveIn && (
          <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
            <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
            {errors.moveIn}
          </p>
        )}
      </section>

      {/* Rental Details Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-6 bg-gray-50 p-2 rounded">Rental Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rent (₹/month)</label>
            <input
              type="number"
              className={`input w-full${errors.rent ? ' border-red-500 bg-red-50' : ''}`}
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
            />
            {errors.rent && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.rent}
            </p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance (₹/month)</label>
            <input
              type="number"
              className={`input w-full${errors.maintenance ? ' border-red-500 bg-red-50' : ''}`}
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
            />
            {errors.maintenance && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.maintenance}
            </p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (₹)</label>
            <input
              type="number"
              className={`input w-full${errors.securityDeposit ? ' border-red-500 bg-red-50' : ''}`}
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
            />
            {errors.securityDeposit && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.securityDeposit}
            </p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Setup Cost (₹)</label>
            <input
              type="number"
              className={`input w-full${errors.setupCost ? ' border-red-500 bg-red-50' : ''}`}
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
            />
            {errors.setupCost && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.setupCost}
            </p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brokerage (₹)</label>
            <input
              type="number"
              className={`input w-full${errors.brokerage ? ' border-red-500 bg-red-50' : ''}`}
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
            />
            {errors.brokerage && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {errors.brokerage}
            </p>}
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-lg font-bold mb-6 bg-gray-50 p-2 rounded">Description</h2>
        <textarea
          className={`input min-h-[100px] focus:ring-2 focus:ring-primary-300${errors.description ? ' border-red-500 bg-red-50' : ''}`}
          placeholder="Add property description..."
          value={formData.description}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({
            ...formData,
            description: e.target.value
          })}
          spellCheck={true}
          autoCorrect="on"
        />
        <p className="text-xs text-gray-500 mt-1">
          Tip: Use this box to share unique details about your property, such as house rules, vibe, or anything not covered above. Avoid repeating amenities, phone number, or location.
        </p>
        {errors.description && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
          <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
          {errors.description}
        </p>}
      </section>

      {/* Upload Images Section (modern, user-friendly) */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 bg-gray-50 p-2 rounded">Upload Images</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-2">
          {images.map((image, index) => (
            <div key={index} className="relative rounded-lg shadow hover:shadow-lg transition overflow-hidden group bg-gray-50">
              <img src={image} alt={`Property ${index + 1}`} className="w-full h-24 sm:h-28 object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-white bg-opacity-80 text-red-600 rounded-full p-1 hover:bg-red-500 hover:text-white transition"
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
      </section>
      {/* 13. Mobile Number at the bottom */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
              <input
          type="tel"
          className={`input${errors.contactNumber ? ' border-red-500 bg-red-50' : ''}`}
          placeholder="Enter your 10-digit mobile number"
          value={formData.contactNumber || ''}
          onChange={e => setFormData({
                    ...formData,
            contactNumber: e.target.value
          })}
          pattern="[0-9]{10}"
          maxLength={10}
          required
          spellCheck={false}
          autoCorrect="off"
        />
        {errors.contactNumber && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 flex items-center" aria-live="polite">
          <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
          {errors.contactNumber}
        </p>}
        <p className="text-xs text-gray-500 mt-1">This number will be displayed to interested users</p>
        </div>
    </form>
  );
};