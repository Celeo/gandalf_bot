import Config

config :nostrum,
  token: System.get_env("DISCORD_TOKEN"),
  shards: 1

config :logger,
  level: :warn

config :gandalf_discord_bot,
  config_file_name: "config.json",
  db_file_name: "roles.db"

import_config "#{config_env()}.exs"
