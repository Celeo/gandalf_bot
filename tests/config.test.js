import { assertEquals, sinon } from "./_test_deps.js";
import { loadConfig } from "../src/config.ts";

Deno.test("config - loadConfig - works when mocked", async () => {
  const data = {
    "containmentRoleId": "1",
    "containmentResponseGif": "abc",
    "blessableUserIds": ["2", "3"],
    "listenableUserIds": ["4"],
    "grossUserIds": ["5"],
    "reactionRoles": [],
    "birthdayChannel": "6",
    "birthdays": [],
    "bookChannel": "7",
    "bookReminders": [8, 9, 10, 11],
  };

  const fetchStub = sinon.stub();
  fetchStub.onFirstCall().returns(
    Promise.resolve({
      status: 200,
      json: () =>
        Promise.resolve({
          authorizationToken: "aaa",
          downloadUrl: "bbb",
          allowed: { bucketName: "ccc" },
        }),
    }),
  );
  fetchStub.onSecondCall().returns(
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve(data),
    }),
  );

  const loaded = await loadConfig(fetchStub);
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
  assertEquals(fetchStub.getCalls().length, 2);
  assertEquals(fetchStub.getCalls()[1].args, [
    "bbb/file/ccc/config.test.json",
    { headers: { authorization: "aaa" } },
  ]);
});
