import CategoryCard from '../ui/CategoryCard';

const HomeCategories = () => {
  return (
    <section className="relative w-full py-16 md:py-24 bg-gradient-to-b from-white via-pink-50/50 to-white">
      <div className="container relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-700 bg-clip-text text-transparent">
            Choose Your Route
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto font-medium">
            Find your perfect living space or connect with like-minded people
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          <CategoryCard 
            title="Find Roommate"
            description="The Social Route - I have a flat, or I want to find someone to hunt with, but I don't want a weirdo."
            link="/users"
            image="/cards/homemate.jpg"
          />
          <CategoryCard 
            title="Find Shared Flat"
            description="The Vacancy Route - I need a room in an already set-up flat. I don't want to buy furniture."
            link="/rent"
            image="/cards/room.jpg"
          />
          <CategoryCard 
            title="Find Full Flat"
            description="The Independence Route - I want the whole place to myself or my group."
            link="/buy"
            image="/cards/fullflat.webp"
          />
        </div>
      </div>
    </section>
  );
};

export default HomeCategories;