defmodule Bot.Util.Message do
  @doc """
  Strip formatting from a string.
  """
  def strip_formatting(content), do: content |> String.replace(["*", "_", "~", "`"], "")

  @doc """
  Strip punctuation from a string.
  """
  def strip_punctuation(content) do
    content
    |> String.replace(["?", "\"", ","], "")
    |> String.trim_trailing("!")
  end
end
