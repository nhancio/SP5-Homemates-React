import { supabase } from '../config/supabase';

export async function useCredits(userId: string, action: string): Promise<boolean> {
  try {
    // Get current credits
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('credits')
      .eq('user_id', userId)
      .single();

    if (fetchError || !userData) {
      console.error('Error fetching user credits:', fetchError);
      return false;
    }

    const currentCredits = userData.credits ?? 0;
    if (currentCredits > 0) {
      // Decrement credits
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          credits: currentCredits - 1,
          credits_last_updated: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating credits:', updateError);
        return false;
      }

      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error using credits:', error);
    return false;
  }
}

export async function getUserCredits(userId: string): Promise<{ credits: number }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('credits')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user credits:', error);
      return { credits: 0 };
    }

    return { credits: data?.credits ?? 0 };
  } catch (error) {
    console.error('Error getting user credits:', error);
    return { credits: 0 };
  }
}

export const addCredits = async (userId: string, amount: number): Promise<boolean> => {
  try {
    // Get current credits
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('credits')
      .eq('user_id', userId)
      .single();

    if (fetchError || !userData) {
      console.error('Error fetching user credits:', fetchError);
      return false;
    }

    const currentCredits = userData.credits ?? 0;
    
    // Add credits
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        credits: currentCredits + amount,
        credits_last_updated: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error adding credits:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding credits:', error);
    return false;
  }
};
