const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_RAW_FILE_BYTES = 8 * 1024 * 1024; // 8 MB
const TARGET_MAX_DIMENSION = 600;

export interface ProcessedImageResult {
  ok: boolean;
  blob?: Blob;
  previewDataUrl?: string;
  error?: string;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const lowerName = file.name.toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const hasValidMime = ALLOWED_IMAGE_TYPES.has(file.type.toLowerCase());

  if (!hasValidMime && !hasValidExt) {
    return {
      valid: false,
      error: 'Unsupported image format. Please choose a JPG, JPEG, PNG, or WebP file.',
    };
  }
  if (file.size <= 0) {
    return {
      valid: false,
      error: 'The selected image file appears to be empty.',
    };
  }
  if (file.size > MAX_RAW_FILE_BYTES) {
    return {
      valid: false,
      error: 'Image exceeds the 8 MB upload limit. Please select a smaller file.',
    };
  }
  return { valid: true };
}

export async function processProfileImage(file: File): Promise<ProcessedImageResult> {
  const check = validateImageFile(file);
  if (!check.valid) {
    return { ok: false, error: check.error };
  }

  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('Unable to read image data.'));
      };
      reader.onerror = () => reject(new Error('Failed to read selected file.'));
      reader.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () =>
        reject(new Error('The selected file could not be decoded as an image.'));
      image.src = dataUrl;
    });

    const scale = Math.min(
      1,
      TARGET_MAX_DIMENSION / Math.max(img.naturalWidth || 1, img.naturalHeight || 1)
    );
    const targetWidth = Math.max(1, Math.round(img.naturalWidth * scale));
    const targetHeight = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { ok: false, error: 'Browser canvas is unavailable for image processing.' };
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const outputMime =
      file.type === 'image/png' ? 'image/png' : 'image/jpeg';

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), outputMime, 0.88);
    });

    if (!blob) {
      return { ok: false, error: 'Image compression failed in this browser.' };
    }

    const previewDataUrl = canvas.toDataURL(outputMime, 0.88);

    return {
      ok: true,
      blob,
      previewDataUrl,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : 'Unable to process the selected image file.',
    };
  }
}
