import React from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from '../ui/PropertyCard';
import { ArrowRight } from 'lucide-react';
import { getMockProperties } from '../../data/properties';

interface FeaturedPropertiesProps {
  title: string;
  subtitle: string;
  viewAllLink: string;
  type: 'buy' | 'rent';
  limit?: number;
  minRent?: number;
  maxRent?: number;
}

const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({ 
  title, 
  subtitle, 
  viewAllLink,
  type,
  limit = 6,
  minRent,
  maxRent
}) => {
  // Get properties filtered by type and limited to the specified number
  const properties = getMockProperties()
    .filter(property => property.listingType === type)
    .slice(0, limit);
  
  return (
    <section className="py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
            {typeof minRent === 'number' && typeof maxRent === 'number' && (
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-sm font-semibold border border-rose-200">
                Rent Range: ₹{minRent.toLocaleString()} - ₹{maxRent.toLocaleString()}
              </span>
            )}
          </div>
          <Link to={viewAllLink} className="flex items-center text-primary-600 hover:text-primary-700 mt-2 md:mt-0">
            <span className="font-medium">View all</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {properties.map(property => (
            <PropertyCard key={property.id} property={property} variant="large" />
          ))}
        </div>
        
        {properties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No properties available at the moment. Check back later!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;