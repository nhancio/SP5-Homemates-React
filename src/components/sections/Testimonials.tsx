import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Home Buyer',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 5,
    quote: 'Homemates made finding my dream home so easy. The filters were intuitive, and the property details were comprehensive. I was able to schedule viewings directly through the app!'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Property Owner',
    image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4,
    quote: 'As a landlord, I appreciate how Homemates streamlines the rental process. The platform gave my property great visibility, and I found reliable tenants within a week.'
  },
  {
    id: 3,
    name: 'Jessica Williams',
    role: 'Service User',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 5,
    quote: 'I used Homemates to book cleaning services for my new apartment. The service was prompt, professional, and reasonably priced. Will definitely use again for all my home service needs!'
  }
];

const Testimonials = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from our satisfied customers about their experience with Homemates
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              
              <p className="text-gray-700 italic">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;