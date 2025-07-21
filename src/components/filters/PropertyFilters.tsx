import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
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

const PRICE_MIN = 1000; // Allow min price from 1,000
const PRICE_MAX = 100000000; // Allow max price up to 10,00,00,000 (1 Cr)

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
  const [localMin, setLocalMin] = useState<number | undefined>(
    isRentFilters(filters[listingType]) ? filters[listingType].minRent : isBuyFilters(filters[listingType]) ? filters[listingType].minPrice : undefined
  );
  const [localMax, setLocalMax] = useState<number | undefined>(
    isRentFilters(filters[listingType]) ? filters[listingType].maxRent : isBuyFilters(filters[listingType]) ? filters[listingType].maxPrice : undefined
  );

  // Sync local state with context filters when filters change externally
  useEffect(() => {
    setLocalPriceMin(isBuyFilters(filters[listingType]) ? filters[listingType].minPrice : undefined);
    setLocalPriceMax(isBuyFilters(filters[listingType]) ? filters[listingType].maxPrice : undefined);
    setLocalMinRent(isRentFilters(filters[listingType]) ? filters[listingType].minRent : '');
    setLocalMaxRent(isRentFilters(filters[listingType]) ? filters[listingType].maxRent : '');
    setLocalMin(isRentFilters(filters[listingType]) ? filters[listingType].minRent : isBuyFilters(filters[listingType]) ? filters[listingType].minPrice : undefined);
    setLocalMax(isRentFilters(filters[listingType]) ? filters[listingType].maxRent : isBuyFilters(filters[listingType]) ? filters[listingType].maxPrice : undefined);
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

  // Handler for input changes
  const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setLocalMin(undefined);
    } else {
      const num = Number(value);
      if (!isNaN(num)) setLocalMin(num);
    }
  };
  const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setLocalMax(undefined);
    } else {
      const num = Number(value);
      if (!isNaN(num)) setLocalMax(num);
    }
  };

  // Commit filter on blur/enter
  const commitMin = () => {
    console.log('Committing min filter:', listingType === 'rent' ? 'minRent' : 'priceMin', localMin);
    setFilters({
      ...filters,
      [listingType]: {
        ...filters[listingType],
        ...(listingType === 'rent' ? { minRent: localMin } : { priceMin: localMin }),
      },
    });
  };
  const commitMax = () => {
    console.log('Committing max filter:', listingType === 'rent' ? 'maxRent' : 'priceMax', localMax);
    setFilters({
      ...filters,
      [listingType]: {
        ...filters[listingType],
        ...(listingType === 'rent' ? { maxRent: localMax } : { priceMax: localMax }),
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
    <div className="bg-white shadow-sm rounded-lg mb-6 relative">
      {/* City and Locality Filters */}
      <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-gray-100 bg-white">
        {/* City Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
          <select
            className="input w-full md:w-48"
            value={currentFilters.city || ''}
            onChange={e => {
              setFilters({
                ...filters,
                [listingType]: {
                  ...filters[listingType],
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
          <label className="block text-xs font-semibold text-gray-700 mb-1">Locality</label>
          <select
            className="input w-full md:w-64"
            value={currentFilters.locality || ''}
            onChange={e => {
              setFilters({
                ...filters,
                [listingType]: {
                  ...filters[listingType],
                  locality: e.target.value,
                },
              });
            }}
            disabled={!currentFilters.city || marketsLoading}
          >
            <option value="">Select Locality</option>
            {localities.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Property Type and BHK Filters */}
      <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-gray-100 bg-white">
        {/* Property Type Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
            Property Type
            <span className="relative group cursor-pointer">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><text x="12" y="16" textAnchor="middle" fontSize="12" fill="currentColor">i</text></svg>
              <span className="absolute left-1/2 -translate-x-1/2 mt-1 w-48 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                Property type refers to the kind of home: Apartment, Villa, Independent House, etc.
              </span>
            </span>
          </label>
          <select
            className="input w-full md:w-48"
            value={currentFilters.propertyType || ''}
            onChange={e => {
              setFilters({
                ...filters,
                [listingType]: {
                  ...filters[listingType],
                  propertyType: e.target.value,
                },
              });
            }}
            disabled={marketsLoading}
          >
            <option value="">Select Property Type</option>
            {propertyTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        {/* BHK Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
            BHK
            <span className="relative group cursor-pointer">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><text x="12" y="16" textAnchor="middle" fontSize="12" fill="currentColor">i</text></svg>
              <span className="absolute left-1/2 -translate-x-1/2 mt-1 w-48 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                BHK stands for Bedrooms, Hall, Kitchen. 1BHK = 1 Bedroom, 2BHK = 2 Bedrooms, etc.
              </span>
            </span>
          </label>
          <select
            className="input w-full md:w-48"
            value={currentFilters.bhk || ''}
            onChange={e => {
              setFilters({
                ...filters,
                [listingType]: {
                  ...filters[listingType],
                  bhk: e.target.value,
                },
              });
            }}
            disabled={marketsLoading}
          >
            <option value="">Select BHK</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(bhk => (
              <option key={bhk} value={bhk}>{bhk} BHK</option>
            ))}
          </select>
        </div>
      </div>
      {/* Rent/Price Range Filter */}
      {listingType === 'rent' && (
        <div className="flex flex-col md:flex-row gap-4 items-center p-4 border-b border-gray-100 bg-white">
          <div className="flex flex-col gap-1 w-full md:w-1/2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Rent Range (₹/month)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="input w-24 text-xs"
                min={PRICE_MIN}
                max={localMax || PRICE_MAX}
                value={localMin === undefined ? '' : localMin}
                onChange={handleMinInput}
                onBlur={commitMin}
                onKeyDown={e => { if (e.key === 'Enter') commitMin(); }}
                placeholder="Min"
                aria-label="Minimum Rent"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                className="input w-24 text-xs"
                min={localMin || PRICE_MIN}
                max={PRICE_MAX}
                value={localMax === undefined ? '' : localMax}
                onChange={handleMaxInput}
                onBlur={commitMax}
                onKeyDown={e => { if (e.key === 'Enter') commitMax(); }}
                placeholder="Max"
                aria-label="Maximum Rent"
              />
              <span className="ml-2 text-xs text-gray-500">per month</span>
            </div>
            <div className="px-2 mt-2">
              {(() => {
                const sliderValue: [number, number] = [
                  typeof localMin === 'number' ? localMin : PRICE_MIN,
                  typeof localMax === 'number' ? localMax : PRICE_MAX
                ];
                return (
                  <Slider
                    range
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    value={sliderValue}
                    onChange={(value) => {
                      if (Array.isArray(value) && value.length === 2) {
                        const [min, max] = value;
                        setLocalMin(min);
                        setLocalMax(max);
                      }
                    }}
                    onAfterChange={(value) => {
                      if (Array.isArray(value) && value.length === 2) {
                        const [min, max] = value;
                        setLocalMin(min);
                        setLocalMax(max);
                        setFilters({
                          ...filters,
                          [listingType]: {
                            ...filters[listingType],
                            minRent: min,
                            maxRent: max,
                          },
                        });
                      }
                    }}
                    allowCross={false}
                    step={500}
                    trackStyle={[{ backgroundColor: '#C2185B' }]}
                    handleStyle={[{ borderColor: '#C2185B' }, { borderColor: '#C2185B' }]}
                  />
                );
              })()}
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatRent(PRICE_MIN)}</span>
                <span>{formatRent(PRICE_MAX)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Amenity/Feature Select Buttons Row (always visible) */}
      <div className="overflow-x-auto py-3 px-4 border-b border-gray-100 bg-white sticky top-0 z-30">
        <div className="flex gap-3 min-w-max">
          {AMENITY_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const selected = selectedAmenities.includes(opt.key);
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleAmenityToggle(opt.key)}
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
      </div>
      {/* Floating Filters Button */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full border border-primary-200 text-primary-600 font-semibold bg-white shadow-lg hover:bg-primary-50 transition hidden md:flex"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
        aria-label="Open Filters"
      >
        <Filter className="w-6 h-6" />
        Filters
      </button>
      {/* Mobile sticky Filters Button */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="fixed left-4 bottom-4 z-50 flex items-center gap-2 px-5 py-3 rounded-full border border-primary-200 text-primary-600 font-semibold bg-white shadow-lg hover:bg-primary-50 transition md:hidden"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
        aria-label="Open Filters"
      >
        <Filter className="w-6 h-6" />
        Filters
      </button>
      {/* Filter Drawer/Modal */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40 transition-opacity"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close Filters Overlay"
          />
          {/* Drawer Panel */}
          <div
            ref={drawerRef}
            tabIndex={-1}
            className="relative h-full bg-white shadow-2xl rounded-r-2xl w-full max-w-md md:max-w-lg lg:max-w-xl flex flex-col animate-slide-in-left focus:outline-none"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.16)' }}
            role="dialog"
            aria-modal="true"
          >
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-white pt-6 pb-3 px-6 border-b flex items-center justify-between rounded-tr-2xl">
              <h3 className="font-bold text-xl flex items-center gap-2"><Filter className="w-6 h-6" /> Filters</h3>
              <div className="flex gap-2">
                <button onClick={clearFilters} className="text-gray-500 hover:text-primary-600 text-sm font-medium px-3 py-1 rounded transition">Clear All</button>
                <button onClick={() => setDrawerOpen(false)} className="text-gray-500 hover:text-primary-600 p-2 rounded-full transition" aria-label="Close Filters"><X className="w-6 h-6" /></button>
              </div>
            </div>
            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-32 pt-4">
              {/* Place all filter fields here (city, locality, price, amenities, etc.) */}
              {/* You can reuse the main filter JSX here, or extract to a subcomponent for DRYness */}
              {/* City Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                <select
                  className="input w-full md:w-48"
                  value={localDrawerFilters?.city || ''}
                  onChange={e => handleDrawerFilterChange('city', e.target.value)}
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Locality</label>
                <select
                  className="input w-full md:w-64"
                  value={localDrawerFilters?.locality || ''}
                  onChange={e => handleDrawerFilterChange('locality', e.target.value)}
                  disabled={!localDrawerFilters?.city || marketsLoading}
                >
                  <option value="">Select Locality</option>
                  {localities.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              {/* Property Type Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  Property Type
                  <span className="relative group cursor-pointer">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><text x="12" y="16" textAnchor="middle" fontSize="12" fill="currentColor">i</text></svg>
                    <span className="absolute left-1/2 -translate-x-1/2 mt-1 w-48 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                      Property type refers to the kind of home: Apartment, Villa, Independent House, etc.
                    </span>
                  </span>
                </label>
                <select
                  className="input w-full md:w-48"
                  value={localDrawerFilters?.propertyType || ''}
                  onChange={e => handleDrawerFilterChange('propertyType', e.target.value)}
                  disabled={marketsLoading}
                >
                  <option value="">Select Property Type</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              {/* BHK Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  BHK
                  <span className="relative group cursor-pointer">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><text x="12" y="16" textAnchor="middle" fontSize="12" fill="currentColor">i</text></svg>
                    <span className="absolute left-1/2 -translate-x-1/2 mt-1 w-48 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                      BHK stands for Bedrooms, Hall, Kitchen. 1BHK = 1 Bedroom, 2BHK = 2 Bedrooms, etc.
                    </span>
                  </span>
                </label>
                <select
                  className="input w-full md:w-48"
                  value={localDrawerFilters?.bhk || ''}
                  onChange={e => handleDrawerFilterChange('bhk', e.target.value)}
                  disabled={marketsLoading}
                >
                  <option value="">Select BHK</option>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(bhk => (
                    <option key={bhk} value={bhk}>{bhk} BHK</option>
                  ))}
                </select>
              </div>
              {/* Rent/Price Range Filter */}
              {listingType === 'rent' && (
                <div className="flex flex-col md:flex-row gap-4 items-center p-4 border-b border-gray-100 bg-white">
                  <div className="flex flex-col gap-1 w-full md:w-1/2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Rent Range (₹/month)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="input w-24 text-xs"
                        min={PRICE_MIN}
                        max={localDrawerFilters?.maxRent || PRICE_MAX}
                        value={localDrawerFilters?.minRent === undefined ? '' : localDrawerFilters?.minRent}
                        onChange={e => handleDrawerFilterChange('minRent', e.target.value)}
                        onBlur={commitMin}
                        onKeyDown={e => { if (e.key === 'Enter') commitMin(); }}
                        placeholder="Min"
                        aria-label="Minimum Rent"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        className="input w-24 text-xs"
                        min={localDrawerFilters?.minRent || PRICE_MIN}
                        max={PRICE_MAX}
                        value={localDrawerFilters?.maxRent === undefined ? '' : localDrawerFilters?.maxRent}
                        onChange={e => handleDrawerFilterChange('maxRent', e.target.value)}
                        onBlur={commitMax}
                        onKeyDown={e => { if (e.key === 'Enter') commitMax(); }}
                        placeholder="Max"
                        aria-label="Maximum Rent"
                      />
                      <span className="ml-2 text-xs text-gray-500">per month</span>
                    </div>
                    <div className="px-2 mt-2">
                      {(() => {
                        const sliderValue: [number, number] = [
                          typeof localDrawerFilters?.minRent === 'number' ? localDrawerFilters?.minRent : PRICE_MIN,
                          typeof localDrawerFilters?.maxRent === 'number' ? localDrawerFilters?.maxRent : PRICE_MAX
                        ];
                        return (
                          <Slider
                            range
                            min={PRICE_MIN}
                            max={PRICE_MAX}
                            value={sliderValue}
                            onChange={(value) => {
                              if (Array.isArray(value) && value.length === 2) {
                                const [min, max] = value;
                                setLocalMin(min);
                                setLocalMax(max);
                              }
                            }}
                            onAfterChange={(value) => {
                              if (Array.isArray(value) && value.length === 2) {
                                const [min, max] = value;
                                setLocalMin(min);
                                setLocalMax(max);
                                setFilters({
                                  ...filters,
                                  [listingType]: {
                                    ...filters[listingType],
                                    minRent: min,
                                    maxRent: max,
                                  },
                                });
                              }
                            }}
                            allowCross={false}
                            step={500}
                            trackStyle={[{ backgroundColor: '#C2185B' }]}
                            handleStyle={[{ borderColor: '#C2185B' }, { borderColor: '#C2185B' }]}
                          />
                        );
                      })()}
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{formatRent(PRICE_MIN)}</span>
                        <span>{formatRent(PRICE_MAX)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Amenity/Feature Select Buttons Row (always visible) */}
              <div className="overflow-x-auto py-3 px-4 border-b border-gray-100 bg-white sticky top-0 z-30">
                <div className="flex gap-3 min-w-max">
                  {AMENITY_OPTIONS.map(opt => {
                    const Icon = opt.icon;
                    const selected = selectedAmenities.includes(opt.key);
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleAmenityToggle(opt.key)}
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
              </div>
            </div>
            {/* Sticky Footer with Apply Button */}
            <div className="sticky bottom-0 z-20 bg-white border-t pt-3 pb-5 px-6 flex justify-end rounded-br-2xl shadow-lg">
              <button
                onClick={handleApplyDrawerFilters}
                className="btn btn-primary px-8 py-3 rounded-full text-lg font-semibold shadow hover:scale-105 transition"
                aria-label="Apply Filters"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyFilters;
