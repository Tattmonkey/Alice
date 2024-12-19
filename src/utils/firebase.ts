import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    // Create a unique filename with timestamp
    const timestamp = new Date().getTime();
    const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const fullPath = `${path}/${filename}`;
    
    console.log('Uploading image to path:', fullPath);
    
    // Create storage reference
    const storageRef = ref(storage, fullPath);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Image uploaded successfully:', snapshot);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Got download URL:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteImage = async (url: string): Promise<void> => {
  try {
    // Get the storage reference from the URL
    const storageRef = ref(storage, url);
    
    // Delete the file
    await deleteObject(storageRef);
    console.log('Image deleted successfully:', url);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw error for deletion failures
  }
};
