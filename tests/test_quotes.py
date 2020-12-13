from gandalf_bot.quotes import get_random_quote


def test_get_random_quote():
    assert len(get_random_quote()) > 0
