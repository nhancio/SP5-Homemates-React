// Coming soon

// import { collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
// import { db } from '../config/firebase';
// import { getAuth } from 'firebase/auth';

// Collection references
// const rentCollection = collection(db, 'r');
// const sellCollection = collection(db, 's');

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
    // const auth = getAuth();
    // const user = auth.currentUser;
    // if (!user) {
    //   throw new Error('User must be authenticated to create a listing');
    // }

    // Ensure we're using the correct collection
    // const collectionRef = collection(db, type === 'rent' ? 'r' : 's');

    // Clean data before saving
    // const cleanData = {
    //   ...data,
    //   createdAt: Date.now(),
    //   status: 'active' as const,
    //   userId: user.uid, // Ensure userId is set from authenticated user
    //   createdByUser: user.uid, // Add createdByUser field
    //   listingType: type // Add this to help with frontend routing
    // };

    // console.log('Creating listing with data:', cleanData);
    // console.log('Collection:', type === 'rent' ? 'r' : 's');

    // const docRef = await addDoc(collectionRef, cleanData);

    // console.log('Document written with ID:', docRef.id);
    return { success: true, id: 'mock_id' }; // Mock response
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
    console.log('Fetching listings...');
    console.log('Getting listings for type:', type, 'with filters:', filters);
    // Use r for rent and s for sell collections
    // const collectionRef = collection(db, type === 'rent' ? 'r' : 's');

    // Start with base query
    // let baseQuery = query(collectionRef);

    // Add status filter
    // baseQuery = query(baseQuery, where('status', '==', 'active'));

    // Add other filters if they exist
    // if (filters) {
    //   if (filters.propertyType) {
    //     baseQuery = query(baseQuery, where('propertyType', '==', filters.propertyType));
    //   }

    //   // Add other filters as needed...
    // }

    // Execute query
    // const snapshot = await getDocs(baseQuery);
    // console.log('Query returned:', snapshot.size, 'documents');


    // Transform and filter results
    const listings: any[] = []; // Mock data
    // const listings = snapshot.docs.map(doc => {
    //   const data = doc.data();
    //   return {
    //     id: doc.id,
    //     ...data,
    //     contactNumber: data.contactNumber || '',
    //     // For type safety, ensure rentDetails and sellDetails are present if expected
    //     rentDetails: data.rentDetails,
    //     sellDetails: data.sellDetails,
    //     address: data.address,
    //     propertyType: data.propertyType
    //   };
    // });


    // Apply all client-side filters
    let filteredListings = listings;

    if (filters) {
      // Price (for buy)
      if (type === 'sell' && (filters.priceMin || filters.priceMax)) {
        console.log('Filtering by priceMin:', filters.priceMin, 'priceMax:', filters.priceMax);
        filteredListings = filteredListings.filter(listing => {
          const price = listing.sellDetails?.price;
          if (price === undefined) return false;
          console.log('Listing price:', price, 'Filter min:', filters.priceMin, 'Filter max:', filters.priceMax);
          if (filters.priceMin && price < Number(filters.priceMin)) return false;
          if (filters.priceMax && price > Number(filters.priceMax)) return false;
          return true;
        });
      }
      // Rent (for rent)
      if (type === 'rent' && (filters.minRent || filters.maxRent)) {
        console.log('Filtering by minRent:', filters.minRent, 'maxRent:', filters.maxRent);
        filteredListings = filteredListings.filter(listing => {
          const rent = listing.rentDetails?.costs?.rent;
          if (rent === undefined) return false;
          console.log('Listing rent:', rent, 'Filter min:', filters.minRent, 'Filter max:', filters.maxRent);
          if (filters.minRent && rent < Number(filters.minRent)) return false;
          if (filters.maxRent && rent > Number(filters.maxRent)) return false;
          return true;
        });
      }

      // City filter
      if (filters.city && filters.city.trim() !== '') {
        filteredListings = filteredListings.filter(listing =>
          listing.address?.city?.toLowerCase().includes(filters.city.toLowerCase())
        );
      }

      // Locality filter
      if (filters.locality && filters.locality.trim() !== '') {
        filteredListings = filteredListings.filter(listing =>
          listing.address?.locality?.toLowerCase().includes(filters.locality.toLowerCase())
        );
      }

      // BHK filter
      if (filters.bhk && filters.bhk !== '') {
        filteredListings = filteredListings.filter(listing =>
          String(listing.propertyType).toLowerCase().includes(String(filters.bhk).toLowerCase())
        );
      }

      // Bathrooms filter
      if (filters.bathrooms && filters.bathrooms !== '') {
        filteredListings = filteredListings.filter(listing => {
          const bathrooms =
            listing.rentDetails?.roomDetails?.bathrooms ??
            listing.sellDetails?.bathrooms ??
            '';
          if (!bathrooms && (filters.bathrooms === 'Any' || filters.bathrooms === '')) return true;
          // Allow partial and case-insensitive match
          return String(bathrooms).toLowerCase().includes(String(filters.bathrooms).toLowerCase());
        });
      }

      // Furnishing Type filter
      if (filters.furnishingType && filters.furnishingType !== '') {
        filteredListings = filteredListings.filter(listing => {
          const furnishingType =
            listing.rentDetails?.furnishingType ??
            listing.sellDetails?.furnishingType ??
            '';
          if (!furnishingType && (filters.furnishingType === 'All' || filters.furnishingType === '')) return true;
          // Allow partial and case-insensitive match
          return (furnishingType || '').toLowerCase().includes(filters.furnishingType.toLowerCase());
        });
      }

      // Area (sqft) filter
      if (filters.minSqft) {
        filteredListings = filteredListings.filter(listing => {
          const area = listing.sellDetails?.sqft
            || listing.rentDetails?.roomDetails?.area
            || 0;
          // If area is missing, treat as match
          if (!area) return true;
          return area >= Number(filters.minSqft);
        });
      }
      if (filters.maxSqft) {
        filteredListings = filteredListings.filter(listing => {
          const area = listing.sellDetails?.sqft
            || listing.rentDetails?.roomDetails?.area
            || 0;
          // If area is missing, treat as match
          if (!area) return true;
          return area <= Number(filters.maxSqft);
        });
      }

      // Availability filter
      if (filters.availability && filters.availability !== '') {
        filteredListings = filteredListings.filter(listing => {
          const avail = (listing.rentDetails?.roomDetails?.availability || '').toLowerCase();
          if (!avail && (filters.availability === 'Any' || filters.availability === '')) return true;
          return avail.includes(filters.availability.toLowerCase());
        });
      }

      // Age of Property filter
      if (filters.ageOfProperty && filters.ageOfProperty !== '') {
        filteredListings = filteredListings.filter(listing => {
          const age = listing.sellDetails?.ageOfProperty
            || listing.rentDetails?.ageOfProperty;
          if (!age && (filters.ageOfProperty === 'All' || filters.ageOfProperty === '')) return true;
          return (age || '').toLowerCase().includes(filters.ageOfProperty.toLowerCase());
        });
      }

      // Possession Status filter
      if (filters.possessionStatus && filters.possessionStatus !== '') {
        filteredListings = filteredListings.filter(listing => {
          const status = listing.sellDetails?.possessionStatus
            || listing.rentDetails?.possessionStatus;
          if (!status && (filters.possessionStatus === 'All' || filters.possessionStatus === '')) return true;
          return (status || '').toLowerCase().includes(filters.possessionStatus.toLowerCase());
        });
      }

      // Property Type filter
      if (filters.propertyType && filters.propertyType !== '') {
        filteredListings = filteredListings.filter(listing =>
          (listing.propertyType || '').toLowerCase().includes(filters.propertyType.toLowerCase())
        );
      }

      // Amenities filter
      if (filters.amenities && filters.amenities.trim() !== '') {
        const selectedAmenities = filters.amenities.split(',').map((a: string) => a.trim()).filter(Boolean);
        if (selectedAmenities.length > 0) {
          filteredListings = filteredListings.filter(listing => {
            if (type === 'rent') {
              const rentListing = listing as unknown as import('./listings').RentListing;
              const allAmenities = [
                ...(rentListing.amenities?.appliances || []),
                ...(rentListing.amenities?.furniture || []),
                ...(rentListing.amenities?.building || [])
              ].map((a: string) => a.toLowerCase());
              return selectedAmenities.every((a: string) => allAmenities.includes(a.toLowerCase()));
            } else if (type === 'sell') {
              const sellListing = listing as unknown as import('./listings').SellListing;
              const allAmenities = (sellListing.sellDetails?.amenities || []).map((a: string) => a.toLowerCase());
              return selectedAmenities.every((a: string) => allAmenities.includes(a.toLowerCase()));
            }
            return true;
          });
        }
      }

      if (type === 'rent') {
        // Max Rent
        if (filters.maxRent) {
          filteredListings = filteredListings.filter(
            listing => listing.rentDetails?.costs?.rent <= Number(filters.maxRent)
          );
        }
        // Min Rent
        if (filters.minRent) {
          filteredListings = filteredListings.filter(
            listing => listing.rentDetails?.costs?.rent >= Number(filters.minRent)
          );
        }
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

    console.log('Returning listings:', filteredListings.length);
    console.log('Final filtered listings:', filteredListings.map(l => ({ id: l.id, rent: l.rentDetails?.costs?.rent, price: l.sellDetails?.price })));
    return filteredListings;

  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
}

export async function getPropertyById(type: 'rent' | 'sell', id: string) {
  try {
    console.log('Fetching property:', { type, id });
    // const collectionName = type === 'rent' ? 'r' : 's';
    // const docRef = doc(db, collectionName, id);
    
    // // Remove any auth requirements for reading
    // const docSnap = await getDoc(docRef);

    // if (!docSnap.exists()) {
    //   console.log('Document not found in collection:', collectionName);
    //   throw new Error('Property not found');
    // }

    // const data = docSnap.data();
    const mockData: any = { // Mock data
      id: 'mock_id',
      address: { city: 'Mock City', locality: 'Mock Locality', buildingName: 'Mock Building' },
      propertyType: 'Mock Type',
      furnishingType: 'Mock Furnishing',
      parking: 'Mock Parking',
      buildingType: 'Mock Building Type',
      handoverDate: 'Mock Date',
      isImmediate: true,
      description: 'Mock Description',
      amenities: { appliances: ['Mock Appliance'], furniture: ['Mock Furniture'], building: ['Mock Building'] },
      images: ['mock_image_url'],
      createdAt: Date.now(),
      userId: 'mock_user_id',
      createdByUser: 'mock_user_id',
      status: 'active',
      contactNumber: 'Mock Contact',
      listingType: type
    };
    return {
      id: 'mock_id',
      ...mockData,
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
    // const rentDocs = await getDocs(query(collection(db, 'r'), where('__name__', 'in', ids)));
    // const sellDocs = await getDocs(query(collection(db, 's'), where('__name__', 'in', ids)));

    const mockListings: any[] = []; // Mock data
    // const rentProperties = rentDocs.docs.map(doc => ({
    //   id: doc.id,
    //   ...doc.data(),
    //   listingType: 'rent'  // Add listing type
    // }));

    // const sellProperties = sellDocs.docs.map(doc => ({
    //   id: doc.id,
    //   ...doc.data(),
    //   listingType: 'sell'  // Add listing type as 'sell'
    // }));

    // // Combine and maintain order
    // const allProperties = [...rentProperties, ...sellProperties];
    // const orderedProperties = ids
    //   .map(id => allProperties.find(prop => prop.id === id))
    //   .filter(Boolean);

    // console.log('Retrieved properties:', orderedProperties.length);
    return mockListings;

  } catch (error) {
    console.error('Error fetching properties by ids:', error);
    throw error;
  }
}

/**
 * Fetch all listings (rent and sell) created by a specific user.
 * @param userId The user's UID
 * @returns Array of listings (rent and sell)
 */
export async function getListingsByUser(userId: string) {
  try {
    // Query rent listings
    // const rentQuery = query(collection(db, 'r'), where('userId', '==', userId));
    // const rentSnapshot = await getDocs(rentQuery);
    // const rentListings = rentSnapshot.docs.map(doc => ({
    //   id: doc.id,
    //   ...doc.data(),
    //   listingType: 'rent',
    // }));

    // // Query sell listings
    // const sellQuery = query(collection(db, 's'), where('userId', '==', userId));
    // const sellSnapshot = await getDocs(sellQuery);
    // const sellListings = sellSnapshot.docs.map(doc => ({
    //   id: doc.id,
    //   ...doc.data(),
    //   listingType: 'sell',
    // }));

    // // Combine and return
    // return [...rentListings, ...sellListings];
    const mockListings: any[] = []; // Mock data
    return mockListings;
  } catch (error) {
    console.error('Error fetching user listings:', error);
    throw error;
  }
}

export const initiatePhonePePayment = async (amount: number, userPhone: string) => {
  const res = await fetch('https://us-central1-homemates-app.cloudfunctions.net/phonepePay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, merchantTransactionId: 'txn_' + Date.now(), userPhone }),
  });
  const data = await res.json();
  if (data.success && data.data && data.data.instrumentResponse.redirectInfo.url) {
    window.location.href = data.data.instrumentResponse.redirectInfo.url;
  } else {
    alert('Payment initiation failed');
  }
};

/**
 * Update a listing by ID and type (rent/sell)
 * @param type 'rent' | 'sell'
 * @param id Listing document ID
 * @param data Partial update data
 */
export async function updateListing(type: 'rent' | 'sell', id: string, data: Partial<RentListing | SellListing>) {
  try {
    // const collectionName = type === 'rent' ? 'r' : 's';
    // const docRef = doc(db, collectionName, id);
    // await import('firebase/firestore').then(({ updateDoc }) => updateDoc(docRef, data));
    return { success: true };
  } catch (error) {
    console.error('Error updating listing:', error);
    throw error;
  }
}

/**
 * Delete a listing by ID and type (rent/sell)
 * @param type 'rent' | 'sell'
 * @param id Listing document ID
 */
export async function deleteListing(type: 'rent' | 'sell', id: string) {
  try {
    // const collectionName = type === 'rent' ? 'r' : 's';
    // const docRef = doc(db, collectionName, id);
    // await import('firebase/firestore').then(({ deleteDoc }) => deleteDoc(docRef));
    return { success: true };
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
}
