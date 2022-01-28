import { assertEquals } from "./test_deps.ts";
import { loadConfig } from "../src/config.ts";

Deno.test("config - loadConfig - works", async () => {
  const filename = "config.test.json";
  const data = new TextEncoder().encode(
    `{
      "token": "abc",
      "containmentRoleId": "1",
      "containmentResponseGif": "def",
      "blessableUserIds": ["2", "3"],
      "listenableUserIds": ["4"],
      "reactionRoles": [],
      "birthdayChannel": "5",
      "birthdays": []
    }`,
  );
  await Deno.writeFile(`./${filename}`, data);
  const loaded = await loadConfig("config.test.json");
  assertEquals(loaded, {
    token: "abc",
    containmentRoleId: 1n,
    containmentResponseGif: "def",
    blessableUserIds: [2n, 3n],
    listenableUserIds: [4n],
    reactionRoles: [],
    birthdayChannel: 5n,
    birthdays: [],
  });
  await Deno.remove(`./${filename}`);
});
