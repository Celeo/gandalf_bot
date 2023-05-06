import { assertEquals, sinon } from "./_test_deps.js";
import { reactionAdd, reactionRemove } from "../src/reactions.ts";

Deno.test("reactions - no match", async () => {
  const addRole = sinon.stub();
  const removeRole = sinon.stub();
  const sendMessage = sinon.stub();
  const wrapper = { addRole, removeRole, sendMessage };
  const config = { reactionRoles: [] };
  const payload = { guildId: 1n };

  await reactionAdd(wrapper, config, payload);

  assertEquals(addRole.getCalls().length, 0);
  assertEquals(removeRole.getCalls().length, 0);
  assertEquals(sendMessage.getCalls().length, 0);
});

Deno.test("reactions - add", async () => {
  const addRole = sinon.stub();
  const getDmChannel = sinon.spy(() => ({ id: 250n }));
  const sendMessage = sinon.stub();
  const wrapper = {
    addRole,
    getDmChannel,
    sendMessage,
    bot: { guilds: [{ id: 1n, roles: [{ name: "group-1" }] }] },
  };
  const config = {
    reactionRoles: [{
      channelId: 200n,
      messageId: 300n,
      emoji: "a",
      roleName: "group-1",
    }],
  };
  const payload = {
    guildId: 1n,
    member: { id: 2n },
    userId: 2n,
    channelId: 200n,
    messageId: 300n,
    emoji: { name: "a" },
  };

  await reactionAdd(wrapper, config, payload);

  assertEquals(addRole.getCalls().length, 1);
  assertEquals(getDmChannel.getCalls().length, 1);
  assertEquals(sendMessage.getCalls().length, 1);
});

Deno.test("reactions - remove", async () => {
  const removeRole = sinon.stub();
  const getMember = sinon.spy(() => ({ id: 2n }));
  const getDmChannel = sinon.spy(() => ({ id: 250n }));
  const sendMessage = sinon.stub();
  const wrapper = {
    removeRole,
    getMember,
    getDmChannel,
    sendMessage,
    bot: { guilds: [{ id: 1n, roles: [{ name: "group-1" }] }] },
  };
  const config = {
    reactionRoles: [{
      channelId: 200n,
      messageId: 300n,
      emoji: "a",
      roleName: "group-1",
    }],
  };
  const payload = {
    guildId: 1n,
    userId: 2n,
    channelId: 200n,
    messageId: 300n,
    emoji: { name: "a" },
  };

  await reactionRemove(wrapper, config, payload);

  assertEquals(removeRole.getCalls().length, 1);
  assertEquals(getMember.getCalls().length, 1);
  assertEquals(getDmChannel.getCalls().length, 1);
  assertEquals(sendMessage.getCalls().length, 1);
});
