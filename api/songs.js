import { storage } from "../server/storage.js";
import { insertSongSchema } from "../shared/schema.js";
import { getUncachableSpotifyClient, convertSpotifyTrackToSong, getTrackAudioFeatures } from "../server/spotify.js";

export default async function handler(req, res) {
  const { method, query, body } = req;

  try {
    if (method === 'GET') {
      // Handle GET /api/songs and GET /api/songs/:id
      const { id } = query;
      
      if (id) {
        // GET /api/songs/:id
        const song = await storage.getSong(id);
        if (!song) {
          return res.status(404).json({ error: "Song not found" });
        }
        return res.json(song);
      } else {
        // GET /api/songs with search/filters
        const { q, genre, difficulty, artist } = query;
        const searchQuery = typeof q === 'string' ? q : '';
        
        const filters = {
          genre: typeof genre === 'string' ? genre : undefined,
          difficulty: typeof difficulty === 'string' ? parseInt(difficulty) : undefined,
          artist: typeof artist === 'string' ? artist : undefined,
        };
        
        const songs = await storage.searchSongs(searchQuery, filters);
        return res.json(songs);
      }
    }

    if (method === 'POST') {
      // Handle POST /api/songs
      const validatedData = insertSongSchema.parse(body);
      const song = await storage.createSong(validatedData);
      return res.json(song);
    }

    if (method === 'PATCH') {
      // Handle PATCH /api/songs/:id
      const { id } = query;
      const updated = await storage.updateSong(id, body);
      if (!updated) {
        return res.status(404).json({ error: "Song not found" });
      }
      return res.json(updated);
    }

    if (method === 'DELETE') {
      // Handle DELETE /api/songs/:id
      const { id } = query;
      const deleted = await storage.deleteSong(id);
      if (!deleted) {
        return res.status(404).json({ error: "Song not found" });
      }
      return res.json({ success: true });
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).json({ error: `Method ${method} not allowed` });

  } catch (error) {
    console.error('Songs API error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
}