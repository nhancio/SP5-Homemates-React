import HomeCategories from '../components/sections/HomeCategories';

const HomePage = () => {
  return (
    <div 
      className="relative w-full min-h-full"
      style={{
        background: "radial-gradient(125% 125% at 50% 10%, #ffffff 20%, #fce7f3 40%, #f3e8ff 60%, #e5e7eb 80%, #d1d5db 100%)",
      }}
    >
      {/* Additional gradient layer */}
      <div 
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top, #fce7f3 0%, transparent 50%), radial-gradient(ellipse at bottom, #e5e7eb 0%, transparent 50%)",
        }}
      />
      
      <div className="relative z-10">
        <HomeCategories />
      </div>
    </div>
  );
};

export default HomePage;