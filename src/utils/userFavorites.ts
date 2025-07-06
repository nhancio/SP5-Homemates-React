import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function updateUserFavorites(userId: string, propertyId: string, isFavorite: boolean) {
  try {
    const userRef = doc(db, 'u', userId);
    if (isFavorite) {
      await setDoc(userRef, { favorites: arrayUnion(propertyId) }, { merge: true });
    } else {
      await setDoc(userRef, { favorites: arrayRemove(propertyId) }, { merge: true });
    }
    return { success: true };
  } catch (error) {
    console.error('Error updating favorites:', error);
    throw error;
  }
}

export async function getUserFavorites(userId: string): Promise<string[]> {
  try {
    const userRef = doc(db, 'u', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      return Array.isArray(data.favorites) ? data.favorites : [];
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
}
