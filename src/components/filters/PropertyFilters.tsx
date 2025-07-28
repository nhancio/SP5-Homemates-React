import React, { useState, useEffect } from 'react';
import { Filter, X, SlidersHorizontal } from 'lucide-react';
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
import { getMarkets, getLocalitiesByCity } from '../../services/markets';

// Add CSS for better mobile touch handling
const sliderStyles = `
  .rent-slider .rc-slider-handle,
  .buy-slider .rc-slider-handle {
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
    pointer-events: auto;
    will-change: transform;
    transform: translateZ(0);
  }
  
  .rent-slider .rc-slider-track,
  .buy-slider .rc-slider-track {
    touch-action: none;
    pointer-events: auto;
  }
  
  .rent-slider .rc-slider-rail,
  .buy-slider .rc-slider-rail {
    touch-action: none;
    pointer-events: auto;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = sliderStyles;
  document.head.appendChild(styleElement);
}

interface PropertyFiltersProps {
  propertyTypes: string[];
  bhkTypes?: string[];
  listingType: 'buy' | 'rent';
  variant?: 'compact' | 'side-panel';
  children?: React.ReactNode;
}

// Separate constants for rent and buy properties
const RENT_MIN = 1000;
const RENT_MAX = 100000;
const BUY_MIN = 1000;
const BUY_MAX = 100000;

const RENT_SLIDER_STEP = 1;
const BUY_SLIDER_STEP = 1;

const RENT_SLIDER_MARKS = {
  1000: '₹1k',
  25000: '₹25k',
  50000: '₹50k',
  75000: '₹75k',
  100000: '₹100k',
};

const BUY_SLIDER_MARKS = {
  1000: '₹1k',
  25000: '₹25k',
  50000: '₹50k',
  75000: '₹75k',
  100000: '₹100k',
};

const PropertyFilters: React.FC<PropertyFiltersProps> = ({ propertyTypes, bhkTypes, listingType, variant = 'compact', children }) => {
  const { filters, setFilters } = useAppContext();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const [markets, setMarkets] = useState<any[]>([]); // Changed type to any[] as Market type is removed
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
  function isBuyFilters(obj: any): obj is { priceMin: number; priceMax: number; amenities?: string } {
    return obj && typeof obj.priceMin === 'number' && typeof obj.priceMax === 'number';
  }

  // Add local state for price/rent inputs
  const [localPriceMin, setLocalPriceMin] = useState<number>(isBuyFilters(filters[listingType]) ? filters[listingType].priceMin : BUY_MIN);
  const [localPriceMax, setLocalPriceMax] = useState<number>(isBuyFilters(filters[listingType]) ? filters[listingType].priceMax : BUY_MAX);
  const [localMinRent, setLocalMinRent] = useState<number>(isRentFilters(filters[listingType]) ? filters[listingType].minRent : RENT_MIN);
  const [localMaxRent, setLocalMaxRent] = useState<number>(isRentFilters(filters[listingType]) ? filters[listingType].maxRent : RENT_MAX);

  // Local state for min/max fields, keyed by listingType
  const isRent = listingType === 'rent';
  const [localMin, setLocalMin] = useState<string>(
    String(isRent ? (filters[listingType]?.minRent ?? RENT_MIN) : (filters[listingType]?.priceMin ?? BUY_MIN))
  );
  const [localMax, setLocalMax] = useState<string>(
    String(isRent ? (filters[listingType]?.maxRent ?? RENT_MAX) : (filters[listingType]?.priceMax ?? BUY_MAX))
  );

  // Sync local state with context filters when filters change externally
  useEffect(() => {
    setLocalPriceMin(isBuyFilters(filters[listingType]) ? filters[listingType].priceMin : BUY_MIN);
    setLocalPriceMax(isBuyFilters(filters[listingType]) ? filters[listingType].priceMax : BUY_MAX);
    setLocalMinRent(isRentFilters(filters[listingType]) ? filters[listingType].minRent : RENT_MIN);
    setLocalMaxRent(isRentFilters(filters[listingType]) ? filters[listingType].maxRent : RENT_MAX);
    setLocalMin(isRent ? String(filters[listingType].minRent) : String(filters[listingType].priceMin));
    setLocalMax(isRent ? String(filters[listingType].maxRent) : String(filters[listingType].priceMax));
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
      'minRent', 'maxRent', 'priceMin', 'priceMax', 'minSqft', 'maxSqft'
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
    console.log('[PropertyFilters] setFilters called:', {
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
  const [minPriceError, setMinPriceError] = useState<string | null>(null);
  const [maxPriceError, setMaxPriceError] = useState<string | null>(null);

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
    if (numVal < (isRent ? RENT_MIN : BUY_MIN)) {
      numVal = isRent ? RENT_MIN : BUY_MIN;
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
        ...(isRent ? { minRent: numVal, maxRent: maxNum } : { priceMin: numVal, priceMax: maxNum }),
      },
    });
    console.log('[PropertyFilters] setFilters called (min/max):', { ...filters, [listingType]: { ...filters[listingType], ...(isRent ? { minRent: numVal, maxRent: maxNum } : { priceMin: numVal, priceMax: maxNum }), }, });
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
    if (numVal > (isRent ? RENT_MAX : BUY_MAX)) {
      numVal = isRent ? RENT_MAX : BUY_MAX;
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
        ...(isRent ? { minRent: minNum, maxRent: numVal } : { priceMin: minNum, priceMax: numVal }),
      },
    });
  };

  // Commit filter on blur/enter
  const commitMin = () => {
    console.log('=== COMMIT MIN DEBUG ===');
    console.log('Committing min filter:', listingType === 'rent' ? 'minRent' : 'priceMin', localMin);
    console.log('Current filters before commit:', filters[listingType]);
    const newFilters = {
      ...filters,
      [listingType]: {
        ...filters[listingType],
        ...(isRent ? { minRent: Number(localMin) } : { priceMin: Number(localMin) }),
      },
    };
    console.log('New filters after commit:', newFilters[listingType]);
    setFilters(newFilters);
    console.log('=== COMMIT MIN DEBUG END ===');
  };
  const commitMax = () => {
    console.log('=== COMMIT MAX DEBUG ===');
    console.log('Committing max filter:', listingType === 'rent' ? 'maxRent' : 'priceMax', localMax);
    console.log('Current filters before commit:', filters[listingType]);
    const newFilters = {
      ...filters,
      [listingType]: {
        ...filters[listingType],
        ...(isRent ? { maxRent: Number(localMax) } : { priceMax: Number(localMax) }),
      },
    };
    console.log('New filters after commit:', newFilters[listingType]);
    setFilters(newFilters);
    console.log('=== COMMIT MAX DEBUG END ===');
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
            minRent: RENT_MIN,
            maxRent: RENT_MAX,
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
            priceMin: BUY_MIN,
            priceMax: BUY_MAX,
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
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
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

  // Compact filter content
  const CompactFilters = () => (
    <div className="bg-white shadow-lg rounded-xl mb-6 p-6 border border-gray-100">
      {/* Row 1: City and Locality - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
          <select className="input w-full bg-gray-50 border-gray-200 focus:border-primary-500 focus:ring-primary-100" value={currentFilters.city || ''} onChange={e => { setFilters({ ...filters, [listingType]: { ...filters[listingType], city: e.target.value, locality: '' } }); console.log('[PropertyFilters] setFilters called (city):', { ...filters, [listingType]: { ...filters[listingType], city: e.target.value, locality: '' } }); }} disabled={marketsLoading}>
            <option value="">Select City</option>
            {cities.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Locality</label>
          <select className="input w-full bg-gray-50 border-gray-200 focus:border-primary-500 focus:ring-primary-100" value={currentFilters.locality || ''} onChange={e => { setFilters({ ...filters, [listingType]: { ...filters[listingType], locality: e.target.value } }); console.log('[PropertyFilters] setFilters called (locality):', { ...filters, [listingType]: { ...filters[listingType], locality: e.target.value } }); }} disabled={!currentFilters.city || marketsLoading}>
            <option value="">Select Locality</option>
            {localities.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>
      </div>
      
      {/* Row 2: Property Type and BHK - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
          <select className="input w-full bg-gray-50 border-gray-200 focus:border-primary-500 focus:ring-primary-100" value={currentFilters.propertyType || ''} onChange={e => { setFilters({ ...filters, [listingType]: { ...filters[listingType], propertyType: e.target.value } }); console.log('[PropertyFilters] setFilters called (propertyType):', { ...filters, [listingType]: { ...filters[listingType], propertyType: e.target.value } }); }} disabled={marketsLoading}>
            <option value="">Select Property Type</option>
            {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">BHK</label>
          <select className="input w-full bg-gray-50 border-gray-200 focus:border-primary-500 focus:ring-primary-100" value={currentFilters.bhk || ''} onChange={e => { setFilters({ ...filters, [listingType]: { ...filters[listingType], bhk: e.target.value } }); console.log('[PropertyFilters] setFilters called (bhk):', { ...filters, [listingType]: { ...filters[listingType], bhk: e.target.value } }); }} disabled={marketsLoading}>
            <option value="">Select BHK</option>
            {bhkTypes
              ? bhkTypes.map((type: string) => <option key={type} value={type}>{type}</option>)
              : Array.from({ length: 10 }, (_, i) => i + 1).map((bhk: number) => <option key={bhk} value={bhk}>{bhk} BHK</option>)}
          </select>
        </div>
      </div>

      {/* Row 3: Price/Rent Range - Compact */}
      {listingType === 'rent' && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Rent Range (₹/month)</label>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1">
                <span className="text-xs text-gray-600 font-medium mb-1 block">Min</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                  <input
                    type="number"
                    className="w-full text-sm py-2 pl-8 pr-3 bg-white border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-100 transition-colors"
                    min={RENT_MIN}
                    max={RENT_MAX}
                    value={localMin}
                    onChange={e => setLocalMin(e.target.value)}
                    onBlur={commitMin}
                    placeholder="1000"
                    onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                  />
                </div>
              </div>
              <span className="text-gray-400 font-medium text-lg">-</span>
              <div className="flex-1">
                <span className="text-xs text-gray-600 font-medium mb-1 block">Max</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                  <input
                    type="number"
                    className="w-full text-sm py-2 pl-8 pr-3 bg-white border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-100 transition-colors"
                    min={RENT_MIN}
                    max={RENT_MAX}
                    value={localMax}
                    onChange={e => setLocalMax(e.target.value)}
                    onBlur={commitMax}
                    placeholder="100000"
                    onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                  />
                </div>
              </div>
            </div>
            <div className="px-2">
              <Slider
                range
                min={RENT_MIN}
                max={RENT_MAX}
                step={RENT_SLIDER_STEP}
                marks={RENT_SLIDER_MARKS}
                value={[Number(localMin) || RENT_MIN, Number(localMax) || RENT_MAX]}
                onChange={(value: number | number[]) => {
                  if (Array.isArray(value) && value.length === 2) {
                    let [min, max] = value;
                    min = Math.max(RENT_MIN, Math.min(min, max));
                    max = Math.min(RENT_MAX, Math.max(max, min));
                    setLocalMin(String(min));
                    setLocalMax(String(max));
                    setFilters({
                      ...filters,
                      [listingType]: {
                        ...filters[listingType],
                        ...(isRent ? { minRent: min, maxRent: max } : { priceMin: min, priceMax: max }),
                      },
                    });
                  }
                }}
                onAfterChange={(value: number | number[]) => {
                  if (Array.isArray(value) && value.length === 2) {
                    const [min, max] = value;
                    setLocalMin(String(min));
                    setLocalMax(String(max));
                    setFilters({ ...filters, [listingType]: { ...filters[listingType], ...(isRent ? { minRent: min, maxRent: max } : { priceMin: min, priceMax: max }), }, });
                  }
                }}
                className="w-full"
                trackStyle={[{ backgroundColor: '#C2185B', height: 8, borderRadius: 4 }]}
                handleStyle={[
                  { 
                    borderColor: '#C2185B', 
                    backgroundColor: '#fff', 
                    borderWidth: 2, 
                    width: 24, 
                    height: 24, 
                    marginTop: -8, 
                    boxShadow: '0 2px 8px rgba(194,24,91,0.15)',
                    borderRadius: '50%'
                  },
                  { 
                    borderColor: '#C2185B', 
                    backgroundColor: '#fff', 
                    borderWidth: 2, 
                    width: 24, 
                    height: 24, 
                    marginTop: -8, 
                    boxShadow: '0 2px 8px rgba(194,24,91,0.15)',
                    borderRadius: '50%'
                  }
                ]}
                railStyle={{ backgroundColor: '#f3e8ee', height: 8, borderRadius: 4 }}
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
              />
            </div>
          </div>
        </div>
      )}

      {listingType === 'buy' && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range (₹)</label>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1">
                <span className="text-xs text-gray-600 font-medium mb-1 block">Min</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                  <input
                    type="number"
                    className="w-full text-sm py-2 pl-8 pr-3 bg-white border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-100 transition-colors"
                    min={BUY_MIN}
                    max={BUY_MAX}
                    value={localMin}
                    onChange={e => setLocalMin(e.target.value)}
                    onBlur={commitMin}
                    placeholder="1000"
                    onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                  />
                </div>
              </div>
              <span className="text-gray-400 font-medium text-lg">-</span>
              <div className="flex-1">
                <span className="text-xs text-gray-600 font-medium mb-1 block">Max</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                  <input
                    type="number"
                    className="w-full text-sm py-2 pl-8 pr-3 bg-white border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-100 transition-colors"
                    min={BUY_MIN}
                    max={BUY_MAX}
                    value={localMax}
                    onChange={e => setLocalMax(e.target.value)}
                    onBlur={commitMax}
                    placeholder="100000"
                    onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                  />
                </div>
              </div>
            </div>
            <div className="px-2">
              <Slider
                range
                min={BUY_MIN}
                max={BUY_MAX}
                step={BUY_SLIDER_STEP}
                marks={BUY_SLIDER_MARKS}
                value={[Number(localMin) || BUY_MIN, Number(localMax) || BUY_MAX]}
                onChange={(value: number | number[]) => {
                  if (Array.isArray(value) && value.length === 2) {
                    let [min, max] = value;
                    min = Math.max(BUY_MIN, Math.min(min, max));
                    max = Math.min(BUY_MAX, Math.max(max, min));
                    setLocalMin(String(min));
                    setLocalMax(String(max));
                    setFilters({
                      ...filters,
                      [listingType]: {
                        ...filters[listingType],
                        ...(isRent ? { minRent: min, maxRent: max } : { priceMin: min, priceMax: max }),
                      },
                    });
                  }
                }}
                onAfterChange={(value: number | number[]) => {
                  if (Array.isArray(value) && value.length === 2) {
                    const [min, max] = value;
                    setLocalMin(String(min));
                    setLocalMax(String(max));
                    setFilters({ ...filters, [listingType]: { ...filters[listingType], ...(isRent ? { minRent: min, maxRent: max } : { priceMin: min, priceMax: max }), }, });
                  }
                }}
                className="w-full"
                trackStyle={[{ backgroundColor: '#C2185B', height: 8, borderRadius: 4 }]}
                handleStyle={[
                  { 
                    borderColor: '#C2185B', 
                    backgroundColor: '#fff', 
                    borderWidth: 2, 
                    width: 24, 
                    height: 24, 
                    marginTop: -8, 
                    boxShadow: '0 2px 8px rgba(194,24,91,0.15)',
                    borderRadius: '50%'
                  },
                  { 
                    borderColor: '#C2185B', 
                    backgroundColor: '#fff', 
                    borderWidth: 2, 
                    width: 24, 
                    height: 24, 
                    marginTop: -8, 
                    boxShadow: '0 2px 8px rgba(194,24,91,0.15)',
                    borderRadius: '50%'
                  }
                ]}
                railStyle={{ backgroundColor: '#f3e8ee', height: 8, borderRadius: 4 }}
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
              />
            </div>
          </div>
        </div>
      )}

      {/* Row 4: Amenities - Compact */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Amenities</label>
        <div className="overflow-x-auto">
          <div className="flex gap-3 min-w-max">
            {AMENITY_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const selected = selectedAmenities.includes(opt.key);
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleAmenityToggle(opt.key)}
                  className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl border transition min-w-[70px] text-xs font-medium focus:outline-none ${selected ? 'bg-primary-600 text-white border-primary-600 shadow-lg' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-primary-300'}`}
                  tabIndex={0}
                >
                  <Icon className={`w-5 h-5 mb-1 ${selected ? 'text-white' : 'text-gray-600'}`} />
                  <span className="whitespace-nowrap text-xs">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // Side panel filter content
  const SidePanelFilters = () => (
    <>
      {/* Side Panel Overlay */}
      {sidePanelOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidePanelOpen(false)}
        />
      )}
      
      {/* Side Panel */}
      <div className={`fixed top-0 right-0 h-[calc(100dvh-4rem)] w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        sidePanelOpen ? 'translate-x-0' : 'translate-x-full'
      } lg:relative lg:translate-x-0 lg:w-72 lg:shadow-xl lg:border-r lg:border-gray-100 lg:h-screen lg:pb-0`}>
        <div className="h-full flex flex-col bg-gradient-to-b from-white to-gray-50">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 bg-white flex-shrink-0">
            <div>
              <h3 className="text-lg lg:text-xl font-bold text-gray-900">Filters</h3>
              <p className="text-xs lg:text-sm text-gray-500 mt-1">Refine your search</p>
            </div>
            <button
              onClick={() => setSidePanelOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Filter Content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6 pb-20 lg:pb-36 min-h-0 overscroll-contain">
            {/* City and Locality */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <label className="block text-sm font-semibold text-gray-800 mb-3">Location</label>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-gray-500 font-medium mb-2 block">City</span>
                    <select 
                      className="w-full px-3 py-2 lg:py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all" 
                      value={currentFilters.city || ''} 
                      onChange={e => { setFilters({ ...filters, [listingType]: { ...filters[listingType], city: e.target.value, locality: '' } }); console.log('[PropertyFilters] setFilters called (city):', { ...filters, [listingType]: { ...filters[listingType], city: e.target.value, locality: '' } }); }} 
                      disabled={marketsLoading}
                    >
                      <option value="">Select City</option>
                      {cities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium mb-2 block">Locality</span>
                    <select 
                      className="w-full px-3 py-2 lg:py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all" 
                      value={currentFilters.locality || ''} 
                      onChange={e => { setFilters({ ...filters, [listingType]: { ...filters[listingType], locality: e.target.value } }); console.log('[PropertyFilters] setFilters called (locality):', { ...filters, [listingType]: { ...filters[listingType], locality: e.target.value } }); }} 
                      disabled={!currentFilters.city || marketsLoading}
                    >
                      <option value="">Select Locality</option>
                      {localities.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Type and BHK */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <label className="block text-sm font-semibold text-gray-800 mb-3">Property Details</label>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-gray-500 font-medium mb-2 block">Property Type</span>
                    <select 
                      className="w-full px-3 py-2 lg:py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all" 
                      value={currentFilters.propertyType || ''} 
                      onChange={e => { setFilters({ ...filters, [listingType]: { ...filters[listingType], propertyType: e.target.value } }); console.log('[PropertyFilters] setFilters called (propertyType):', { ...filters, [listingType]: { ...filters[listingType], propertyType: e.target.value } }); }} 
                      disabled={marketsLoading}
                    >
                      <option value="">Select Property Type</option>
                      {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium mb-2 block">BHK</span>
                    <select 
                      className="w-full px-3 py-2 lg:py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all" 
                      value={currentFilters.bhk || ''} 
                      onChange={e => { setFilters({ ...filters, [listingType]: { ...filters[listingType], bhk: e.target.value } }); console.log('[PropertyFilters] setFilters called (bhk):', { ...filters, [listingType]: { ...filters[listingType], bhk: e.target.value } }); }} 
                      disabled={marketsLoading}
                    >
                      <option value="">Select BHK</option>
                      {bhkTypes
                        ? bhkTypes.map((type: string) => <option key={type} value={type}>{type}</option>)
                        : Array.from({ length: 10 }, (_, i) => i + 1).map((bhk: number) => <option key={bhk} value={bhk}>{bhk} BHK</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Price/Rent Range */}
            {listingType === 'rent' && (
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <label className="block text-sm font-semibold text-gray-800 mb-3">Rent Range (₹/month)</label>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-gray-500 font-medium mb-2 block">Min</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                        <input
                          type="number"
                          className="w-full text-sm py-2 lg:py-2.5 pl-8 pr-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all"
                          min={RENT_MIN}
                          max={RENT_MAX}
                          value={localMin}
                          onChange={e => setLocalMin(e.target.value)}
                          onBlur={commitMin}
                          placeholder="1000"
                          onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-medium mb-2 block">Max</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                        <input
                          type="number"
                          className="w-full text-sm py-2 lg:py-2.5 pl-8 pr-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all"
                          min={RENT_MIN}
                          max={RENT_MAX}
                          value={localMax}
                          onChange={e => setLocalMax(e.target.value)}
                          onBlur={commitMax}
                          placeholder="100000"
                          onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Slider
                      range
                      min={RENT_MIN}
                      max={RENT_MAX}
                      step={RENT_SLIDER_STEP}
                      value={[localMinRent || RENT_MIN, localMaxRent || RENT_MAX]}
                      onChange={(value: number | number[]) => {
                        if (Array.isArray(value) && value.length === 2) {
                          setLocalMinRent(value[0]);
                          setLocalMaxRent(value[1]);
                        }
                      }}
                      onAfterChange={(value: number | number[]) => {
                        if (Array.isArray(value) && value.length === 2) {
                          setFilters({ ...filters, [listingType]: { ...filters[listingType], minRent: value[0], maxRent: value[1] } });
                        }
                      }}
                      marks={RENT_SLIDER_MARKS}
                      className="rent-slider"
                      trackStyle={{ backgroundColor: '#be185d', height: 8, borderRadius: 4 }}
                      handleStyle={[
                        { 
                          borderColor: '#be185d', 
                          backgroundColor: '#ffffff', 
                          borderWidth: 2, 
                          width: 20, 
                          height: 20, 
                          marginTop: -8, 
                          boxShadow: '0 4px 12px rgba(194,24,91,0.25)',
                          borderRadius: '50%'
                        },
                        { 
                          borderColor: '#be185d', 
                          backgroundColor: '#ffffff', 
                          borderWidth: 2, 
                          width: 20, 
                          height: 20, 
                          marginTop: -8, 
                          boxShadow: '0 4px 12px rgba(194,24,91,0.25)',
                          borderRadius: '50%'
                        }
                      ]}
                      railStyle={{ backgroundColor: '#f3e8ee', height: 8, borderRadius: 4 }}
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
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Buy Price Range */}
            {listingType === 'buy' && (
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <label className="block text-sm font-semibold text-gray-800 mb-3">Price Range (₹)</label>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-gray-500 font-medium mb-2 block">Min</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                        <input
                          type="number"
                          className="w-full text-sm py-2 lg:py-2.5 pl-8 pr-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all"
                          min={BUY_MIN}
                          max={BUY_MAX}
                          value={localPriceMin}
                          onChange={e => setLocalPriceMin(Number(e.target.value))}
                          onBlur={() => {
                            if (localPriceMin !== undefined) {
                              setFilters({ ...filters, [listingType]: { ...filters[listingType], priceMin: localPriceMin } });
                            }
                          }}
                          placeholder="1000"
                          onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-medium mb-2 block">Max</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                        <input
                          type="number"
                          className="w-full text-sm py-2 lg:py-2.5 pl-8 pr-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all"
                          min={BUY_MIN}
                          max={BUY_MAX}
                          value={localPriceMax}
                          onChange={e => setLocalPriceMax(Number(e.target.value))}
                          onBlur={() => {
                            if (localPriceMax !== undefined) {
                              setFilters({ ...filters, [listingType]: { ...filters[listingType], priceMax: localPriceMax } });
                            }
                          }}
                          placeholder="100000"
                          onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Slider
                      range
                      min={BUY_MIN}
                      max={BUY_MAX}
                      step={BUY_SLIDER_STEP}
                      value={[localPriceMin || BUY_MIN, localPriceMax || BUY_MAX]}
                      onChange={(value: number | number[]) => {
                        if (Array.isArray(value) && value.length === 2) {
                          setLocalPriceMin(value[0]);
                          setLocalPriceMax(value[1]);
                        }
                      }}
                      onAfterChange={(value: number | number[]) => {
                        if (Array.isArray(value) && value.length === 2) {
                          setFilters({ ...filters, [listingType]: { ...filters[listingType], priceMin: value[0], priceMax: value[1] } });
                        }
                      }}
                      marks={BUY_SLIDER_MARKS}
                      className="buy-slider"
                      trackStyle={{ backgroundColor: '#be185d', height: 8, borderRadius: 4 }}
                      handleStyle={[
                        { 
                          borderColor: '#be185d', 
                          backgroundColor: '#ffffff', 
                          borderWidth: 2, 
                          width: 20, 
                          height: 20, 
                          marginTop: -8, 
                          boxShadow: '0 4px 12px rgba(194,24,91,0.25)',
                          borderRadius: '50%'
                        },
                        { 
                          borderColor: '#be185d', 
                          backgroundColor: '#ffffff', 
                          borderWidth: 2, 
                          width: 20, 
                          height: 20, 
                          marginTop: -8, 
                          boxShadow: '0 4px 12px rgba(194,24,91,0.25)',
                          borderRadius: '50%'
                        }
                      ]}
                      railStyle={{ backgroundColor: '#f3e8ee', height: 8, borderRadius: 4 }}
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
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Amenities */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <label className="block text-sm font-semibold text-gray-800 mb-3">Amenities</label>
              <div className="grid grid-cols-2 gap-2">
                {AMENITY_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const selected = selectedAmenities.includes(opt.key);
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleAmenityToggle(opt.key)}
                      className={`flex items-center gap-1.5 lg:gap-2 p-2 lg:p-2.5 rounded-lg border transition-all duration-200 text-xs lg:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-200 ${
                        selected 
                          ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-200' 
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-primary-300'
                      }`}
                      tabIndex={0}
                    >
                      <Icon className={`w-3 h-3 lg:w-4 lg:h-4 ${selected ? 'text-white' : 'text-gray-600'}`} />
                      <span className="text-xs truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky Footer for Mobile */}
          <div className="lg:hidden bg-white border-t border-gray-200 p-4 z-10">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-3 text-sm font-medium text-white bg-primary-600 border border-primary-600 rounded-lg hover:bg-primary-700 hover:border-primary-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200 shadow-lg"
            >
              Clear All Filters
            </button>
          </div>
  
          {/* Desktop Footer */}
          <div className="hidden lg:block p-4 lg:p-6 border-t border-gray-200 bg-white flex-shrink-0">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // Return based on variant
  if (variant === 'side-panel') {
    return (
      <div className="lg:flex lg:gap-6">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4 sticky top-0 z-30 bg-white pb-4">
          <button
            onClick={() => setSidePanelOpen(true)}
            className="flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-200 w-full"
          >
            <SlidersHorizontal className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="font-semibold text-sm lg:text-base">Filters</span>
            <div className="ml-auto bg-white bg-opacity-20 rounded-full px-2 py-1 text-xs font-medium">
              {Object.values(currentFilters).filter(v => v && v !== '' && v !== 0).length}
            </div>
          </button>
        </div>

        {/* Side Panel */}
        <SidePanelFilters />

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-6">
          {children}
        </div>
      </div>
    );
  }

  // Default compact variant
  return <CompactFilters />;
};

export default PropertyFilters;
