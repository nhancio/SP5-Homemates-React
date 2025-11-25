import { supabase, auth } from '../config/supabase';
import { queryWithTimeout } from '../utils/supabaseHelpers';

// Helper to safely parse numeric amounts from numbers or strings
function parseAmount(value: any): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : null;
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned) return null;
    const num = Number(cleaned);
    return Number.isFinite(num) && num > 0 ? num : null;
  }
  return null;
}

// Helper to transform Supabase row to listing format
function transformListing(row: any, type: 'rent' | 'sell'): any {
  return {
    id: row.id,
    address: {
      city: row.address_city,
      locality: row.address_locality,
      buildingName: row.address_building_name,
      googleMapsLink: row.address_google_maps_link,
    },
    propertyType: row.property_type,
    roomType: row.room_type,
    furnishType: row.furnish_type,
    parking: row.parking,
    buildingType: row.building_type,
    handoverDate: row.handover_date,
    isImmediate: row.is_immediate,
    description: row.description,
    contactNumber: row.contact_number,
    images: row.images || [],
    createdAt: row.created_at,
    userId: row.user_id,
    createdByUser: row.created_by_user,
    status: row.status,
    listingType: type,
    roomAvailable: row.room_available,
    rooms: row.rooms,
    rentDetails: row.rent_details,
    sellDetails: row.sell_details,
  };
}

// Helper to transform listing data for Supabase insert/update
function transformListingForDB(data: any, type: 'rent' | 'sell'): any {
  const transformed: any = {
    user_id: data.userId,
    created_by_user: data.createdByUser || data.userId,
    listing_type: type,
    status: data.status || 'active',
    address_city: data.address?.city,
    address_locality: data.address?.locality,
    address_building_name: data.address?.buildingName,
    address_google_maps_link: data.address?.googleMapsLink,
    property_type: data.propertyType,
    room_type: data.roomType,
    furnish_type: data.furnishType,
    parking: data.parking,
    building_type: data.buildingType,
    handover_date: data.handoverDate,
    is_immediate: data.isImmediate,
    description: data.description,
    contact_number: data.contactNumber,
    images: data.images || [],
    created_at: data.createdAt || Date.now(),
    room_available: data.roomAvailable,
    rooms: data.rooms,
  };

  if (type === 'rent') {
    transformed.rent_details = data.rentDetails;
  } else {
    transformed.sell_details = data.sellDetails;
    transformed.looking_for = data.lookingFor;
  }

  return transformed;
}

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
  createdByUser: string;
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
      availability: string;
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
    const { data: { session }, error: sessionError } = await auth.getSession();
    if (sessionError || !session) {
      throw new Error('User must be authenticated to create a listing');
    }

    const userId = session.user.id;
    const tableName = type === 'rent' ? 'rent_listings' : 'sell_listings';

    console.log('=== CREATELISTING DEBUG ===');
    console.log('Type parameter:', type);
    console.log('Table name:', tableName);
    console.log('User ID:', userId);
    console.log('Data passed in:', data);

    // Additional validation: enforce minimum amount 1000
    if (type === 'rent') {
      const rent = parseAmount((data as any)?.rentDetails?.costs?.rent);
      if (rent === null || rent < 1000) {
        throw new Error('Minimum monthly rent must be ₹1000 or above');
      }
    } else {
      const price = parseAmount((data as any)?.sellDetails?.price ?? (data as any)?.price);
      if (price === null || price < 1000) {
        throw new Error('Minimum price must be ₹1000 or above');
      }
    }

    // Clean data before saving
    const cleanData = {
      ...data,
      createdAt: Date.now(),
      status: 'active' as const,
      userId: userId,
      createdByUser: userId,
      listingType: type
    };

    const transformedData = transformListingForDB(cleanData, type);

    console.log('Transformed data for Supabase:', transformedData);

    const { data: insertedData, error } = await supabase
      .from(tableName)
      .insert(transformedData)
      .select()
      .single();

    if (error) {
      console.error('Error creating listing:', error);
      throw error;
    }

    console.log('Listing created successfully with ID:', insertedData.id);
    return { success: true, id: insertedData.id };
  } catch (error: any) {
    console.error('Error creating listing:', error);
    if (error.code === 'PGRST301' || error.message?.includes('permission')) {
      throw new Error('You do not have permission to create listings');
    }
    throw error;
  }
}

