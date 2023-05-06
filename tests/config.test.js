import { assertEquals, sinon } from "./_test_deps.js";
import { loadConfig } from "../src/config.ts";

Deno.test("config - loadConfig - works when mocked", async () => {
  const data = `{
    "containmentRoleId": "1",
    "containmentResponseGif": "abc",
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
  const redisClose = sinon.stub();
  redisGet.returns(data);
  const loaded = await loadConfig(() => ({ get: redisGet, close: redisClose }));
  assertEquals(loaded, {
    containmentRoleId: 1n,
    containmentResponseGif: "abc",
    blessableUserIds: [2n, 3n],
    listenableUserIds: [4n],
    grossUserIds: [5n],
    reactionRoles: [],
    birthdayChannel: 6n,
    birthdays: [],
    bookChannel: 7n,
    bookReminders: [8, 9, 10, 11],
  });
  assertEquals(redisGet.getCalls().length, 1);
  assertEquals(redisClose.getCalls().length, 1);
});
