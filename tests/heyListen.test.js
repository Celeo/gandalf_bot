import { assertEquals, sinon } from "./_test_deps.js";
import { handler } from "../src/heyListen.ts";

Deno.test("heyListen - does not trigger for un-configured users", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = { listenableUserIds: [] };
  const message = { authorId: 123n };

  await handler(wrapper, config, message);

  assertEquals(addReaction.getCalls().length, 0);
});

Deno.test("heyListen - ignores non-triggering messages", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = { listenableUserIds: [123n] };
  const message = { authorId: 123n, content: "something random" };

  await handler(wrapper, config, message);

  assertEquals(addReaction.getCalls().length, 0);
});

Deno.test("heyListen - triggers when appropriate", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = { listenableUserIds: [123n] };
  const message = { authorId: 123n, content: "listen!" };

  await handler(wrapper, config, message);

  assertEquals(addReaction.getCalls().length, 1);
});
