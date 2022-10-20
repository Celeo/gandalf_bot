import { assertEquals, sinon } from "./test_deps.ts";
import { handler } from "../src/tradle.ts";

Deno.test("tradle - ignores empty", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = {};
  const message = { content: "" };

  await handler(wrapper, config, message);

  assertEquals(addReaction.getCalls().length, 0);
});

Deno.test("tradle - matches correctly", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = {};
  const message = {
    content: `#Tradle #226 1/6
🟩🟩🟩🟩🟩
https://oec.world/en/tradle`,
  };

  await handler(wrapper, config, message);

  assertEquals(addReaction.getCalls().length, 1);
});

Deno.test("tradle - ignores correctly", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = {};
  const message = {
    content: `#Tradle #226 3/6
🟩🟩🟩🟩🟨
🟩🟩🟩🟩🟨
🟩🟩🟩🟩🟩
https://oec.world/en/tradle`,
  };

  await handler(wrapper, config, message);

  assertEquals(addReaction.getCalls().length, 0);
});
