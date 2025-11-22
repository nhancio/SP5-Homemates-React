import LandingHero from '../components/sections/LandingHero';
import FeaturedProperties from '../components/sections/FeaturedProperties';

const HomePage = () => {
  return (
    <div className="relative w-full">
      {/* Hero Section with Route Cards */}
      <LandingHero />
      
      {/* Featured Properties */}
      <FeaturedProperties />
    </div>
  );
};

export default HomePage;