import { assertEquals } from "./test_deps.js";
import { loadConfig } from "../src/config.ts";

Deno.test("config - loadConfig - works", async () => {
  const filename = "config.test.json";
  const data = new TextEncoder().encode(
    `{
      "token": "abc",
      "containmentRoleId": 1,
      "containmentResponseGif": "def",
      "blessableUserIds": [2, 3],
      "listenableUserIds": [9007199254740992]
    }`
  );
  await Deno.writeFile(`./${filename}`, data);
  const loaded = await loadConfig("config.test.json");
  assertEquals(loaded, {
    token: "abc",
    containmentRoleId: 1,
    containmentResponseGif: "def",
    blessableUserIds: [2, 3],
    listenableUserIds: [9007199254740992n],
  });
  await Deno.remove(`./${filename}`);
});
