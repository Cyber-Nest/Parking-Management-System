/**
 * Verify Cloudinary credentials: node scripts/test-cloudinary.js
 * Requires CLOUDINARY_CLOUD_NAME (or CLOUDINARY_URL) in .env
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { v2: cloudinary } = require('cloudinary');

const url = process.env.CLOUDINARY_URL;
if (url) {
  cloudinary.config({ secure: true });
} else {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!name || !key || !secret) {
    console.error('Missing Cloudinary env. Set CLOUDINARY_URL or CLOUDINARY_* vars in .env');
    process.exit(1);
  }
  if (/your[_\s-]*cloud/i.test(name) || name === 'YOUR_CLOUD_NAME') {
    console.error(
      'CLOUDINARY_CLOUD_NAME is still a placeholder. Copy your cloud name from https://console.cloudinary.com (Dashboard → Product Environment).',
    );
    process.exit(1);
  }
  cloudinary.config({ cloud_name: name, api_key: key, api_secret: secret, secure: true });
}

const tiny =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

cloudinary.uploader
  .upload(tiny, { folder: 'parksmart/test', public_id: `test_${Date.now()}` })
  .then((r) => {
    console.log('OK — uploaded to:', r.secure_url);
    process.exit(0);
  })
  .catch((e) => {
    console.error('Cloudinary test failed:', e.message || e);
    process.exit(1);
  });
