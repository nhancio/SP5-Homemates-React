import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAppContext } from '../../context/AppContext';
import {
  Wifi, Car, Droplet, Utensils, Dumbbell, Snowflake, Shield, Tv, Flame, Fan, Lightbulb, Lock, Refrigerator, WashingMachine, BedDouble, ShowerHead, PawPrint, Users, KeyRound, Plug, Speaker, ParkingCircle, Bike, Leaf, Sun, Thermometer, AirVent, Home
} from 'lucide-react';
import { getMarkets, Market, getLocalitiesByCity } from '../../services/markets';

interface PropertyFiltersProps {
  propertyTypes: string[];
  listingType: 'buy' | 'rent';
}

const PRICE_MIN = 1000; // Fixed min price
const PRICE_MAX = 30000; // Max rent set to 30K
const SLIDER_STEP = 500;
const SLIDER_MARKS = {
  1000: '₹1k',
  10000: '₹10k',
  20000: '₹20k',
  30000: '₹30k',
};

const PropertyFilters: React.FC<PropertyFiltersProps> = ({ propertyTypes, listingType }) => {
  const { filters, setFilters } = useAppContext();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [localities, setLocalities] = useState<string[]>([]);
  const [marketsLoading, setMarketsLoading] = useState(true);

  // Move currentFilters up so it's available for useEffect
  const currentFilters = filters[listingType];

  useEffect(() => {
    // Fetch all markets on mount
    getMarkets().then((data) => {
      setMarkets(data);
      // Extract unique cities
      const uniqueCities = Array.from(new Set(data.map(m => m.city).filter(Boolean)));
      setCities(uniqueCities);
      setMarketsLoading(false);
    });
  }, []);

  // Update localities when city changes
  useEffect(() => {
    if (currentFilters.city) {
      getLocalitiesByCity(currentFilters.city).then(setLocalities);
    } else {
      setLocalities([]);
    }
  }, [currentFilters.city]);

  // Focus trap for accessibility
  useEffect(() => {
    if (drawerOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [drawerOpen]);

  // Type guards for filter types
  function isRentFilters(obj: any): obj is { minRent: number; maxRent: number; amenities: string } {
    return obj && typeof obj.minRent === 'number' && typeof obj.maxRent === 'number';
  }
  function isBuyFilters(obj: any): obj is { minPrice: number; maxPrice: number; amenities?: string } {
    return obj && typeof obj.minPrice === 'number' && typeof obj.maxPrice === 'number';
  }

  // Add local state for price/rent inputs
  const [localPriceMin, setLocalPriceMin] = useState<number | undefined>(isBuyFilters(filters[listingType]) ? filters[listingType].minPrice : undefined);
  const [localPriceMax, setLocalPriceMax] = useState<number | undefined>(isBuyFilters(filters[listingType]) ? filters[listingType].maxPrice : undefined);
  const [localMinRent, setLocalMinRent] = useState(isRentFilters(filters[listingType]) ? filters[listingType].minRent : '');
  const [localMaxRent, setLocalMaxRent] = useState(isRentFilters(filters[listingType]) ? filters[listingType].maxRent : '');

  // Local state for min/max fields, keyed by listingType
  const isRent = listingType === 'rent';
  const [localMin, setLocalMin] = useState<string>(
    String(isRent ? (filters[listingType]?.minRent ?? PRICE_MIN) : (filters[listingType]?.minPrice ?? PRICE_MIN))
  );
  const [localMax, setLocalMax] = useState<string>(
    String(isRent ? (filters[listingType]?.maxRent ?? PRICE_MAX) : (filters[listingType]?.maxPrice ?? PRICE_MAX))
  );

  // Sync local state with context filters when filters change externally
  useEffect(() => {
    setLocalPriceMin(isBuyFilters(filters[listingType]) ? filters[listingType].minPrice : undefined);
    setLocalPriceMax(isBuyFilters(filters[listingType]) ? filters[listingType].maxPrice : undefined);
    setLocalMinRent(isRentFilters(filters[listingType]) ? filters[listingType].minRent : '');
    setLocalMaxRent(isRentFilters(filters[listingType]) ? filters[listingType].maxRent : '');
    setLocalMin(isRent ? String(filters[listingType].minRent) : String(filters[listingType].minPrice));
    setLocalMax(isRent ? String(filters[listingType].maxRent) : String(filters[listingType].maxPrice));
  }, [filters[listingType], listingType]);

  useEffect(() => {
    setFilters({ ...filters, activeType: listingType });
  }, [listingType]);

  // Add localDrawerFilters state for all filter fields
  const [localDrawerFilters, setLocalDrawerFilters] = useState<any>(null);

  // When opening the drawer, initialize localDrawerFilters from currentFilters
  useEffect(() => {
    if (drawerOpen) {
      setLocalDrawerFilters({ ...currentFilters });
    }
  }, [drawerOpen, currentFilters]);

  // Handler for local drawer filter changes
  const handleDrawerFilterChange = (name: string, value: any) => {
    setLocalDrawerFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  // Handler for Apply Filters button
  const handleApplyDrawerFilters = () => {
    setFilters({
      ...filters,
      [listingType]: { ...localDrawerFilters },
    });
    setDrawerOpen(false);
  };

  // Only show city and locality dropdowns for location selection
  // In the JSX, ensure only the city and locality dropdowns are present for location selection

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue: any = value;
    if ([
      'minRent', 'maxRent', 'minPrice', 'maxPrice', 'minSqft', 'maxSqft'
    ].includes(name)) {
      newValue = value === '' ? '' : Number(value);
    }
    console.log('Filter change', name, value, newValue);
    setFilters({
      ...filters,
      [listingType]: {
        ...filters[listingType],
        [name]: newValue,
      },
    });
  };

  // Validation state for min/max rent
  const [minRentError, setMinRentError] = useState<string | null>(null);
  const [maxRentError, setMaxRentError] = useState<string | null>(null);

  // Handler for input changes
  const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, ''); // Only allow digits
    if (val.length > 5) val = val.slice(0, 5);
    let numVal = Number(val);
    if (val === '' || isNaN(numVal)) {
      setMinRentError('Please enter a number');
      setLocalMin(val);
      return;
    }
    if (numVal < PRICE_MIN) {
      numVal = PRICE_MIN;
    }
    const maxNum = Number(localMax);
    if (!isNaN(maxNum) && numVal > maxNum) {
      numVal = maxNum;
    }
    setMinRentError(null);
    setLocalMin(String(numVal));
    setFilters({
      ...filters,
      [listingType]: {
        ...filters[listingType],
        ...(isRent ? { minRent: numVal, maxRent: maxNum } : { minPrice: numVal, maxPrice: maxNum }),
      },
    });
  };
  const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, ''); // Only allow digits
    if (val.length > 5) val = val.slice(0, 5);
    let numVal = Number(val);
    if (val === '' || isNaN(numVal)) {
      setMaxRentError('Please enter a number');
      setLocalMax(val);
      return;
    }
    if (numVal > PRICE_MAX) {
      numVal = PRICE_MAX;
    }
    const minNum = Number(localMin);
    if (!isNaN(minNum) && numVal < minNum) {
      numVal = minNum;
    }
    setMaxRentError(null);
    setLocalMax(String(numVal));
    setFilters({
      ...filters,
      [listingType]: {
        ...filters[listingType],
        ...(isRent ? { minRent: minNum, maxRent: numVal } : { minPrice: minNum, maxPrice: numVal }),
      },
    });
  };

  // Commit filter on blur/enter
  const commitMin = () => {
    console.log('Committing min filter:', listingType === 'rent' ? 'minRent' : 'priceMin', localMin);
    setFilters({
      ...filters,
      [listingType]: {
        ...filters[listingType],
        ...(isRent ? { minRent: Number(localMin) } : { priceMin: Number(localMin) }),
      },
    });
  };
  const commitMax = () => {
    console.log('Committing max filter:', listingType === 'rent' ? 'maxRent' : 'priceMax', localMax);
    setFilters({
      ...filters,
      [listingType]: {
        ...filters[listingType],
        ...(isRent ? { maxRent: Number(localMax) } : { priceMax: Number(localMax) }),
      },
    });
  };

  const clearFilters = () => {
    setFilters({
      ...filters,
      [listingType]: listingType === 'rent'
        ? {
            city: '',
            locality: '',
            propertyType: '',
            furnishingType: '',
            bhk: '',
            bathrooms: '',
            minRent: 0,
            maxRent: 10000000,
            minSqft: 0,
            maxSqft: 0,
            amenities: '',
            availability: '',
            availableFrom: '',
            ageOfProperty: '',
            possessionStatus: '',
          }
        : {
            city: '',
            locality: '',
            propertyType: '',
            bhk: '',
            minPrice: 0,
            maxPrice: 10000000,
            minSqft: 0,
            maxSqft: 0,
            ageOfProperty: '',
            possessionStatus: '',
          },
    });
  };

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)}Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  const formatRent = (rent: number) => {
    if (rent >= 100000) {
      return `₹${(rent / 100000).toFixed(1)}L`;
    } else {
      return `₹${rent.toLocaleString()}`;
    }
  };

  // Amenity/feature options with icon and label
  const AMENITY_OPTIONS = [
    { key: 'parking', label: 'Car Parking', icon: Car },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'fridge', label: 'Fridge', icon: Refrigerator },
    { key: 'washing', label: 'Washing', icon: WashingMachine },
    { key: 'bed', label: 'Bed', icon: BedDouble },
    { key: 'roommate', label: 'Shared Room', icon: Users },
    { key: 'key', label: 'Private Room', icon: KeyRound },
    { key: 'power', label: 'Power Backup', icon: Plug },
    { key: 'car', label: 'Parking', icon: ParkingCircle },
    { key: 'bike', label: 'Bike Parking', icon: Bike },
    { key: 'house', label: 'Gated Society', icon: Home },
  ];

  let selectedAmenities: string[] = [];
  if (isRentFilters(currentFilters) || isBuyFilters(currentFilters)) {
    if (typeof (currentFilters as any).amenities === 'string' && (currentFilters as any).amenities) {
      selectedAmenities = (currentFilters as any).amenities.split(',').map((a: string) => a.trim()).filter(Boolean);
    }
  }
  const handleAmenityToggle = (key: string) => {
    let newAmenities: string[];
    if (selectedAmenities.includes(key)) {
      newAmenities = selectedAmenities.filter((a: string) => a !== key);
    } else {
      newAmenities = [...selectedAmenities, key];
    }
                  setFilters({
                    ...filters,
                    [listingType]: {
                      ...filters[listingType],
        amenities: newAmenities.join(','),
                    },
                  });
  };

  return (
    <div className="bg-white shadow-sm rounded-lg mb-6 p-4">
      {/* Row 1: City and Locality */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-primary-50 rounded-xl p-4 border border-primary-100">
        <div>
          <label className="block text-xs font-semibold text-primary-700 mb-1">City</label>
          <select className="input w-full" value={currentFilters.city || ''} onChange={e => setFilters({ ...filters, [listingType]: { ...filters[listingType], city: e.target.value, locality: '' } })} disabled={marketsLoading}>
            <option value="">Select City</option>
            {cities.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
              </div>
        <div>
          <label className="block text-xs font-semibold text-primary-700 mb-1">Locality</label>
          <select className="input w-full" value={currentFilters.locality || ''} onChange={e => setFilters({ ...filters, [listingType]: { ...filters[listingType], locality: e.target.value } })} disabled={!currentFilters.city || marketsLoading}>
            <option value="">Select Locality</option>
            {localities.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
              </div>
            </div>
      {/* Row 2: Property Type and BHK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-primary-50 rounded-xl p-4 border border-primary-100">
        <div>
          <label className="block text-xs font-semibold text-primary-700 mb-1 flex items-center gap-1">Property Type <span className="relative group cursor-pointer"><svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><text x="12" y="16" textAnchor="middle" fontSize="12" fill="currentColor">i</text></svg><span className="absolute left-1/2 -translate-x-1/2 mt-1 w-48 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">Property type refers to the kind of home: Apartment, Villa, Independent House, etc.</span></span></label>
          <select className="input w-full" value={currentFilters.propertyType || ''} onChange={e => setFilters({ ...filters, [listingType]: { ...filters[listingType], propertyType: e.target.value } })} disabled={marketsLoading}>
            <option value="">Select Property Type</option>
            {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
            <div>
          <label className="block text-xs font-semibold text-primary-700 mb-1 flex items-center gap-1">BHK <span className="relative group cursor-pointer"><svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><text x="12" y="16" textAnchor="middle" fontSize="12" fill="currentColor">i</text></svg><span className="absolute left-1/2 -translate-x-1/2 mt-1 w-48 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">BHK stands for Bedrooms, Hall, Kitchen. 1BHK = 1 Bedroom, 2BHK = 2 Bedrooms, etc.</span></span></label>
          <select className="input w-full" value={currentFilters.bhk || ''} onChange={e => setFilters({ ...filters, [listingType]: { ...filters[listingType], bhk: e.target.value } })} disabled={marketsLoading}>
            <option value="">Select BHK</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(bhk => <option key={bhk} value={bhk}>{bhk} BHK</option>)}
          </select>
        </div>
      </div>
      {/* Row 3: Rent/Price Range */}
      {listingType === 'rent' && (
        <div className="mb-4">
          <label className="block text-sm font-bold text-primary-700 mb-2">Rent Range (₹/month)</label>
          <div className="bg-white rounded-xl shadow p-6 border border-primary-100 flex flex-col gap-2">
            {/* Inputs Row with labels */}
            <div className="flex flex-row items-end gap-2 w-full mb-4">
              <div className="flex flex-col items-start">
                <span className="text-xs text-primary-500 font-medium mb-1">Min</span>
                <div className="relative w-32">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input
                    type="number"
                    className={`input w-32 text-base font-semibold focus:ring-2 focus:ring-primary-200 transition h-10 pl-7 pr-2 bg-gray-50 border rounded-md text-left ${minRentError ? 'border-red-400' : 'border-primary-100'}`}
                    min={1000}
                    max={30000}
                    maxLength={5}
                    value={localMin}
                    onChange={handleMinInput}
                    placeholder="Min"
                    aria-label="Minimum Rent"
                  />
                  {minRentError && <div className="text-xs text-red-500 mt-1">{minRentError}</div>}
                </div>
              </div>
              <span className="text-gray-400 font-bold mb-1">-</span>
              <div className="flex flex-col items-start">
                <span className="text-xs text-primary-500 font-medium mb-1">Max</span>
                <div className="relative w-32">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input
                    type="number"
                    className={`input w-32 text-base font-semibold focus:ring-2 focus:ring-primary-200 transition h-10 pl-7 pr-2 bg-gray-50 border rounded-md text-left ${maxRentError ? 'border-red-400' : 'border-primary-100'}`}
                    min={Number(localMin) || 1000}
                    max={30000}
                    maxLength={5}
                    value={localMax}
                    onChange={handleMaxInput}
                    placeholder="Max"
                    aria-label="Maximum Rent"
                  />
                  {maxRentError && <div className="text-xs text-red-500 mt-1">{maxRentError}</div>}
                </div>
              </div>
              <span className="text-sm text-primary-700 font-semibold mb-1 ml-2">per month</span>
            </div>
            {/* Slider Row */}
            <div className="flex flex-col justify-center w-full">
              <div className="relative w-full flex items-center" style={{ minHeight: 48 }}>
                {/* Slider */}
                <div className="w-full px-2 flex items-center justify-center">
                  {(() => {
                    return (
                      <Slider
                        range
                        min={PRICE_MIN}
                        max={PRICE_MAX}
                        step={SLIDER_STEP}
                        marks={SLIDER_MARKS}
                        value={[Number(localMin), Number(localMax)]}
                        handleRender={(node: React.ReactElement, handleProps: any) => (
                          <Tooltip
                            prefixCls="rc-slider-tooltip"
                            overlay={`₹${handleProps.value.toLocaleString()}`}
                            visible={handleProps.dragging}
                            placement="top"
                            key={handleProps.index}
                          >
                            {node}
                          </Tooltip>
                        )}
                        onChange={(value: number | number[]) => {
                          if (Array.isArray(value) && value.length === 2) {
                            let [min, max] = value;
                            min = Math.max(PRICE_MIN, Math.min(min, max));
                            max = Math.min(PRICE_MAX, Math.max(max, min));
                            setLocalMin(String(min));
                            setLocalMax(String(max));
                            setFilters({
                              ...filters,
                              [listingType]: {
                                ...filters[listingType],
                                ...(isRent ? { minRent: min, maxRent: max } : { minPrice: min, maxPrice: max }),
                              },
                            });
                          }
                        }}
                        onAfterChange={(value: number | number[]) => {
                          if (Array.isArray(value) && value.length === 2) {
                            const [min, max] = value;
                            setLocalMin(String(min));
                            setLocalMax(String(max));
                            setFilters({ ...filters, [listingType]: { ...filters[listingType], minRent: min, maxRent: max, }, });
                          }
                        }}
                        allowCross={false}
                        trackStyle={[{ backgroundColor: '#C2185B', height: 10 }]}
                        handleStyle={[
                          { borderColor: '#C2185B', backgroundColor: '#fff', borderWidth: 3, width: 28, height: 28, marginTop: -10, boxShadow: '0 2px 8px rgba(194,24,91,0.10)' },
                          { borderColor: '#C2185B', backgroundColor: '#fff', borderWidth: 3, width: 28, height: 28, marginTop: -10, boxShadow: '0 2px 8px rgba(194,24,91,0.10)' }
                        ]}
                        railStyle={{ backgroundColor: '#f3e8ee', height: 10, borderRadius: 5 }}
                      />
                    );
                  })()}
          </div>
        </div>
          </div>
          </div>
        </div>
      )}
      {/* Row 4: Amenities */}
      <div className="overflow-x-auto py-3 px-1 border-b border-gray-100 bg-primary-50 rounded-xl border border-primary-100 mb-2">
        <div className="flex gap-3 min-w-max">
          {AMENITY_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const selected = selectedAmenities.includes(opt.key);
            return (
          <button
                key={opt.key}
                type="button"
                onClick={() => handleAmenityToggle(opt.key)}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-full border transition min-w-[70px] text-xs font-medium focus:outline-none ${selected ? 'bg-primary-600 text-white border-primary-600 shadow' : 'bg-white text-primary-600 border-primary-200 hover:bg-primary-50'}`}
                tabIndex={0}
              >
                <Icon className={`w-5 h-5 mb-1 ${selected ? 'text-white' : 'text-primary-600'}`} />
                <span className="whitespace-nowrap">{opt.label}</span>
          </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PropertyFilters;
