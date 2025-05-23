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
  setupCost: number;
  brokerage: number;
  electricityBill: string;
  setupCostRefundable: boolean;
  brokerageRefundable: boolean;
}