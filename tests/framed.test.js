import { assertEquals, sinon } from "./test_deps.ts";
import { handler } from "../src/framed.ts";

Deno.test("framed - ignores empty", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = {};
  const message = { content: "" };

  await handler(wrapper, config, message);

  assertEquals(addReaction.getCalls().length, 0);
});

Deno.test("framed - matches correctly", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = {};
  const message = {
    content: `Framed #223
🎥 🟩 ⬛ ⬛ ⬛ ⬛ ⬛

https://framed.wtf/`,
  };

  await handler(wrapper, config, message);

  assertEquals(addReaction.getCalls().length, 1);
});

Deno.test("framed - ignores correctly", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = {};
  const message = {
    content: `Framed #223
🎥 🟥 🟥 🟥 🟩 ⬛ ⬛

https://framed.wtf/`,
  };

  await handler(wrapper, config, message);

  assertEquals(addReaction.getCalls().length, 0);
});
