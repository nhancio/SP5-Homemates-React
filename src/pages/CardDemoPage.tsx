import React from 'react';
import PropertyCard from '../components/ui/PropertyCard';
import { getMockProperties } from '../data/properties';

const CardDemoPage: React.FC = () => {
  const properties = getMockProperties().slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Property Card Variants Demo</h1>
      
      {/* Small Cards Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Small Cards (Default)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map(property => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              variant="small"
              listingType={property.listingType === 'sell' ? 'buy' : 'rent'}
            />
          ))}
        </div>
      </section>

      {/* Large Cards Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Large Cards (NoBroker Style)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {properties.map(property => (
            <PropertyCard 
              key={`large-${property.id}`} 
              property={property} 
              variant="large"
              listingType={property.listingType === 'sell' ? 'buy' : 'rent'}
            />
          ))}
        </div>
      </section>

      {/* Comparison Section */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Card Variants Comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-primary-600">Small Card Features:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Compact design for list/grid views</li>
              <li>• Smaller image (h-52)</li>
              <li>• Condensed information layout</li>
              <li>• Bottom action buttons (Save, Call, Share)</li>
              <li>• Ideal for browsing multiple properties</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-primary-600">Large Card Features:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Prominent design for featured/detailed views</li>
              <li>• Larger image (h-80)</li>
              <li>• More detailed information with icons</li>
              <li>• Prominent "Contact Owner" button</li>
              <li>• Heart icon in top-right corner</li>
              <li>• Inspired by NoBroker's premium listings</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CardDemoPage; 