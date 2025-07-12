import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
// Removed: import Slider from 'rc-slider';
// Removed: import 'rc-slider/assets/index.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAppContext } from '../../context/AppContext';

interface PropertyFiltersProps {
  propertyTypes: string[];
  listingType: 'buy' | 'rent';
}

const PRICE_MIN = 10000000;
const PRICE_MAX = 100000000;

const PropertyFilters: React.FC<PropertyFiltersProps> = ({ propertyTypes, listingType }) => {
  const { filters, setFilters } = useAppContext();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [detectedCity, setDetectedCity] = useState('');
  const [detectedState, setDetectedState] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Add local state for price/rent inputs
  const [localMinPrice, setLocalMinPrice] = useState(filters[listingType]?.minPrice === '' ? '' : filters[listingType]?.minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(filters[listingType]?.maxPrice === '' ? '' : filters[listingType]?.maxPrice);
  const [localMinRent, setLocalMinRent] = useState(filters[listingType]?.minRent === '' ? '' : filters[listingType]?.minRent);
  const [localMaxRent, setLocalMaxRent] = useState(filters[listingType]?.maxRent === '' ? '' : filters[listingType]?.maxRent);

  // Sync local state with context filters when filters change externally
  useEffect(() => {
    setLocalMinPrice(filters[listingType]?.minPrice === '' ? '' : filters[listingType]?.minPrice);
    setLocalMaxPrice(filters[listingType]?.maxPrice === '' ? '' : filters[listingType]?.maxPrice);
    setLocalMinRent(filters[listingType]?.minRent === '' ? '' : filters[listingType]?.minRent);
    setLocalMaxRent(filters[listingType]?.maxRent === '' ? '' : filters[listingType]?.maxRent);
  }, [filters[listingType]?.minPrice, filters[listingType]?.maxPrice, filters[listingType]?.minRent, filters[listingType]?.maxRent]);

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

  // Handler to update filters only on Enter or blur
  const handlePriceInput = (name: string, value: string | number) => {
    let newValue: any = value === '' ? '' : Number(value);
    setFilters({
      ...filters,
      [listingType]: {
        ...filters[listingType],
        [name]: newValue,
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
            minPrice: PRICE_MIN,
            maxPrice: PRICE_MAX,
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

  const currentFilters = filters[listingType];

  return (
    <div className="bg-white shadow-sm rounded-lg mb-6">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="font-medium text-lg">Filters</h3>
        </div>
        <button
          onClick={toggleFilters}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium md:hidden"
        >
          {isFilterOpen ? 'Hide' : 'Show'}
        </button>
      </div>

      <div className={`border-t-0 p-6 ${isFilterOpen ? 'block' : 'hidden md:block'}`}> 
        {/* Row 1: Price, Location, Property Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Price Filter */}
          {listingType === 'rent' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Rent (₹/month)</label>
              <input
                type="number"
                name="minRent"
                className="input w-full mb-2"
                placeholder="Enter minimum rent"
                min={0}
                value={localMinRent}
                onChange={e => setLocalMinRent(e.target.value)}
                onBlur={() => handlePriceInput('minRent', localMinRent)}
                onKeyDown={e => { if (e.key === 'Enter') handlePriceInput('minRent', localMinRent); }}
              />
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-2">Max Rent (₹/month)</label>
              <input
                type="number"
                name="maxRent"
                className="input w-full"
                placeholder="Enter maximum rent"
                min={currentFilters.minRent === '' ? 0 : currentFilters.minRent}
                value={localMaxRent}
                onChange={e => setLocalMaxRent(e.target.value)}
                onBlur={() => handlePriceInput('maxRent', localMaxRent)}
                onKeyDown={e => { if (e.key === 'Enter') handlePriceInput('maxRent', localMaxRent); }}
              />
              {currentFilters.minRent > currentFilters.maxRent && (
                <div className="text-red-500 text-xs mt-1">Minimum rent cannot exceed maximum rent.</div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (₹)</label>
              <input
                type="number"
                name="minPrice"
                className="input w-full mb-2"
                placeholder="Enter minimum price"
                min={PRICE_MIN}
                value={localMinPrice}
                onChange={e => setLocalMinPrice(e.target.value)}
                onBlur={() => handlePriceInput('minPrice', localMinPrice)}
                onKeyDown={e => { if (e.key === 'Enter') handlePriceInput('minPrice', localMinPrice); }}
              />
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-2">Max Price (₹)</label>
              <input
                type="number"
                name="maxPrice"
                className="input w-full"
                placeholder="Enter maximum price"
                min={currentFilters.minPrice === '' ? PRICE_MIN : currentFilters.minPrice}
                value={localMaxPrice}
                onChange={e => setLocalMaxPrice(e.target.value)}
                onBlur={() => handlePriceInput('maxPrice', localMaxPrice)}
                onKeyDown={e => { if (e.key === 'Enter') handlePriceInput('maxPrice', localMaxPrice); }}
              />
              {currentFilters.minPrice > currentFilters.maxPrice && (
                <div className="text-red-500 text-xs mt-1">Minimum price cannot exceed maximum price.</div>
              )}
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location (Locality, City or Both)</label>
            <input
              type="text"
              name="location"
              placeholder="Enter locality, city, or both (e.g. Whitefield, Bangalore)"
              value={locationInput}
              onChange={handleLocationChange}
              className="input"
              autoComplete="off"
              onBlur={() => setTimeout(() => setSuggestions([]), 150)}
              onFocus={async () => {
                if (locationInput.length > 2) {
                  setDetecting(true);
                  const results = await fetchSuggestions(locationInput);
                  setSuggestions(results);
                  setDetecting(false);
                }
              }}
              onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
            />
            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <ul className="absolute bg-white border border-gray-200 rounded shadow z-20 mt-1 w-full max-h-48 overflow-auto">
                {suggestions.map((s, i) => (
                  <li
                    key={s.place_id}
                    className="px-4 py-2 cursor-pointer hover:bg-primary-50 text-sm"
                    onMouseDown={() => handleSuggestionClick(s)}
                  >
                    {s.display_name}
                  </li>
                ))}
              </ul>
            )}
            {detecting && (
              <div className="text-xs text-gray-500 mt-1">Detecting city/state...</div>
            )}
            {!detecting && detectedCity && detectedState && (
              <div className="text-xs text-primary-700 mt-1">Detected: {detectedCity}, {detectedState}</div>
            )}
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
            <select
              name="propertyType"
              value={currentFilters.propertyType}
              onChange={handleFilterChange}
              className="input"
              onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
            >
              <option value="">All Types</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-6" />

        {/* Row 2: BHK, Bathrooms, Furnishing, Availability */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">BHK</label>
            <select
              name="bhk"
              value={currentFilters.bhk || ''}
              onChange={handleFilterChange}
              className="input w-full"
              onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
            >
              <option value="">Any</option>
              {[1,2,3,4,5].map((n) => (
                <option key={n} value={n}>{n} BHK</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
            <select
              name="bathrooms"
              value={currentFilters.bathrooms || ''}
              onChange={handleFilterChange}
              className="input w-full"
              onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
            >
              <option value="">Any</option>
              <option value="dedicated">Dedicated</option>
              <option value="shared">Shared</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing Type</label>
            <select
              name="furnishingType"
              value={currentFilters.furnishingType || ''}
              onChange={handleFilterChange}
              className="input w-full"
              onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
            >
              <option value="">All</option>
              <option value="Furnished">Furnished</option>
              <option value="Semi-furnished">Semi-furnished</option>
              <option value="Unfurnished">Unfurnished</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
            <select
              name="availability"
              value={currentFilters.availability || ''}
              onChange={handleFilterChange}
              className="input w-full"
              onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
            >
              <option value="">Any</option>
              <option value="immediate">Immediate</option>
              <option value="date">Select Date</option>
            </select>
            {currentFilters.availability === 'date' && (
              <DatePicker
                selected={currentFilters.availableFrom ? new Date(currentFilters.availableFrom) : null}
                onChange={date => handleFilterChange({
                  target: {
                    name: 'availableFrom',
                    value: date ? date.toISOString().split('T')[0] : ''
                  }
                })}
                minDate={new Date()}
                className="input mt-2 w-full"
                placeholderText="Select date"
                dateFormat="yyyy-MM-dd"
                isClearable
                showPopperArrow={false}
              />
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end mt-4">
          <button
            onClick={clearFilters}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </button>
          {/* Removed Apply Filters button to prevent accidental page reloads */}
        </div>
      </div>
    </div>
  );
};

export default PropertyFilters;
