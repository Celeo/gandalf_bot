defmodule Bot.MessageCheck do
  require Logger

  @words_file_name "words.txt"
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

  def read_in_words! do
    File.read!(Application.app_dir(:gandalf_discord_bot, "priv/#{@words_file_name}"))
    |> String.split("\n")
  end

  defp strip_formatting(content), do: content |> String.replace(["*", "_", "~", "`"], "")
  defp strip_punctuation(content), do: content |> String.replace(["?", "!", "\""], "")

  def is_incoherent!(content, task \\ :whitespace) do
    case task do
      :whitespace ->
        if String.contains?(content, " ") or String.contains?(content, "\n") do
          Logger.debug("is_incoherent false, contains whitespace")
          false
        else
          content = content |> strip_formatting() |> strip_punctuation()
          is_incoherent!(content, :length)
        end

      :length ->
        if String.length(content) < @minimum_message_length do
          Logger.debug("is_incoherent false, too short (#{String.length(content)} chars)")
          false
        else
          is_incoherent!(content, :real)
        end

      :real ->
        if Bot.MessageCheck.Words.check_word(content) do
          Logger.debug("is_incoherent false, is a real word")
          false
        else
          is_incoherent!(content, :patterns)
        end

      :patterns ->
        if Enum.any?(@ignore_patterns, &Regex.match?(&1, content)) do
          Logger.debug("is_incoherent false, matches ignore pattern")
          false
        else
          true
        end
    end
  end
end
