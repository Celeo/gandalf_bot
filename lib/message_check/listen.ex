defmodule Bot.MessageCheck.HeyListen do
  require Logger

  @pattern ~r/^listen[! ]*$/i

  def is_match!(content) do
    Regex.match?(@pattern, content)
  end

  def emoji(), do: %Nostrum.Struct.Emoji{name: "👂"}
end
