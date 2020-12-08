import os

import pytest

from gandalf_bot.config import (
    BasicConfig,
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
  "containment_response_gif": "https://example.com",
  "blessable_user_ids": [
      123,
      456
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


def test_from_disk():
    with open(BASIC_CONFIG_FILE_TEST_NAME, "w") as f:
        f.write(BASIC_CONFIG_FILE_TEST_CONTENT)
    c = BasicConfig.from_disk()
    assert c.token == "abc123"
    assert c.containment_role_id == 1234567890
    assert c.containment_response_gif == "https://example.com"
    assert c.blessable_user_ids == [123, 456]


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
