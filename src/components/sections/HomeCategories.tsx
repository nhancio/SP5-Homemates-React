import React from 'react';
import CategoryCard from '../ui/CategoryCard';
import { Home, Building, Key, Castle, Landmark, Hotel, Bed, Sofa } from 'lucide-react';

const HomeCategories = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container">
        {/* Rental Options Section - Temporarily Disabled */}
        {/* <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Rental Options</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find your ideal rental property
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-12">
          <CategoryCard 
            title="Single Room"
            icon={<Bed className="w-6 h-6" />}
            description="Affordable single rooms perfect for students and singles"
            link="/rent?type=single_room"
          />
          <CategoryCard 
            title="2BHK"
            icon={<Sofa className="w-6 h-6" />}
            description="Comfortable 2 bedroom apartments ideal for small families"
            link="/rent?type=2bhk"
          />
          <CategoryCard 
            title="3BHK"
            icon={<Hotel className="w-6 h-6" />}
            description="Spacious 3 bedroom apartments for families and professionals"
            link="/rent?type=3bhk"
          />
          <CategoryCard 
            title="4BHK"
            icon={<Key className="w-6 h-6" />}
            description="Luxury 4 bedroom homes with abundant space and amenities"
            link="/rent?type=4bhk"
          />
        </div> */}

        {/* Properties by Category Section - Temporarily Disabled */}
        {/* <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Find Properties by Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse properties based on your preferences
          </p>
        </div> */}
      </div>
    </section>
  );
};

export default HomeCategories;