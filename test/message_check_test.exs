defmodule Bot.MessageCheck.Test do
  alias Bot.MessageCheck
  use ExUnit.Case

  test "is_incoherent" do
    assert MessageCheck.is_incoherent!("kljasdfjldiksafjklsda")

    assert not MessageCheck.is_incoherent!("bahahaha")
    assert not MessageCheck.is_incoherent!("lolololloo")
    assert not MessageCheck.is_incoherent!("hueuhueuhuhe")
    assert not MessageCheck.is_incoherent!("http://example.com")
    assert not MessageCheck.is_incoherent!("https://google.com")
    assert not MessageCheck.is_incoherent!("reeeeeeeeee")
    assert not MessageCheck.is_incoherent!("<:Screampackman2:123456>")
    assert not MessageCheck.is_incoherent!("<@!123456>")
    assert not MessageCheck.is_incoherent!("<@123456>")
    assert not MessageCheck.is_incoherent!("!foobar")

    assert not MessageCheck.is_incoherent!("dictionary")
    assert not MessageCheck.is_incoherent!("*dictionary*")
    assert not MessageCheck.is_incoherent!("**dictionary**")
    assert not MessageCheck.is_incoherent!("_dictionary_")
    assert not MessageCheck.is_incoherent!("~~dictionary~~")
    assert not MessageCheck.is_incoherent!("`dictionary`")
    assert not MessageCheck.is_incoherent!("***dictionary***")
    assert not MessageCheck.is_incoherent!("\"dictionary\"")
    assert not MessageCheck.is_incoherent!("dictionary!!")
    assert not MessageCheck.is_incoherent!("dictionary???")
  end
end

defmodule Bot.MessageCheck.Words.Test do
  alias Bot.MessageCheck.Words
  use ExUnit.Case

  test "can load words file" do
    words = Words.load_words!()
    assert length(words) > 100_000
  end
end
