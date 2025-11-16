import CategoryCard from '../ui/CategoryCard';

const HomeCategories = () => {
  return (
    <section className="relative w-full">
      <div className="container relative z-10 pt-6 pb-16 sm:pb-12 md:pb-10 lg:pb-0">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Explore Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-2">
            Find your perfect living space or connect with like-minded people
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <CategoryCard 
            title="Room in a Flat"
            description="Find affordable rooms in shared flats perfect for students and professionals"
            link="/rent"
            image="/cards/room.jpg"
          />
          <CategoryCard 
            title="Full Flat"
            description="Browse complete apartments and flats for rent or purchase"
            link="/buy"
            image="/cards/fullflat.webp"
          />
          <CategoryCard 
            title="Find Homemate"
            description="Connect with compatible flatmates using our smart matching system"
            link="/users"
            image="/cards/homemate.jpg"
          />
          <CategoryCard 
            title="Home Services"
            description="Discover professional home services for all your needs"
            link="/services"
            image="/cards/services.avif"
          />
        </div>
      </div>
    </section>
  );
};

export default HomeCategories;