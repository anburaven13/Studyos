import { dbConnections } from './api/db';

async function check() {
  const email = 'keya.ghosh3110@gmail.com';
  
  for(let i = 0; i < dbConnections.length; i++) {
    try {
      const res = await dbConnections[i]`SELECT id FROM users WHERE email=${email}`;
      if (res.length > 0) {
        const userId = res[0].id;
        const exams = await dbConnections[i]`SELECT count(*) FROM exams WHERE user_id=${userId}`;
        const homework = await dbConnections[i]`SELECT count(*) FROM homework WHERE user_id=${userId}`;
        const routines = await dbConnections[i]`SELECT count(*) FROM routines WHERE user_id=${userId}`;
        console.log(`DB ${i} (user_id: ${userId}): Exams=${exams[0].count}, Homework=${homework[0].count}, Routines=${routines[0].count}`);
      }
    } catch (e: any) {}
  }
  process.exit(0);
}

check();
