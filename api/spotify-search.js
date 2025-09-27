import { getUncachableSpotifyClient } from "../server/spotify.js";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: "Search query required" });
    }
    
    const spotify = await getUncachableSpotifyClient();
    const results = await spotify.search(q, ['track'], 'US', 20);
    
    return res.json(results);
  } catch (error) {
    console.error('Spotify search error:', error);
    return res.status(500).json({ error: "Failed to search Spotify" });
  }
}