defmodule Bot.Util.Words.Test do
  alias Bot.Util.Words
  use ExUnit.Case

  test "can load words file" do
    words = Words.load_words!()
    assert length(words) > 100_000
  end
end
