import { Service } from '../types/service';

const mockServices: Service[] = [
  {
    id: 'serv-1',
    name: 'Deep House Cleaning',
    description: 'Complete cleaning service including bathrooms, kitchen, living spaces, and bedrooms. Our professionals use eco-friendly products.',
    price: 80,
    duration: '4-5 hours',
    type: 'Cleaning',
    image: 'https://images.pexels.com/photos/4107112/pexels-photo-4107112.jpeg?auto=compress&cs=tinysrgb&w=1600',
    nextAvailable: 'Tomorrow',
    rating: 4.8,
    reviews: 125
  },
  {
    id: 'serv-2',
    name: 'Weekly Meal Preparation',
    description: 'Professional chef will prepare weekly meals according to your dietary requirements and preferences.',
    price: 120,
    duration: '3-4 hours',
    type: 'Cooking',
    image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1600',
    nextAvailable: 'In 2 days',
    rating: 4.9,
    reviews: 87
  },
  {
    id: 'serv-3',
    name: 'Bathroom Deep Cleaning',
    description: 'Specialized deep cleaning for bathrooms, including tile grout, shower doors, and sanitizing all surfaces.',
    price: 60,
    duration: '2-3 hours',
    type: 'Cleaning',
    image: 'https://images.pexels.com/photos/4107098/pexels-photo-4107098.jpeg?auto=compress&cs=tinysrgb&w=1600',
    nextAvailable: 'Today',
    rating: 4.7,
    reviews: 93
  },
  {
    id: 'serv-4',
    name: 'Kitchen Appliance Repair',
    description: 'Professional repair service for all major kitchen appliances including refrigerators, ovens, and dishwashers.',
    price: 90,
    duration: '1-3 hours',
    type: 'Repair',
    image: 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=1600',
    nextAvailable: 'In 3 days',
    rating: 4.6,
    reviews: 78
  },
  {
    id: 'serv-5',
    name: 'Interior House Painting',
    description: 'Professional painting service for interior walls with color consultation and premium quality paints.',
    price: 75,
    duration: 'Varies by size',
    type: 'Painting',
    image: 'https://images.pexels.com/photos/8092472/pexels-photo-8092472.jpeg?auto=compress&cs=tinysrgb&w=1600',
    nextAvailable: 'Next week',
    rating: 4.8,
    reviews: 105
  },
  {
    id: 'serv-6',
    name: 'Dinner Party Chef',
    description: 'Private chef service for dinner parties and special occasions. Customized menu according to your preferences.',
    price: 150,
    duration: '4-6 hours',
    type: 'Cooking',
    image: 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=1600',
    nextAvailable: 'Weekends',
    rating: 4.9,
    reviews: 62
  },
  {
    id: 'serv-7',
    name: 'Window Cleaning',
    description: 'Professional window cleaning service for both interior and exterior windows, including screens and frames.',
    price: 65,
    duration: '2-4 hours',
    type: 'Cleaning',
    image: 'https://images.pexels.com/photos/7216999/pexels-photo-7216999.jpeg?auto=compress&cs=tinysrgb&w=1600',
    nextAvailable: 'Tomorrow',
    rating: 4.7,
    reviews: 89
  },
  {
    id: 'serv-8',
    name: 'Plumbing Services',
    description: 'Professional plumbing repairs and installations for bathrooms, kitchens, and all water systems in your home.',
    price: 95,
    duration: '1-4 hours',
    type: 'Repair',
    image: 'https://images.pexels.com/photos/4116978/pexels-photo-4116978.jpeg?auto=compress&cs=tinysrgb&w=1600',
    nextAvailable: 'In 2 days',
    rating: 4.6,
    reviews: 71
  },
  {
    id: 'serv-9',
    name: 'Exterior House Painting',
    description: 'Complete exterior painting service including surface preparation, priming, and premium quality paint application.',
    price: 85,
    duration: 'Varies by size',
    type: 'Painting',
    image: 'https://images.pexels.com/photos/5691702/pexels-photo-5691702.jpeg?auto=compress&cs=tinysrgb&w=1600',
    nextAvailable: 'Next week',
    rating: 4.8,
    reviews: 97
  }
];

export function getMockServices(): Service[] {
  return mockServices;
}

export function getServiceById(id: string): Service | undefined {
  return mockServices.find(service => service.id === id);
}