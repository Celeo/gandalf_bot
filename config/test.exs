import Config

config :logger,
  level: :debug

config :gandalf_discord_bot,
  config_file_name: "config.test.json",
  db_file_name: "roles.test.db"
