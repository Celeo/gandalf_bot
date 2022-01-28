// Web worker to watch the config.json file and
// send it to the main thread anew when changed.

import { loadConfig } from "./config.ts";

const watcher = Deno.watchFs("./config.json");

for await (const event of watcher) {
  if (event.kind === "modify") {
    console.log("Found config file edit; reloading");
    (self as unknown as Worker).postMessage(await loadConfig());
  }
}
