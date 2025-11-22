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
      
      {/* Gradient Overlay - Pink Theme */}
      <div className="absolute inset-0 bg-gradient-to-t from-pink-900/90 via-pink-800/60 to-pink-700/30 group-hover:from-pink-950/95 group-hover:via-pink-900/70 transition-all duration-300" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full p-6 text-white">
        <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-pink-200 transition-colors duration-300 drop-shadow-lg">
          {title}
        </h3>
        <p className="text-sm md:text-base text-pink-50 mb-4 line-clamp-2 drop-shadow-md">
          {description}
        </p>
        <div className="flex items-center text-white text-sm md:text-base font-semibold group-hover:text-pink-200 transition-colors duration-300 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full w-fit">
          <span className="mr-2">Explore</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" />
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;