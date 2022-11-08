// Web worker to wait for people's birthdays,
// and send a message back to the main thread
// so a message can be posted to Discord.

import { Config } from "./config.ts";

/**
 * Sleep for a number of seconds.
 */
function sleep(seconds: number): Promise<(() => Promise<void>)> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

let config: Config | undefined;
const mentioned: Record<string, Array<number>> = {};

(self as unknown as Worker).onmessage = (e: MessageEvent<Config>) => {
  console.log("Received new config in birthdaysWorker");
  config = e.data;
};

// give plenty of time for the gateway to get connected
await sleep(30);

while (true) {
  if (config === undefined) {
    await sleep(5);
    continue;
  }
  console.log("Checking for birthdays");
  if (config.birthdays.length > 0) {
    const date = new Date(new Date().getTime() - (8 * 1000 * 60 * 60)); // PST offset
    const dateMatch = `${date.getMonth() + 1}/${date.getDate()}`;
    for (const birthday of config.birthdays) {
      if (birthday.when === dateMatch) {
        if (
          birthday.who in mentioned &&
          mentioned[birthday.who].includes(date.getFullYear())
        ) {
          // already done this year for this person
          continue;
        }
        (self as unknown as Worker).postMessage(birthday.who);
        if (birthday.who in mentioned) {
          mentioned[birthday.who].push(date.getFullYear());
        } else {
          mentioned[birthday.who] = [date.getFullYear()];
        }
      }
    }
  }
  await sleep(60 * 60 * 3); // 3 hours
}
