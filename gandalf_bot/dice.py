from dataclasses import dataclass
from enum import Enum
import re
from random import randint
from typing import List

from loguru import logger


RESULT_MINIMUM_FOR_SUCCESS = 8
NUMERIC_REGEX = re.compile(r"^\d+$")


class RollType(Enum):

    """
    value = (
        <string to search for>,
        <value to hit at/above to explode>
    )
    """

    EXPLODE_10 = ("10again", 10)
    EXPLODE_9 = ("9again", 9)
    EXPLODE_8 = ("8again", 8)
    CHANCE = ("chance", 11)

    @staticmethod
    def from_str(s: str) -> "RollType":
        for roll_type in RollType:
            if roll_type.value[0] in s:
                return roll_type
        return RollType.EXPLODE_10


@dataclass
class Roll:

    value: int
    is_bonus: bool

    def __str__(self) -> str:
        if self.is_bonus:
            return f"({self.value})"
        return f"{self.value}"


def count_dice_to_roll(s: str) -> int:
    val = 0
    for part in s.split():
        if NUMERIC_REGEX.match(part):
            val += int(part)
    return val


def _roll_single() -> int:
    return randint(1, 10)


def roll_dice(s: str) -> str:
    roll_type = RollType.from_str(s)
    if roll_type == RollType.CHANCE:
        logger.debug("Rolling a chance die")
        val = _roll_single()
        if val == 10:
            return "Chance succeeded!"
        return f"Chance failed ({val})"
    dice_count = count_dice_to_roll(s)
    if dice_count == 0:
        return "Could not parse any dice to roll"
    logger.debug(f"Rolling a total of {dice_count} dice with type {roll_type}")
    results = []
    for _ in range(dice_count):
        is_bonus = False
        while True:
            val = _roll_single()
            results.append(Roll(value=val, is_bonus=is_bonus))
            if val < roll_type.value[1]:
                break
            is_bonus = True
    return " ".join([str(p) for p in results])


def roll_dice_help() -> str:
    return """Roll dice for Chronicles of Darkness
Command: `!roll [#|chance] (10again|9again|8again)`
Examples:
-- `!roll 4`
-- `!roll 3 10again`
-- `!roll 8 9again`
-- `!roll 2 8again`
-- `!roll chance`"""