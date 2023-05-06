import { assertEquals, sinon } from "./_test_deps.js";
import { handler } from "../src/gross.ts";

Deno.test("gross - does not trigger for un-configured users", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = { grossUserIds: [] };
  const message = { authorId: 123n, content: "lubricate" };

  await handler(wrapper, config, message);

  assertEquals(addReaction.getCalls().length, 0);
});

Deno.test("gross - triggers when appropriate", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = { grossUserIds: [123n] };
  const message = { authorId: 123n, content: "lubricate" };

  await handler(wrapper, config, message);

  assertEquals(addReaction.getCalls().length, 1);
});
