import os

import httpx
import pytest

from gandalf_bot import message_util
from gandalf_bot.message_util import (
    is_incoherent,
    _strip_formatting,
    _strip_punctuation,
    _fetch_english_words,
)


TEST_WORD_LIST_FILE_NAME = "words.test.txt"


@pytest.fixture(autouse=True)
def set_util_paths(monkeypatch):
    monkeypatch.setattr(
        message_util, "ENGLISH_WORDS_FILE_NAME", TEST_WORD_LIST_FILE_NAME
    )


@pytest.fixture(autouse=True)
def clean_test_files():
    yield
    if os.path.exists(TEST_WORD_LIST_FILE_NAME):
        os.remove(TEST_WORD_LIST_FILE_NAME)


@pytest.fixture
def offline_word_list(monkeypatch):
    monkeypatch.setattr(message_util, "_fetch_english_words", lambda: ["dictionary"])


def test_fetch_english_words_disk():
    with open(TEST_WORD_LIST_FILE_NAME, "w") as f:
        f.write("dictionary\n")
    words = _fetch_english_words()
    assert words == ["dictionary"]


def test_fetch_english_words_network_success(monkeypatch):
    class Response:
        def __init__(self):
            self.status_code = 200
            self.text = "dictionary"

    monkeypatch.setattr(httpx, "get", lambda _: Response())
    assert _fetch_english_words() == ["dictionary"]


def test_fetch_english_words_network_failure(monkeypatch):
    class Response:
        def __init__(self):
            self.status_code = 500
            self.text = None

    monkeypatch.setattr(httpx, "get", lambda _: Response())
    try:
        _fetch_english_words()  # should fail
        assert False
    except ValueError as e:
        assert "Got status code 500 from GitHub" in str(e)


def test_is_incoherent_space(offline_word_list):
    assert not is_incoherent("a a")


def test_is_incoherent_newline(offline_word_list):
    assert not is_incoherent("a\na")


def test_is_incoherent_length(offline_word_list):
    assert not is_incoherent("bbb")


def test_is_incoherent_real_word(offline_word_list):
    assert not is_incoherent("diCTIonarY")


def test_is_incoherent_patterns(offline_word_list):
    assert not is_incoherent("bahahaha")
    assert not is_incoherent("lolololloo")
    assert not is_incoherent("hueuhueuhuhe")
    assert not is_incoherent("http://example.com")
    assert not is_incoherent("https://google.com")
    assert not is_incoherent("reeeeeeeeee")
    assert not is_incoherent("<:Screampackman2:123456>")
    assert not is_incoherent("<@!123456>")
    assert not is_incoherent("<@123456>")
    assert not is_incoherent("!foobar")


def test_is_incoherent(offline_word_list):
    assert is_incoherent("kljasdfjldiksafjklsda")


def test__strip_formatting():
    assert "word" == _strip_formatting("word")
    assert "word" == _strip_formatting("*word*")
    assert "word" == _strip_formatting("**word**")
    assert "word" == _strip_formatting("_word_")
    assert "word" == _strip_formatting("~~word~~")
    assert "word" == _strip_formatting("`word`")
    assert "word" == _strip_formatting("***word***")


def test__strip_punctuation():
    assert "word" == _strip_punctuation('"word"')
    assert "word" == _strip_punctuation("word!!")
    assert "word" == _strip_punctuation("word???")
