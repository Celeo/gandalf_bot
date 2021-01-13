from dataclasses import dataclass
from enum import Enum
import re
from random import SystemRandom

from loguru import logger


RESULT_MINIMUM_FOR_SUCCESS = 8
NUMERIC_REGEX = re.compile(r"^\d+$")
SYMBOL_REGEX = re.compile(r"^[+|-]$")
DICE_INPUT_SPLIT_REGEX = re.compile(r"([ |\-|+])")

rand = SystemRandom()


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


class RollPartMod(Enum):

    ADD = "+"
    SUBTRACT = "-"


@dataclass
class Roll:

    value: int
    is_bonus: bool

    def __str__(self) -> str:
        if self.is_bonus:
            return f"({self.value})"
        return f"{self.value}"


def _count_dice_to_roll(s: str) -> int:
    """Determine how many dice the user has requested.

    This method handles single values ("3", "10") and
    math combinations ("1 + 3 - 2").
    """
    val, mod = 0, RollPartMod.ADD
    parts = DICE_INPUT_SPLIT_REGEX.split(s)
    for part in parts:
        if not part:
            continue
        elif NUMERIC_REGEX.match(part):
            val += int(part) * (1 if mod == RollPartMod.ADD else -1)
        elif SYMBOL_REGEX.match(part):
            mod = RollPartMod(part)
    return val


def _roll_single() -> int:
    return rand.randint(1, 10)


def roll_dice(s: str) -> str:
    roll_type = RollType.from_str(s)
    if roll_type == RollType.CHANCE:
        logger.debug("Rolling a chance die")
        val = _roll_single()
        if val == 10:
            return "Chance succeeded!"
        return f"Chance failed ({val})"
    is_rote = "rote" in s.lower()
    dice_count = _count_dice_to_roll(s)
    if dice_count == 0:
        return "Could not parse any dice to roll"
    logger.debug(
        f"Rolling a total of {dice_count} dice with type {roll_type}{' (rote)' if is_rote else ''}"
    )
    results = []
    for _ in range(dice_count):
        is_bonus = False
        while True:
            val = _roll_single()
            results.append(Roll(value=val, is_bonus=is_bonus))
            if val < roll_type.value[1]:
                break
            is_bonus = True
    successes = len([r for r in results if r.value >= 8])
    roll_result_str = " ".join([str(r) for r in results])
    failures = len(results) - successes
    rote_successes = 0
    if failures and is_rote:
        logger.debug(f"Rote roll had {failures} failures, rolling them again")
        nested_result = roll_dice(f"{failures} {roll_type.value[0]}")
        rote_successes = int(nested_result.split()[1])
        successes += rote_successes
    sass = "\nFool of a Took!" if successes == 0 else ""
    ret_msg = "Successes: {}\n{}{}".format(successes, roll_result_str, sass)
    if rote_successes:
        ret_msg += f"\nExtra successes from rote: {rote_successes}"
    elif is_rote:
        ret_msg += "\nNo additional successes from rote"
    return ret_msg


def roll_dice_help() -> str:
    return """Roll dice for Chronicles of Darkness

Command: `!roll [#|chance] (10again|9again|8again) [...]`
Examples:
-- `!roll 4`
-- `!roll 3 10again`
-- `!roll 8 9again`
-- `!roll 2 8again`
-- `!roll 5 rote`
-- `!roll chance`
-- `!roll 1 + 3 - 2`
"""