export async function getListings(type: 'rent' | 'sell', filters?: any) {
  try {
    const startTime = Date.now();
    console.log('=== GETLISTINGS DEBUG START ===');
    console.log('Fetching listings...');
    console.log('Getting listings for type:', type, 'with filters:', filters);
    
    const tableName = type === 'rent' ? 'rent_listings' : 'sell_listings';
    let queryBuilder = supabase
      .from(tableName)
      .select('*')
      .eq('status', 'active')
      .limit(1000); // Add limit to prevent huge queries

    // Add property type filter if provided
    if (filters?.propertyType) {
      queryBuilder = queryBuilder.eq('property_type', filters.propertyType);
    }

    // Execute query with timeout wrapper
    const { data: rows, error } = await queryWithTimeout(
      queryBuilder,
      8000, // 8 second timeout
      `getListings-${type}`
    );

    if (error) {
      console.error('Error fetching listings:', error);
      // Return empty array instead of throwing to prevent app crash
      console.warn('Returning empty array due to error');
      return [];
    }

    // Transform rows to listing format
    let listings = (rows || []).map(row => transformListing(row, type));

    console.log('Fetched listings count:', listings.length);

    // Apply client-side filters (for city/locality case-insensitive matching)
    if (filters) {
      // Price filter (for sell)
      if (type === 'sell' && (filters.priceMin || filters.priceMax)) {
        listings = listings.filter(listing => {
          const price = listing.price || listing.sellDetails?.price;
          if (price === undefined) return false;
          if (filters.priceMin && price < Number(filters.priceMin)) return false;
          if (filters.priceMax && price > Number(filters.priceMax)) return false;
          return true;
        });
      }

      // Rent filter (for rent)
      if (type === 'rent' && (filters.minRent || filters.maxRent)) {
        listings = listings.filter(listing => {
          const rent = listing.rentDetails?.costs?.rent;
          if (rent === undefined) return false;
          if (filters.minRent && rent < Number(filters.minRent)) return false;
          if (filters.maxRent && rent > Number(filters.maxRent)) return false;
          return true;
        });
      }

      // City filter (case-insensitive)
      if (filters.city && filters.city.trim() !== '') {
        listings = listings.filter(listing =>
          listing.address?.city?.toLowerCase().includes(filters.city.toLowerCase())
        );
      }

      // Locality filter (case-insensitive)
      if (filters.locality && filters.locality.trim() !== '') {
        listings = listings.filter(listing =>
          listing.address?.locality?.toLowerCase().includes(filters.locality.toLowerCase())
        );
      }

      // BHK filter
      if (filters.bhk && filters.bhk !== '') {
        listings = listings.filter(listing =>
          String(listing.bedrooms || listing.propertyType || listing.roomType).toLowerCase().includes(String(filters.bhk).toLowerCase())
        );
      }

      // Bathrooms filter
      if (filters.bathrooms && filters.bathrooms !== '') {
        listings = listings.filter(listing => {
          const bathrooms = listing.bathrooms || listing.rentDetails?.roomDetails?.bathrooms;
          return String(bathrooms).toLowerCase().includes(String(filters.bathrooms).toLowerCase());
        });
      }

      // Property type filter
      if (filters.propertyType && filters.propertyType !== '') {
        listings = listings.filter(listing =>
          String(listing.type || listing.propertyType).toLowerCase().includes(String(filters.propertyType).toLowerCase())
        );
      }

      // Amenities filter
      if (filters.amenities && filters.amenities !== '') {
        const amenityList = filters.amenities.split(',').map((a: string) => a.trim().toLowerCase());
        listings = listings.filter(listing => {
          const allListingAmenities: string[] = [];
          
          if (listing.features && Array.isArray(listing.features)) {
            allListingAmenities.push(...listing.features);
          }
          
          if (listing.amenities && Array.isArray(listing.amenities)) {
            allListingAmenities.push(...listing.amenities);
          }
          
          if (listing.amenities && typeof listing.amenities === 'object' && !Array.isArray(listing.amenities)) {
            if (listing.amenities.appliances) allListingAmenities.push(...listing.amenities.appliances);
            if (listing.amenities.furniture) allListingAmenities.push(...listing.amenities.furniture);
            if (listing.amenities.building) allListingAmenities.push(...listing.amenities.building);
          }
          
          if (listing.sellDetails?.amenities) {
            allListingAmenities.push(...listing.sellDetails.amenities);
          }
          
          if (listing.rentDetails?.amenities) {
            allListingAmenities.push(...listing.rentDetails.amenities);
          }

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
          
          return amenityList.some((amenityKey: string) => {
            const mappedFeatures = amenityKeyMap[amenityKey] || [amenityKey];
            return mappedFeatures.some(feature => 
              allListingAmenities.some((listingAmenity: string) =>
                listingAmenity.toLowerCase().includes(feature.toLowerCase())
              )
            );
          });
        });
      }
    }

    // Apply base validation filter
    listings = listings.filter(listing => {
      if (type === 'rent') {
        const rent = parseAmount(listing?.rentDetails?.costs?.rent);
        return rent !== null && rent >= 1000;
      } else {
        const price = parseAmount(listing?.sellDetails?.price ?? listing?.price);
        return price !== null && price >= 1000;
      }
    });

    console.log('Final filtered listings count:', listings.length);
    console.log('=== GETLISTINGS DEBUG END ===');
    return listings;
  } catch (error: any) {
    console.error('=== GETLISTINGS ERROR ===');
    console.error('Error fetching listings:', error);
    throw error;
  }
}

