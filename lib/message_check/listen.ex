defmodule Bot.MessageCheck.HeyListen do
  require Logger

  @pattern ~r/^listen[! ]*$/i

  def is_match!(content) do
    content =
      content
      |> String.trim()
      |> Bot.Util.Message.strip_formatting()
      |> Bot.Util.Message.strip_punctuation()

    Regex.match?(@pattern, content)
  end

  def emoji(), do: %Nostrum.Struct.Emoji{name: "👂"}
end
