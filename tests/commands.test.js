import { assertEquals } from "./test_deps.js";
import { parse } from "../src/commands.ts";

Deno.test("commands - parse - empty message", () => {
  assertEquals(parse(""), null);
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
