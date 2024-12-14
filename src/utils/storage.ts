import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { MessageAttachment } from '../types/messages';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

export class FileTooLargeError extends Error {
  constructor() {
    super('File size exceeds 10MB limit');
    this.name = 'FileTooLargeError';
  }
}

export class InvalidFileTypeError extends Error {
  constructor() {
    super('Invalid file type');
    this.name = 'InvalidFileTypeError';
  }
}

export async function uploadMessageAttachment(
  file: File,
  threadId: string,
  messageId: string
): Promise<MessageAttachment> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new FileTooLargeError();
  }

  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new InvalidFileTypeError();
  }

  // Generate a unique filename
  const timestamp = Date.now();
  const extension = file.name.split('.').pop();
  const filename = `${messageId}_${timestamp}.${extension}`;

  // Create storage reference
  const storageRef = ref(
    storage,
    `message-attachments/${threadId}/${filename}`
  );

  // Upload file
  await uploadBytes(storageRef, file);

  // Get download URL
  const url = await getDownloadURL(storageRef);

  // Return attachment metadata
  return {
    id: `${messageId}_${timestamp}`,
    type: file.type.startsWith('image/') ? 'image' : 'file',
    url,
    name: file.name,
    size: file.size
  };
}

export async function uploadMultipleAttachments(
  files: File[],
  threadId: string,
  messageId: string
): Promise<MessageAttachment[]> {
  const uploadPromises = files.map(file =>
    uploadMessageAttachment(file, threadId, messageId)
  );

  return Promise.all(uploadPromises);
}

export async function deleteMessageAttachment(
  threadId: string,
  filename: string
): Promise<void> {
  const storageRef = ref(
    storage,
    `message-attachments/${threadId}/${filename}`
  );

  try {
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

export function isImageFile(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.includes(file.type);
}

export function getFileIcon(fileType: string): string {
  // Return appropriate icon class based on file type
  if (fileType.startsWith('image/')) return 'image';
  if (fileType === 'application/pdf') return 'file-pdf';
  if (fileType.includes('word')) return 'file-word';
  return 'file';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
