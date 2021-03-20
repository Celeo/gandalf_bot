defmodule GandalfDiscordBot.MixProject do
  use Mix.Project

  def project do
    [
      app: :bobby_discord_bot,
      version: "0.1.0",
      elixir: "~> 1.11",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  def application do
    [
      extra_applications: [:logger],
      mod: {Bot.Application, []}
    ]
  end

  defp deps do
    [
      {:nostrum, "~> 0.4"}
    ]
  end
end
