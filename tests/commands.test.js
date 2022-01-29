import { assertEquals, sinon } from "./test_deps.ts";
import { handler, parse } from "../src/commands.ts";

// ===== parse =====

Deno.test("commands - parse - empty message", () => {
  assertEquals(parse(""), null);
});

Deno.test("commands - parse - no !", () => {
  assertEquals(parse("help"), null);
});

Deno.test("commands - parse - just !", () => {
  assertEquals(parse("!"), null);
});

Deno.test("commands - parse - no args command", () => {
  assertEquals(parse("!a"), { name: "a", args: [] });
});

Deno.test("commands - parse - command with args", () => {
  assertEquals(parse("!a b c"), { name: "a", args: ["b", "c"] });
});

Deno.test("commands - parse - uppercase command", () => {
  assertEquals(parse("!A"), { name: "a", args: [] });
});

// ===== help =====

Deno.test("commands - help", async () => {
  const replyTo = sinon.stub();
  const wrapper = { replyTo };
  const config = {};
  const message = { content: "!help" };

  await handler(wrapper, config, message);

  assertEquals(replyTo.getCalls().length, 1);
});

// ===== breach =====

Deno.test("commands - breach - sender not admin", async () => {
  const replyTo = sinon.stub();
  const addRole = sinon.stub();
  const hasGuildPermissions = () => false;
  const wrapper = {
    replyTo,
    addRole,
    bot: { guilds: {} },
    hasGuildPermissions,
  };
  const config = {};
  const message = { content: "!breach", member: {}, guildId: 1n };

  await handler(wrapper, config, message);

  assertEquals(replyTo.getCalls().length, 1);
});

Deno.test("commands - breach - no mentions", async () => {
  const replyTo = sinon.stub();
  const addRole = sinon.stub();
  const hasGuildPermissions = () => true;
  const wrapper = {
    replyTo,
    addRole,
    bot: { guilds: {} },
    hasGuildPermissions,
  };
  const config = {};
  const message = {
    content: "!breach",
    member: {},
    guildId: 1n,
    mentionedUserIds: [],
  };

  await handler(wrapper, config, message);

  assertEquals(replyTo.getCalls().length, 1);
  assertEquals(replyTo.getCall(0).lastArg, "You must tag a user");
});

Deno.test("commands - breach - succeeds", async () => {
  const replyTo = sinon.stub();
  const addRole = sinon.stub();
  const hasGuildPermissions = () => true;
  const wrapper = {
    replyTo,
    addRole,
    bot: { guilds: {} },
    hasGuildPermissions,
  };
  const config = { containmentResponseGif: "abc" };
  const message = {
    content: "!breach",
    member: {},
    guildId: 1n,
    mentionedUserIds: [2n],
  };

  await handler(wrapper, config, message);

  assertEquals(replyTo.getCalls().length, 1);
  assertEquals(replyTo.getCall(0).lastArg, "abc");
  assertEquals(addRole.getCalls().length, 1);
});

// ===== unbreach =====

Deno.test("commands - unbreach - sender not admin", async () => {
  const replyTo = sinon.stub();
  const removeRole = sinon.stub();
  const addReaction = sinon.stub();
  const hasGuildPermissions = () => false;
  const wrapper = {
    replyTo,
    removeRole,
    addReaction,
    bot: { guilds: {} },
    hasGuildPermissions,
  };
  const config = {};
  const message = { content: "!unbreach", member: {}, guildId: 1n };

  await handler(wrapper, config, message);

  assertEquals(replyTo.getCalls().length, 1);
  assertEquals(addReaction.getCalls().length, 0);
});

Deno.test("commands - unbreach - no mentions", async () => {
  const replyTo = sinon.stub();
  const removeRole = sinon.stub();
  const addReaction = sinon.stub();
  const hasGuildPermissions = () => true;
  const wrapper = {
    replyTo,
    removeRole,
    addReaction,
    bot: { guilds: {} },
    hasGuildPermissions,
  };
  const config = {};
  const message = {
    content: "!unbreach",
    member: {},
    guildId: 1n,
    mentionedUserIds: [],
  };

  await handler(wrapper, config, message);

  assertEquals(replyTo.getCalls().length, 1);
  assertEquals(replyTo.getCall(0).lastArg, "You must tag a user");
  assertEquals(addReaction.getCalls().length, 0);
});

Deno.test("commands - unbreach - succeeds", async () => {
  const replyTo = sinon.stub();
  const removeRole = sinon.stub();
  const addReaction = sinon.stub();
  const hasGuildPermissions = () => true;
  const wrapper = {
    replyTo,
    removeRole,
    addReaction,
    bot: { guilds: {} },
    hasGuildPermissions,
  };
  const config = { containmentResponseGif: "abc" };
  const message = {
    content: "!unbreach",
    member: {},
    guildId: 1n,
    mentionedUserIds: [2n],
  };

  await handler(wrapper, config, message);

  assertEquals(replyTo.getCalls().length, 0);
  assertEquals(removeRole.getCalls().length, 1);
  assertEquals(addReaction.getCalls().length, 1);
});

