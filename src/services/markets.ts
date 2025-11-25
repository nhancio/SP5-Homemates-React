import { supabase } from '../config/supabase';

export const getMarkets = async () => {
  try {
    console.log('[getMarkets] Fetching markets...');
    const startTime = Date.now();
    
    const queryPromise = supabase
      .from('markets')
      .select('id, city, market');
    
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        console.warn('[getMarkets] Timeout after 5s');
        resolve({ data: null, error: { code: 'TIMEOUT' } });
      }, 5000);
    });
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
    const duration = Date.now() - startTime;
    console.log(`[getMarkets] Completed in ${duration}ms`);

    if (error) {
      console.error('[getMarkets] Error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[getMarkets] Exception:', error);
    return [];
  }
};

// Fetch localities for a given city from the markets collection
export async function getLocalitiesByCity(city: string): Promise<string[]> {
  try {
    const normalizedCity = city.trim().toLowerCase();
    console.log('[getLocalitiesByCity] Fetching for city:', normalizedCity);
    const startTime = Date.now();
    
    const queryPromise = supabase
      .from('markets')
      .select('market')
      .ilike('city', normalizedCity);
    
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        console.warn('[getLocalitiesByCity] Timeout after 5s');
        resolve({ data: null, error: { code: 'TIMEOUT' } });
      }, 5000);
    });
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
    const duration = Date.now() - startTime;
    console.log(`[getLocalitiesByCity] Completed in ${duration}ms`);

    if (error) {
      console.error('Error fetching localities:', error);
      return [];
    }

    const markets = (data || [])
      .map(m => m.market)
      .filter((m: any) => typeof m === 'string' && m.trim() !== '');

    // Remove duplicates (case-insensitive, trimmed)
    const uniqueMarkets = Array.from(new Set(markets.map((m: string) => m.trim().toLowerCase())))
      .map(key => markets.find((m: string) => m.trim().toLowerCase() === key) || key);

    console.log('Looking for city:', normalizedCity);
    console.log('Filtered markets:', markets);
    console.log('Unique markets:', uniqueMarkets);
    
    return uniqueMarkets;
  } catch (error) {
    console.error('Error fetching localities for city:', city, error);
    return [];
  }
}
