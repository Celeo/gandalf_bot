#!/usr/bin/env -S deno run --allow-read=config.deploy.json --allow-net=127.0.0.1

import { parse } from "https://deno.land/std@0.185.0/flags/mod.ts";
import { redisConnect } from "./src/deps.ts";
import { REDIS_KEY } from "./src/config.ts";

let hostname = "127.0.0.1";
let port = 6379;
let password: string | undefined = undefined;

const args = parse(Deno.args);
if (args["h"] || args["help"]) {
  console.log(
    `Optional arguments:
    -u <hostname> (default: 127.0.0.1)
    -p <port> (default: 6379)
    -a <password> (default: undefined)`,
  );
  Deno.exit(0);
}
if (Object.keys(args).includes("u")) {
  hostname = args["u"];
}
if (Object.keys(args).includes("p")) {
  port = parseInt(args["p"]);
}
if (Object.keys(args).includes("a")) {
  password = args["a"];
}

const redis = await redisConnect({ hostname, port, password });
const configText = await Deno.readTextFile(`./config.deploy.json`);
redis.set(REDIS_KEY, configText);
