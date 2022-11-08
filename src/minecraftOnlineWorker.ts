import { Config } from "./config.ts";

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
  console.log("Received new config in minecraftOnlineWorker");
  config = e.data;
};

// give plenty of time for the gateway to get connected
await sleep(30);

while (true) {
  if (config === undefined) {
    console.log(
      "Minecraft Online Worker does not have a config; waiting 5 seconds ...",
    );
    await sleep(5);
    continue;
  }
  console.log("Checking for Minecraft server player count");
  if (config.minecraftServer) {
    const count = await getOnlineCount(config);
    (self as unknown as Worker).postMessage(count);
  }
  await sleep(60 * 5); // 5 minutes
}
