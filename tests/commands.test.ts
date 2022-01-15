import { assertEquals } from "./test_deps.ts";
import { parse } from "../src/commands.ts";

Deno.test("parse - empty message", () => {
  assertEquals(parse(""), null);
});

Deno.test("parse - just !", () => {
  assertEquals(parse("!"), null);
});

Deno.test("parse - no args command", () => {
  assertEquals(parse("!a"), { name: "a", args: [] });
});

Deno.test("parse - command with args", () => {
  assertEquals(parse("!a b c"), { name: "a", args: ["b", "c"] });
});

Deno.test("parse - uppercase command", () => {
  assertEquals(parse("!A"), { name: "a", args: [] });
});
