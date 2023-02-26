import { Config } from "./config.ts";
import { logger } from "./deps.ts";

/**
 * Sleep for a number of seconds.
 */
function sleep(seconds: number): Promise<(() => Promise<void>)> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

let config: Config | undefined;
const reminded: Array<number> = [];

(self as unknown as Worker).onmessage = (e: MessageEvent<Config>) => {
  logger.debug("Received new config in bookReminderWorker");
  config = e.data;
};

// give plenty of time for the gateway to get connected
await sleep(30);

while (true) {
  if (config === undefined) {
    await sleep(5);
    continue;
  }
  logger.debug("Checking for book reminders");
  if (config.bookChannel && config.bookReminders.length > 0) {
    const date = new Date(new Date().getTime() - (8 * 1000 * 60 * 60)); // PST offset
    const day = date.getDate();
    if (config.bookReminders.includes(day)) {
      if (reminded.includes(day)) {
        // already reminded this day
        continue;
      }
      const index = config.bookReminders.indexOf(day);
      let message;
      switch (index) {
        case 0: {
          message = "First book reminder! 25% of the way through the month.";
          break;
        }
        case 1: {
          message = "Second book reminder! Halfway through the month.";
          break;
        }
        case 2: {
          message = "Third book reminder! 75% through the month!";
          break;
        }
        case 3: {
          message = "Last book reminder! Finish by tomorrow!";
          break;
        }
      }
      (self as unknown as Worker).postMessage(message);
      reminded.push(day);
    }
  }
  await sleep(60 * 60 * 12); // 12 hours
}
