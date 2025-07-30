import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function useCredits(userId: string, action: string): Promise<boolean> {
  const userRef = doc(db, 'u', userId);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) return false;
  const data = userDoc.data();
  const currentCredits = data.credits ?? 0;
  if (currentCredits > 0) {
    await updateDoc(userRef, { credits: currentCredits - 1 });
    return true;
  } else {
    return false;
  }
}

export async function getUserCredits(userId: string): Promise<{ credits: number }> {
  const userDoc = await getDoc(doc(db, 'u', userId));
  if (userDoc.exists()) {
    const data = userDoc.data();
    return { credits: data.credits ?? 0 };
  }
  return { credits: 0 };
}

export const addCredits = async (userId: string, amount: number): Promise<boolean> => {
  try {
    const userRef = doc(db, 'u', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      const currentCredits = data.credits ?? 0;
      await updateDoc(userRef, { credits: currentCredits + amount });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding credits:', error);
    return false;
  }
}; 