export async function getPropertyById(type: 'rent' | 'sell', id: string) {
  try {
    console.log('Fetching property:', { type, id });
    const tableName = type === 'rent' ? 'rent_listings' : 'sell_listings';
    
    const { data, error } = await queryWithTimeout(
      supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single(),
      5000, // 5 second timeout
      `getPropertyById-${type}-${id}`
    );

    if (error) {
      console.error('Error fetching property:', error);
      throw new Error('Property not found');
    }

    if (!data) {
      throw new Error('Property not found');
    }

    const transformed = transformListing(data, type);
    console.log('Retrieved property data:', transformed);
    
    return transformed;
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
}

export async function getListingsByIds(ids: string[]) {
  try {
    if (!ids.length) return [];

    console.log('Fetching properties for IDs:', ids);

    // Fetch from both tables with timeout
    const [rentResult, sellResult] = await Promise.all([
      queryWithTimeout(
        supabase
          .from('rent_listings')
          .select('*')
          .in('id', ids),
        5000,
        'getListingsByIds-rent'
      ),
      queryWithTimeout(
        supabase
          .from('sell_listings')
          .select('*')
          .in('id', ids),
        5000,
        'getListingsByIds-sell'
      )
    ]);

    const rentProperties = (rentResult.data || []).map(row => transformListing(row, 'rent'));
    const sellProperties = (sellResult.data || []).map(row => transformListing(row, 'sell'));

    const allProperties = [...rentProperties, ...sellProperties];
    const orderedProperties = ids
      .map(id => allProperties.find(prop => prop.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    console.log('Retrieved properties:', orderedProperties.length);
    return orderedProperties;

  } catch (error) {
    console.error('Error fetching properties by ids:', error);
    throw error;
  }
}

export async function getListingsByUser(userId: string) {
  try {
    console.log('=== GETLISTINGSBYUSER DEBUG START ===');
    console.log('Fetching listings for userId:', userId);
    
    // Query both tables with timeout
    const [rentResult, sellResult] = await Promise.all([
      queryWithTimeout(
        supabase
          .from('rent_listings')
          .select('*')
          .or(`user_id.eq.${userId},created_by_user.eq.${userId}`),
        5000,
        'getListingsByUser-rent'
      ),
      queryWithTimeout(
        supabase
          .from('sell_listings')
          .select('*')
          .or(`user_id.eq.${userId},created_by_user.eq.${userId}`),
        5000,
        'getListingsByUser-sell'
      )
    ]);

    const rentListings = (rentResult.data || []).map(row => ({
      ...transformListing(row, 'rent'),
      listingType: 'rent',
    }));

    const sellListings = (sellResult.data || []).map(row => ({
      ...transformListing(row, 'sell'),
      listingType: 'sell',
    }));

    const allListings = [...rentListings, ...sellListings];
    console.log('Total listings found:', allListings.length);
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

export async function updateListing(type: 'rent' | 'sell', id: string, data: Partial<RentListing | SellListing>) {
  try {
    const tableName = type === 'rent' ? 'rent_listings' : 'sell_listings';
    const transformedData = transformListingForDB(data as any, type);
    
    // Remove undefined values
    Object.keys(transformedData).forEach(key => {
      if (transformedData[key] === undefined) {
        delete transformedData[key];
      }
    });

    const { error } = await supabase
      .from(tableName)
      .update(transformedData)
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating listing:', error);
    throw error;
  }
}

export async function deleteListing(type: 'rent' | 'sell', id: string) {
  try {
    const tableName = type === 'rent' ? 'rent_listings' : 'sell_listings';
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
}
