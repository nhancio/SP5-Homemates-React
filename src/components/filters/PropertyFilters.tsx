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
        [name]: ['minRent', 'maxRent', 'minPrice', 'maxPrice', 'minSqft', 'maxSqft'].includes(name) ? Number(value) : value,
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
            maxRent: 0,
            preferredTenant: '',
            amenities: [],
          }
        : {
            city: '',
            locality: '',
            propertyType: '',
            furnishingType: '',
            minPrice: 0,
            maxPrice: 0,
            minSqft: 0,
            maxSqft: 0,
            ageOfProperty: '',
            possessionStatus: '',
            amenities: [],
          },
    });
  };

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const renderFullHomeFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">BHK</label>
        <select
          name="bhk"
          value={currentFilters.bhk || ''}
          onChange={handleFilterChange}
          className="input"
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
          className="input"
        >
          <option value="">Any</option>
          {[1,2,3,4,5].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing Type</label>
        <select
          name="furnishingType"
          value={currentFilters.furnishingType || ''}
          onChange={handleFilterChange}
          className="input"
        >
          <option value="">All</option>
          <option value="Furnished">Furnished</option>
          <option value="Semi-furnished">Semi-furnished</option>
          <option value="Unfurnished">Unfurnished</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
        <input
          type="text"
          name="amenities"
          placeholder="Comma separated (e.g. wifi, parking)"
          value={currentFilters.amenities || ''}
          onChange={handleFilterChange}
          className="input"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Area (sqft)</label>
        <input
          type="number"
          name="minSqft"
          placeholder="Min sqft"
          value={currentFilters.minSqft || ''}
          onChange={handleFilterChange}
          className="input mb-2"
        />
        <input
          type="number"
          name="maxSqft"
          placeholder="Max sqft"
          value={currentFilters.maxSqft || ''}
          onChange={handleFilterChange}
          className="input"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
        <select
          name="availability"
          value={currentFilters.availability || ''}
          onChange={handleFilterChange}
          className="input"
        >
          <option value="">Any</option>
          <option value="immediate">Immediate</option>
          <option value="date">Select Date</option>
        </select>
        {currentFilters.availability === 'date' && (
          <input
            type="date"
            name="availableFrom"
            value={currentFilters.availableFrom || ''}
            onChange={handleFilterChange}
            className="input mt-2"
          />
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Age of Property</label>
        <select
          name="ageOfProperty"
          value={currentFilters.ageOfProperty || ''}
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
          value={currentFilters.possessionStatus || ''}
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
                name="maxRent"
                min={1000}
                max={100000}
                step={500}
                value={currentFilters.maxRent || 100000}
                onChange={handleFilterChange}
                className="w-full accent-primary-600"
              />
              <div className="text-sm text-gray-600 mt-1">
                Up to ₹{Number(currentFilters.maxRent || 100000).toLocaleString()}
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
                  currentFilters.minPrice || PRICE_MIN,
                  currentFilters.maxPrice || PRICE_MAX,
                ]}
                onChange={(values: number[]) => {
                  setFilters({
                    ...filters,
                    [listingType]: {
                      ...filters[listingType],
                      minPrice: values[0],
                      maxPrice: values[1],
                    },
                  });
                }}
              />
              <div className="text-sm text-gray-600 mt-1">
                ₹{(currentFilters.minPrice || PRICE_MIN).toLocaleString()} - ₹{(currentFilters.maxPrice || PRICE_MAX).toLocaleString()}
              </div>
            </div>
          )}

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              name="city"
              placeholder="Enter city"
              value={currentFilters.city}
              onChange={handleFilterChange}
              className="input"
            />
          </div>

          {/* Locality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Locality</label>
            <input
              type="text"
              name="locality"
              placeholder="Enter locality"
              value={currentFilters.locality}
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
        {renderFullHomeFilters()}

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
