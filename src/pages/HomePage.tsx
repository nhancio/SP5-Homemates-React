import React from 'react';
import HeroBanner from '../components/sections/HeroBanner';
import FeaturedProperties from '../components/sections/FeaturedProperties';
import HomeCategories from '../components/sections/HomeCategories';
import HomeServices from '../components/sections/HomeServices';
import Testimonials from '../components/sections/Testimonials';
import MatchingDashboard from '../components/MatchingDashboard';
import { useAppContext } from '../context/AppContext';

const HomePage: React.FC = () => {
  const { user } = useAppContext();

  return (
    <>
      <HeroBanner />
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
    </>
  );
};

export default HomePage;