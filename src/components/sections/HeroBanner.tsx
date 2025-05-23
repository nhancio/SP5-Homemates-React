import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Users, Key, X, Wrench } from 'lucide-react'; // Add Wrench to imports
import { useAppContext } from '../../context/AppContext';

const HeroBanner = () => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const { setFilters } = useAppContext();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showPopup) {
      timer = setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showPopup]);

  const handleComingSoonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPopup(true);
  };

  const handlePropertyTypeClick = (type: string, listingType: 'rent' | 'buy') => {
    setFilters(prev => ({
      ...prev,
      [listingType]: {
        ...prev[listingType],
        propertyType: type
      }
    }));
    navigate(`/${listingType}`);
  };

  return (
    <section className="h-full relative flex items-center justify-center overflow-hidden"> {/* Removed min-height and padding */}
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
              <span className="text-base sm:text-lg">Rent</span>
            </Link>
            <Link 
              to="/buy"
              className="flex items-center justify-center bg-[#FFA5B8] text-white hover:bg-opacity-90 p-2 rounded-xl font-bold transition shadow hover:shadow-lg h-14 sm:h-20"
            >
              <span className="text-base sm:text-lg">Buy</span>
            </Link>
            <button 
              onClick={handleComingSoonClick}
              className="flex items-center justify-center bg-[#D84C89] text-white hover:bg-opacity-90 p-2 rounded-xl font-bold transition shadow hover:shadow-lg h-14 sm:h-20"
            >
              <span className="text-base sm:text-lg">Find Friends</span>
            </button>
            <button
              onClick={handleComingSoonClick}
              className="flex items-center justify-center bg-[#DBA6CF] text-white hover:bg-opacity-90 p-2 rounded-xl font-bold transition shadow hover:shadow-lg h-14 sm:h-20"
            >
              <span className="text-base sm:text-lg">Services</span>
            </button>
          </div>
        </div>
      </div>

      {/* Coming Soon Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm mx-4 relative">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold mb-2">Coming Soon!</h3>
            <p className="text-gray-600">
              We're brewing some cool features for you! Stay tuned for updates.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroBanner;