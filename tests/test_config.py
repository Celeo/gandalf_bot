import os

import pytest

from gandalf_bot.config import Config


CONFIG_FILE_TEST_NAME = "config.test.json"
CONFIG_FILE_TEST_CONTENT = """
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
def set_config_path(monkeypatch):
    monkeypatch.setattr("gandalf_bot.config.CONFIG_FILE_NAME", CONFIG_FILE_TEST_NAME)


@pytest.fixture()
def test_config_file():
    try:
        with open(CONFIG_FILE_TEST_NAME, "w") as f:
            f.write(CONFIG_FILE_TEST_CONTENT)
        yield
    except Exception as e:
        raise e
    finally:
        if os.path.exists(CONFIG_FILE_TEST_NAME):
            os.remove(CONFIG_FILE_TEST_NAME)


def test_from_disk(test_config_file):
    c = Config.from_disk()
    assert c.token == "abc123"
    assert c.containment_role_id == 1234567890
    assert c.containment_response_gif == "https://example.com"
    assert c.blessable_user_ids == [123, 456]
