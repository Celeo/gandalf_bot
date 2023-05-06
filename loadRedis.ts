#!/usr/bin/env -S deno run --allow-read --allow-net=127.0.0.1
import { parse } from "https://deno.land/std@0.185.0/flags/mod.ts";
import { connect } from "https://deno.land/x/redis@v0.29.3/mod.ts";

let file = "config.deploy.json";
let hostname = "127.0.0.1";
let port = 6379;
let password: string | undefined = undefined;

const args = parse(Deno.args);
if (args["h"] || args["help"]) {
  console.log(
    `Optional arguments:
    -f <file> (default: config.deploy.json)
    -u <hostname> (default: 127.0.0.1)
    -p <port> (default: 6379)
    -a <password> (default: undefined)`,
  );
  Deno.exit(0);
}
if (Object.keys(args).includes("f")) {
  file = args["f"];
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

const redis = await connect({ hostname, port, password });
const configText = await Deno.readTextFile(`./${file}`);
redis.set("gandalf-config", configText);
