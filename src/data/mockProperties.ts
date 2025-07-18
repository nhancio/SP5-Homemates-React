export const mockProperties = [
  {
    id: '1',
    address: {
      city: 'Bengaluru',
      locality: 'Whitefield',
      buildingName: 'abc-security',
    },
    amenities: {
      appliances: ['Fridge', 'Washing'],
      furniture: ['Bed'],
      building: ['Car Parking', 'Security', 'Power Backup'],
    },
    propertyType: 'gated',
    furnishingType: 'unfurnished',
    // ...other fields as needed
  },
  {
    id: '2',
    address: {
      city: 'Bengaluru',
      locality: 'Indiranagar',
      buildingName: 'xyz-apartments',
    },
    amenities: {
      appliances: ['Fridge'],
      furniture: ['Bed'],
      building: ['Car Parking', 'Gated Society'],
    },
    propertyType: 'apartment',
    furnishingType: 'furnished',
  },
  {
    id: '3',
    address: {
      city: 'Hyderabad',
      locality: 'Hitech City',
      buildingName: 'tech-homes',
    },
    amenities: {
      appliances: ['Washing'],
      furniture: [],
      building: ['Parking', 'Security'],
    },
    propertyType: 'villa',
    furnishingType: 'semi-furnished',
  },
]; 