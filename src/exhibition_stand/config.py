import tomllib
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).parent.parent.parent


@dataclass
class Config:
    port: int
    fullscreen: bool
    secret_exit_key: str
    idle_timeout_seconds: int
    csv_path: Path
    backup_dir: Path
    backup_interval_minutes: int
    offer_title: str
    offer_subtitle: str
    offer_cta: str


def load_config(path: Path | None = None) -> Config:
    config_path = path or ROOT / "config.toml"
    with open(config_path, "rb") as f:
        data = tomllib.load(f)
    return Config(
        port=data["app"]["port"],
        fullscreen=data["app"]["fullscreen"],
        secret_exit_key=data["app"]["secret_exit_key"],
        idle_timeout_seconds=data["display"]["idle_timeout_seconds"],
        csv_path=ROOT / data["data"]["csv_path"],
        backup_dir=ROOT / data["data"]["backup_dir"],
        backup_interval_minutes=data["data"]["backup_interval_minutes"],
        offer_title=data["offer"]["title"],
        offer_subtitle=data["offer"]["subtitle"],
        offer_cta=data["offer"]["cta"],
    )
