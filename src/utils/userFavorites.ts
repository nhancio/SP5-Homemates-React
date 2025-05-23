import { doc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function updateUserFavorites(userId: string, propertyId: string, isFavorite: boolean) {
  try {
    const userRef = doc(db, 'u', userId);
    
    if (isFavorite) {
      await setDoc(userRef, {
        favorites: arrayUnion(propertyId)
      }, { merge: true });
    } else {
      await setDoc(userRef, {
        favorites: arrayRemove(propertyId)
      }, { merge: true });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating favorites:', error);
    throw error;
  }
}
