defmodule Bot.MessageCheck.HeyListen.Test do
  alias Bot.MessageCheck.HeyListen
  use ExUnit.Case

  test "is_match" do
    assert HeyListen.is_match!("listen")
    assert HeyListen.is_match!("LISTEN")
    assert HeyListen.is_match!("LISTEN!")
    assert HeyListen.is_match!("LISTEN   ")
    assert HeyListen.is_match!("LISTEN !")

    assert HeyListen.is_match!("*LISTEN !")
    assert HeyListen.is_match!("\"LISTEN !")
    assert HeyListen.is_match!("~LISTEN !")
    assert HeyListen.is_match!("_LISTEN !")
    assert HeyListen.is_match!("`LISTEN !")

    assert not HeyListen.is_match!("asdf listen asdf")
  end
end
