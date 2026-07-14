import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]


def load_env() -> None:
    env_path = ROOT / ".env"
    if not env_path.exists():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY", "")
TABLE_NAME = os.environ.get("SUPABASE_GYM_TABLE", "gym_data")
PAGE_CONTENT_TABLES = {
    "fitness-bhaktapur-home-page": "home_page_content",
    "fitness-bhaktapur-about-page": "about_page_content",
}
PORT = int(os.environ.get("PYTHON_BACKEND_PORT", "8000"))
ALLOWED_ORIGIN = os.environ.get("CORS_ALLOWED_ORIGIN", "*")


class ApiError(Exception):
    def __init__(self, status: int, message: str):
        super().__init__(message)
        self.status = status
        self.message = message


def supabase_headers(extra=None):
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ApiError(500, "Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to .env.")

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    if extra:
        headers.update(extra)
    return headers


def supabase_request(path: str, method: str = "GET", payload=None, headers=None):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    request = Request(
        f"{SUPABASE_URL}/rest/v1/{path}",
        data=data,
        method=method,
        headers=supabase_headers(headers),
    )

    try:
        with urlopen(request, timeout=15) as response:
            body = response.read().decode("utf-8")
            return json.loads(body) if body else None
    except HTTPError as exc:
        details = exc.read().decode("utf-8", errors="replace")
        raise ApiError(exc.code, details or exc.reason)
    except URLError as exc:
        raise ApiError(502, f"Could not reach Supabase: {exc.reason}")


def get_gym_data(key: str):
    page_table = PAGE_CONTENT_TABLES.get(key)
    if page_table:
        rows = supabase_request(f"{page_table}?id=eq.true&select=id,content&limit=1")
        return rows[0].get("content") if rows else None

    encoded_key = quote(key, safe="")
    rows = supabase_request(f"{TABLE_NAME}?key=eq.{encoded_key}&select=key,value&limit=1")
    if not rows:
        return None
    return rows[0].get("value")


def set_gym_data(key: str, value):
    page_table = PAGE_CONTENT_TABLES.get(key)
    if page_table:
        rows = supabase_request(
            f"{page_table}?on_conflict=id",
            method="POST",
            payload=[{"id": True, "content": value}],
            headers={"Prefer": "resolution=merge-duplicates,return=representation"},
        )
        return rows[0].get("content") if rows else value

    rows = supabase_request(
        f"{TABLE_NAME}?on_conflict=key",
        method="POST",
        payload=[{"key": key, "value": value}],
        headers={"Prefer": "resolution=merge-duplicates,return=representation"},
    )
    if not rows:
        return value
    return rows[0].get("value")


class GymApiHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
        self.send_header("Access-Control-Allow-Methods", "GET, PUT, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            self.send_json(200, {"ok": True, "supabaseConfigured": bool(SUPABASE_URL and SUPABASE_KEY)})
            return

        key = self.extract_key()
        if not key:
            self.send_json(404, {"error": "Not found"})
            return

        try:
            self.send_json(200, {"key": key, "value": get_gym_data(key)})
        except ApiError as exc:
            self.send_json(exc.status, {"error": exc.message})

    def do_PUT(self):
        key = self.extract_key()
        if not key:
            self.send_json(404, {"error": "Not found"})
            return

        try:
            body = self.read_json()
            if "value" not in body:
                raise ApiError(400, "Request body must include a value field.")
            value = set_gym_data(key, body["value"])
            self.send_json(200, {"key": key, "value": value})
        except ApiError as exc:
            self.send_json(exc.status, {"error": exc.message})
        except json.JSONDecodeError:
            self.send_json(400, {"error": "Invalid JSON body."})

    def extract_key(self):
        prefix = "/api/gym-data/"
        path = self.path.split("?", 1)[0]
        if not path.startswith(prefix):
            return None
        key = path[len(prefix):].strip("/")
        return key or None

    def read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        payload = self.rfile.read(length).decode("utf-8")
        return json.loads(payload or "{}")

    def send_json(self, status: int, payload):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, format, *args):
        print(f"{self.address_string()} - {format % args}")


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", PORT), GymApiHandler)
    print(f"Python gym backend running on http://localhost:{PORT}")
    print(f"Using Supabase table: {TABLE_NAME}")
    server.serve_forever()
