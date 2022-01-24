import { DB } from "./deps.ts";

const SQL_CREATE_TABLE = `
CREATE TABLE IF NOT EXISTS role_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id INTEGER NOT NULL,
  message_id INTEGER NOT NULL,
  emoji_name TEXT NOT NULL,
  role_name TEXT NOT NULL
)`;
const SQL_RETRIEVE_ITEMS = `SELECT * FROM role_config`;

/**
 * Just the types for the `Role` DB model.
 */
export interface Role {
  id: number;
  channel_id: bigint;
  message_id: bigint;
  emoji_name: string;
  role_name: string;
}

function getDB(): DB {
  return new DB("./roles.db");
}

/**
 * Drop the database and create new tables.
 */
export function databaseSetup() {
  const db = getDB();
  db.query(SQL_CREATE_TABLE);
  db.close();
}

/**
 * Get all entries from the database.
 */
export function getAllRoles(): Array<Role> {
  const db = getDB();
  const roles: Array<Role> = [];
  for (const row of db.query(SQL_RETRIEVE_ITEMS)) {
    roles.push({
      id: row[0] as number,
      channel_id: row[1] as bigint,
      message_id: row[2] as bigint,
      emoji_name: row[3] as string,
      role_name: row[4] as string,
    });
  }
  db.close();
  return roles;
}
