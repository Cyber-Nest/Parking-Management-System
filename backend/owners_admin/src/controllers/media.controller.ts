import { Request, Response } from 'express';
import { uploadMedia, uploadMediaList } from '../services/cloudinary.service';
import { NotFoundError, ValidationError } from '../services/commonErrors';

const handleError = (err: unknown, res: Response): void => {
  if (err instanceof ValidationError || err instanceof NotFoundError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error('[MediaController] Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
};

export const uploadMediaFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = String(req.body?.file ?? req.body?.photo ?? req.body?.media ?? '').trim();
    const files = Array.isArray(req.body?.files) ? req.body.files : null;
    const folder = String(req.body?.folder ?? '').trim() || undefined;
    const label = String(req.body?.label ?? 'Media').trim();

    if (files?.length) {
      const urls = await uploadMediaList(
        files.map((item: unknown) => String(item)),
        { folder },
      );
      res.status(201).json({
        success: true,
        message: 'Media uploaded to Cloudinary',
        data: { urls, label },
      });
      return;
    }

    if (!file) {
      res.status(400).json({ success: false, message: 'file or files is required' });
      return;
    }

    const url = await uploadMedia(file, { folder });
    res.status(201).json({
      success: true,
      message: 'Media uploaded to Cloudinary',
      data: {
        url,
        photoUrl: url,
        label,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    handleError(err, res);
  }
};
