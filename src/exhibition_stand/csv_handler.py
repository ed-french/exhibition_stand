import csv
import shutil
import threading
from datetime import datetime
from pathlib import Path

FIELDS = ["timestamp", "name", "company", "email", "keep_updated", "application_area"]


def append_registration(csv_path: Path, data: dict) -> None:
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    write_header = not csv_path.exists()
    with open(csv_path, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        if write_header:
            writer.writeheader()
        writer.writerow(
            {
                "timestamp": datetime.now().isoformat(timespec="seconds"),
                "name": data.get("name", "").strip(),
                "company": data.get("company", "").strip(),
                "email": data.get("email", "").strip(),
                "keep_updated": "yes" if data.get("keep_updated") else "no",
                "application_area": data.get("application_area", "").strip(),
            }
        )


def backup_csv(csv_path: Path, backup_dir: Path) -> None:
    if not csv_path.exists():
        return
    backup_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    dest = backup_dir / f"registrations_{timestamp}.csv"
    shutil.copy2(csv_path, dest)


def start_backup_scheduler(
    csv_path: Path, backup_dir: Path, interval_minutes: int
) -> None:
    def _schedule():
        backup_csv(csv_path, backup_dir)
        t = threading.Timer(interval_minutes * 60, _schedule)
        t.daemon = True
        t.start()

    t = threading.Timer(interval_minutes * 60, _schedule)
    t.daemon = True
    t.start()
