import Config

config :nostrum,
  token: System.get_env("DISCORD_TOKEN"),
  shards: 1

config :logger,
  level: :info
