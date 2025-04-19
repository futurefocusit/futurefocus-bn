import { Response, NextFunction } from 'express';

import API from '../models/API';

export const authenticateAPI = async (req: any, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    const secretKey = req.headers['x-secret-key'] as string;

    if (!apiKey || !secretKey) {
      return res.status(401).json({ message: 'API credentials are required.' });
    }

    const apiRecord = await API.findOne({
      api_key: apiKey,
      secret_key: secretKey
    }).populate('inst');

    if (!apiRecord) {
      return res.status(403).json({ message: 'Invalid API credentials.' });
    }

    // Attach to request for downstream use
    req.api = {
      apiId: apiRecord._id,
      institution: apiRecord.inst
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
