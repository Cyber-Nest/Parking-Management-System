import { Router } from 'express';
import { uploadMediaFile } from '../controllers/media.controller';
import { getCloudinarySetupError, isCloudinaryConfigured } from '../services/cloudinary.service';

const router = Router();

router.get('/status', (_req, res) => {
  const setupError = getCloudinarySetupError();
  res.json({
    success: true,
    data: {
      configured: isCloudinaryConfigured(),
      ready: !setupError,
      message: setupError,
    },
  });
});

router.post('/upload', uploadMediaFile);

export default router;
