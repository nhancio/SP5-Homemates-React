import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Market {
  id: string;
  city: string;
  market: string; // locality
}

// Test function to verify Firebase connection
export async function testFirebaseConnection() {
  try {
    console.log('Testing Firebase connection...');
    console.log('Database instance:', db);
    
    // Try to access the markets collection
    const marketsRef = collection(db, 'markets');
    console.log('Markets collection reference:', marketsRef);
    
    // Try to get documents
    const snapshot = await getDocs(marketsRef);
    console.log('Snapshot size:', snapshot.size);
    console.log('Snapshot empty:', snapshot.empty);
    
    return { success: true, size: snapshot.size };
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return { success: false, error };
  }
}

// Manual test function - call this from browser console
export async function manualTestMarkets() {
  console.log('=== MANUAL MARKETS TEST ===');
  try {
    const result = await testFirebaseConnection();
    console.log('Connection test:', result);
    
    if (result.success) {
      const markets = await getMarkets();
      console.log('Markets test result:', markets);
      return markets;
    } else {
      console.log('Connection failed, cannot test markets');
      return null;
    }
  } catch (error) {
    console.error('Manual test failed:', error);
    return null;
  }
}



export async function getMarkets(): Promise<Market[]> {
  try {
    console.log('Fetching markets from Firebase...');
    console.log('Database instance:', db);
    
    const marketsRef = collection(db, 'markets');
    console.log('Markets collection reference:', marketsRef);
    
    const snapshot = await getDocs(marketsRef);
    console.log('Snapshot size:', snapshot.size);
    console.log('Snapshot empty:', snapshot.empty);
    
    console.log('Raw markets data:', snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));
    
    const markets = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Processing document:', { id: doc.id, data });
      return {
        id: doc.id,
        city: data.city || '',
        market: data.market || '',
      };
    });

    console.log('Processed markets:', markets);
    console.log('Markets count:', markets.length);
    
    return markets;
  } catch (error) {
    console.error('Error fetching markets:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        code: (error as any).code,
        message: error.message,
        stack: error.stack
      });
    }
    return [];
  }
} 

// Fetch localities for a given city from the markets collection
export async function getLocalitiesByCity(city: string): Promise<string[]> {
  try {
    const normalizedCity = city.trim().toLowerCase();
    const allMarketsSnapshot = await getDocs(collection(db, 'markets'));
    const allMarkets = allMarketsSnapshot.docs
      .map(doc => doc.data())
      .filter((m: any) => typeof m.city === 'string' && m.city.trim().toLowerCase() === normalizedCity)
      .map((m: any) => m.market)
      .filter((m: any) => typeof m === 'string' && m.trim() !== '');
    // Remove duplicates (case-insensitive, trimmed)
    const uniqueMarkets = Array.from(new Set(allMarkets.map((m: string) => m.trim().toLowerCase())))
      .map(key => allMarkets.find((m: string) => m.trim().toLowerCase() === key) || key);
    // Debug logs
    console.log('Looking for city:', normalizedCity);
    console.log('All markets:', allMarketsSnapshot.docs.map(doc => doc.data()));
    console.log('Filtered markets:', allMarkets);
    console.log('Unique markets:', uniqueMarkets);
    return uniqueMarkets;
  } catch (error) {
    console.error('Error fetching localities for city:', city, error);
    return [];
  }
} 