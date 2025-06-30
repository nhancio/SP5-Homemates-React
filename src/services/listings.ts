import { collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';

// Collection references
const rentCollection = collection(db, 'r');
const sellCollection = collection(db, 's');

export interface ListingData {
  address: {
    city: string;
    locality: string;
    buildingName: string;
  };
  propertyType: string;
  furnishingType: string;
  parking: string;
  buildingType: string;
  handoverDate: string;
  isImmediate: boolean;
  description: string;
  amenities: {
    appliances: string[];
    furniture: string[];
    building: string[];
  };
  images: string[];
  createdAt: number;
  userId: string;
  createdByUser: string;  // Add this field
  status: 'active' | 'inactive';
  contactNumber: string;
}

export interface RentListing extends ListingData {
  rentDetails: {
    preferredTenant: {
      lookingFor: string;
      preferences: string[];
    };
    roomDetails: {
      availableRooms: number;
      availability: string;  // Changed from roomType
      bathroomType: string;
    };
    costs: {
      rent: number;
      maintenance: number;
      securityDeposit: number;
      setupCost: number;
      brokerage: number;
    };
    additionalBills: {
      wifi: number;
      water: number;
      gas: number;
      cook: number;
      maid: number;
      others: number;
    };
  };
}

export interface SellListing extends ListingData {
  sellDetails: {
    price: number;
    gst: number;
    isNegotiable: boolean;
    propertyType: string;
    sqft: number;
    direction: 'East' | 'West' | 'North' | 'South' | 'North-East' | 'North-West';
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
  };
}

export async function createListing(type: 'rent' | 'sell', data: RentListing | SellListing) {
  try {
    // Validate user is authenticated
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to create a listing');
    }

    // Ensure we're using the correct collection
    const collectionRef = collection(db, type === 'rent' ? 'r' : 's');

    // Clean data before saving
    const cleanData = {
      ...data,
      createdAt: Date.now(),
      status: 'active' as const,
      userId: user.uid, // Ensure userId is set from authenticated user
      createdByUser: user.uid, // Add createdByUser field
      listingType: type // Add this to help with frontend routing
    };

    console.log('Creating listing with data:', cleanData);
    console.log('Collection:', type === 'rent' ? 'r' : 's');

    const docRef = await addDoc(collectionRef, cleanData);

    console.log('Document written with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating listing:', error);
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to create listings');
    }
    throw error;
  }
}

export async function getListings(type: 'rent' | 'sell', filters?: any) {
  try {
    console.log('Getting listings for type:', type, 'with filters:', filters);
    // Use r for rent and s for sell collections
    const collectionRef = collection(db, type === 'rent' ? 'r' : 's');

    // Start with base query
    let baseQuery = query(collectionRef);

    // Add status filter
    baseQuery = query(baseQuery, where('status', '==', 'active'));

    // Add other filters if they exist
    if (filters) {
      if (filters.propertyType) {
        baseQuery = query(baseQuery, where('propertyType', '==', filters.propertyType));
      }

      // Add other filters as needed...
    }

    // Execute query
    const snapshot = await getDocs(baseQuery);
    console.log('Query returned:', snapshot.size, 'documents');


    // Transform and filter results
    const listings = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        contactNumber: data.contactNumber || '',
        // For type safety, ensure rentDetails and sellDetails are present if expected
        rentDetails: data.rentDetails,
        sellDetails: data.sellDetails,
        address: data.address,
        propertyType: data.propertyType
      };
    });


    // Apply all client-side filters
    let filteredListings = listings;

    if (filters) {
      // Price
      if (filters.priceMin || filters.priceMax) {
        filteredListings = filteredListings.filter(listing => {
          const price = type === 'rent'
            ? listing.rentDetails?.costs?.rent
            : listing.sellDetails?.price;
          if (filters.priceMin && price < Number(filters.priceMin)) return false;
          if (filters.priceMax && price > Number(filters.priceMax)) return false;
          return true;
        });
      }

      // Location
      if (filters.location && filters.location.trim() !== '') {
        filteredListings = filteredListings.filter(listing => {
          const loc = listing.address?.locality || listing.address?.city || '';
          return loc.toLowerCase().includes(filters.location.toLowerCase());
        });
      }

      // Property Type
      if (filters.propertyType && filters.propertyType !== '') {
        filteredListings = filteredListings.filter(listing => listing.propertyType === filters.propertyType);
      }

      if (type === 'rent') {
        // Room Type
        if (filters.roomType && filters.roomType !== '') {
          filteredListings = filteredListings.filter(listing => listing.rentDetails?.roomDetails?.roomType === filters.roomType);
        }
        // Tenant Type
        if (filters.tenantType && filters.tenantType !== '') {
          filteredListings = filteredListings.filter(listing => listing.rentDetails?.preferredTenant?.lookingFor === filters.tenantType);
        }
        // Bathroom Type
        if (filters.bathroomType && filters.bathroomType !== '') {
          filteredListings = filteredListings.filter(listing => listing.rentDetails?.roomDetails?.bathroomType === filters.bathroomType);
        }
      } else if (type === 'sell') {
        // Built Up Area
        if (filters.builtUpArea && Number(filters.builtUpArea) > 0) {
          filteredListings = filteredListings.filter(listing => Number(listing.sellDetails?.sqft) >= Number(filters.builtUpArea));
        }
        // Age of Property
        if (filters.ageOfProperty && filters.ageOfProperty !== '') {
          filteredListings = filteredListings.filter(listing => {
            const age = listing.sellDetails?.ageOfProperty;
            if (!age) return false;
            if (filters.ageOfProperty === '0-2') return age === '0-2';
            if (filters.ageOfProperty === '2-5') return age === '2-5';
            if (filters.ageOfProperty === '5-10') return age === '5-10';
            if (filters.ageOfProperty === '10+') return age === '10+';
            return false;
          });
        }
        // Possession Status
        if (filters.possessionStatus && filters.possessionStatus !== '') {
          filteredListings = filteredListings.filter(listing => listing.sellDetails?.possessionStatus === filters.possessionStatus);
        }
      }
    }

    console.log('Returning filtered listings:', filteredListings.length);
    return filteredListings;

  } catch (error) {
    console.error('Error in getListings:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch ${type} listings: ${error.message}`);
    } else {
      throw new Error(`Failed to fetch ${type} listings: Unknown error`);
    }
  }
}

export async function getPropertyById(type: 'rent' | 'sell', id: string) {
  try {
    console.log('Fetching property:', { type, id });
    const collectionName = type === 'rent' ? 'r' : 's';
    const docRef = doc(db, collectionName, id);
    
    // Remove any auth requirements for reading
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log('Document not found in collection:', collectionName);
      throw new Error('Property not found');
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      listingType: type
    };
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
}

export async function getListingsByIds(ids: string[]) {
  try {
    if (!ids.length) return [];

    // Fetch from both collections
    const rentDocs = await getDocs(query(collection(db, 'r'), where('__name__', 'in', ids)));
    const sellDocs = await getDocs(query(collection(db, 's'), where('__name__', 'in', ids)));

    const rentProperties = rentDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      listingType: 'rent'  // Add listing type
    }));

    const sellProperties = sellDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      listingType: 'sell'  // Add listing type as 'sell'
    }));

    // Combine and maintain order
    const allProperties = [...rentProperties, ...sellProperties];
    const orderedProperties = ids
      .map(id => allProperties.find(prop => prop.id === id))
      .filter(Boolean);

    console.log('Retrieved properties:', orderedProperties.length);
    return orderedProperties;

  } catch (error) {
    console.error('Error fetching properties by ids:', error);
    throw error;
  }
}
