import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

export const signInWithGoogle = async () => {
  try {
    // Force OAuth consent screen
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    const result = await signInWithPopup(auth, googleProvider);
    const userId = result.user.uid;
    
    // Check if user exists in 'u' collection
    const userRef = doc(db, 'u', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(userRef, {
        userId: userId,
        email: result.user.email,
        name: result.user.displayName,
        photoURL: result.user.photoURL,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      });
      console.log('Created new user:', userId);
    } else {
      // Update last login
      await setDoc(userRef, {
        lastLoginAt: new Date().toISOString()
      }, { merge: true });
      console.log('Updated existing user:', userId);
    }

    const userData = {
      user: {
        id: userId,
        name: result.user.displayName || '',
        email: result.user.email || '',
        photoURL: result.user.photoURL || '',
        isPremium: false
      },
      success: true,
      isNewUser: !userDoc.exists()
    };

    // Store user data in localStorage immediately
    localStorage.setItem('user', JSON.stringify(userData.user));
    
    return userData;

  } catch (error) {
    console.error('Auth Error:', error);
    localStorage.removeItem('user'); // Clear any stale data
    return { success: false };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('user'); // Clear user data on logout
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false };
  }
};

export async function getUserFavorites(userId: string): Promise<string[]> {
  try {
    const userDoc = await getDoc(doc(db, 'u', userId));
    if (userDoc.exists()) {
      return userDoc.data()?.favorites || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
}
