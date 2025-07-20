import React, { useState, useEffect } from 'react';
import HeroBanner from '../components/sections/HeroBanner';
import FeaturedProperties from '../components/sections/FeaturedProperties';
import HomeCategories from '../components/sections/HomeCategories';
import HomeServices from '../components/sections/HomeServices';
import Testimonials from '../components/sections/Testimonials';
import MatchingDashboard from '../components/MatchingDashboard';
import { useAppContext } from '../context/AppContext';
import { ChevronDown } from 'lucide-react';

const HomePage: React.FC = () => {
  const { user } = useAppContext();
  const [showContent, setShowContent] = useState(false);

  // Show content if user scrolls down or if they're not at the top
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowContent(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToContent = () => {
    setShowContent(true);
    // Smooth scroll to the content section
    setTimeout(() => {
      const contentSection = document.getElementById('home-content');
      if (contentSection) {
        contentSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <>
      {/* Full-screen HeroBanner */}
      <div className="h-screen flex flex-col relative -mt-16"> {/* Remove top margin to account for fixed navbar */}
        <HeroBanner />
        
        {/* Visually Interesting Scroll button */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20">
          <button
            onClick={handleScrollToContent}
            className="group px-8 py-4 rounded-full bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 shadow-xl flex items-center gap-3 font-semibold text-gray-900 text-base transition-all duration-300 focus:outline-none animate-float border-none"
            style={{
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            }}
          >
            <span className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-wide">What's inside?</span>
              <span className="relative">
                <ChevronDown className="w-7 h-7 text-white drop-shadow-[0_2px_8px_rgba(168,85,247,0.5)] transition-all duration-300 group-hover:scale-125 group-hover:text-pink-100 group-hover:animate-bounce-once group-hover:filter group-hover:brightness-125" />
                {/* Glow effect on hover */}
                <span className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-80 transition-opacity duration-300 blur-sm bg-pink-300/40"></span>
              </span>
            </span>
          </button>
        </div>

        {/* Animations */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .animate-float { animation: float 3s ease-in-out infinite; }
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradientMove {
            background-size: 200% 200%;
            animation: gradientMove 4s ease-in-out infinite;
          }
          @keyframes wiggle {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            20% { transform: translateY(-2px) rotate(-10deg); }
            40% { transform: translateY(2px) rotate(10deg); }
            60% { transform: translateY(-2px) rotate(-8deg); }
            80% { transform: translateY(2px) rotate(8deg); }
          }
          .group-hover\\:animate-wiggle:hover { animation: wiggle 0.7s; }
          @keyframes bounce-once {
            0%, 100% { transform: translateY(0) scale(1); }
            30% { transform: translateY(6px) scale(1.2); }
            60% { transform: translateY(-2px) scale(1.1); }
            80% { transform: translateY(2px) scale(1.15); }
          }
          .group-hover\\:animate-bounce-once:hover { animation: bounce-once 0.7s; }
        `}</style>
      </div>

      {/* Content section */}
      {showContent && (
        <div id="home-content" className="bg-gray-50">
          {/* Show matching dashboard for logged-in users */}
          {user && (
            <div className="container py-8">
              <MatchingDashboard onViewMatches={() => window.location.href = '/find-friends'} />
            </div>
          )}
          <FeaturedProperties
            title="Featured Shared Homes"
            subtitle="Top shared home listings for you"
            viewAllLink="/rent"
            type="rent"
            limit={4}
          />
          <FeaturedProperties
            title="Featured Full Home"
            subtitle="Best full home listings for families and professionals"
            viewAllLink="/buy"
            type="buy"
            limit={4}
          />
          <HomeCategories />
          <HomeServices />
          <Testimonials />
        </div>
      )}
    </>
  );
};

export default HomePage;