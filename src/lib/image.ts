/**
 * Compress and resize an image file to fit within localStorage limits.
 * Returns a base64 data URL, or throws if the image can't be processed.
 *
 * This module uses browser-only APIs (Image, Canvas, URL.createObjectURL)
 * and must only be imported from client components.
 */
export function compressImage(
  file: File,
  { maxWidth = 256, maxHeight = 256, quality = 0.7 } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    // Reject files over 20MB (browser may struggle to decode them)
    if (file.size > 20 * 1024 * 1024) {
      reject(new Error('Image is too large (max 20MB)'));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate scaled dimensions maintaining aspect ratio
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not create canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Use JPEG for smaller output (works well for photos)
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
