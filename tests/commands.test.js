import { assertEquals, sinon } from "./_test_deps.js";
import {
  commandBreach,
  commandPin,
  commandUnBreach,
  commandUnpin,
} from "../src/commands.ts";

Deno.test("commands - breach - sender not admin", async () => {
  const addRole = sinon.stub();
  const sendInteractionResponse = sinon.stub();
  const hasGuildPermissions = () => false;
  const wrapper = {
    addRole,
    bot: { helpers: { sendInteractionResponse } },
    hasGuildPermissions,
  };
  const config = { containmentResponseGif: "abc" };
  const payload = {
    member: {},
    guildId: 1n,
    data: { options: [{ value: "2" }] },
  };

  await commandBreach(wrapper, config, payload);

  assertEquals(addRole.getCalls().length, 0);
  assertEquals(sendInteractionResponse.getCalls().length, 1);
});

Deno.test("commands - breach - succeeds", async () => {
  const addRole = sinon.stub();
  const sendInteractionResponse = sinon.stub();
  const hasGuildPermissions = () => true;
  const wrapper = {
    addRole,
    bot: { helpers: { sendInteractionResponse } },
    hasGuildPermissions,
  };
  const config = { containmentResponseGif: "abc" };
  const payload = {
    member: {},
    guildId: 1n,
    data: { options: [{ value: "2" }] },
  };

  await commandBreach(wrapper, config, payload);

  assertEquals(addRole.getCalls().length, 1);
  assertEquals(sendInteractionResponse.getCalls().length, 1);
});

Deno.test("commands - unbreach - sender not admin", async () => {
  const removeRole = sinon.stub();
  const sendInteractionResponse = sinon.stub();
  const hasGuildPermissions = () => false;
  const wrapper = {
    removeRole,
    bot: { helpers: { sendInteractionResponse } },
    hasGuildPermissions,
  };
  const config = { containmentResponseGif: "abc" };
  const payload = {
    member: {},
    guildId: 1n,
    data: { options: [{ value: "2" }] },
  };

  await commandUnBreach(wrapper, config, payload);

  assertEquals(removeRole.getCalls().length, 0);
  assertEquals(sendInteractionResponse.getCalls().length, 1);
});

Deno.test("commands - unbreach - succeeds", async () => {
  const removeRole = sinon.stub();
  const sendInteractionResponse = sinon.stub();
  const hasGuildPermissions = () => true;
  const wrapper = {
    removeRole,
    bot: { helpers: { sendInteractionResponse } },
    hasGuildPermissions,
  };
  const config = { containmentResponseGif: "abc" };
  const payload = {
    member: {},
    guildId: 1n,
    data: { options: [{ value: "2" }] },
  };

  await commandUnBreach(wrapper, config, payload);

  assertEquals(removeRole.getCalls().length, 1);
  assertEquals(sendInteractionResponse.getCalls().length, 1);
});

Deno.test("commands - pin - succeeds", async () => {
  const pinMessage = sinon.stub();
  const sendInteractionResponse = sinon.stub();
  const hasGuildPermissions = () => true;
  const wrapper = {
    pinMessage,
    bot: { helpers: { sendInteractionResponse } },
    hasGuildPermissions,
  };
  const payload = {
    channelId: 1n,
    guildId: 2n,
    data: { options: [{ value: "3" }] },
  };

  await commandPin(wrapper, {}, payload);

  assertEquals(pinMessage.getCalls().length, 1);
  assertEquals(sendInteractionResponse.getCalls().length, 1);
});

Deno.test("commands - unpin - succeeds", async () => {
  const unpinMessage = sinon.stub();
  const sendInteractionResponse = sinon.stub();
  const hasGuildPermissions = () => true;
  const wrapper = {
    unpinMessage,
    bot: { helpers: { sendInteractionResponse } },
    hasGuildPermissions,
  };
  const payload = {
    channelId: 1n,
    guildId: 2n,
    data: { options: [{ value: "3" }] },
  };

  await commandUnpin(wrapper, {}, payload);

  assertEquals(unpinMessage.getCalls().length, 1);
  assertEquals(sendInteractionResponse.getCalls().length, 1);
});
