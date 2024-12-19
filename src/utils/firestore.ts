import { doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const updateUserDoc = async (userId: string, data: any) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data);
};

export const setUserDoc = async (userId: string, data: any) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, data);
};

export const deleteUserDoc = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  await deleteDoc(userRef);
};
