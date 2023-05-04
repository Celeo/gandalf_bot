import { assertEquals, sinon } from "./test_deps.ts";
import { handler } from "../src/blessYou.ts";
import { memoizy } from "../src/deps.ts";

function _loadWordsForTest() {
  const decoder = new TextDecoder("utf-8");
  const raw = Deno.readFileSync("./words.txt");
  const text = decoder.decode(raw);
  return text.split("\n");
}
const loadWordsForTest = memoizy(_loadWordsForTest);

Deno.test("blessYou - does not trigger for un-configured users", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = { blessableUserIds: [] };
  const message = { content: "" };

  await handler(wrapper, config, message, loadWordsForTest);

  assertEquals(addReaction.getCalls().length, 0);
});

Deno.test("blessYou - ignores messages with whitespace", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = { blessableUserIds: [123n] };
  const message = { authorId: 123n, content: "hello\nworld" };

  await handler(wrapper, config, message, loadWordsForTest);

  assertEquals(addReaction.getCalls().length, 0);
});

Deno.test("blessYou - ignores short messages", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = { blessableUserIds: [123n] };
  const message = { authorId: 123n, content: "zkjgz" };

  await handler(wrapper, config, message, loadWordsForTest);

  assertEquals(addReaction.getCalls().length, 0);
});

Deno.test("blessYou - ignores real words", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = { blessableUserIds: [123n] };
  const message = { authorId: 123n, content: "dictionary" };

  await handler(wrapper, config, message, loadWordsForTest);

  assertEquals(addReaction.getCalls().length, 0);
});

Deno.test("blessYou - triggers when appropriate", async () => {
  const addReaction = sinon.stub();
  const wrapper = { addReaction };
  const config = { blessableUserIds: [123n] };
  const message = { authorId: 123n, content: "kleartuhjkleraghklujgaet" };

  await handler(wrapper, config, message, loadWordsForTest);

  assertEquals(addReaction.getCalls().length, 1);
});
