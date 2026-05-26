# Apitronix Exhibition Stand

Kiosk app for collecting early-adopter registrations at exhibitions.

## Requirements

- Python 3.11+
- [UV](https://docs.astral.sh/uv/) — `pip install uv` or `winget install astral-sh.uv`

## Quick start

```powershell
cd exhibition_stand
uv run exhibition-stand
```

The browser opens automatically at `http://127.0.0.1:5000`.  
Press **Ctrl+C** in the terminal to stop.

## Configuration

Edit `config.toml` before the event:

| Key | Default | Description |
|-----|---------|-------------|
| `app.port` | `5000` | Local HTTP port |
| `app.fullscreen` | `false` | Open browser fullscreen on launch |
| `app.secret_exit_key` | `ctrl+shift+q` | Key combo to quit the app |
| `display.idle_timeout_seconds` | `45` | Seconds before form resets to advertising |
| `data.csv_path` | `registrations.csv` | Where registrations are saved |
| `data.backup_dir` | `backups/` | Hourly backup destination |
| `data.backup_interval_minutes` | `60` | How often to back up the CSV |
| `offer.title` | … | Headline on both the ad screen and form |
| `offer.subtitle` | … | Supporting text |
| `offer.cta` | … | Call-to-action shown in advertising mode |

### Secret exit key format

Single key: `%`  
With modifiers: `ctrl+shift+q` or `alt+f4`

## Collected data

Registrations are appended to `registrations.csv`:

```
timestamp,name,company,email,keep_updated,application_area
2026-05-26T10:15:00,Jane Smith,Acme Ltd,jane@acme.com,yes,IoT sensor nodes
```

An hourly backup is copied to `backups/registrations_YYYYMMDD_HHMMSS.csv`.

## Modes

| Mode | Trigger |
|------|---------|
| **Advertising** | Startup, form submission, Escape, idle timeout |
| **Registration** | Any key pressed while in advertising mode |
| **Success** | After a valid form submission (auto-returns after 3.5 s) |
| **Exit** | Secret key combo (configurable) |
