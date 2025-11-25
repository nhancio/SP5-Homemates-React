import React from 'react';
import { ArrowRight, Check, TrendingUp, Shield, Users, Home } from 'lucide-react';
import BeforeAfterSlider from '../components/ui/BeforeAfterSlider';

const ForLandlordsPage = () => {
  // Using images from public/images folder
  const beforeImage = '/images/after.jpeg';
  const afterImage = '/images/before.jpeg';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-pink-50 to-rose-50 py-20 md:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Guaranteed Rent in{' '}
              <span className="text-primary-600">30 Days or Less</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Homemates transforms your property into a fully furnished, move-in ready apartment—and rents it out to top-tier tenants in no-time.
            </p>
            <button className="btn btn-primary text-lg px-8 py-4 flex items-center gap-2 mx-auto">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-primary-600 mb-3">120+</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Landlords Trust Us</div>
              <div className="text-gray-600">We've tastefully set up over 120 homes</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-primary-600 mb-3">₹0</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Service/Brokerage Fees</div>
              <div className="text-gray-600">Our landlords have saved more than ₹60L in brokerage fees</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-primary-600 mb-3">₹5Cr+</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Rent Disbursed</div>
              <div className="text-gray-600">We've processed each and every rent payment on time, with zero defaults so far</div>
            </div>
          </div>
        </div>
      </section>

      {/* In The News / Homemates's Magic Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">In The News</h2>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h3 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'serif' }}>
                Homemates's Magic
              </h3>
              <p className="text-lg text-gray-700 mb-8">
                We beef up your home with curated furniture & interior upgrades without making any structural changes.
              </p>
              
              {/* Before/After Slider */}
              <div className="mt-8">
                <BeforeAfterSlider
                  beforeImage={beforeImage}
                  afterImage={afterImage}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* Feature 1 */}
              <div className="bg-gradient-to-br from-primary-50 to-pink-50 rounded-2xl p-8 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-primary-600 rounded-full p-3 text-white">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">100% Rental Guarantee</h3>
                    <p className="text-gray-700">
                      List your home with Homemates - we guarantee you a tenant placement within 30 days. If not, we start paying you the rent from Day 31.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-gradient-to-br from-primary-50 to-pink-50 rounded-2xl p-8 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-primary-600 rounded-full p-3 text-white">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Minimal Management Fee</h3>
                    <p className="text-gray-700">
                      From tenant placement to ongoing property management, we handle everything—at minimal cost.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-gradient-to-br from-primary-50 to-pink-50 rounded-2xl p-8 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-primary-600 rounded-full p-3 text-white">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Top 1% Tenant</h3>
                    <p className="text-gray-700">
                      Your property is only rented to trustworthy professionals and families who appreciate quality living.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="bg-gradient-to-br from-primary-50 to-pink-50 rounded-2xl p-8 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-primary-600 rounded-full p-3 text-white">
                    <Home className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Premium Furnishing</h3>
                    <p className="text-gray-700">
                      We upgrade your property into a designer home that commands premium rent—all with 0 effort from your end.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Join hundreds of landlords who trust Homemates to manage their properties
            </p>
            <button className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4 flex items-center gap-2 mx-auto">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForLandlordsPage;

