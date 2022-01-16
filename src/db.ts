import {
  Database,
  DataTypes,
  Model,
  ModelFields,
  SQLite3Connector,
} from "./deps.ts";

/**
 * Database ORM object.
 */
export const db = new Database(
  new SQLite3Connector({ filepath: "./roles.db" }),
);

/**
 * Role DB model.
 */
export class Role extends Model {
  static table = "role_config";
  static timestamps = false;

  static fields: ModelFields = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    channel_id: {
      type: DataTypes.BIG_INTEGER,
      allowNull: false,
    },
    message_id: {
      type: DataTypes.BIG_INTEGER,
      allowNull: false,
    },
    emoji_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    role_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  };
}

/**
 * Just the types for the `Role` DB model.
 */
export interface RoleModel {
  id: number;
  channel_id: bigint;
  message_id: bigint;
  emoji_name: string;
  role_name: string;
}

// connect the model to the DB instance.
db.link([Role]);

/**
 * Drop the database and create new tables.
 */
export async function databaseSetup() {
  await db.sync({ drop: true });
}

/**
 * Get all entries from the database.
 */
export async function getAllRoles(): Promise<Array<RoleModel>> {
  return (await Role.all()) as Array<unknown> as Array<
    RoleModel
  >;
}
