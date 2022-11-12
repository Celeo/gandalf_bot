import { Config } from "./config.ts";
import { logger } from "./deps.ts";

/**
 * Response format from external website.
 */
interface ApiResponse {
  description: string;
  enforcesSecureChat: boolean;
  favicon: string;
  players: {
    max: number;
    online: number;
  };
  version: {
    name: string;
    protocol: number;
  };
}

/**
 * Get the number of players current online on the server.
 */
async function getOnlineCount(config: Config): Promise<number> {
  const url =
    `https://minecraft-api.com/api/ping/${config.minecraftServer}/443/json`;
  const resp = await fetch(url);
  const data: ApiResponse = await resp.json();
  return data.players.online;
}

/**
 * Sleep for a number of seconds.
 */
function sleep(seconds: number): Promise<(() => Promise<void>)> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

let config: Config | undefined;

(self as unknown as Worker).onmessage = (e: MessageEvent<Config>) => {
  logger.debug("Received new config in minecraftOnlineWorker");
  config = e.data;
};

// give plenty of time for the gateway to get connected
await sleep(30);

while (true) {
  if (config === undefined) {
    await sleep(5);
    continue;
  }
  if (config.minecraftServer) {
    const count = await getOnlineCount(config);
    (self as unknown as Worker).postMessage(count);
  }
  await sleep(60 * 10); // 10 minutes
}
