defmodule Bot.Quotes.Test do
  use ExUnit.Case

  test "can get a quote" do
    q = Bot.Quotes.get_random()
    assert String.length(q) > 0
  end
end
