from gandalf_bot.message_util import is_incoherent, strip_formatting, strip_punctuation


def test_is_incoherent_space():
    assert not is_incoherent("a a")


def test_is_incoherent_length():
    assert not is_incoherent("bbb")


def test_is_incoherent_real_word():
    assert not is_incoherent("diCTIonarY")


def test_is_incoherent_patterns():
    assert not is_incoherent("bahahaha")
    assert not is_incoherent("lolololloo")
    assert not is_incoherent("hueuhueuhuhe")
    assert not is_incoherent("http://example.com")
    assert not is_incoherent("https://google.com")
    assert not is_incoherent("reeeeeeeeee")
    assert not is_incoherent("<:Screampackman2:754148436906999888>")


def test_is_incoherent():
    assert is_incoherent("kljasdfjldiksafjklsda")


def test_strip_formatting():
    assert "word" == strip_formatting("word")
    assert "word" == strip_formatting("*word*")
    assert "word" == strip_formatting("**word**")
    assert "word" == strip_formatting("_word_")
    assert "word" == strip_formatting("~~word~~")
    assert "word" == strip_formatting("`word`")
    assert "word" == strip_formatting("***word***")


def test_strip_punctuation():
    assert "word" == strip_punctuation('"word"')
    assert "word" == strip_punctuation("word!!")
    assert "word" == strip_punctuation("word???")
