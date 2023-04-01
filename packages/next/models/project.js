import prisma from "@/lib/prisma";
import * as COMMANDS from "@/lib/commands";
import * as EVENTS from "@/lib/events";
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const execCommand = (project, command, data) => {
  const handler = COMMANDS[command];
  if (!handler) throw new Error(`Command ${command} not found`);
  const events = []
  const addEvent = (type, data) => { events.push({ type, data }); }

  const success = handler(data, addEvent, project, null);
  // match false specifically, because we want to allow undefined to be returned
  if (success === false) return null;
  return events;
}

const reduceProject = (project, event) => {
  const reducer = EVENTS[event.eventType];
  if (!reducer) throw new Error(`Reducer ${event.eventType} not found`);
  return reducer(project, JSON.parse(event.eventData));
}

export async function eventsSince(shortcode, version) {
  const eventsSince = await prisma.projectEvent.findMany({
    where: { shortcode, version: { gt: version || 0 } },
    orderBy: { version: 'asc' },
  });
  return eventsSince;
}

export async function getProject(shortcode) {
  const snapshot = await prisma.projectSnapshot.findUnique({
    where: { shortcode },
  });
  const eventsSince = await prisma.projectEvent.findMany({
    where: { shortcode, version: { gt: snapshot?.version || 0 } },
    orderBy: { version: 'asc' },
  });


  const project = eventsSince.reduce(reduceProject, snapshot?.data || {});
  project.version = snapshot?.version || eventsSince.length;
  return project;
}

export async function runAndSave(shortcode, commands) {
  for (let i = 0; i < 100; i++) {
    try {
      const project = await getProject(shortcode);
      if (!project && !commands.find(c => c.command === 'createProject')) {
        throw new Error('Project not found');
      }

      const newEvents = []
      commands.forEach((cmd) => {
        const { command, data } = cmd;
        const es = execCommand(project, command, data)
        if (es) newEvents.push(...es);
      });
      console.log('newevents', newEvents.length);
      if (!newEvents || !newEvents.length) return;

      await insertEvents(shortcode, project.version || 0, newEvents);

      return newEvents;
    } catch (e) { 
      console.log(e);
    }
  }

  throw new Error('Failed to save events');
}

export async function insertEvents(shortcode, expectedVersion, events) {
  const db = await open({
    filename: '/data/dev.db',
    driver: sqlite3.Database,
  });

  const placeholders = events
    .map(() => '(?, ?, ?)')
    .join(', ');

  const eventData = (events || []).flatMap((event, idx) => [
    event.type,
    JSON.stringify(event.data),
    idx + 1,
  ]);

const sql = `
WITH new_events (event_type, event_data, idx) AS (
  VALUES ${placeholders}
),
max_versions AS (
  SELECT shortcode, COALESCE(MAX(version), 0) as max_version
  FROM ProjectEvent
  WHERE shortcode = ?
  GROUP BY shortcode

  UNION ALL

  SELECT ? as shortcode, 0 as max_version
  WHERE NOT EXISTS (
    SELECT 1
    FROM ProjectEvent
    WHERE shortcode = ?
  )
),
events_with_shortcode_and_version AS (
  SELECT ? as shortcode, new_events.event_type, new_events.event_data, new_events.idx, max_versions.max_version + new_events.idx as new_version
  FROM new_events, max_versions
)
INSERT INTO ProjectEvent (shortcode, eventType, eventData, version)
SELECT
  events_with_shortcode_and_version.shortcode,
  events_with_shortcode_and_version.event_type,
  events_with_shortcode_and_version.event_data,
  events_with_shortcode_and_version.new_version
FROM events_with_shortcode_and_version
INNER JOIN max_versions ON events_with_shortcode_and_version.shortcode = max_versions.shortcode AND events_with_shortcode_and_version.new_version = max_versions.max_version + events_with_shortcode_and_version.idx
WHERE max_versions.max_version = ?;
`;

  const result = await db.run(sql, [...eventData, shortcode, shortcode, shortcode, shortcode, expectedVersion])
  if (result.changes !== events.length) {
    throw new Error(`Expected ${events.length} events to be inserted, but ${result.changes} were inserted`);
  }
  await db.close();
}



// const INSERT_QUERY = `
// WITH new_events (event_type, event_data, idx) AS (
//   VALUES (
//     ('updateProjectName', '{"name":"test"}', 1),
//     ('addUnit', '{"id":"uuid","name":"test"}', 2)
//   )
// ),
// max_versions AS (
//   SELECT shortcode, COALESCE(MAX(version), 0) as max_version
//   FROM projectEvents
//   WHERE shortcode = ?
//   GROUP BY shortcode
// ),
// events_with_shortcode_and_version AS (
//   SELECT ?, new_events.event_type, new_events.event_data, new_events.idx, max_versions.max_version + new_events.idx as new_version
//   FROM new_events, max_versions
// )
// INSERT INTO projectEvent (shortcode, eventType, eventData, version)
// SELECT
//   events_with_shortcode_and_version.shortcode,
//   events_with_shortcode_and_version.event_type,
//   events_with_shortcode_and_version.event_data,
//   events_with_shortcode_and_version.new_version
// FROM events_with_shortcode_and_version
// WHERE max_versions.max_version = ?;
// `;

// export async function insertEvents(shortcode, latestVersion, events) {

// }

// export async function updateProjectWithRetry(shortcode, commandName, data) {
//   for (let i = 0; i < 10; i++) {
//     try {
//       let latestProject = await prisma.project.findFirst({
//         where: { shortcode },
//         orderBy: { version: 'desc' },
//         select: { version: true, data: true },
//       });

//       if (!latestProject) {
//         throw new Error(`Project with shortcode '${shortcode}' not found`);
//       }

//       const latestData = JSON.parse(latestProject.data || "{}");
//       const newEvents = execCommand(latestData, commandName, data);
//       if (!newEvents) {
//         throw new Error(`Command '${commandName}' failed`);
//       }

//       const newData = newEvents.reduce(reduceProject, latestData);

//       const prevVersion = latestProject.version;
//       const newVersion = prevVersion + 1;

//       const result = await prisma.$executeRaw`
//         UPDATE Project as p
//         SET data = '${JSON.stringify(newData)}',
//             version = ${newVersion}
//         WHERE p.shortcode = '${shortcode}'
//           AND p.version = ${prevVersion}
//           AND ${newVersion} = p.version + 1;
//       `;

//       if (result.affectedRows === 1) {
//         const updatedProject = await prisma.project.findUnique({ where: { shortcode } });
//         return updatedProject;
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   throw new Error(`Failed to update project with shortcode '${shortcode}' after 10 attempts`);
// }
