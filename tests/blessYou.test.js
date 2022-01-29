import { assertEquals, sinon } from "./test_deps.ts";
import { handler } from "../src/blessYou.ts";

Deno.test("blessYou - does not trigger for un-configured users", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = { blessableUserIds: [] };
  const message = {};

  await handler(wrapper, config, message);

  assertEquals(addReaction.getCalls().length, 0);
});

Deno.test("blessYou - ignores messages with whitespace", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = { blessableUserIds: [123n] };
  const message = { authorId: 123n, content: "hello\nworld" };

  await handler(wrapper, config, message);

  assertEquals(addReaction.getCalls().length, 0);
});

Deno.test("blessYou - ignores short messages", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = { blessableUserIds: [123n] };
  const message = { authorId: 123n, content: "zkjgz" };

  await handler(wrapper, config, message);

  assertEquals(addReaction.getCalls().length, 0);
});

Deno.test("blessYou - ignores real words", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = { blessableUserIds: [123n] };
  const message = { authorId: 123n, content: "dictionary" };

  await handler(wrapper, config, message);

  assertEquals(addReaction.getCalls().length, 0);
});

Deno.test("blessYou - triggers when appropriate", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = { blessableUserIds: [123n] };
  const message = { authorId: 123n, content: "kleartuhjkleraghklujgaet" };

  await handler(wrapper, config, message);

  assertEquals(addReaction.getCalls().length, 1);
});
