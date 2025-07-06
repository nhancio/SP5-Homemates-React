import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useAppContext } from '../../context/AppContext';

interface PropertyFiltersProps {
  propertyTypes: string[];
  listingType: 'buy' | 'rent';
}

const PRICE_MIN = 10000000;
const PRICE_MAX = 100000000;

const defaultFilters = {
  rent: {
    priceMin: '',
    priceMax: '',
    location: '',
    propertyType: '',
    roomType: '',
    tenantType: '',
    bathroomType: ''
  },
  buy: {
    priceMin: PRICE_MIN,
    priceMax: PRICE_MAX,
    location: '',
    propertyType: '',
    builtUpArea: '',
    ageOfProperty: '',
    possessionStatus: ''
  }
};

const PropertyFilters: React.FC<PropertyFiltersProps> = ({ propertyTypes, listingType }) => {
  const { filters, setFilters } = useAppContext();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setFilters({ ...filters, activeType: listingType });
  }, [listingType]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [listingType]: {
        ...filters[listingType],
        [name]: ['priceMin', 'priceMax', 'builtUpArea'].includes(name) ? Number(value) : value,
      },
    });
  };

  const clearFilters = () => {
    setFilters({
      ...filters,
      [listingType]: listingType === 'rent' ? defaultFilters.rent : defaultFilters.buy
    });
  };

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const renderRentFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
        <select 
          name="roomType"
          value={filters.rent.roomType}
          onChange={handleFilterChange}
          className="input"
        >
          <option value="">All Types</option>
          <option value="shared">Shared</option>
          <option value="private">Private</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tenant Type</label>
        <select 
          name="tenantType"
          value={filters.rent.tenantType}
          onChange={handleFilterChange}
          className="input"
        >
          <option value="">Any</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bathroom Type</label>
        <select 
          name="bathroomType"
          value={filters.rent.bathroomType}
          onChange={handleFilterChange}
          className="input"
        >
          <option value="">All Types</option>
          <option value="attached">Attached</option>
          <option value="common">Common</option>
        </select>
      </div>
    </div>
  );

  const renderBuyFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Built Up Area</label>
        <input 
          type="number" 
          name="builtUpArea"
          placeholder="Min sqft" 
          value={filters.buy.builtUpArea}
          onChange={handleFilterChange}
          className="input" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Age of Property</label>
        <select 
          name="ageOfProperty"
          value={filters.buy.ageOfProperty}
          onChange={handleFilterChange}
          className="input"
        >
          <option value="">All</option>
          <option value="0-2">0-2 years</option>
          <option value="2-5">2-5 years</option>
          <option value="5-10">5-10 years</option>
          <option value="10+">10+ years</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Possession Status</label>
        <select 
          name="possessionStatus"
          value={filters.buy.possessionStatus}
          onChange={handleFilterChange}
          className="input"
        >
          <option value="">All</option>
          <option value="ready">Ready to Move</option>
          <option value="under-construction">Under Construction</option>
        </select>
      </div>
    </div>
  );

  const currentFilters = filters[listingType];

  return (
    <div className="bg-white shadow-sm rounded-lg mb-6">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="font-medium">Filters</h3>
        </div>
        <button 
          onClick={toggleFilters} 
          className="text-primary-600 hover:text-primary-700 text-sm font-medium md:hidden"
        >
          {isFilterOpen ? 'Hide' : 'Show'}
        </button>
      </div>

      <div className={`border-t border-gray-100 p-4 ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
        {/* Common Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Price Filter */}
          {listingType === 'rent' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Rent (₹)</label>
              <input
                type="range"
                name="priceMax"
                min={1000}
                max={100000}
                step={500}
                value={currentFilters.priceMax || 100000}
                onChange={handleFilterChange}
                className="w-full accent-primary-600"
              />
              <div className="text-sm text-gray-600 mt-1">
                Up to ₹{Number(currentFilters.priceMax || 100000).toLocaleString()}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (₹)</label>
              <Slider
                range
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={50000}
                value={[
                  currentFilters.priceMin || PRICE_MIN,
                  currentFilters.priceMax || PRICE_MAX
                ]}
                onChange={(values: number[]) => {
                  setFilters({
                    ...filters,
                    [listingType]: {
                      ...filters[listingType],
                      priceMin: values[0],
                      priceMax: values[1],
                    },
                  });
                }}
              />
              <div className="text-sm text-gray-600 mt-1">
                ₹{(currentFilters.priceMin || PRICE_MIN).toLocaleString()} - ₹{(currentFilters.priceMax || PRICE_MAX).toLocaleString()}
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input 
              type="text" 
              name="location"
              placeholder="Enter location"
              value={currentFilters.location}
              onChange={handleFilterChange}
              className="input"
            />
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
            <select 
              name="propertyType"
              value={currentFilters.propertyType}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="">All Types</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Type-specific Filters */}
        {listingType === 'rent' ? renderRentFilters() : renderBuyFilters()}

        {/* Footer Buttons */}
        <div className="flex justify-end mt-4">
          <button 
            onClick={clearFilters}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </button>
          <button className="btn btn-primary">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilters;
