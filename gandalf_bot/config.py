from dataclasses import dataclass
from datetime import datetime
import json
from typing import Any, Dict, List, Optional

from crontab import CronTab
from loguru import logger
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
class ScheduledPing:

    channel_id: int
    message: str
    cron: str

    def should_ping(self, now=None) -> bool:
        """Should this scheduled ping be triggered

        Returns true if the time between now and the next time this
        ping will trigger is less than 60 seconds. Note that this
        will return false if the cron would trigger exactly on the
        current time.
        """
        return CronTab(self.cron).next(now or datetime.now(), default_utc=False) <= 60

    @staticmethod
    def parse(source: Dict[str, Any]) -> "ScheduledPing":
        return ScheduledPing(
            channel_id=source["channel_id"],
            message=source["message"],
            cron=source["cron"],
        )


@dataclass
class BasicConfig:

    token: str
    containment_role_id: int
    containment_response_gif: Optional[str]
    blessable_user_ids: List[int]
    scheduled: List[ScheduledPing]

    @staticmethod
    def from_disk() -> "BasicConfig":
        with open(BASE_CONFIG_FILE_NAME) as f:
            data = json.load(f)
        scheduled = []
        for sch in data["scheduled"]:
            scheduled.append(ScheduledPing.parse(sch))
        return BasicConfig(
            token=data["token"],
            containment_role_id=data["containment_role_id"],
            containment_response_gif=data.get("containment_response_gif"),
            blessable_user_ids=data["blessable_user_ids"],
            scheduled=scheduled,
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
