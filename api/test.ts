import { dbConnections } from './api/db.js';
import express from 'express';

export default function mountTest(app: express.Application) {
  app.get('/api/test-db0', async (req, res) => {
    try {
      if (!dbConnections || dbConnections.length === 0) {
        return res.json({ err: "No DB connections" });
      }
      const users = await dbConnections[0]`SELECT id, email, class_level FROM users WHERE email LIKE '%keya%'`;
      res.json({ db0_ok: true, users });
    } catch(e: any) {
      res.json({ err: e.message });
    }
  });
}
