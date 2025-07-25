import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const getMarkets = async () => {
  const snapshot = await getDocs(collection(db, 'markets'));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    city: doc.data().city,
    market: doc.data().market,
  }));
};

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