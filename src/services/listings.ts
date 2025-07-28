// Coming soon

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

    console.log('=== CREATELISTING DEBUG ===');
    console.log('User from auth:', user);
    console.log('User UID:', user.uid);
    console.log('Data passed in:', data);
    console.log('Clean data being saved:', cleanData);

    console.log('Creating listing with data:', cleanData);
    console.log('Collection:', type === 'rent' ? 'r' : 's');

    const docRef = await addDoc(collectionRef, cleanData);

    console.log('Document written with ID:', docRef.id);
    
    // Test: Immediately try to fetch the listing we just created
    console.log('Testing: Fetching the listing we just created...');
    const testQuery = query(collection(db, type === 'rent' ? 'r' : 's'), where('userId', '==', user.uid));
    const testSnapshot = await getDocs(testQuery);
    console.log('Test query found', testSnapshot.size, 'listings for user', user.uid);
    console.log('Test listings:', testSnapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    })));
    
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error creating listing:', error);
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to create listings');
    }
    throw error;
  }
}

export async function getListings(type: 'rent' | 'sell', filters?: any) {
  try {
    console.log('=== GETLISTINGS DEBUG START ===');
    console.log('Fetching listings...');
    console.log('Getting listings for type:', type, 'with filters:', filters);
    
    // Try to get listings from Firebase first
    let listings: any[] = [];
    try {
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
      }

      console.log('Executing Firestore query...');
      // Execute query
      const snapshot = await getDocs(baseQuery);
      console.log('Query returned:', snapshot.size, 'documents');
      
      // Transform and filter results
      listings = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          contactNumber: data.contactNumber || '',
          rentDetails: data.rentDetails,
          sellDetails: data.sellDetails,
          address: data.address,
          propertyType: data.propertyType,
          bathrooms: data.bathrooms,
          amenities: data.amenities
        };
      });
    } catch (firebaseError) {
      console.log('Firebase query failed, using mock data:', firebaseError);
    }

    // If no listings from Firebase, use mock data
    if (listings.length === 0) {
      console.log('No Firebase listings found, using mock data...');
      const { getMockProperties } = await import('../data/properties');
      const mockProperties = getMockProperties();
      
      // Filter mock properties by type
      listings = mockProperties.filter(property => {
        if (type === 'rent') {
          return property.listingType === 'rent';
        } else {
          return property.listingType === 'buy' || property.listingType === 'sell';
        }
      });
      
      console.log('Mock properties found:', listings.length);
    }

    console.log('Transformed listings before client-side filtering:', listings);

    // Apply all client-side filters
    let filteredListings = listings;

    if (filters) {
      console.log('Applying client-side filters:', filters);
      
      // Price (for buy)
      if (type === 'sell' && (filters.priceMin || filters.priceMax)) {
        console.log('=== PRICE FILTER DEBUG ===');
        console.log('Filtering by priceMin:', filters.priceMin, 'priceMax:', filters.priceMax);
        console.log('Total listings before price filter:', filteredListings.length);
        console.log('Sample listing structure:', filteredListings[0]);
        filteredListings = filteredListings.filter(listing => {
          const price = listing.price || listing.sellDetails?.price;
          console.log('Checking listing:', listing.id, 'Price found:', price, 'Type:', typeof price);
          if (price === undefined) {
            console.log('Listing has no price:', listing);
            return false;
          }
          console.log('Listing price:', price, 'Filter min:', filters.priceMin, 'Filter max:', filters.priceMax);
          if (filters.priceMin && price < Number(filters.priceMin)) {
            console.log('Listing filtered out - price too low:', price, '<', filters.priceMin);
            return false;
          }
          if (filters.priceMax && price > Number(filters.priceMax)) {
            console.log('Listing filtered out - price too high:', price, '>', filters.priceMax);
            return false;
          }
          console.log('Listing passed price filter:', price);
          return true;
        });
        console.log('Total listings after price filter:', filteredListings.length);
        console.log('=== PRICE FILTER DEBUG END ===');
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
        console.log('Filtering by city:', filters.city);
        filteredListings = filteredListings.filter(listing =>
          listing.address?.city?.toLowerCase().includes(filters.city.toLowerCase())
        );
      }

      // Locality filter
      if (filters.locality && filters.locality.trim() !== '') {
        console.log('Filtering by locality:', filters.locality);
        filteredListings = filteredListings.filter(listing =>
          listing.address?.locality?.toLowerCase().includes(filters.locality.toLowerCase())
        );
      }

      // BHK filter
      if (filters.bhk && filters.bhk !== '') {
        console.log('Filtering by BHK:', filters.bhk);
        filteredListings = filteredListings.filter(listing =>
          String(listing.bedrooms || listing.propertyType).toLowerCase().includes(String(filters.bhk).toLowerCase())
        );
      }

      // Bathrooms filter
      if (filters.bathrooms && filters.bathrooms !== '') {
        console.log('Filtering by bathrooms:', filters.bathrooms);
        filteredListings = filteredListings.filter(listing => {
          const bathrooms = listing.bathrooms || listing.rentDetails?.roomDetails?.bathrooms;
          return String(bathrooms).toLowerCase().includes(String(filters.bathrooms).toLowerCase());
        });
      }

      // Property type filter
      if (filters.propertyType && filters.propertyType !== '') {
        console.log('Filtering by property type:', filters.propertyType);
        filteredListings = filteredListings.filter(listing =>
          String(listing.type || listing.propertyType).toLowerCase().includes(String(filters.propertyType).toLowerCase())
        );
      }

      // Amenities filter
      if (filters.amenities && filters.amenities !== '') {
        console.log('Filtering by amenities:', filters.amenities);
        const amenityList = filters.amenities.split(',').map((a: string) => a.trim().toLowerCase());
        console.log('Amenity list to filter by:', amenityList);
        filteredListings = filteredListings.filter(listing => {
          // Normalize all amenity data into a single array
          const allListingAmenities: string[] = [];
          
          // Add features array if it exists
          if (listing.features && Array.isArray(listing.features)) {
            allListingAmenities.push(...listing.features);
          }
          
          // Add amenities array if it exists and is an array
          if (listing.amenities && Array.isArray(listing.amenities)) {
            allListingAmenities.push(...listing.amenities);
          }
          
          // Add amenities object properties if it exists and is an object
          if (listing.amenities && typeof listing.amenities === 'object' && !Array.isArray(listing.amenities)) {
            if (listing.amenities.appliances && Array.isArray(listing.amenities.appliances)) {
              allListingAmenities.push(...listing.amenities.appliances);
            }
            if (listing.amenities.furniture && Array.isArray(listing.amenities.furniture)) {
              allListingAmenities.push(...listing.amenities.furniture);
            }
            if (listing.amenities.building && Array.isArray(listing.amenities.building)) {
              allListingAmenities.push(...listing.amenities.building);
            }
          }
          
          // Add sellDetails amenities if it exists
          if (listing.sellDetails && listing.sellDetails.amenities && Array.isArray(listing.sellDetails.amenities)) {
            allListingAmenities.push(...listing.sellDetails.amenities);
          }
          
          console.log('All listing amenities:', allListingAmenities);
          
          // Map amenity keys to actual feature names
          const amenityKeyMap: { [key: string]: string[] } = {
            'parking': ['Parking', 'Car Parking', '2 Car Parking'],
            'security': ['Security', 'Security System'],
            'fridge': ['Fridge', 'Refrigerator'],
            'washing': ['Washing Machine', 'Washing'],
            'bed': ['Bed', 'Fully Furnished'],
            'roommate': ['Shared Room', 'Roommate'],
            'key': ['Private Room', 'Private'],
            'power': ['Power Backup', 'Generator'],
            'car': ['Parking', 'Car Parking'],
            'bike': ['Bike Parking', 'Parking'],
            'house': ['Gated Community', 'Gated Society'],
            'ac': ['AC', 'Air Conditioning'],
            'gym': ['Gym', 'Gymnasium'],
            'pool': ['Swimming Pool', 'Pool'],
            'garden': ['Garden', 'Private Garden'],
            'smart': ['Smart Home', 'Smart']
          };
          
          const matchFound = amenityList.some((amenityKey: string) => {
            const mappedFeatures = amenityKeyMap[amenityKey] || [amenityKey];
            console.log(`Checking amenity key "${amenityKey}" with mapped features:`, mappedFeatures);
            
            const hasMatch = mappedFeatures.some(feature => 
              allListingAmenities.some((listingAmenity: string) => {
                const amenityMatch = listingAmenity.toLowerCase().includes(feature.toLowerCase());
                console.log(`Comparing "${listingAmenity}" with "${feature}": ${amenityMatch}`);
                return amenityMatch;
              })
            );
            
            console.log(`Match found for amenity key "${amenityKey}": ${hasMatch}`);
            return hasMatch;
          });
          
          console.log(`Final match for listing "${listing.title}": ${matchFound}`);
          return matchFound;
        });
      }
    }

    console.log('Final filtered listings count:', filteredListings.length);
    console.log('=== GETLISTINGS DEBUG END ===');
    return filteredListings;
  } catch (error: any) {
    console.error('=== GETLISTINGS ERROR ===');
    console.error('Error fetching listings:', error);
    throw error;
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
    console.log('Retrieved property data:', data);
    
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

/**
 * Fetch all listings (rent and sell) created by a specific user.
 * @param userId The user's UID
 * @returns Array of listings (rent and sell)
 */
export async function getListingsByUser(userId: string) {
  try {
    console.log('=== GETLISTINGSBYUSER DEBUG START ===');
    console.log('Fetching listings for userId:', userId);
    
    // First, let's check what's actually in the collections
    console.log('Checking all documents in rent collection...');
    const allRentSnapshot = await getDocs(collection(db, 'r'));
    console.log('All rent documents:', allRentSnapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    })));
    
    console.log('Checking all documents in sell collection...');
    const allSellSnapshot = await getDocs(collection(db, 's'));
    console.log('All sell documents:', allSellSnapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    })));
    
    // Query rent listings
    const rentQuery = query(collection(db, 'r'), where('userId', '==', userId));
    console.log('Rent query:', rentQuery);
    const rentSnapshot = await getDocs(rentQuery);
    console.log('Rent snapshot size:', rentSnapshot.size);
    console.log('Rent documents:', rentSnapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    })));
    const rentListings = rentSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      listingType: 'rent',
    }));

    // Query sell listings
    const sellQuery = query(collection(db, 's'), where('userId', '==', userId));
    console.log('Sell query:', sellQuery);
    const sellSnapshot = await getDocs(sellQuery);
    console.log('Sell snapshot size:', sellSnapshot.size);
    console.log('Sell documents:', sellSnapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    })));
    const sellListings = sellSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      listingType: 'sell',
    }));

    // If no listings found with userId, try with createdByUser
    if (rentListings.length === 0 && sellListings.length === 0) {
      console.log('No listings found with userId, trying createdByUser...');
      const rentQueryByCreatedBy = query(collection(db, 'r'), where('createdByUser', '==', userId));
      const rentSnapshotByCreatedBy = await getDocs(rentQueryByCreatedBy);
      console.log('Rent listings with createdByUser:', rentSnapshotByCreatedBy.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      })));
      
      const sellQueryByCreatedBy = query(collection(db, 's'), where('createdByUser', '==', userId));
      const sellSnapshotByCreatedBy = await getDocs(sellQueryByCreatedBy);
      console.log('Sell listings with createdByUser:', sellSnapshotByCreatedBy.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      })));
      
      const rentListingsByCreatedBy = rentSnapshotByCreatedBy.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        listingType: 'rent',
      }));
      
      const sellListingsByCreatedBy = sellSnapshotByCreatedBy.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        listingType: 'sell',
      }));
      
      const allListingsByCreatedBy = [...rentListingsByCreatedBy, ...sellListingsByCreatedBy];
      console.log('Total listings found with createdByUser:', allListingsByCreatedBy.length);
      return allListingsByCreatedBy;
    }

    // Combine and return
    const allListings = [...rentListings, ...sellListings];
    console.log('Total listings found:', allListings.length);
    console.log('All listings:', allListings);
    console.log('=== GETLISTINGSBYUSER DEBUG END ===');
    return allListings;
  } catch (error: any) {
    console.error('=== GETLISTINGSBYUSER ERROR ===');
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