// ===== sitrep =====

Deno.test("commands - sitrep - sender not admin", async () => {
  const replyTo = sinon.stub();
  const removeRole = sinon.stub();
  const fetchMembers = sinon.stub();
  const getUser = sinon.spy(() => ({ id: 10n }));
  const hasGuildPermissions = () => false;
  const wrapper = {
    replyTo,
    removeRole,
    fetchMembers,
    getUser,
    bot: { guilds: {} },
    hasGuildPermissions,
  };
  const config = {};
  const message = { content: "!sitrep", member: {}, guildId: 1n };

  await handler(wrapper, config, message);

  assertEquals(replyTo.getCalls().length, 1);
  assertEquals(fetchMembers.getCalls().length, 0);
  assertEquals(getUser.getCalls().length, 0);
});

Deno.test("commands - sitrep - succeeds - no one contained", async () => {
  const replyTo = sinon.stub();
  const removeRole = sinon.stub();
  const fetchMembers = sinon.stub();
  const getUser = sinon.spy(() => ({ id: 10n }));
  const hasGuildPermissions = () => true;
  const wrapper = {
    replyTo,
    removeRole,
    fetchMembers,
    getUser,
    bot: {
      guilds: {},
      members: [
        {
          roles: [],
        },
      ],
    },
    hasGuildPermissions,
  };
  const config = {};
  const message = { content: "!sitrep", member: {}, guildId: 1n };

  await handler(wrapper, config, message);

  assertEquals(replyTo.getCalls().length, 1);
  assertEquals(replyTo.getCall(0).lastArg, "No one is contained");
  assertEquals(fetchMembers.getCalls().length, 1);
  assertEquals(getUser.getCalls().length, 0);
});

Deno.test("commands - sitrep - succeeds - contained users", async () => {
  const replyTo = sinon.stub();
  const removeRole = sinon.stub();
  const fetchMembers = sinon.stub();
  const getUser = sinon.spy(() => ({ id: 10n }));
  const hasGuildPermissions = () => true;
  const wrapper = {
    replyTo,
    removeRole,
    fetchMembers,
    getUser,
    bot: {
      guilds: {},
      members: [
        {
          id: 10n,
          roles: [100n],
        },
      ],
    },
    hasGuildPermissions,
  };
  const config = { containmentRoleId: 100n };
  const message = { content: "!sitrep", member: {}, guildId: 1n };

  await handler(wrapper, config, message);

  assertEquals(replyTo.getCalls().length, 1);
  assertEquals(replyTo.getCall(0).lastArg, "Contained users: <@!10>");
  assertEquals(fetchMembers.getCalls().length, 1);
  assertEquals(getUser.getCalls().length, 1);
});

// ===== pin =====

Deno.test("commands - pin - requires args", async () => {
  const replyTo = sinon.stub();
  const pinMessage = sinon.stub();
  const addReaction = sinon.stub();
  const wrapper = { replyTo, pinMessage };
  const config = {};
  const message = { content: "!pin", channelId: 1n, id: 2n };

  await handler(wrapper, config, message);

  assertEquals(replyTo.getCalls().length, 1);
  assertEquals(pinMessage.getCalls().length, 0);
  assertEquals(addReaction.getCalls().length, 0);
});

Deno.test("commands - pin - succeeds", async () => {
  const replyTo = sinon.stub();
  const pinMessage = sinon.stub();
  const addReaction = sinon.stub();
  const wrapper = { replyTo, pinMessage, addReaction };
  const config = {};
  const message = { content: "!pin 123", channelId: 1n, id: 2n };

  await handler(wrapper, config, message);

  assertEquals(replyTo.getCalls().length, 0);
  assertEquals(pinMessage.getCalls().length, 1);
  assertEquals(addReaction.getCalls().length, 1);
});

// ===== unpin =====

Deno.test("commands - unpin - requires args", async () => {
  const replyTo = sinon.stub();
  const unpinMessage = sinon.stub();
  const addReaction = sinon.stub();
  const wrapper = { replyTo, unpinMessage };
  const config = {};
  const message = { content: "!unpin", channelId: 1n, id: 2n };

  await handler(wrapper, config, message);

  assertEquals(replyTo.getCalls().length, 1);
  assertEquals(unpinMessage.getCalls().length, 0);
  assertEquals(addReaction.getCalls().length, 0);
});

Deno.test("commands - unpin - succeeds", async () => {
  const replyTo = sinon.stub();
  const unpinMessage = sinon.stub();
  const addReaction = sinon.stub();
  const wrapper = { replyTo, unpinMessage, addReaction };
  const config = {};
  const message = { content: "!unpin 123", channelId: 1n, id: 2n };

  await handler(wrapper, config, message);

  assertEquals(replyTo.getCalls().length, 0);
  assertEquals(unpinMessage.getCalls().length, 1);
  assertEquals(addReaction.getCalls().length, 1);
});
