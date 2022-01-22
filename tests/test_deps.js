export * from "https://deno.land/std@0.119.0/testing/asserts.ts";

// TODO:  Need to figure out how to mock functions imported from Discordeno.
//        Can't just mock the `bot` object, since Discordeno passes that
//        into the functions that interact wit the Discord API.
//        Have to actually mock _those_ functions.
//
//        Doesn't look like Deno really allows mocking imports (due to how
//        ES modules work, most likely).
//
//        Some people say that I could construct a class of the functions
//        and import the functions from that in the code, and that could
//        be mocked.
//
//        Deno supports import maps, but due to the complexity of the bot
//        library, there doesn't seem to be a simple way to utilize a
//        remapping of some of its functions to local mocks.
