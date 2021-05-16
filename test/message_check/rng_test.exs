defmodule Bot.Util.Rng.Test do
  alias Bot.Util.Rng
  use ExUnit.Case

  test "get random number" do
    num = Rng.get_number()
    assert 1 <= num
    assert num <= 10
  end

  test "store static number" do
    Rng.enqueue_static(11)
    num = Rng.get_number()
    assert num == 11
  end
end
