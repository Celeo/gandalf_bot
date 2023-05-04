import { redisConnect } from "./src/deps.ts";
import { REDIS_KEY } from "./src/config.ts";

const text = await Deno.readTextFile(`./config.json`);
const redis = await redisConnect({ hostname: "127.0.0.1" });
redis.set(REDIS_KEY, text);
