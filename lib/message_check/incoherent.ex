defmodule Bot.MessageCheck.Incoherent do
  require Logger

  @minimum_message_length 8
  @ignore_patterns [
    ~r/^[hue]{5,}$/i,
    ~r/^[bha]{5,}$/i,
    ~r/^[lo]{5,}$/i,
    ~r/^https?:\/\//i,
    ~r/^re{5,}/i,
    ~r/^<:\w+:\d+>$/,
    ~r/^<@!?\d+>$/,
    ~r/^!/
  ]

  defp strip_formatting(content), do: content |> String.replace(["*", "_", "~", "`"], "")

  defp strip_punctuation(content) do
    content
    |> String.replace(["?", "\""], "")
    |> String.trim_trailing("!")
  end

  @doc """
  Determine if the string is nonsense and could warrant the bot's reaction.
  """
  def is_match!(content, task \\ :whitespace) do
    case task do
      :whitespace ->
        if String.contains?(content, " ") or String.contains?(content, "\n") do
          false
        else
          content = content |> strip_formatting() |> strip_punctuation()
          is_match!(content, :length)
        end

      :length ->
        if String.length(content) < @minimum_message_length do
          false
        else
          is_match!(content, :real)
        end

      :real ->
        if Bot.Util.Words.check_word(content) do
          false
        else
          is_match!(content, :patterns)
        end

      :patterns ->
        not Enum.any?(@ignore_patterns, &Regex.match?(&1, content))
    end
  end

  def emoji(), do: %Nostrum.Struct.Emoji{name: "🤧"}
end
