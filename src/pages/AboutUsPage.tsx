import React from 'react';
import { Home, Coffee, Hammer, TrendingUp, Award, Users, Brain, Target } from 'lucide-react';

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - LIVE THE Homemates WAY */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-rose-600 text-white py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
              LIVE THE Homemates WAY
            </h1>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20">
                <div className="text-5xl md:text-6xl font-bold mb-3">400+</div>
                <div className="text-lg md:text-xl font-semibold mb-2">Rooms Across 150+ Homes</div>
                <Home className="w-8 h-8 mx-auto mt-4 opacity-80" />
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20">
                <div className="text-5xl md:text-6xl font-bold mb-3">500+</div>
                <div className="text-lg md:text-xl font-semibold mb-2">Bent Nails</div>
                <Hammer className="w-8 h-8 mx-auto mt-4 opacity-80" />
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20">
                <div className="text-5xl md:text-6xl font-bold mb-3">1000+</div>
                <div className="text-lg md:text-xl font-semibold mb-2">Coffee Cups</div>
                <Coffee className="w-8 h-8 mx-auto mt-4 opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <p className="text-xl md:text-2xl text-gray-800 leading-relaxed mb-6">
                You've set high standards for everything in your life—whether it's your career, the people you surround yourself with, or the experiences you chase. So why compromise when it comes to finding a home?
              </p>
              
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                Today's rental options feel like a letdown. Unfurnished homes, hefty deposits, brokers who seem more interested in their commissions than your comfort—everything feels designed to make you settle. And deep down, that goes against everything you stand for.
              </p>
              
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                At Homemates, we believe your home should rise to the same standards you hold for yourself. That's why we've created a simpler, smarter way to rent—one that's designed around you. We're here to remove the barriers, so you can focus on living the life you've worked for—without compromise.
              </p>
              
              <p className="text-xl md:text-2xl text-primary-600 font-semibold leading-relaxed">
                Because expecting more isn't asking too much. It's what you deserve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section - HomeMates Story */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              About Us
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                <strong className="text-primary-600">HomeMates</strong> is an AI driven living platform built to make finding the right home and the right roommate simple, safe and enjoyable. Our journey started with a clear belief that great living begins with great people. Students and young professionals deserve homes where they feel understood, supported and truly comfortable. We set out to build a platform that uses technology, data and psychology to create meaningful matches and smooth housing experiences.
              </p>
              
              <div className="bg-gradient-to-br from-primary-50 to-pink-50 rounded-2xl p-8 md:p-10 my-8 border-l-4 border-primary-600">
                <div className="flex items-start gap-4">
                  <div className="bg-primary-600 rounded-full p-3 text-white flex-shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">T Hub Incubation</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Our story grew stronger when we entered the <strong>T Hub ecosystem</strong> as an incubated startup. The mentorship, exposure and guidance from India's most respected innovation hub helped us shape HomeMates into a scalable and impactful product. Being under T Hub gave us the confidence to think bigger and execute faster.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 md:p-10 my-8 border-l-4 border-amber-500">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-500 rounded-full p-3 text-white flex-shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Global AI Summit Hackathon Winner 2024</h3>
                    <p className="text-gray-700 leading-relaxed">
                      In 2024, our team won <strong className="text-amber-700">first place</strong> at the Global AI Summit hackathon held in Hyderabad. This victory validated our belief that advanced AI can transform how people discover homes and roommates. Our winning solution focused on hyper personalization and intelligent matching, and it inspired many of the core features now built into HomeMates.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <Brain className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                  <h4 className="font-bold text-gray-900 mb-2">AI-Driven</h4>
                  <p className="text-sm text-gray-600">Advanced AI for intelligent matching</p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <Users className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                  <h4 className="font-bold text-gray-900 mb-2">Community-Focused</h4>
                  <p className="text-sm text-gray-600">Building meaningful connections</p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <Target className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                  <h4 className="font-bold text-gray-900 mb-2">Mission-Driven</h4>
                  <p className="text-sm text-gray-600">Help people find where they belong</p>
                </div>
              </div>
              
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                Today, HomeMates continues to innovate at the intersection of community, real estate and artificial intelligence. We aim to make every move in seamless, every roommate compatible and every home search effortless.
              </p>
              
              <div className="bg-primary-600 text-white rounded-2xl p-8 md:p-10 text-center my-8">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Our Mission</h3>
                <p className="text-lg md:text-xl leading-relaxed">
                  Help people find a place where they feel they belong.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;

