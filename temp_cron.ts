import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.POSTGRES_URL);

async function run() {
  try {
    const timeZone = 'Asia/Kolkata';
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone });
    const todayDate = new Date().toLocaleDateString('en-CA', { timeZone });
    const nowTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone });
    const nowTimeDate = new Date(new Date().toLocaleString('en-US', { timeZone }));

    const routines = await sql`
      SELECT r.user_id, r.schedule, u.email 
      FROM routines r
      JOIN users u ON u.id = r.user_id
    `;
    console.log(`Found ${routines.length} routines.`);

    for (const routine of routines) {
      console.log(`Processing routine for user ${routine.email}`);
      const todayBlocks = routine.schedule[todayName] || [];
      
      const yesterday = new Date();
      const yesterdayDateObj = new Date(new Date().toLocaleString('en-US', { timeZone }));
      yesterdayDateObj.setDate(yesterdayDateObj.getDate() - 1);
      const yesterdayName = yesterdayDateObj.toLocaleDateString('en-US', { weekday: 'long' });
      const yesterdayDateStr = yesterdayDateObj.toLocaleDateString('en-CA');
      const yesterdayBlocks = routine.schedule[yesterdayName] || [];

      const missedBlocks = todayBlocks.filter((block) => {
        if (block.start > block.end) return false;
        return block.end < nowTime;
      }).map((b) => ({ ...b, targetDate: todayDate }));

      const upcomingBlocks = todayBlocks.filter((block) => {
        const [hours, minutes] = block.start.split(':').map(Number);
        const blockStartDate = new Date(nowTimeDate);
        blockStartDate.setHours(hours, minutes, 0, 0);
        
        const diffMs = blockStartDate.getTime() - nowTimeDate.getTime();
        const diffMins = diffMs / 60000;
        
        return diffMins > 0 && diffMins <= 10;
      });

      const yesterdayMissedBlocks = yesterdayBlocks.filter((block) => {
        if (block.start > block.end) {
          return block.end < nowTime;
        }
        return false;
      }).map((b) => ({ ...b, targetDate: yesterdayDateStr }));

      const allMissedBlocks = [...missedBlocks, ...yesterdayMissedBlocks];
      console.log(`User ${routine.email}: ${missedBlocks.length} missed today, ${yesterdayMissedBlocks.length} missed yesterday, ${upcomingBlocks.length} upcoming`);

      if (allMissedBlocks.length > 0 || upcomingBlocks.length > 0) {
        const todayProgressRes = await sql`SELECT progress, notified_blocks, upcoming_notified_blocks FROM routine_progress WHERE user_id = ${routine.user_id} AND date = ${todayDate}`;
        const yesterdayProgressRes = await sql`SELECT progress, notified_blocks, upcoming_notified_blocks FROM routine_progress WHERE user_id = ${routine.user_id} AND date = ${yesterdayDateStr}`;
        
        let progressMapToday = todayProgressRes.length > 0 ? (todayProgressRes[0].progress || {}) : {};
        let notifiedListToday = todayProgressRes.length > 0 ? (todayProgressRes[0].notified_blocks || []) : [];
        let upcomingNotifiedListToday = todayProgressRes.length > 0 ? (todayProgressRes[0].upcoming_notified_blocks || []) : [];
        
        let progressMapYesterday = yesterdayProgressRes.length > 0 ? (yesterdayProgressRes[0].progress || {}) : {};
        let notifiedListYesterday = yesterdayProgressRes.length > 0 ? (yesterdayProgressRes[0].notified_blocks || []) : [];

        console.log(`todayProgressRes type:`, typeof notifiedListToday, Array.isArray(notifiedListToday) ? 'Array' : notifiedListToday);

        let updatedToday = false;
        let updatedYesterday = false;

        for (const block of allMissedBlocks) {
          const isYesterday = block.targetDate === yesterdayDateStr;
          const progressMap = isYesterday ? progressMapYesterday : progressMapToday;
          let notifiedList = isYesterday ? notifiedListYesterday : notifiedListToday;

          // Note: we purposely log error if .push fails
          if (!progressMap[block.id] && !notifiedList.includes(block.id)) {
            console.log(`Would send missed email for ${block.title}`);
            notifiedList.push(block.id);
          }
        }

        for (const block of upcomingBlocks) {
          if (!upcomingNotifiedListToday.includes(block.id)) {
            console.log(`Would send upcoming email for ${block.title}`);
            upcomingNotifiedListToday.push(block.id);
          }
        }
      }
    }
    console.log("Done");
  } catch(e) {
    console.error(e);
  }
}
run();
