import sys
import threading
from pathlib import Path

from flask import Flask, jsonify, render_template, request

from .config import Config
from .csv_handler import append_registration

ROOT = Path(__file__).parent.parent.parent


def create_app(config: Config) -> Flask:
    app = Flask(
        __name__,
        static_folder=str(ROOT / "static"),
        template_folder=str(ROOT / "templates"),
    )

    @app.route("/")
    def index():
        return render_template(
            "index.html",
            config={
                "idle_timeout_ms": config.idle_timeout_seconds * 1000,
                "secret_exit_key": config.secret_exit_key,
                "offer_title": config.offer_title,
                "offer_subtitle": config.offer_subtitle,
                "offer_cta": config.offer_cta,
            },
        )

    @app.route("/api/register", methods=["POST"])
    def register():
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "No data received"}), 400
        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        if not name or not email:
            return jsonify({"error": "Name and email are required"}), 400
        append_registration(config.csv_path, data)
        return jsonify({"status": "ok"})

    @app.route("/api/exit", methods=["POST"])
    def exit_app():
        def _delayed_exit():
            import time
            time.sleep(0.3)
            sys.exit(0)

        threading.Thread(target=_delayed_exit, daemon=True).start()
        return jsonify({"status": "exiting"})

    return app
