"""Local dev server — serves /api/chat and /api/clear from the Vercel handler classes."""
import os
import sys
from http.server import HTTPServer
sys.path.insert(0, os.path.dirname(__file__))

from api.chat import handler as chat_handler
from api.clear import handler as clear_handler


class DevHandler(chat_handler):
    def do_POST(self):
        if self.path.startswith("/api/chat"):
            chat_handler.do_POST(self)
        elif self.path.startswith("/api/clear"):
            clear_handler.do_POST(self)
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        chat_handler.do_OPTIONS(self)

    def log_message(self, fmt, *args):
        print(f"[API] {fmt % args}")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    server = HTTPServer(("localhost", port), DevHandler)
    print(f"API dev server running on http://localhost:{port}")
    server.serve_forever()
