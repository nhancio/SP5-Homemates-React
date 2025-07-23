import React, { useState, useEffect, useRef } from 'react';
import HeroBanner from '../components/sections/HeroBanner';
import FeaturedProperties from '../components/sections/FeaturedProperties';
import HomeCategories from '../components/sections/HomeCategories';
import HomeServices from '../components/sections/HomeServices';
import Testimonials from '../components/sections/Testimonials';
import MatchingDashboard from '../components/MatchingDashboard';
import { useAppContext } from '../context/AppContext';
import { ChevronDown, User as UserIcon, Briefcase, Loader, Phone, Star, MapPin, Heart } from 'lucide-react';
import { findUserMatches, getCompatibilityInsights, UserProfile, mockUsers } from '../services/matching';
import { 
  calculatePreferenceMatch, 
  calculateLocationMatch, 
  calculateBudgetMatch, 
  calculateLifestyleMatch 
} from '../services/matching';

const HomePage: React.FC = () => {
  const { user } = useAppContext();
  const [showContent, setShowContent] = useState(false);

  // Always scroll to the Smart Matching Algorithm section
  const handleScrollToContent = () => {
    setShowContent(true);
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
            className="group px-8 py-4 rounded-full bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 flex items-center gap-3 font-semibold text-gray-900 text-base transition-all duration-300 focus:outline-none border-none"
          >
            <span className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-wide">What's inside?</span>
              <span className="relative">
                <ChevronDown className="w-7 h-7 text-white transition-all duration-300 group-hover:scale-110 group-hover:text-pink-100 group-hover:filter group-hover:brightness-110" />
              </span>
            </span>
          </button>
        </div>
      </div>
      {/* Always show Smart Matching Algorithm section */}
      {showContent && (
        <div id="home-content" className="bg-gray-50 mt-48">
          {/* --- Smart Matching Algorithm heading and description --- */}
          <div className="container py-16 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-extrabold mb-1 text-primary-700">Smart Matching Algorithm 🎯</h1>
            <p className="text-lg text-gray-600">Find your perfect flatmate using our advanced preference matching system.</p>
          </div>
          {/* --- Other homepage sections --- */}
          {/* Show matching dashboard for logged-in users */}
          {user && (
            <div className="container py-8">
              <MatchingDashboard onViewMatches={() => window.location.href = '/find-friends'} />
            </div>
          )}
          {/*
          <FeaturedProperties
            title="Featured Shared Homes"
            subtitle="Top shared home listings for you"
            viewAllLink="/rent"
            type="rent"
            limit={4}
            minRent={1000}
            maxRent={30000}
          />
          <FeaturedProperties
            title="Featured Full Home"
            subtitle="Best full home listings for families and professionals"
            viewAllLink="/buy"
            type="buy"
            limit={4}
          />
          <HomeServices />
          <Testimonials />
          */}
          <HomeCategories />
        </div>
      )}
    </>
  );
};

export default HomePage;