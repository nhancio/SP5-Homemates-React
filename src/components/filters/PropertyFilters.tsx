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

  // Focus trap for accessibility
  useEffect(() => {
    if (drawerOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [drawerOpen]);

  // Add local state for price/rent inputs
  // Change local state for price inputs to use priceMin and priceMax
  const [localPriceMin, setLocalPriceMin] = useState<number | undefined>(filters[listingType]?.priceMin);
  const [localPriceMax, setLocalPriceMax] = useState<number | undefined>(filters[listingType]?.priceMax);
  const [localMinRent, setLocalMinRent] = useState(filters[listingType]?.minRent === '' ? '' : filters[listingType]?.minRent);
  const [localMaxRent, setLocalMaxRent] = useState(filters[listingType]?.maxRent === '' ? '' : filters[listingType]?.maxRent);

  // Local state for min/max fields, keyed by listingType
  const [localMin, setLocalMin] = useState<number | undefined>(
    listingType === 'rent' ? filters[listingType]?.minRent : filters[listingType]?.priceMin
  );
  const [localMax, setLocalMax] = useState<number | undefined>(
    listingType === 'rent' ? filters[listingType]?.maxRent : filters[listingType]?.priceMax
  );

  // Sync local state with context filters when filters change externally
  useEffect(() => {
    setLocalPriceMin(filters[listingType]?.priceMin);
    setLocalPriceMax(filters[listingType]?.priceMax);
    setLocalMinRent(filters[listingType]?.minRent === '' ? '' : filters[listingType]?.minRent);
    setLocalMaxRent(filters[listingType]?.maxRent === '' ? '' : filters[listingType]?.maxRent);
    setLocalMin(listingType === 'rent' ? filters[listingType]?.minRent : filters[listingType]?.priceMin);
    setLocalMax(listingType === 'rent' ? filters[listingType]?.maxRent : filters[listingType]?.priceMax);
  }, [filters[listingType]?.priceMin, filters[listingType]?.priceMax, filters[listingType]?.minRent, filters[listingType]?.maxRent, listingType]);

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
            roomType: '',
            bathroomType: '',
            minRent: 0,
            maxRent: 100000,
            preferredTenant: '',
          }
        : {
            city: '',
            locality: '',
            propertyType: '',
            furnishingType: '',
            priceMin: PRICE_MIN,
            priceMax: PRICE_MAX,
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

  const currentFilters = filters[listingType];
  const selectedAmenities = Array.isArray(currentFilters.amenities)
    ? currentFilters.amenities
    : typeof currentFilters.amenities === 'string' && currentFilters.amenities
      ? currentFilters.amenities.split(',').map((a: string) => a.trim()).filter(Boolean)
      : [];
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
        amenities: newAmenities,
      },
    });
  };

  return (
    <div className="bg-white shadow-sm rounded-lg mb-6 relative">
      {/* Filters Button above amenity chips */}
      {/*
      <div className="w-full flex justify-center md:justify-start p-4 border-b border-gray-100 bg-white">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-full border border-primary-200 text-primary-600 font-semibold bg-white shadow hover:bg-primary-50 transition"
          aria-label="Open Filters"
        >
          <Filter className="w-6 h-6" />
          Filters
        </button>
      </div>
      */}
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
