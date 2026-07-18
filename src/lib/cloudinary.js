// src/lib/cloudinary.js

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

// Helper to compute SHA-1 hash for signing Cloudinary requests
async function sha1(string) {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest('SHA-1', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Upload a file directly to Cloudinary from the client
 * @param {File} file The file to upload
 * @param {string} folder Optional folder path in Cloudinary
 * @returns {Promise<string>} The secure URL of the uploaded asset
 */
export const uploadToCloudinary = async (file, folder = 'portfolio') => {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are not configured in environment variables.');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // Parameters must be sorted alphabetically for signature
  const signatureParams = `folder=${folder}&timestamp=${timestamp}`;
  const signature = await sha1(signatureParams + apiSecret);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('folder', folder);
  formData.append('signature', signature);

  // Cloudinary endpoint (supports images, videos, raw files)
  const resourceType = file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : 'raw';
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to upload to Cloudinary');
  }

  const data = await response.json();
  return data.secure_url;
};
