import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Users, Key, Wrench } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import type { Filters } from '../../context/AppContext';

const HeroBanner = () => {
  const navigate = useNavigate();
  const { setFilters } = useAppContext();

  const handleServicesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/services');
  };

  const handleFindFriendsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/users');
  };

  const handlePropertyTypeClick = (type: string, listingType: 'rent' | 'buy') => {
    setFilters((prev: Filters) => ({
      ...prev,
      [listingType]: {
        ...prev[listingType],
        propertyType: type
      }
    }));
    navigate(`/${listingType}`);
  };

  return (
    <>
      <section className="relative flex flex-col justify-center items-center overflow-hidden h-[calc(100vh-64px-64px)]"> {/* Fit between navbar and footer, no negative margin */}
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat before:absolute before:inset-0 before:bg-black before:opacity-40"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1600')"
          }}
        />

        {/* Content Overlay */}
        <div className="container relative z-10">
          <div className="text-center max-w-3xl mx-auto text-white">
            <h1 className="text-lg md:text-3xl font-bold mb-2 md:mb-4"> {/* Reduced text size and margins */}
              Find Your Perfect Home with Homemates
            </h1>
            <p className="text-base md:text-lg mb-4 md:mb-8"> {/* Reduced text size and margins */}
              Your dream property is just a click away
            </p>
            
            <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto px-2">
              <Link 
                to="/rent" 
                className="flex items-center justify-center bg-[#FF4E8E] text-white hover:bg-opacity-90 p-2 rounded-xl font-bold transition shadow hover:shadow-lg h-14 sm:h-20"
              >
                <span className="text-base sm:text-lg">Shared Home</span>
              </Link>
              <Link 
                to="/buy"
                className="flex items-center justify-center bg-[#FFA5B8] text-white hover:bg-opacity-90 p-2 rounded-xl font-bold transition shadow hover:shadow-lg h-14 sm:h-20"
              >
                <span className="text-base sm:text-lg">Full Home</span>
              </Link>
              <button 
                onClick={handleFindFriendsClick}
                className="flex items-center justify-center bg-[#D84C89] text-white hover:bg-opacity-90 p-2 rounded-xl font-bold transition shadow hover:shadow-lg h-14 sm:h-20"
              >
                <span className="text-base sm:text-lg">Find Friends</span>
              </button>
              <button
                onClick={handleServicesClick}
                className="flex items-center justify-center bg-[#DBA6CF] text-white hover:bg-opacity-90 p-2 rounded-xl font-bold transition shadow hover:shadow-lg h-14 sm:h-20"
              >
                <span className="text-base sm:text-lg">Services</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroBanner;