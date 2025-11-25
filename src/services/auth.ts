import { supabase, auth } from '../config/supabase';

export const signInWithGoogle = async () => {
  try {
    // Sign in with Google OAuth
    // Flow: App -> Supabase -> Google -> Supabase Callback -> App
    const { data, error } = await auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Auth Error:', error);
      localStorage.removeItem('user');
      return { success: false, error: error.message };
    }

    // The OAuth flow will redirect automatically
    // Supabase handles the callback and redirects back to our app
    return { success: true, data };
  } catch (error: any) {
    console.error('Auth Error:', error);
    localStorage.removeItem('user');
    return { success: false, error: error.message };
  }
};

// Handle OAuth callback
export const handleAuthCallback = async () => {
  try {
    const { data: { session }, error } = await auth.getSession();
    
    if (error || !session) {
      throw new Error('Failed to get session');
    }

    const userId = session.user.id;
    
    // Check if user exists in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (userError && userError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking user:', userError);
    }
    
    if (!userData) {
      // Create new user document with 5 free credits
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          user_id: userId,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
          photo_url: session.user.user_metadata?.avatar_url || '',
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
          credits: 5,
          credits_last_updated: new Date().toISOString(),
        });
      
      if (insertError) {
        console.error('Error creating user:', insertError);
      } else {
        console.log('Created new user with 5 credits:', userId);
      }
    } else {
      // Update last login and initialize credits if not present
      const updateData: any = {
        last_login_at: new Date().toISOString(),
      };
      
      // Initialize credits if not present
      if (userData.credits === null || userData.credits === undefined) {
        updateData.credits = 5;
        updateData.credits_last_updated = new Date().toISOString();
      }
      
      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Error updating user:', updateError);
      } else {
        console.log('Updated existing user:', userId);
      }
    }

    // Fetch updated user data
    const { data: updatedUser } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    const userDataResult = {
      user: {
        id: userId,
        name: updatedUser?.name || session.user.user_metadata?.full_name || '',
        email: updatedUser?.email || session.user.email || '',
        photoURL: updatedUser?.photo_url || session.user.user_metadata?.avatar_url || '',
        isPremium: updatedUser?.is_premium || false
      },
      success: true,
      isNewUser: !userData
    };

    // Store user data in localStorage immediately
    localStorage.setItem('user', JSON.stringify(userDataResult.user));
    
    return userDataResult;

  } catch (error: any) {
    console.error('Auth Callback Error:', error);
    localStorage.removeItem('user');
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    const { error } = await auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      return { success: false };
    }
    localStorage.removeItem('user');
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false };
  }
};

export const getUserFavorites = async (userId?: string): Promise<string[]> => {
  try {
    if (!userId) {
      const { data: { session } } = await auth.getSession();
      if (!session) {
        return [];
      }
      userId = session.user.id;
    }

    const { data, error } = await supabase
      .from('users')
      .select('favorites')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user favorites:', error);
      return [];
    }
    
    return Array.isArray(data?.favorites) ? data.favorites : [];
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return [];
  }
};

// Get current user session
export const getCurrentUser = async () => {
  try {
    const { data: { session }, error } = await auth.getSession();
    if (error || !session) {
      return null;
    }
    return session.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
