import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  StorageReference,
} from 'firebase/storage';
import { storage } from '../../config/firebase';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface UploadResult {
  url: string;
  path: string;
  filename: string;
}

// Helper function to generate a unique filename
const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
};

// Helper function to validate file
const validateFile = (file: File, allowedTypes: string[] = ALLOWED_IMAGE_TYPES): void => {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
};

// Upload a single file
export const uploadFile = async (
  file: File,
  path: string,
  customFilename?: string
): Promise<UploadResult> => {
  try {
    validateFile(file);

    const filename = customFilename || generateUniqueFilename(file.name);
    const fullPath = `${path}/${filename}`;
    const storageRef = ref(storage, fullPath);

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    return {
      url,
      path: fullPath,
      filename
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Upload multiple files
export const uploadFiles = async (
  files: File[],
  path: string
): Promise<UploadResult[]> => {
  try {
    const uploadPromises = files.map(file => uploadFile(file, path));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
};

// Delete a file
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Delete multiple files
export const deleteFiles = async (paths: string[]): Promise<void> => {
  try {
    const deletePromises = paths.map(path => deleteFile(path));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting files:', error);
    throw error;
  }
};

// List all files in a directory
export const listFiles = async (path: string): Promise<string[]> => {
  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    const urls = await Promise.all(result.items.map(item => getDownloadURL(item)));
    return urls;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

// Get download URL for a file
export const getFileUrl = async (path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

// Upload a profile image with automatic resizing
export const uploadProfileImage = async (
  file: File,
  userId: string
): Promise<UploadResult> => {
  try {
    validateFile(file);

    // Here you would typically resize the image before uploading
    // For now, we'll just upload the original
    const path = `users/${userId}/profile`;
    const filename = 'profile.jpg';
    
    return await uploadFile(file, path, filename);
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

// Upload portfolio images with automatic resizing
export const uploadPortfolioImages = async (
  files: File[],
  artistId: string
): Promise<UploadResult[]> => {
  try {
    files.forEach(file => validateFile(file));

    // Here you would typically resize the images before uploading
    // For now, we'll just upload the originals
    const path = `artists/${artistId}/portfolio`;
    
    return await uploadFiles(files, path);
  } catch (error) {
    console.error('Error uploading portfolio images:', error);
    throw error;
  }
};

// Upload product images with automatic resizing
export const uploadProductImages = async (
  files: File[],
  productId: string
): Promise<UploadResult[]> => {
  try {
    files.forEach(file => validateFile(file));

    // Here you would typically resize the images before uploading
    // For now, we'll just upload the originals
    const path = `products/${productId}`;
    
    return await uploadFiles(files, path);
  } catch (error) {
    console.error('Error uploading product images:', error);
    throw error;
  }
};
