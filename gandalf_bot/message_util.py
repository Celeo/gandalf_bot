import os
import re
from typing import List

import httpx
from loguru import logger


ENGLISH_WORDS_FILE_URL = (
    "https://raw.githubusercontent.com/dwyl/english-words/master/words.txt"
)
ENGLISH_WORDS_FILE = "words.txt"
MINIMUM_MESSAGE_LENGTH = 8
BLESS_YOU_EMOJI = "🤧"
IGNORE_PATTERNS = [
    re.compile(r"^[hue]{5,}$"),
    re.compile(r"^[bha]{5,}$"),
    re.compile(r"^[lo]{5,}$"),
    re.compile(r"^https?://"),
    re.compile(r"^re{5,}"),
    re.compile(r"^<:\w+:\d+>$"),
]


def _fetch_english_words() -> List[str]:
    if os.path.exists(ENGLISH_WORDS_FILE):
        with open(ENGLISH_WORDS_FILE) as f:
            return [line.strip() for line in f.readlines()]
    logger.debug("Downloading word list from GitHub")
    resp = httpx.get(ENGLISH_WORDS_FILE_URL)
    if resp.status_code != 200:
        raise ValueError(f"Got status for {resp.status_code} from GitHub")
    with open(ENGLISH_WORDS_FILE, "w") as f:
        f.write(resp.text)
    return resp.text.split("\n")


def strip_formatting(content: str) -> str:
    return content.replace("*", "").replace("_", "").replace("~", "").replace("`", "")


def strip_punctuation(content: str) -> str:
    return content.replace("?", "").replace("!", "").replace('"', "")


def is_incoherent(content: str) -> bool:
    if " " in content:
        logger.debug("Message contains a space")
        return False
    content = strip_formatting(strip_punctuation(content.lower()))
    if len(content) < MINIMUM_MESSAGE_LENGTH:
        logger.debug(f"Message was only {len(content)} chars long")
        return False
    english_words = _fetch_english_words()
    if content in english_words:
        logger.debug("Valid English word")
        return False
    for pattern in IGNORE_PATTERNS:
        if pattern.match(content):
            logger.debug("Matches ignore pattern")
            return False
    # TODO use Levenshtein Distance to see if it's just a misspelling of a word
    return True
