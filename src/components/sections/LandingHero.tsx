import React from 'react';
import CategoryCard from '../ui/CategoryCard';

const LandingHero = () => {
  return (
    <section className="relative w-full py-16 md:py-24 min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 10%, #ffffff 0%, #fdf2f8 20%, #fce7f3 40%, #f9d5e5 60%, #f3c2d7 80%, #ecb8d1 100%)",
        }}
      />
      
      {/* Additional gradient layers for depth */}
      <div
        className="absolute inset-0 z-0 opacity-70"
        style={{
          background: "radial-gradient(ellipse at top, #fce7f3 0%, transparent 50%), radial-gradient(ellipse at bottom, #f3c2d7 0%, transparent 50%)",
        }}
      />

      {/* Decorative Background Blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-300/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-200/10 rounded-full blur-3xl"></div>

      {/* Content */}
      <div className="container relative z-10">
        <div className="text-center mb-12 md:mb-16">
          {/* Decorative Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-lg border border-pink-200">
            <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-semibold text-pink-700">People-First Prop-Tech</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-700 bg-clip-text text-transparent">
            Choose Your Route
          </h1>
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

export default LandingHero;

