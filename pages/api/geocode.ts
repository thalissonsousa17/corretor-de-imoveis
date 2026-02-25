import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        format: 'json',
        q: q,
        limit: 1,
      },
      headers: {
        'User-Agent': 'CorretorDeImoveisApp/1.0',
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error proxying geocode request:', error);
    res.status(500).json({ error: 'Failed to fetch geocode data' });
  }
}
