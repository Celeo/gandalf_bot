defmodule Bot.MessageCheck.Incoherent.Test do
  alias Bot.MessageCheck.Incoherent
  use ExUnit.Case

  test "is_match" do
    assert Incoherent.is_match!("kljasDFJLDIksafjklsda")

    assert not Incoherent.is_match!("bahahaha")
    assert not Incoherent.is_match!("lolololloo")
    assert not Incoherent.is_match!("hueuhueuhuhe")
    assert not Incoherent.is_match!("http://example.com")
    assert not Incoherent.is_match!("https://google.com")
    assert not Incoherent.is_match!("reeeeeeeeee")
    assert not Incoherent.is_match!("<:Screampackman2:123456>")
    assert not Incoherent.is_match!("<@!123456>")
    assert not Incoherent.is_match!("<@123456>")
    assert not Incoherent.is_match!("!asdfghjk")

    assert not Incoherent.is_match!("dictionary")
    assert not Incoherent.is_match!("*dictionary*")
    assert not Incoherent.is_match!("**dictionary**")
    assert not Incoherent.is_match!("_dictionary_")
    assert not Incoherent.is_match!("~~dictionary~~")
    assert not Incoherent.is_match!("`dictionary`")
    assert not Incoherent.is_match!("***dictionary***")
    assert not Incoherent.is_match!("\"dictionary\"")
    assert not Incoherent.is_match!("dictionary!!")
    assert not Incoherent.is_match!("dictionary???")
  end
end
