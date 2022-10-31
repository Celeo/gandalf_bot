import { assertEquals, sinon } from "./test_deps.ts";
import { handler } from "../src/guessingGames.ts";

Deno.test("guessingGames - ignores empty", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = {};
  const message = { content: "" };

  await handler(wrapper, config, message);

  assertEquals(addReaction.getCalls().length, 0);
});

Deno.test("guessingGames - framed - matches correctly", async () => {
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

Deno.test("guessingGames - framed - ignores correctly", async () => {
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

Deno.test("guessingGames - tradle - matches correctly", async () => {
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

Deno.test("guessingGames - tradle - ignores correctly", async () => {
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

Deno.test("guessingGames - worldle - matches correctly", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = {};
  const message = {
    content: `#Worldle #282 1/6 (100%)
🟩🟩🟩🟩🟩🎉
https://worldle.teuteuf.fr/`,
  };

  await handler(wrapper, config, message);

  assertEquals(addReaction.getCalls().length, 1);
});

Deno.test("guessingGames - worldle - ignores correctly", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = {};
  const message = {
    content: `#Tradle #237 3/6
🟩🟩🟨⬜⬜
🟩🟩🟩🟩🟨
🟩🟩🟩🟩🟩
https://oec.world/en/tradle`,
  };

  await handler(wrapper, config, message);

  assertEquals(addReaction.getCalls().length, 0);
});
