// Web worker to watch the config.json file and
// send it to the main thread anew when changed.

import { loadConfig } from "./config.ts";
import { logger } from "./deps.ts";

const watcher = Deno.watchFs("./config.json");

for await (const event of watcher) {
  if (event.kind === "modify") {
    logger.info("Found config file edit; reloading");
    (self as unknown as Worker).postMessage(await loadConfig());
  }
}
