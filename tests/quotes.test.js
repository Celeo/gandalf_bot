import { assertEquals, sinon } from "./_test_deps.js";
import { handler } from "../src/quotes.ts";

Deno.test("quotes - does not trigger when not mentioned", async () => {
  const replyTo = sinon.stub();
  const wrapper = { replyTo, bot: { id: 123n } };
  const config = {};
  const message = { mentionedUserIds: [] };

  await handler(wrapper, config, message);

  assertEquals(replyTo.getCalls().length, 0);
});

Deno.test("quotes - triggers when mentioned", async () => {
  const replyTo = sinon.stub();
  const wrapper = { replyTo, bot: { id: 123n } };
  const config = {};
  const message = { mentionedUserIds: [123n] };

  await handler(wrapper, config, message);

  assertEquals(replyTo.getCalls().length, 1);
});
