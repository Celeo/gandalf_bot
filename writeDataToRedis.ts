import { redisConnect } from "./src/deps.ts";
import { loadConfig } from "./src/config.ts";

const redis = await redisConnect({
  hostname: "127.0.0.1",
});

const decoder = new TextDecoder("utf-8");
const wordsRaw = await Deno.readFile("./words.txt");
const words = decoder.decode(wordsRaw).replace("\n", ",");

await redis.del("gandalf-config");
await redis.del("gandalf-words");

const configStr = JSON.stringify(
  await loadConfig(),
  (_, v) => typeof v === "bigint" ? v.toString() : v,
);
await redis.set("gandalf-config", configStr);
await redis.set("gandalf-words", words);

redis.close();
