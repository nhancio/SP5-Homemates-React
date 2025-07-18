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
  const [locationInput, setLocationInput] = useState('');
  const [detectedCity, setDetectedCity] = useState('');
  const [detectedState, setDetectedState] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
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

  // Nominatim autocomplete fetch
  const fetchSuggestions = async (input: string) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&addressdetails=1&limit=5`
    );
    const data = await res.json();
    return data.map((item: any) => ({
      display_name: item.display_name,
      city: item.address.city || item.address.town || item.address.village || '',
      state: item.address.state || '',
      place_id: item.place_id,
    }));
  };

  const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationInput(value);
    setFilters({
      ...filters,
      [listingType]: {
        ...filters[listingType],
        location: value,
        city: '', // clear old city/locality
        locality: '',
      },
    });
    if (value.length > 2) {
      setDetecting(true);
      const results = await fetchSuggestions(value);
      setSuggestions(results);
      setDetecting(false);
    } else {
      setDetectedCity('');
      setDetectedState('');
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setLocationInput(suggestion.display_name);
    setDetectedCity(suggestion.city);
    setDetectedState(suggestion.state);
    setSuggestions([]);
    setFilters({
      ...filters,
      [listingType]: {
        ...filters[listingType],
        location: suggestion.display_name,
        city: suggestion.city,
        locality: '',
      },
    });
  };

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
      {/* Drawer/Modal for detailed filters is disabled */}
    </div>
  );
};

export default PropertyFilters;
