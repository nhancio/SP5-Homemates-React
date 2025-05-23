import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  link: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, icon, description, link }) => {
  return (
    <Link 
      to={link}
      className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
    >
      <div className="p-2 rounded-full bg-primary-50 text-primary-600 w-fit mb-3 group-hover:bg-primary-100 transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-base font-semibold mb-1 group-hover:text-primary-600 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-gray-600 text-xs mb-3 flex-grow">{description}</p>
      <div className="flex items-center text-primary-600 text-sm font-medium">
        <span className="mr-1">Explore</span>
        <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform duration-300" />
      </div>
    </Link>
  );
};

export default CategoryCard;