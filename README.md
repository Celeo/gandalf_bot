# gandalf_bot

[![CI](https://github.com/Celeo/gandalf_bot/workflows/CI/badge.svg?branch=master)](https://github.com/Celeo/gandalf_bot/actions?query=workflow%3ACI)

A Discord bot.

## Installing

1. Install [Rust](https://www.rust-lang.org/)
1. Clone the repo

## Using

I am hosting this bot on [https://fly.io](fly.io); consequently, I can only use environment variables. To that end, due to the complexity of the configuration that this bot uses, I utilize [B2 Cloud Storage](https://www.backblaze.com/cloud-storage) (think of AWS S3) to store the configuration JSON and dynamically download it when the bot runs.

The bot also requires 4 environment variables. If there is an `.env` file in the same directory where the bot is executed (`cargo r` counts), the bot will read it.

```ini
B2_KEY_ID=
B2_APP_KEY=
B2_FILE_NAME=
DISCORD_BOT_TOKEN=
```

The "DISCORD_BOT_TOKEN" is from your [Discord Developer Portal](https://discord.com/developers/applications). The B2 info is from your B2 account.

Create the env file, put your config file in B2, and run the bot with `cargo run` in the project root or by executing the built binary.

## License

- Bot under MIT or Apache-2.0.
- List of English words under the [unlicense](https://github.com/dwyl/english-words).
- Libraries in use under their respective licenses.

## Contributing

Note: preceding my normal "contributions welcome" message is a disclaimer that this bot is specifically made for a Discord guild I'm in. If you want to contribute a bit, you're welcome to, but the intent of this bot won't really change.

Please feel free to contribute. Please open an issue first (or comment on an existing one) so that I know that you want to add/change something.

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you shall be licensed as above, without any additional terms or conditions.
