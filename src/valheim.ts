import { Config } from "./config.ts";
import { ensureDir, logger } from "./deps.ts";

const VALHEIM_BACKUP_DIR = "valheim_backups";

export enum InstanceStatus {
  Online = "active",
  OnlineEmpty = "empty",
  Saving = "saving",
  Offline = "shutdown",
  ServerStarting = "init",
  GameStarting = "booted",
  GameStarted = "started",
}

/**
 * Data returned for a server.
 */
export type ServiceInfo = {
  "instance/init-date": string;
  "instance/cloud-dns": string;
  "world/active": boolean;
  "world/id": number;
  "instance/started-date": string;
  "user/balance": number;
  "user/id": number;
  "world/price": number;
  "world/created-date": string;
  "instance/modified-date": string;
  "world/game-config": {
    "serverpassword": string;
    "filebrowser": boolean;
    "servername": string;
    "gameworld": string;
    "crossplay": false;
  };
  "world/game-type": string;
  "world/server-password": null;
  "instance/cloud-ip4": string;
  "instance/status": InstanceStatus;
  "world/filespace-id": number;
  "instance/alive-date": string;
  "world/region": string;
  "instance/id": number;
  "world/name": string;
};

/**
 * Get the status of the configured Valheim server.
 */
export async function getInstanceStatus(
  config: Config,
): Promise<ServiceInfo> {
  logger.debug("Getting Valheim server status");
  const response = await fetch(
    `https://api.ggod.io/api/worlds/${config.valheim.server}`,
    {
      headers: {
        "authorization":
          `Auth-ggod token=undefined password=${config.valheim.password}`,
      },
    },
  );
  if (response.status !== 200) {
    throw Error(`Server info - got status ${response.status}`);
  }
  return response.json();
}

/**
 * Send a command to start the configured Valheim server.
 *
 * Does not perform a check of the server status; that should
 * be done beforehand, and be aware of race conditions.
 */
export async function startServer(config: Config): Promise<void> {
  logger.debug("Starting Valheim server");
  const response = await fetch(
    `https://api.ggod.io/api/worlds/${config.valheim.server}/_start`,
    {
      method: "POST",
      headers: {
        "authorization":
          `Auth-ggod token=undefined password=${config.valheim.password}`,
      },
    },
  );
  if (response.status !== 200) {
    throw Error(`Server start - got status ${response.status}`);
  }
}

/**
 * Send a command to stop the configured Valheim server.
 *
 * Does not perform a check of the server status; that should
 * be done beforehand, and be aware of race conditions.
 */
export async function stopServer(config: Config): Promise<void> {
  logger.debug("Stopping Valheim server");
  const response = await fetch(
    `https://api.ggod.io/api/worlds/${config.valheim.server}/_stop`,
    {
      method: "POST",
      headers: {
        "authorization":
          `Auth-ggod token=undefined password=${config.valheim.password}`,
      },
    },
  );
  if (response.status !== 200) {
    throw Error(`Server start - got status ${response.status}`);
  }
}

/**
 * Send web requests to download the server's files to
 * the local directory, serving as a backup.
 */
export async function backupServer(config: Config): Promise<void> {
  logger.debug("Backing up Valheim server files");
  await ensureDir(`./${VALHEIM_BACKUP_DIR}`);
  const timestamp = new Date().getTime();

  /* get the server data */

  const status = await getInstanceStatus(config);
  const serverName = status["world/name"] as string;
  const fileSpaceId = status["world/filespace-id"] as number;

  /* handle the DB file */

  const fileDbResponse = await fetch(
    `https://api.ggod.io/api/filespace/${fileSpaceId}`,
    {
      method: "POST",
      body: JSON.stringify({
        "filespace/filename": `save/${serverName}.db`,
        "filespace/operation": "download",
      }),
      headers: {
        authorization: `Auth-ggod token=${config.valheim.authToken}`,
        "content-type": "application/json",
      },
    },
  );
  if (fileDbResponse.status !== 200) {
    throw Error(`DB file info - got status ${fileDbResponse.status}`);
  }
  const dbFileUrl = (await fileDbResponse.json())["url"] as string;

  const fileDbDataResponse = await fetch(dbFileUrl);
  if (fileDbDataResponse.status !== 200) {
    logger.debug(await fileDbDataResponse.text());
    throw Error(`DB file download - got status ${fileDbDataResponse.status}`);
  }
  logger.debug("Writing DB file to disk");
  await Deno.writeFile(
    `./${VALHEIM_BACKUP_DIR}/${timestamp}.db`,
    new Uint8Array(await fileDbDataResponse.arrayBuffer()),
  );
  /* handle the FWL file */

  const fileFwlResponse = await fetch(
    `https://api.ggod.io/api/filespace/${fileSpaceId}`,
    {
      method: "POST",
      body: JSON.stringify({
        "filespace/filename": `save/${serverName}.fwl`,
        "filespace/operation": "download",
      }),
      headers: {
        authorization: `Auth-ggod token=${config.valheim.authToken}`,
        "content-type": "application/json",
      },
    },
  );
  if (fileFwlResponse.status !== 200) {
    throw Error(`FWL file info - got status ${fileFwlResponse.status}`);
  }
  const fwlFileUrl = (await fileFwlResponse.json())["url"] as string;

  const fileFwlDataResponse = await fetch(fwlFileUrl);
  if (fileFwlDataResponse.status !== 200) {
    logger.debug(await fileFwlDataResponse.text());
    throw Error(`FWL file download - got status ${fileFwlDataResponse.status}`);
  }
  logger.debug("Writing DB file to disk");
  await Deno.writeFile(
    `./${VALHEIM_BACKUP_DIR}/${timestamp}.fwl`,
    new Uint8Array(await fileFwlDataResponse.arrayBuffer()),
  );

  logger.info("Valheim backup successful");
}
