from dataclasses import dataclass
import json
from typing import List, Optional


CONFIG_FILE_NAME = "config.json"


@dataclass
class Config:

    token: str
    containment_role_id: int
    containment_response_gif: Optional[str]
    blessable_user_ids: List[int]

    @staticmethod
    def from_disk() -> "Config":
        with open(CONFIG_FILE_NAME) as f:
            data = json.load(f)
        return Config(
            token=data["token"],
            containment_role_id=data["containment_role_id"],
            containment_response_gif=data.get("containment_response_gif"),
            blessable_user_ids=data["blessable_user_ids"],
        )
