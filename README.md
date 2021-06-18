# gandalf_bot

[![CI](https://github.com/Celeo/gandalf_bot/workflows/CI/badge.svg?branch=master)](https://github.com/Celeo/gandalf_bot/actions?query=workflow%3ACI)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

A Discord bot.

## Installing

1. Install [Elixir](elixir-lang.org/)
1. Clone the repo
1. Install dependencies with `mix deps.get`

## Using

1. Copy the `config.example.json` file to `config.json`
1. Create a `.env` and `.env.prod` files that expose a `DISCORD_TOKEN` environment variable via `source DISCORD_TOKEN=<your token>`
1. Run with `mix run --no-halt`

If you want to enable the functionality to post screenshots of merits, you'll need to create your own screenshots. Sorry, but copyright.

## Developing

### Building

#### Requirements

* Git
* Elixir

#### Steps

```sh
git clone https://github.com/Celeo/gandalf_bot
cd gandalf_bot
mix deps.get
```

#### Running tests

```sh
mix test
```

## License

Licensed under MIT ([LICENSE](LICENSE)).

## Contributing

Note: preceding my normal "contributions welcome" message is a disclaimer that this bot is specifically made for a Discord guild I'm in. If you want to contribute a bit, you're welcome to, but the intent of this bot won't really grow.

Please feel free to contribute. Please open an issue first (or comment on an existing one) so that I know that you want to add/change something.

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you shall be licensed as above, without any additional terms or conditions.
