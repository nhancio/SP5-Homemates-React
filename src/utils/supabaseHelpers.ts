import { supabase } from '../config/supabase';

/**
 * Wrapper for Supabase queries with timeout and error handling
 */
export async function queryWithTimeout<T>(
  queryPromise: Promise<{ data: T | null; error: any }>,
  timeoutMs: number = 5000,
  operationName: string = 'Query'
): Promise<{ data: T | null; error: any }> {
  const startTime = Date.now();
  console.log(`[${operationName}] Starting query...`);
  
  try {
    const timeoutPromise = new Promise<{ data: null; error: any }>((resolve) => {
      setTimeout(() => {
        console.error(`[${operationName}] Query timeout after ${timeoutMs}ms`);
        resolve({ data: null, error: { message: 'Query timeout', code: 'TIMEOUT' } });
      }, timeoutMs);
    });

    const result = await Promise.race([queryPromise, timeoutPromise]);
    const duration = Date.now() - startTime;
    
    if (result.error) {
      console.error(`[${operationName}] Error after ${duration}ms:`, result.error);
    } else {
      console.log(`[${operationName}] Success in ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${operationName}] Exception after ${duration}ms:`, error);
    return { data: null, error };
  }
}

/**
 * Safe query that returns empty array on error
 */
export async function safeQuery<T>(
  queryPromise: Promise<{ data: T | null; error: any }>,
  timeoutMs: number = 5000,
  operationName: string = 'Query',
  defaultValue: T = [] as any
): Promise<T> {
  const result = await queryWithTimeout(queryPromise, timeoutMs, operationName);
  
  if (result.error) {
    console.warn(`[${operationName}] Returning default value due to error`);
    return defaultValue;
  }
  
  return result.data || defaultValue;
}

