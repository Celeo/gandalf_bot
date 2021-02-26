from datetime import datetime
import os

import pytest

from gandalf_bot.config import (
    BasicConfig,
    ScheduledPing,
    load_roles_from_disk,
    db,
    connect_to_db,
    RoleConfigEntry,
)


BASIC_CONFIG_FILE_TEST_NAME = "config.test.json"
ROLES_DB_FILE_TEST_NAME = "roles.test.db"
BASIC_CONFIG_FILE_TEST_CONTENT = """
{
  "token": "abc123",
  "containment_role_id": 1234567890,
  "valheim_role_id": 1234567891,
  "containment_response_gif": "https://example.com",
  "blessable_user_ids": [
      123,
      456
  ],
  "scheduled": [
      {
        "channel_id": 123456,
        "message": "Let's go",
        "cron": "30 17 * * 3"
      }
  ]
}
"""


@pytest.fixture(autouse=True)
def set_config_paths(monkeypatch):
    monkeypatch.setattr(
        "gandalf_bot.config.BASE_CONFIG_FILE_NAME", BASIC_CONFIG_FILE_TEST_NAME
    )
    monkeypatch.setattr(
        "gandalf_bot.config.ROLE_CONFIG_FILE_NAME", ROLES_DB_FILE_TEST_NAME
    )


@pytest.fixture(autouse=True)
def clean_test_files():
    yield
    if os.path.exists(BASIC_CONFIG_FILE_TEST_NAME):
        os.remove(BASIC_CONFIG_FILE_TEST_NAME)
    if db["real"] is not None:
        db["real"].close()
    db["real"] = None
    if os.path.exists(ROLES_DB_FILE_TEST_NAME):
        os.remove(ROLES_DB_FILE_TEST_NAME)


@pytest.fixture
def sample_rce():
    rce = RoleConfigEntry()
    rce.channel_id = 1  # type: ignore
    rce.message_id = 2  # type: ignore
    rce.emoji_name = "a"  # type: ignore
    rce.role_name = "b"  # type: ignore
    return rce


def test_from_disk():
    with open(BASIC_CONFIG_FILE_TEST_NAME, "w") as f:
        f.write(BASIC_CONFIG_FILE_TEST_CONTENT)
    c = BasicConfig.from_disk()
    assert c.token == "abc123"
    assert c.containment_role_id == 1234567890
    assert c.valheim_role_id == 1234567891
    assert c.containment_response_gif == "https://example.com"
    assert c.blessable_user_ids == [123, 456]
    assert c.scheduled == [
        ScheduledPing(channel_id=123456, message="Let's go", cron="30 17 * * 3")
    ]


def test_db_create_empty():
    connect_to_db()
    roles = load_roles_from_disk()
    assert len(roles) == 0


def test_db_load_roles_from_disk():
    connect_to_db()
    rce = RoleConfigEntry.create(
        channel_id=1, message_id=2, emoji_name="a", role_name="b"
    )
    roles = load_roles_from_disk()
    assert len(roles) == 1
    assert roles[0] == rce


def test_role_config_entry_matches(sample_rce):
    assert sample_rce.matches(1, 2, "a")
    assert not sample_rce.matches(1, 2, "b")


def test_role_config_entry_str(sample_rce):
    assert str(sample_rce) == "<RoleConfigEntry b>"


def test_role_config_entry_repr(sample_rce):
    assert repr(sample_rce) == "<RoleConfigEntry 1 2 a b>"


def test_connect_to_db():
    connect_to_db()
    os.remove(ROLES_DB_FILE_TEST_NAME)
    connect_to_db()


def test_scheduled_ping_should_ping():
    ping = ScheduledPing(channel_id=123456, message="Let's go", cron="30 17 * * 3")
    assert ping.should_ping(datetime(2021, 1, 6, 17, 0, 0)) == False
    assert ping.should_ping(datetime(2021, 1, 6, 17, 28, 0)) == False
    assert ping.should_ping(datetime(2021, 1, 6, 17, 30, 1)) == False
    assert ping.should_ping(datetime(2021, 1, 6, 17, 28, 59)) == False
    assert ping.should_ping(datetime(2021, 1, 6, 17, 29))
    assert ping.should_ping(datetime(2021, 1, 6, 17, 29, 30))
    assert ping.should_ping(datetime(2021, 1, 6, 17, 29, 59))
    assert ping.should_ping(datetime(2021, 1, 6, 17, 30)) == False
