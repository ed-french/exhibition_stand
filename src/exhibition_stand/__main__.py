import socket
import sys
import threading
import time
import webbrowser

from .app import create_app
from .config import load_config
from .csv_handler import start_backup_scheduler


def _open_browser(url: str, fullscreen: bool) -> None:
    time.sleep(1.2)
    if fullscreen:
        import subprocess

        if sys.platform == "win32":
            # Open Edge in fullscreen (F11-style)
            subprocess.Popen(
                ["cmd", "/c", "start", "msedge", "--start-fullscreen", url],
                shell=False,
            )
            return
        elif sys.platform == "darwin":
            subprocess.Popen(
                ["open", "-a", "Google Chrome", "--args", "--start-fullscreen", url]
            )
            return
        else:
            subprocess.Popen(["google-chrome", "--start-fullscreen", url])
            return
    webbrowser.open(url)


def main() -> None:
    config = load_config()

    # Validate CSV is writable before accepting any visitors
    try:
        config.csv_path.parent.mkdir(parents=True, exist_ok=True)
        with open(config.csv_path, "a", encoding="utf-8"):
            pass
    except OSError as e:
        print(f"ERROR: Cannot write to CSV at {config.csv_path}: {e}", file=sys.stderr)
        sys.exit(1)

    start_backup_scheduler(config.csv_path, config.backup_dir, config.backup_interval_minutes)

    app = create_app(config)
    local_url = f"http://127.0.0.1:{config.port}"

    try:
        lan_ip = socket.gethostbyname(socket.gethostname())
    except OSError:
        lan_ip = "unavailable"
    lan_url = f"http://{lan_ip}:{config.port}"

    threading.Thread(
        target=_open_browser, args=(local_url, config.fullscreen), daemon=True
    ).start()

    print(f"Apitronix Exhibition Stand  →  {local_url}")
    print(f"Network (other devices)     →  {lan_url}")
    print(f"Registrations CSV           →  {config.csv_path}")
    print(f"CSV backup folder           →  {config.backup_dir}")
    print(f"Press Ctrl+C to stop\n")

    app.run(host="0.0.0.0", port=config.port, debug=False, use_reloader=False)


if __name__ == "__main__":
    main()
