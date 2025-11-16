import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  description: string;
  link: string;
  image: string;
}

const CategoryCard = ({ title, description, link, image }: CategoryCardProps) => {
  return (
    <Link 
      to={link}
      className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full min-h-[440px] md:min-h-[440px]"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-110"
        style={{
          backgroundImage: `url('${image}')`
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 group-hover:from-black/90 group-hover:via-black/60 transition-all duration-300" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full p-6 text-white">
        <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-primary-300 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm md:text-base text-gray-200 mb-4 line-clamp-2">
          {description}
        </p>
        <div className="flex items-center text-white text-sm md:text-base font-semibold group-hover:text-primary-300 transition-colors duration-300">
          <span className="mr-2">Explore</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" />
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;