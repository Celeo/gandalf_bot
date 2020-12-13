from gandalf_bot import dice
from gandalf_bot.dice import (
    RollType,
    roll_dice_help,
    roll_dice,
    count_dice_to_roll,
    _roll_single,
)


def test_roll_type_parse_nothing():
    assert RollType.from_str("") == RollType.EXPLODE_10


def test_roll_type_parse_10again():
    assert RollType.from_str("4 10again") == RollType.EXPLODE_10


def test_roll_type_parse_9again():
    assert RollType.from_str("9again 4") == RollType.EXPLODE_9


def test_roll_type_parse_8again():
    assert RollType.from_str("1 8again") == RollType.EXPLODE_8


def test_roll_type_parse_chance():
    assert RollType.from_str("chance") == RollType.CHANCE


def test_roll_dice_help():
    assert len(roll_dice_help()) > 0


def test_roll_dice_chance_success(monkeypatch):
    monkeypatch.setattr(dice, "_roll_single", lambda: 10)
    assert roll_dice("chance") == "Chance succeeded!"


def test_roll_dice_chance_fail(monkeypatch):
    monkeypatch.setattr(dice, "_roll_single", lambda: 9)
    assert roll_dice("chance") == "Chance failed (9)"


def test_count_dice_to_roll():
    assert count_dice_to_roll("1") == 1
    assert count_dice_to_roll("1 1") == 2
    assert count_dice_to_roll("1 9again") == 1
    assert count_dice_to_roll("10 8again") == 10
    assert count_dice_to_roll("chance") == 0


def test_roll_dice_10again(monkeypatch):
    results = [10, 4]
    monkeypatch.setattr(dice, "_roll_single", lambda: results.pop(0))
    assert roll_dice("1") == "Successes: 1\n10 (4)"


def test_roll_dice_9again(monkeypatch):
    results = [10, 9, 4]
    monkeypatch.setattr(dice, "_roll_single", lambda: results.pop(0))
    assert roll_dice("1 9again") == "Successes: 2\n10 (9) (4)"


def test_roll_dice_8again(monkeypatch):
    results = [10, 9, 8, 4]
    monkeypatch.setattr(dice, "_roll_single", lambda: results.pop(0))
    assert roll_dice("1 8again") == "Successes: 3\n10 (9) (8) (4)"


def test_roll_dice_multiple(monkeypatch):
    results = [4, 2, 5, 3]
    monkeypatch.setattr(dice, "_roll_single", lambda: results.pop(0))
    assert roll_dice("4") == "Successes: 0\n4 2 5 3\nFool of a Took!"


def test_roll_dice_add(monkeypatch):
    results = [4, 2, 5, 3]
    monkeypatch.setattr(dice, "_roll_single", lambda: results.pop(0))
    assert roll_dice("2 2") == "Successes: 0\n4 2 5 3\nFool of a Took!"


def tet_roll_dice_none():
    assert roll_dice(" ") == "Could not parse any dice to roll"


def test_roll_single():
    assert 0 < _roll_single() <= 10
