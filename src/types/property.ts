export interface PropertyAddress {
  buildingName: string;
  locality: string;
  city: string;
}

export interface RoomDetails {
  availableRooms: number;
  availability: string;
  bathroomType: string;
}

export interface RentCosts {
  rent: number;
  maintenance: number;
  securityDeposit: number;
  setupCost: number;
  brokerage: number;
}

export interface AdditionalBills {
  wifi: number;
  water: number;
  gas: number;
  cook: number;
  maid: number;
  others: number;
}

export interface PreferredTenant {
  lookingFor: string;
  preferences: string[];
}

export interface RentDetailsFull {
  roomDetails: RoomDetails;
  costs: RentCosts;
  additionalBills: AdditionalBills;
  preferredTenant: PreferredTenant;
}

export interface SellDetails {
  price: number;
  rent: number;
  maintenance: number;
  brokerage: number;
  securityDeposit: number;
  gst: number;
  isNegotiable: boolean;
  propertyType: string;
  sqft: number;
  direction: string;
  ownership: string;
  ageOfProperty: string;
  totalFloors: string;
  floorNumber: string;
  waterSupply: string;
  approvals: string[];
  amenities: string[];
  highlights: string[];
  description: string;
  propertyId: string;
  loanOnProperty: boolean;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  features: string[];
  listingType: 'buy' | 'rent';
  listedAt: string;
  contactInfo: {
    name: string;
    phone: string;
    email: string;
  };
  address?: PropertyAddress;
  rentDetails?: RentDetailsFull;
  sellDetails?: SellDetails;
}

export interface PropertyAmenities {
  appliances: string[];
  furniture: string[];
  society: string[];
}

export interface ServiceCosts {
  maid: number;
  cook: number;
  other: number;
}

export interface AdditionalBills {
  wifi: number;
  water: number;
  gas: number;
}

export interface RentDetails {
  rent: number;
  maintenance: number;
  securityDeposit: number;
  brokerage: number;
  electricityBill: string;
  brokerageRefundable: boolean;
}