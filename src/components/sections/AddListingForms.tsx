import React, { useState, useEffect, ChangeEvent } from 'react';
import { Camera, X } from 'lucide-react';
import {
  Wifi, Car, Droplet, Utensils, Dumbbell, Snowflake, Shield, Tv, Flame, Fan, Lightbulb, Lock, Refrigerator, WashingMachine, BedDouble, ShowerHead, PawPrint, Users, KeyRound, Plug, Speaker, ParkingCircle, Bike, Leaf, Sun, Thermometer, AirVent, Home
} from 'lucide-react';
import { USER_PREFERENCES } from '../../constants/theme';
import * as LucideIcons from 'lucide-react';
import { getMarkets, Market, testFirebaseConnection, getLocalitiesByCity } from '../../services/markets';

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

interface AddListingFormsProps {
  listingType: 'rent' | 'sell';
  formData: any;
  setFormData: (data: any) => void;
  images: string[];
  setImages: (images: string[] | ((prev: string[]) => string[])) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  onSubmit: () => void; // Added for form submission
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
              className="input w-full"
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
          </div>
          {/* Locality Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Locality</label>
            <select
              className="input w-full"
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
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Building Name</label>
          <input
            type="text"
            placeholder="Building Name"
            className="input w-full"
            value={formData.address.buildingName}
            onChange={e => setFormData({
              ...formData,
              address: {
                ...formData.address,
                buildingName: e.target.value,
              },
            })}
          />
        </div>
      </div>
    </section>
  );
};

const ContactNumberField = ({ formData, setFormData }: { formData: any; setFormData: (data: any) => void }) => (
  <section className="bg-white p-6 rounded-lg shadow-sm">
    <h2 className="text-lg font-semibold mb-4">Contact Details</h2>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number*</label>
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
      />
      <p className="text-xs text-gray-500 mt-1">This number will be displayed to interested users</p>
    </div>
  </section>
);

export const RentForm: React.FC<AddListingFormsProps> = (props) => {
  const { formData, setFormData, images, setImages, handleImageUpload, removeImage } = props;
  const [isDragActive, setIsDragActive] = useState(false);
  const [errors, setErrors] = useState<any>({});
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

  const validate = () => {
    const newErrors: any = {};
    const mobile = formData.contactNumber || '';
    if (!/^[6-9][0-9]{9}$/.test(mobile)) {
      newErrors.contactNumber = 'Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.';
    }
    const availableRooms = Number(formData.rentDetails.roomDetails.availableRooms);
    if (![1,2,3].includes(availableRooms)) {
      newErrors.availableRooms = 'Available rooms must be 1, 2, 3';
    }
    if (formData.isImmediate === false) {
      const date = new Date(formData.handoverDate);
      if (!formData.handoverDate) {
        newErrors.handoverDate = 'Please select a date.';
      } else if (date < minDate || date > maxDate) {
        newErrors.handoverDate = `Date must be between ${minDate.toLocaleDateString()} and ${maxDate.toLocaleDateString()}`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
              className="input w-full"
              value={formData.address.buildingName}
              onChange={e => setFormData({
                ...formData,
                address: {
                  ...formData.address,
                  buildingName: e.target.value,
                },
              })}
            />
          </div>
          {/* City Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <select
              className="input w-full"
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
          </div>
          {/* Locality Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Locality</label>
            <select
              className="input w-full"
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
                <option key={locality} value={locality}>{locality}</option>
              ))}
            </select>
          </div>
        </div>
      </section>
      {/* 2-column, 3-row grid for main fields */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-6 bg-gray-50 p-2 rounded">Home Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
          {/* Row 1 - Flat Type (NEW for Shared Listing) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Flat Type*</label>
            <select
              className="input w-full"
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Rooms</label>
            <select
              className="input w-full"
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
            {errors.availableRooms && <p className="text-red-500 text-xs mt-1">{errors.availableRooms}</p>}
          </div>
          {/* Row 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
            <select
              className="input w-full"
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Washroom Type</label>
            <select
              className="input w-full"
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
          </div>
          {/* Row 3 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
            <select
              className="input w-full"
              value={formData.buildingType}
              onChange={e => setFormData({
                ...formData,
                buildingType: e.target.value
              })}
            >
              <option value="">Select Property Type</option>
              <option value="standalone">Standalone Apartment</option>
              <option value="gated">Gated Community</option>
              <option value="individual">Individual House</option>
              <option value="villa">Villa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Furnish Type</label>
            <select
              className="input w-full"
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
          </div>
          {/* Row 4 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parking</label>
            <select
              className="input w-full"
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
      </section>
      {/* 8. Preferred Tenant */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-4">
        <h2 className="text-lg font-semibold mb-4">Preferred Tenant</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Looking for</label>
            <select
              className="input"
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
              title="Looking for"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Any">Any</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferences</label>
            <div className="flex flex-wrap gap-3">
              {USER_PREFERENCES.map(pref => {
                const Icon = (LucideIcons as any)[pref.icon] || LucideIcons.User;
                const selected = formData.rentDetails.preferredTenant.preferences.includes(pref.label);
                return (
                  <button
                    key={pref.id}
                    type="button"
                    onClick={() => {
                      const preferences = formData.rentDetails.preferredTenant.preferences;
                      setFormData({
                        ...formData,
                        rentDetails: {
                          ...formData.rentDetails,
                          preferredTenant: {
                            ...formData.rentDetails.preferredTenant,
                            preferences: preferences.includes(pref.label)
                              ? preferences.filter((p: string) => p !== pref.label)
                              : [...preferences, pref.label]
                          }
                        }
                      });
                    }}
                    className={`flex flex-col items-center justify-center px-3 py-2 rounded-full border transition min-w-[70px] text-xs font-medium focus:outline-none ${selected
                      ? 'bg-primary-600 text-white border-primary-600 shadow'
                      : 'bg-white text-primary-600 border-primary-200 hover:bg-primary-50'}`}
                    tabIndex={0}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${selected ? 'text-white' : 'text-primary-600'}`} />
                    <span className="whitespace-nowrap">{pref.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      {/* 9. Move In */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-4">
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
            {errors.handoverDate && <p className="text-red-500 text-xs mt-1">{errors.handoverDate}</p>}
            <span className="text-xs text-gray-500">Select your move-in date.</span>
          </>
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
              className="input w-full"
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance (₹/month)</label>
            <input
              type="number"
              className="input w-full"
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (₹)</label>
            <input
              type="number"
              className="input w-full"
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Setup Cost (₹)</label>
            <input
              type="number"
              className="input w-full"
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brokerage (₹)</label>
            <input
              type="number"
              className="input w-full"
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
            />
          </div>
        </div>
      </section>

      {/* 11. Description */}
      <section className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-lg font-bold mb-6 bg-gray-50 p-2 rounded">Description</h2>
        <textarea
          className="input min-h-[100px] focus:ring-2 focus:ring-primary-300"
          placeholder="Add property description..."
          value={formData.description}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({
            ...formData,
            description: e.target.value
          })}
        />
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number*</label>
        <input
          type="tel"
          className="input"
          placeholder="Enter your 10-digit mobile number"
          value={formData.contactNumber || ''}
          onChange={e => setFormData({
            ...formData,
            contactNumber: e.target.value
          })}
          pattern="[0-9]{10}"
          maxLength={10}
          required
        />
        {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
        <p className="text-xs text-gray-500 mt-1">This number will be displayed to interested users</p>
      </div>
      <button type="submit" className="btn btn-primary mt-4">Post</button>
    </form>
  );
};

export const SellForm: React.FC<AddListingFormsProps> = (props) => {
  const { formData, setFormData, images, handleImageUpload, removeImage } = props;
  
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

  return (
    <>
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
              className="input w-full"
              value={formData.address.buildingName}
              onChange={e => setFormData({
                ...formData,
                address: {
                  ...formData.address,
                  buildingName: e.target.value,
                },
              })}
            />
          </div>
          {/* City Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <select
              className="input w-full"
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
          </div>
          {/* Locality Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Locality</label>
            <select
              className="input w-full"
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
                <option key={locality} value={locality}>{locality}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 2-column, 3-row grid for main fields */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-6 bg-gray-50 p-2 rounded">Home Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
          {/* Row 1 - Flat Type (NEW for Full Home) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Flat Type*</label>
            <select
              className="input w-full"
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
            <select
              className="input w-full"
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
          </div>
          {/* Row 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Furnish Type</label>
            <select
              className="input w-full"
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
          </div>
          {/* Row 3 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parking</label>
            <select
              className="input w-full"
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
      </section>

      {/* Price Details Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-6 bg-gray-50 p-2 rounded">Price Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rent</label>
            <input
              type="number"
              className="input w-full focus:ring-2 focus:ring-primary-300"
              placeholder="Enter rent"
              value={formData.sellDetails?.rent || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({
                ...formData,
                sellDetails: {
                  ...formData.sellDetails,
                  rent: e.target.value
                }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance</label>
            <input
              type="number"
              className="input w-full focus:ring-2 focus:ring-primary-300"
              placeholder="Enter maintenance"
              value={formData.sellDetails?.maintenance || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({
                ...formData,
                sellDetails: {
                  ...formData.sellDetails,
                  maintenance: e.target.value
                }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit</label>
            <input
              type="number"
              className="input w-full focus:ring-2 focus:ring-primary-300"
              placeholder="Enter security deposit"
              value={formData.sellDetails?.securityDeposit || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({
                ...formData,
                sellDetails: {
                  ...formData.sellDetails,
                  securityDeposit: e.target.value
                }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brokerage</label>
            <input
              type="number"
              className="input w-full focus:ring-2 focus:ring-primary-300"
              placeholder="Enter brokerage"
              value={formData.sellDetails?.brokerage || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({
                ...formData,
                sellDetails: {
                  ...formData.sellDetails,
                  brokerage: e.target.value
                }
              })}
            />
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-lg font-bold mb-6 bg-gray-50 p-2 rounded">Description</h2>
        <textarea
          className="input min-h-[100px] focus:ring-2 focus:ring-primary-300"
          placeholder="Add property description..."
          value={formData.description}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({
            ...formData,
            description: e.target.value
          })}
        />
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
      <button type="button" className="btn btn-primary mt-4">Post</button>
    </>
  );
};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         