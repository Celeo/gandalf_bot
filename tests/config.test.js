import { assertEquals, sinon } from "./test_deps.ts";
import { loadConfig } from "../src/config.ts";

Deno.test("config - loadConfig - works", async () => {
  const data = `{
    "token": "abc",
    "containmentRoleId": "1",
    "containmentResponseGif": "def",
    "blessableUserIds": ["2", "3"],
    "listenableUserIds": ["4"],
    "grossUserIds": ["5"],
    "reactionRoles": [],
    "birthdayChannel": "6",
    "birthdays": [],
    "bookChannel": "7",
    "bookReminders": [8, 9, 10, 11]
  }`;
  const redisGet = sinon.stub();
  redisGet.returns(data);
  const loaded = await loadConfig(() => ({ get: redisGet }));
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
    bookChannel: 7n,
    bookReminders: [8, 9, 10, 11],
  });
});
