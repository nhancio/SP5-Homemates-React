import { supabase } from '../config/supabase';

export async function updateUserFavorites(userId: string, propertyId: string, isFavorite: boolean) {
  try {
    // Get current favorites
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('favorites')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user favorites:', fetchError);
      throw fetchError;
    }

    const currentFavorites = Array.isArray(userData?.favorites) ? userData.favorites : [];
    let newFavorites: string[];

    if (isFavorite) {
      // Add to favorites if not already present
      if (!currentFavorites.includes(propertyId)) {
        newFavorites = [...currentFavorites, propertyId];
      } else {
        return { success: true }; // Already in favorites
      }
    } else {
      // Remove from favorites
      newFavorites = currentFavorites.filter(id => id !== propertyId);
    }

    // Update favorites
    const { error: updateError } = await supabase
      .from('users')
      .update({ favorites: newFavorites })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating favorites:', updateError);
      throw updateError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating favorites:', error);
    throw error;
  }
}

export async function getUserFavorites(userId: string): Promise<string[]> {
  try {
    console.log('[getUserFavorites] Fetching for user:', userId);
    const startTime = Date.now();
    
    const queryPromise = supabase
      .from('users')
      .select('favorites')
      .eq('user_id', userId)
      .single();
    
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        console.warn('[getUserFavorites] Timeout after 3s');
        resolve({ data: null, error: { code: 'TIMEOUT' } });
      }, 3000);
    });
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
    const duration = Date.now() - startTime;
    console.log(`[getUserFavorites] Completed in ${duration}ms`);

    if (error) {
      if (error.code === 'PGRST116') {
        // No user found, return empty array
        return [];
      }
      console.error('Error fetching favorites:', error);
      return [];
    }

    return Array.isArray(data?.favorites) ? data.favorites : [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
}
