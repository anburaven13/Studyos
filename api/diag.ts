import { dbConnections } from './db.js';
import express from 'express';

export default function mountDiagnostics(app: express.Application) {
  app.get('/api/diag', async (req, res) => {
    try {
      const url1 = process.env.DATABASE_URL_1 ? "SET" : "NOT_SET";
      const pgUrl = process.env.POSTGRES_URL ? "SET" : "NOT_SET";
      const connections = dbConnections.length;
      
      const db0Users = connections > 0 ? await dbConnections[0]`SELECT email FROM users WHERE email LIKE '%keya%'` : [];
      const db1Users = connections > 1 ? await dbConnections[1]`SELECT email FROM users WHERE email LIKE '%keya%'` : [];
      
      res.json({
        url1,
        pgUrl,
        connections,
        db0: db0Users,
        db1: db1Users
      });
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });
}
