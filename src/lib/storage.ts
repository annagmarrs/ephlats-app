import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import imageCompression from 'browser-image-compression';

export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 800,
    useWebWorker: true,
  });
  const storageRef = ref(storage, `profilePhotos/${userId}/avatar.jpg`);
  await uploadBytes(storageRef, compressed, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}

export async function uploadGalleryPhoto(
  eventId: string,
  photoId: string,
  file: File
): Promise<{ photoUrl: string; thumbnailUrl: string; fileSize: number }> {
  // Full-size (max 1MB)
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });

  // Thumbnail (max 400px)
  const thumbnail = await imageCompression(file, {
    maxSizeMB: 0.1,
    maxWidthOrHeight: 400,
    useWebWorker: true,
  });

  const photoRef = ref(storage, `galleryPhotos/${eventId}/${photoId}.jpg`);
  const thumbRef = ref(storage, `galleryPhotos/${eventId}/thumb_${photoId}.jpg`);

  await Promise.all([
    uploadBytes(photoRef, compressed, { contentType: 'image/jpeg' }),
    uploadBytes(thumbRef, thumbnail, { contentType: 'image/jpeg' }),
  ]);

  const [photoUrl, thumbnailUrl] = await Promise.all([
    getDownloadURL(photoRef),
    getDownloadURL(thumbRef),
  ]);

  return { photoUrl, thumbnailUrl, fileSize: compressed.size };
}

export async function uploadMusicPdf(fileName: string, file: File): Promise<string> {
  const storageRef = ref(storage, `music/${fileName}`);
  await uploadBytes(storageRef, file, { contentType: 'application/pdf' });
  return getDownloadURL(storageRef);
}

export async function deleteStorageFile(path: string) {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

export function getStoragePathFromUrl(url: string): string | null {
  try {
    const decoded = decodeURIComponent(url);
    const match = decoded.match(/\/o\/(.+?)\?/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
