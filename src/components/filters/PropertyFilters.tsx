import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface PropertyFiltersProps {
  propertyTypes: string[];
  listingType: 'buy' | 'rent';
}

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
    priceMin: '',
    priceMax: '',
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
  
  // Update active filter type when listingType changes
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <div className="flex space-x-2">
              <input 
                type="number" 
                name="priceMin"
                placeholder="Min"
                value={currentFilters.priceMin || ''}
                onChange={handleFilterChange}
                className="input w-1/2"
              />
              <input 
                type="number" 
                name="priceMax"
                placeholder="Max"
                value={currentFilters.priceMax || ''}
                onChange={handleFilterChange}
                className="input w-1/2"
              />
            </div>
          </div>
          
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

        {/* Render type-specific filters */}
        {listingType === 'rent' ? renderRentFilters() : renderBuyFilters()}
        
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