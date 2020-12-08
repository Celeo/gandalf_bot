from dataclasses import dataclass
import json
from typing import List, Optional

from peewee import (
    Model,
    CharField,
    IntegerField,
    DatabaseProxy,
    SqliteDatabase,
)


BASE_CONFIG_FILE_NAME = "config.json"
ROLE_CONFIG_FILE_NAME = "roles.db"

db = {"proxy": DatabaseProxy(), "real": None}


@dataclass
class BasicConfig:

    token: str
    containment_role_id: int
    containment_response_gif: Optional[str]
    blessable_user_ids: List[int]

    @staticmethod
    def from_disk() -> "BasicConfig":
        with open(BASE_CONFIG_FILE_NAME) as f:
            data = json.load(f)
        return BasicConfig(
            token=data["token"],
            containment_role_id=data["containment_role_id"],
            containment_response_gif=data.get("containment_response_gif"),
            blessable_user_ids=data["blessable_user_ids"],
        )


class RoleConfigEntry(Model):

    channel_id = IntegerField()
    message_id = IntegerField()
    emoji_name = CharField()
    role_name = CharField()

    class Meta:
        database = db["proxy"]

    def matches(self, channel_id: int, message_id: int, emoji_name: str) -> bool:
        return (
            self.channel_id == channel_id
            and self.message_id == message_id
            and self.emoji_name == emoji_name
        )

    def __str__(self) -> str:
        return f"<RoleConfigEntry {self.role_name}>"

    def __repr__(self) -> str:
        return f"<RoleConfigEntry {self.channel_id} {self.message_id} {self.emoji_name} {self.role_name}>"


def connect_to_db() -> None:
    if db["real"] is not None:
        return
    real = SqliteDatabase(ROLE_CONFIG_FILE_NAME)
    db["proxy"].initialize(real)
    real.connect()
    real.create_tables([RoleConfigEntry])
    db["real"] = real


def load_roles_from_disk() -> List[RoleConfigEntry]:
    return RoleConfigEntry.select()
