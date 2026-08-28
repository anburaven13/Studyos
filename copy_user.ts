import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function copyUserData(fromEmail: string, toEmail: string) {
  try {
    console.log(`Starting copy from ${fromEmail} to ${toEmail}...`);

    // 1. Get Source User
    const sourceUsers = await sql`SELECT * FROM users WHERE email = ${fromEmail}`;
    if (sourceUsers.length === 0) {
      console.error(`Source user ${fromEmail} not found!`);
      return;
    }
    const sourceUser = sourceUsers[0];
    const sourceId = sourceUser.id;

    // 2. Get or Create Target User
    let targetUsers = await sql`SELECT * FROM users WHERE email = ${toEmail}`;
    let targetId;
    if (targetUsers.length === 0) {
      console.log(`Target user ${toEmail} not found. Creating...`);
      const inserted = await sql`
        INSERT INTO users (email, password_hash, class_level, board) 
        VALUES (${toEmail}, ${sourceUser.password_hash}, ${sourceUser.class_level}, ${sourceUser.board})
        RETURNING id
      `;
      targetId = inserted[0].id;
      console.log(`Created target user with ID: ${targetId}`);
    } else {
      targetId = targetUsers[0].id;
      console.log(`Target user found with ID: ${targetId}. Clearing old data to prevent duplicates...`);
      await sql`DELETE FROM routines WHERE user_id = ${targetId}`;
      await sql`DELETE FROM notes WHERE user_id = ${targetId}`;
      await sql`DELETE FROM exams WHERE user_id = ${targetId}`;
      await sql`DELETE FROM homework WHERE user_id = ${targetId}`;
      await sql`DELETE FROM planner_events WHERE user_id = ${targetId}`;
      await sql`DELETE FROM knowledge_dna WHERE user_id = ${targetId}`;
      await sql`DELETE FROM study_sessions WHERE user_id = ${targetId}`;
      await sql`DELETE FROM routine_progress WHERE user_id = ${targetId}`;
    }

    // 3. Copy Routines
    const routines = await sql`SELECT * FROM routines WHERE user_id = ${sourceId}`;
    for (const r of routines) {
      await sql`
        INSERT INTO routines (user_id, schedule) 
        VALUES (${targetId}, ${r.schedule})
      `;
    }
    console.log(`Copied ${routines.length} routines.`);

    // 4. Copy Notes
    const notes = await sql`SELECT * FROM notes WHERE user_id = ${sourceId}`;
    for (const n of notes) {
      await sql`
        INSERT INTO notes (user_id, title, content, folder, tags, created_at, updated_at) 
        VALUES (${targetId}, ${n.title}, ${n.content}, ${n.folder}, ${n.tags ? JSON.stringify(n.tags) : null}, ${n.created_at}, ${n.updated_at})
      `;
    }
    console.log(`Copied ${notes.length} notes.`);

    // 5. Copy Exams
    const exams = await sql`SELECT * FROM exams WHERE user_id = ${sourceId}`;
    for (const e of exams) {
      await sql`
        INSERT INTO exams (user_id, name, date, confidence, created_at) 
        VALUES (${targetId}, ${e.name}, ${e.date}, ${e.confidence}, ${e.created_at})
      `;
    }
    console.log(`Copied ${exams.length} exams.`);

    // 6. Copy Homework
    const homework = await sql`SELECT * FROM homework WHERE user_id = ${sourceId}`;
    for (const h of homework) {
      await sql`
        INSERT INTO homework (user_id, title, subject, due_date, completed, created_at) 
        VALUES (${targetId}, ${h.title}, ${h.subject}, ${h.due_date}, ${h.completed}, ${h.created_at})
      `;
    }
    console.log(`Copied ${homework.length} homework items.`);

    // 7. Copy Planner Events
    const planner = await sql`SELECT * FROM planner_events WHERE user_id = ${sourceId}`;
    for (const p of planner) {
      await sql`
        INSERT INTO planner_events (user_id, name, start_time, end_time, source, created_at) 
        VALUES (${targetId}, ${p.name}, ${p.start_time}, ${p.end_time}, ${p.source}, ${p.created_at})
      `;
    }
    console.log(`Copied ${planner.length} planner events.`);

    // 8. Copy Knowledge DNA
    const dna = await sql`SELECT * FROM knowledge_dna WHERE user_id = ${sourceId}`;
    for (const d of dna) {
      await sql`
        INSERT INTO knowledge_dna (
          user_id, source_id, concept_name, requires, leads_to, abstractness, 
          calculation_load, visualization_need, memory_difficulty, misconceptions, real_world_uses, created_at
        ) 
        VALUES (
          ${targetId}, ${d.source_id}, ${d.concept_name}, ${d.requires ? JSON.stringify(d.requires) : null}, 
          ${d.leads_to ? JSON.stringify(d.leads_to) : null}, ${d.abstractness}, ${d.calculation_load}, 
          ${d.visualization_need}, ${d.memory_difficulty}, ${d.misconceptions ? JSON.stringify(d.misconceptions) : null}, 
          ${d.real_world_uses ? JSON.stringify(d.real_world_uses) : null}, ${d.created_at}
        )
      `;
    }
    console.log(`Copied ${dna.length} Knowledge DNA items.`);

    // 9. Copy Study Sessions
    const sessions = await sql`SELECT * FROM study_sessions WHERE user_id = ${sourceId}`;
    for (const s of sessions) {
      await sql`
        INSERT INTO study_sessions (user_id, duration_minutes, date, created_at) 
        VALUES (${targetId}, ${s.duration_minutes}, ${s.date}, ${s.created_at})
      `;
    }
    console.log(`Copied ${sessions.length} study sessions.`);

    // 10. Copy Routine Progress
    const progress = await sql`SELECT * FROM routine_progress WHERE user_id = ${sourceId}`;
    for (const p of progress) {
      await sql`
        INSERT INTO routine_progress (
          user_id, date, progress, notified_blocks, upcoming_notified_blocks, agenda_sent, created_at
        ) 
        VALUES (
          ${targetId}, ${p.date}, ${p.progress ? JSON.stringify(p.progress) : null}, 
          ${p.notified_blocks ? JSON.stringify(p.notified_blocks) : '[]'}, 
          ${p.upcoming_notified_blocks ? JSON.stringify(p.upcoming_notified_blocks) : '[]'}, 
          ${p.agenda_sent}, ${p.created_at}
        )
      `;
    }
    console.log(`Copied ${progress.length} routine progress items.`);

    console.log('✅ User data successfully copied!');

  } catch (error) {
    console.error('Error copying data:', error);
  }
}

copyUserData('debg4171@gmail.com', 'keya.ghosh3110@gmail.com');
