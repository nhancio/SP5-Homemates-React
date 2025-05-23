import { Property } from '../types/property';

const mockProperties: Property[] = [
  {
    id: 'prop-1',
    title: 'Luxury Apartment in Downtown',
    description: 'Beautiful luxury apartment in the heart of downtown with amazing city views. Features high-end finishes, modern appliances, and a private balcony.',
    price: 4500000,
    location: 'Koramangala, Bangalore',
    type: 'Flat',
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    images: [
      'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=1600',
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600',
      'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=1600'
    ],
    features: ['Elevator', 'Parking', 'Gym', 'Swimming Pool'],
    listingType: 'buy',
    listedAt: '2023-05-15',
    contactInfo: {
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      email: 'rahul.sharma@example.com'
    }
  },
  {
    id: 'prop-2',
    title: 'Modern Villa with Swimming Pool',
    description: 'Stunning modern villa with a private swimming pool and garden. Perfect for families looking for luxury and comfort.',
    price: 12000000,
    location: 'Whitefield, Bangalore',
    type: 'Villa',
    bedrooms: 4,
    bathrooms: 3,
    area: 3200,
    images: [
      'https://images.pexels.com/photos/32870/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1600',
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600',
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1600'
    ],
    features: ['Swimming Pool', 'Garden', 'Smart Home', 'Security System'],
    listingType: 'buy',
    listedAt: '2023-06-02',
    contactInfo: {
      name: 'Priya Patel',
      phone: '+91 87654 32109',
      email: 'priya.patel@example.com'
    }
  },
  {
    id: 'prop-3',
    title: 'Spacious 3BHK Apartment',
    description: 'Modern 3BHK apartment with premium amenities and great connectivity.',
    price: 7500000,
    location: 'HSR Layout, Bangalore',
    type: 'Flat',
    bedrooms: 3,
    bathrooms: 3,
    area: 1800,
    images: [/* Add image URLs */],
    features: ['Modular Kitchen', 'Power Backup', 'Club House', 'Children\'s Play Area'],
    listingType: 'buy',
    listedAt: '2024-03-10',
    contactInfo: {
      name: 'Amit Kumar',
      phone: '+91 98765 43211',
      email: 'amit.kumar@example.com'
    }
  },
  // Add more properties with Indian locations and contact details...
];

// Add these export functions
export function getMockProperties(): Property[] {
  return mockProperties;
}

export function getPropertyById(id: string): Property | undefined {
  return mockProperties.find(property => property.id === id);
}