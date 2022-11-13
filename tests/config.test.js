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
      "grossUserIds": ["5"],
      "reactionRoles": [],
      "birthdayChannel": "6",
      "birthdays": [],
      "minecraftChannel": "7",
      "minecraftMessage": null,
      "minecraftServer": "ghi"
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
    grossUserIds: [5n],
    reactionRoles: [],
    birthdayChannel: 6n,
    birthdays: [],
    minecraftChannel: 7n,
    minecraftMessage: null,
    minecraftServer: "ghi",
  });
  await Deno.remove(`./${filename}`);
});
