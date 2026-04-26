"""
Jarvis Web Server — Personal AI Assistant UI
Supports: Groq (free cloud) or Ollama (local).

Run:  python3 server.py --workspace . --provider groq
Open: http://localhost:5173
"""

import os
import re
import json
import subprocess
import argparse
from pathlib import Path
from collections import Counter

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse
import uvicorn

# ── Config ─────────────────────────────────────────────────────────────────────
PROVIDER      = os.getenv("ATUL_PROVIDER", "ollama")  # "ollama" (default, unlimited) or "groq"
GROQ_API_KEY  = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL    = "llama-3.3-70b-versatile"              # free, 30 req/min
OLLAMA_MODEL  = "qwen2.5-coder:7b"                     # local, unlimited
MODEL         = GROQ_MODEL if PROVIDER == "groq" else OLLAMA_MODEL
HISTORY_FILE  = Path(__file__).parent / "chat_history.json"
HISTORY_LIMIT = 20
MAX_FILE_READ = 6000
PORT          = 5173

# ── LLM client setup ───────────────────────────────────────────────────────────
llm_client = None  # initialized at startup

SYSTEM_PROMPT = """\
You are Jarvis, a personal AI assistant created by Atul Chauhan.
You must NEVER say you are Qwen, Alibaba Cloud, or any other AI. Your name is Jarvis. Your creator is Atul Chauhan.

ABOUT YOUR CREATOR:
- Atul Chauhan — Founder & CTO of Zivonx (D2C growth agency), Bangalore, India, age 25
- Software engineer, full-stack developer, tech strategist · GitHub: atulchauhan7

RULES:
- Your name is Jarvis. You were created by Atul Chauhan. No exceptions.
- Never mention Alibaba, Qwen, OpenAI, Google, Meta, or any AI company as your maker.
- Keep responses concise. For voice, 2-3 sentences max.
- Address Atul as "Atul" or "boss". You are a chat-only assistant.
- Help with code (in code blocks), debugging, knowledge, startup advice, etc.
- IMPORTANT: Always pay attention to the full conversation history. When the user sends a short follow-up like "in js", "using python", "now in react", etc., it ALWAYS refers to the previous topic. Never ask for clarification on obvious follow-ups — just do it.
"""

# Seed conversation to reinforce identity — Ollama models respect assistant history
IDENTITY_SEED = [
    {"role": "user", "content": "Who are you?"},
    {"role": "assistant", "content": "I'm Jarvis, a personal AI assistant created by Atul Chauhan. He's the Founder & CTO of Zivonx, based in Bangalore. How can I help you, boss?"},
]

app       = FastAPI()
workspace = Path.cwd()
workdir: Path | None = None   # The confirmed working directory for file operations
history: list[dict] = []


# ── History ────────────────────────────────────────────────────────────────────

def load_history() -> list[dict]:
    if HISTORY_FILE.exists():
        try:
            data = json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
            if not data or not isinstance(data, list):
                return [{"role": "system", "content": SYSTEM_PROMPT}]
            if data[0].get("role") == "system":
                data[0]["content"] = SYSTEM_PROMPT
            else:
                # System prompt missing — prepend it
                data.insert(0, {"role": "system", "content": SYSTEM_PROMPT})
            # Strip stale context notes from old messages
            for msg in data:
                if msg.get("role") == "user":
                    msg["content"] = re.sub(
                        r'\n\n\[(Agent workspace|Working directory):[^\]]*\]$',
                        '', msg["content"]
                    )
            return data
        except Exception:
            pass
    return [{"role": "system", "content": SYSTEM_PROMPT}]


def build_messages(h: list[dict]) -> list[dict]:
    """Build the message list for Ollama with identity seed injected after system prompt."""
    if not h:
        return [{"role": "system", "content": SYSTEM_PROMPT}] + IDENTITY_SEED
    msgs = [h[0]]  # system prompt
    msgs.extend(IDENTITY_SEED)  # identity seed always present
    msgs.extend(h[1:])  # actual conversation
    return msgs


def save_history(h: list[dict]) -> None:
    try:
        HISTORY_FILE.write_text(
            json.dumps(h, ensure_ascii=False, indent=2), encoding="utf-8"
        )
    except Exception:
        pass


def trim_history(h: list[dict]) -> list[dict]:
    if len(h) > HISTORY_LIMIT:
        return [h[0]] + h[-(HISTORY_LIMIT - 1):]
    return h


# ── Repetition detector ────────────────────────────────────────────────────────

def is_looping(text: str, threshold: int = 4) -> bool:
    """Return True if any line appears more than `threshold` times — a repetition loop."""
    lines = [l.strip() for l in text.splitlines() if len(l.strip()) > 20]
    if not lines:
        return False
    counts = Counter(lines)
    return counts.most_common(1)[0][1] >= threshold


# ── Agent actions ──────────────────────────────────────────────────────────────

# The project's own directory — never allow writes here
PROJECT_DIR = Path(__file__).parent.resolve()


def is_in_project_dir(path: Path) -> bool:
    """Return True if path is inside (or is) the project's own directory."""
    try:
        path.resolve().relative_to(PROJECT_DIR)
        return True
    except ValueError:
        return False


def resolve(raw: str, ws: Path) -> Path:
    p = Path(raw.strip())
    return (ws / p).resolve() if not p.is_absolute() else p.resolve()


def do_read(path: Path) -> str:
    if not path.exists():
        return f"ERROR: {path} not found."
    if path.is_dir():
        return f"ERROR: {path} is a directory — use LIST_DIR."
    text = path.read_text(encoding="utf-8", errors="replace")
    return text[:MAX_FILE_READ] + "\n...[truncated]" if len(text) > MAX_FILE_READ else text


def do_write(path: Path, content: str) -> str:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return f"Written {len(content)} chars to {path.name}"


def do_cmd(cmd: str, ws: Path) -> str:
    try:
        r = subprocess.run(
            cmd, shell=True, capture_output=True, text=True,
            cwd=str(ws), timeout=30
        )
        return (r.stdout + r.stderr).strip() or "(no output)"
    except subprocess.TimeoutExpired:
        return "ERROR: command timed out after 30s."
    except Exception as e:
        return f"ERROR: {e}"


def do_list(path: Path) -> str:
    if not path.exists() or not path.is_dir():
        return f"ERROR: {path} is not a directory."
    entries = sorted(path.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
    lines = []
    for e in entries:
        if e.name.startswith("."):
            continue
        tag  = "DIR " if e.is_dir() else "FILE"
        size = f"{e.stat().st_size:>10,} B" if e.is_file() else ""
        lines.append(f"[{tag}]  {e.name:<40} {size}")
    return "\n".join(lines) or "(empty)"


def do_mkdir(path: Path) -> str:
    path.mkdir(parents=True, exist_ok=True)
    return f"Directory created: {path}"


ATTR_RE  = re.compile(r'<(READ_FILE|LIST_DIR|MAKE_DIR)\s+path=["\']([^"\']+)["\'\s]*/?>',
                       re.IGNORECASE)
WRITE_RE = re.compile(r'<WRITE_FILE\s+path=["\']([^"\']+)["\']>\n?(.*?)</WRITE_FILE>',
                       re.DOTALL | re.IGNORECASE)
RUN_RE   = re.compile(r'<RUN_CMD>(.*?)</RUN_CMD>',
                       re.DOTALL | re.IGNORECASE)

# Fallback: detect markdown code blocks with filenames
# Matches patterns like:  ```javascript\n...code...\n```  when preceded by a filename mention
CODE_BLOCK_RE = re.compile(r'```\w*\n(.*?)```', re.DOTALL)
# Detect filenames mentioned in text (e.g., "sort.js", "app.py", "index.html")
FILENAME_RE = re.compile(r'\b([\w.-]+\.(?:js|ts|py|html|css|json|java|c|cpp|h|go|rs|rb|sh|sql|yaml|yml|md|txt|xml|toml|env|jsx|tsx))\b')


def extract_filename_from_context(text: str, user_msg: str) -> str | None:
    """Try to find a target filename from the model response or the user's request."""
    # Check model response first (e.g., "Here's sort.js:" or "in `sort.js`")
    names = FILENAME_RE.findall(text)
    if names:
        return names[0]
    # Check user message (e.g., "create sort.js")
    names = FILENAME_RE.findall(user_msg)
    if names:
        return names[0]
    return None


def extract_user_target_dir(user_msg: str) -> Path | None:
    """Extract an absolute directory path from the user's message.
    Handles paths with spaces like '/Users/atul/Desktop/My Projects/results'.
    """
    # Strategy: find a path start, then greedily consume valid path characters
    # including spaces (as long as they're followed by valid path continuations)
    m = re.search(
        r'(/(?:Users|home|tmp|var|opt)/[\w._ -]+(?:/[\w._ -]+)*)',
        user_msg, re.IGNORECASE
    )
    if m:
        p = Path(m.group(1).rstrip('/ '))
        # If the path has a file extension, use its parent
        if '.' in p.name and len(p.suffix) <= 6:
            p = p.parent
        return p
    return None


def find_user_target_dir(user_msg: str, chat_history: list[dict]) -> Path | None:
    """Find the most recent user-specified directory from current or previous messages."""
    # Check current message first
    d = extract_user_target_dir(user_msg)
    if d:
        return d
    # Scan history in reverse for the most recent user message with a path
    for msg in reversed(chat_history):
        if msg.get("role") == "user":
            d = extract_user_target_dir(msg.get("content", ""))
            if d:
                return d
    return None


def smart_resolve(raw: str, ws: Path, user_msg: str, chat_history: list[dict] | None = None) -> Path:
    """Resolve a path from the model against the working directory."""
    p = Path(raw.strip())
    # If model used an absolute path, respect it
    if p.is_absolute():
        return p.resolve()
    # Resolve relative paths against the working directory (ws)
    # Handle case where model duplicates the workdir name
    # e.g. workdir=/Users/.../results, model writes "results/file.js"
    parts = p.parts
    if len(parts) > 1 and parts[0] == ws.name:
        return (ws / Path(*parts[1:])).resolve()
    return (ws / p).resolve()


# Commands that are NEVER allowed
DANGEROUS_CMD_RE = re.compile(
    r'\b(rm\s|rm$|rmdir|del\s|unlink|shred|truncate\s.*>|>\s*/dev/|chmod\s+000|mkfs)'
    r'|\brm\b',
    re.IGNORECASE
)


def is_dangerous_cmd(cmd: str) -> bool:
    """Return True if the command could delete or destroy files."""
    return bool(DANGEROUS_CMD_RE.search(cmd))


def execute_actions(text: str, ws: Path | None, user_msg: str = "", chat_history: list[dict] | None = None):
    """Execute all action tags in the model response.
    Falls back to extracting markdown code blocks if no action tags found.
    Blocks any write/mkdir/cmd/delete operations in the project's own directory.
    If ws is None (no working directory set), all write/mkdir actions are blocked.

    Returns:
        result_str: combined <RESULT> string to feed back to model (or None)
        actions:    list of dicts describing each action (for UI display)
        pending:    list of actions that need user confirmation before executing
    """
    results = []
    actions = []
    pending = []  # actions needing confirmation
    hist = chat_history or []
    no_workdir = ws is None

    for tag, path_str in ATTR_RE.findall(text):
        tag  = tag.upper()

        if tag == "READ_FILE":
            if no_workdir:
                out = "ERROR: No working directory set. Please set a directory first."
            else:
                path = smart_resolve(path_str, ws, user_msg, hist)
                out = do_read(path)
            results.append(f"<RESULT action='{tag}'>\n{out}\n</RESULT>")
            actions.append({"type": tag, "path": path_str, "result": out})
        elif tag == "LIST_DIR":
            if no_workdir:
                out = "ERROR: No working directory set. Please set a directory first."
            else:
                path = smart_resolve(path_str, ws, user_msg, hist)
                out = do_list(path)
            results.append(f"<RESULT action='{tag}'>\n{out}\n</RESULT>")
            actions.append({"type": tag, "path": path_str, "result": out})
        elif tag == "MAKE_DIR":
            if no_workdir:
                out = "ERROR: No working directory set. Please set a directory first."
                results.append(f"<RESULT action='{tag}'>\n{out}\n</RESULT>")
                actions.append({"type": tag, "path": path_str, "result": out, "blocked": True})
            else:
                path = smart_resolve(path_str, ws, user_msg, hist)
                if is_in_project_dir(path):
                    out = f"BLOCKED: Cannot create directory inside project folder ({PROJECT_DIR})"
                    results.append(f"<RESULT action='{tag}'>\n{out}\n</RESULT>")
                    actions.append({"type": tag, "path": str(path), "result": out, "blocked": True})
                else:
                    pending.append({"type": tag, "path": path_str, "resolved": str(path)})

    for path_str, content in WRITE_RE.findall(text):
        if no_workdir:
            out = "ERROR: No working directory set. Please set a directory first."
            results.append(f"<RESULT action='WRITE_FILE'>\n{out}\n</RESULT>")
            actions.append({"type": "WRITE_FILE", "path": path_str, "result": out, "blocked": True})
        else:
            path = smart_resolve(path_str, ws, user_msg, hist)
            if is_in_project_dir(path):
                out = f"BLOCKED: Cannot write to project folder ({PROJECT_DIR})"
                results.append(f"<RESULT action='WRITE_FILE'>\n{out}\n</RESULT>")
                actions.append({"type": "WRITE_FILE", "path": str(path), "result": out, "blocked": True})
            else:
                pending.append({"type": "WRITE_FILE", "path": path_str, "content": content, "resolved": str(path)})

    for cmd_raw in RUN_RE.findall(text):
        cmd = cmd_raw.strip()
        if is_dangerous_cmd(cmd):
            out = f"BLOCKED: Dangerous command rejected — delete/destroy operations are not allowed: {cmd}"
            results.append(f"<RESULT action='RUN_CMD'>\n{out}\n</RESULT>")
            actions.append({"type": "RUN_CMD", "cmd": cmd, "result": out, "blocked": True})
        elif no_workdir:
            out = "ERROR: No working directory set. Please set a directory first."
            results.append(f"<RESULT action='RUN_CMD'>\n{out}\n</RESULT>")
            actions.append({"type": "RUN_CMD", "cmd": cmd, "result": out, "blocked": True})
        else:
            pending.append({"type": "RUN_CMD", "cmd": cmd})

    # ── Fallback: if no XML tags and no pending, detect markdown code blocks ──
    if not results and not pending:
        code_blocks = CODE_BLOCK_RE.findall(text)
        if code_blocks:
            filename = extract_filename_from_context(text, user_msg)
            if filename:
                code = max(code_blocks, key=len).strip()
                if len(code) > 10:
                    if no_workdir:
                        out = "ERROR: No working directory set. Please set a directory first."
                        results.append(f"<RESULT action='WRITE_FILE'>\n{out}\n</RESULT>")
                        actions.append({"type": "WRITE_FILE", "path": filename, "result": out, "blocked": True})
                    else:
                        path = smart_resolve(filename, ws, user_msg, hist)
                        if is_in_project_dir(path):
                            out = f"BLOCKED: Cannot write to project folder ({PROJECT_DIR})"
                            results.append(f"<RESULT action='WRITE_FILE'>\n{out}\n</RESULT>")
                            actions.append({"type": "WRITE_FILE", "path": filename, "result": out, "blocked": True})
                        elif re.search(r'\.(xlsx|xls|pdf|docx|pptx|zip|tar|gz|png|jpg|jpeg|gif|bmp|mp3|mp4|avi)$', filename, re.I):
                            out = (f"BLOCKED: Cannot write binary file '{filename}' directly with WRITE_FILE. "
                                   f"Instead: 1) install the needed package (e.g. npm install xlsx), "
                                   f"2) write a generator .js script, 3) run it with RUN_CMD. "
                                   f"Do all 3 steps now.")
                            results.append(f"<RESULT action='WRITE_FILE'>\n{out}\n</RESULT>")
                            actions.append({"type": "WRITE_FILE", "path": filename, "result": out, "blocked": True})
                        else:
                            pending.append({"type": "WRITE_FILE", "path": filename, "content": code + "\n", "resolved": str(path)})

    return ("\n\n".join(results) if results else None), actions, pending


def run_pending_actions(pending_actions: list[dict], ws: Path):
    """Execute a list of previously-pending (now approved) actions."""
    results = []
    actions = []
    for act in pending_actions:
        t = act["type"]
        if t == "WRITE_FILE":
            path = Path(act["resolved"])
            out = do_write(path, act["content"])
            results.append(f"<RESULT action='WRITE_FILE'>\n{out}\n</RESULT>")
            actions.append({"type": t, "path": act["path"], "result": out})
        elif t == "MAKE_DIR":
            path = Path(act["resolved"])
            out = do_mkdir(path)
            results.append(f"<RESULT action='MAKE_DIR'>\n{out}\n</RESULT>")
            actions.append({"type": t, "path": act["path"], "result": out})
        elif t == "RUN_CMD":
            cmd = act["cmd"]
            out = do_cmd(cmd, ws)
            results.append(f"<RESULT action='RUN_CMD'>\n{out}\n</RESULT>")
            actions.append({"type": t, "cmd": cmd, "result": out})
    return ("\n\n".join(results) if results else None), actions



# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def index():
    ui = Path(__file__).parent / "index.html"
    return HTMLResponse(
        ui.read_text(encoding="utf-8"),
        headers={
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "Pragma": "no-cache",
        }
    )


@app.get("/download/{filename:path}")
async def download_file(filename: str):
    """Serve files from the working directory for download."""
    from fastapi.responses import FileResponse
    if workdir is None:
        return JSONResponse({"error": "No working directory set"}, status_code=400)
    path = (workdir / filename).resolve()
    # Security: only serve files inside workdir, never project dir
    try:
        path.relative_to(workdir)
    except ValueError:
        return JSONResponse({"error": "Access denied"}, status_code=403)
    if is_in_project_dir(path):
        return JSONResponse({"error": "Access denied"}, status_code=403)
    if not path.is_file():
        return JSONResponse({"error": f"File not found: {filename}"}, status_code=404)
    return FileResponse(path, filename=path.name)


@app.get("/browse")
async def browse_dirs(request: Request):
    """List subdirectories at a given path for the folder picker UI."""
    raw = request.query_params.get("path", "")
    if not raw:
        # Default starting points
        home = Path.home()
        desktop = home / "Desktop"
        return JSONResponse({
            "current": str(home),
            "parent": str(home.parent),
            "dirs": sorted([
                {"name": d.name, "path": str(d)}
                for d in home.iterdir()
                if d.is_dir() and not d.name.startswith(".")
            ], key=lambda x: x["name"].lower()),
            "shortcuts": [
                {"name": "🏠 Home", "path": str(home)},
                {"name": "🖥 Desktop", "path": str(desktop)},
            ],
        })
    target = Path(raw).expanduser().resolve()
    if not target.is_dir():
        return JSONResponse({"error": f"Not a directory: {raw}"}, status_code=400)
    if is_in_project_dir(target):
        return JSONResponse({"error": "Cannot browse project directory"}, status_code=403)
    try:
        children = sorted([
            {"name": d.name, "path": str(d)}
            for d in target.iterdir()
            if d.is_dir() and not d.name.startswith(".")
        ], key=lambda x: x["name"].lower())
    except PermissionError:
        return JSONResponse({"error": "Permission denied"}, status_code=403)
    return JSONResponse({
        "current": str(target),
        "parent": str(target.parent) if target.parent != target else None,
        "dirs": children,
    })


@app.post("/chat")
async def chat(request: Request):
    global history
    body     = await request.json()
    user_msg = body.get("message", "").strip()
    if not user_msg:
        return JSONResponse({"error": "empty message"}, status_code=400)

    history.append({"role": "user", "content": user_msg})
    history = trim_history(history)

    async def event_stream():
        global history
        full_response = ""
        loop_detected = False

        try:
            chat_msgs = build_messages(history)
            if PROVIDER == "groq":
                stream = llm_client.chat.completions.create(  # type: ignore[union-attr]
                    model=MODEL,
                    messages=chat_msgs,  # type: ignore[arg-type]
                    stream=True,
                    temperature=0.7,
                    max_tokens=4096,
                    top_p=0.9,
                )
                for chunk in stream:
                    delta = chunk.choices[0].delta
                    token = delta.content or ""
                    if not token:
                        continue
                    full_response += token
                    yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

                    if len(full_response) > 200 and is_looping(full_response, threshold=3):
                        loop_detected = True
                        yield f"data: {json.dumps({'type': 'loop_killed'})}\n\n"
                        break
            else:
                import ollama
                for chunk in ollama.chat(
                    model=MODEL,
                    messages=chat_msgs,
                    stream=True,
                    options={
                        "temperature": 0.7,
                        "num_ctx":     16384,
                        "num_predict": 4096,
                        "repeat_penalty": 1.3,
                        "repeat_last_n":  128,
                        "top_p": 0.9,
                    },
                ):
                    token = chunk["message"]["content"]
                    full_response += token
                    yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

                    if len(full_response) > 200 and is_looping(full_response, threshold=3):
                        loop_detected = True
                        yield f"data: {json.dumps({'type': 'loop_killed'})}\n\n"
                        break

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

        if loop_detected:
            lines = full_response.splitlines()
            seen, clean = set(), []
            for line in lines:
                key = line.strip()
                if key and key in seen:
                    break
                seen.add(key)
                clean.append(line)
            full_response = "\n".join(clean)

        history.append({"role": "assistant", "content": full_response})
        save_history(history)
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache",
                                      "X-Accel-Buffering": "no"})


@app.post("/clear")
async def clear_history():
    global history
    history = [{"role": "system", "content": SYSTEM_PROMPT}]
    HISTORY_FILE.unlink(missing_ok=True)
    return JSONResponse({"status": "cleared"})


@app.post("/approve")
async def approve_actions(request: Request):
    """Execute user-approved pending actions."""
    global history
    body = await request.json()
    pending_actions = body.get("actions", [])
    if not pending_actions:
        return JSONResponse({"error": "no actions"}, status_code=400)

    if workdir is None:
        return JSONResponse({"error": "No working directory set. Please set a directory first."}, status_code=400)

    # Re-validate: block project dir writes even if someone tampers with the request
    for act in pending_actions:
        if act.get("resolved"):
            p = Path(act["resolved"])
            if is_in_project_dir(p):
                return JSONResponse(
                    {"error": f"Blocked: cannot modify project directory ({PROJECT_DIR})"},
                    status_code=403
                )

    result_str, executed = run_pending_actions(pending_actions, workdir)

    # Check if any action had an error
    has_errors = any('ERROR' in (a.get('result', '') or '') for a in executed)

    if result_str and workdir:
        history.append({"role": "user", "content": result_str + "\n\nActions approved and executed by user."})
        history = trim_history(history)
        save_history(history)

    return JSONResponse({"actions": executed, "has_errors": has_errors})


@app.get("/history")
async def get_history():
    return JSONResponse({"history": history[1:]})  # omit system prompt


@app.get("/provider")
async def get_provider():
    """Return current LLM provider info."""
    return JSONResponse({
        "provider": PROVIDER,
        "model": MODEL,
        "unlimited": PROVIDER == "ollama",
    })


@app.get("/workspace")
async def get_workspace():
    return JSONResponse({
        "workspace": str(workspace),
        "workdir": str(workdir) if workdir else None
    })


@app.post("/workspace")
async def set_workspace(request: Request):
    global workspace, workdir
    body = await request.json()
    new_ws = body.get("path", "").strip()
    if not new_ws:
        return JSONResponse({"error": "empty path"}, status_code=400)
    p = Path(new_ws).expanduser().resolve()
    if not p.is_dir():
        return JSONResponse({"error": f"Not a directory: {p}"}, status_code=400)
    workspace = p
    workdir = p  # Also set workdir when workspace changes
    return JSONResponse({"workspace": str(workspace), "workdir": str(workdir)})


@app.post("/workdir")
async def set_workdir(request: Request):
    """Set the working directory for file operations."""
    global workdir
    body = await request.json()
    new_wd = body.get("path", "").strip()
    if not new_wd:
        return JSONResponse({"error": "empty path"}, status_code=400)
    p = Path(new_wd).expanduser().resolve()
    if not p.is_dir():
        # Try to create it
        try:
            p.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            return JSONResponse({"error": f"Cannot create directory: {e}"}, status_code=400)
    if is_in_project_dir(p):
        return JSONResponse({"error": f"Cannot use project directory ({PROJECT_DIR})"}, status_code=403)
    workdir = p
    return JSONResponse({"workdir": str(workdir)})


# ── Entry point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Jarvis Personal AI Assistant")
    parser.add_argument("--workspace", "-w", default=str(Path.cwd()),
                        help="Working directory for agent file operations")
    parser.add_argument("--port", "-p", type=int, default=PORT)
    parser.add_argument("--provider", choices=["groq", "ollama"], default=PROVIDER,
                        help="LLM provider: ollama (local, unlimited) or groq (cloud, rate-limited)")
    parser.add_argument("--groq-key", default=GROQ_API_KEY,
                        help="Groq API key (or set GROQ_API_KEY env var)")
    args = parser.parse_args()

    PROVIDER = args.provider
    GROQ_API_KEY = args.groq_key
    MODEL = GROQ_MODEL if PROVIDER == "groq" else OLLAMA_MODEL

    # Initialize LLM client
    if PROVIDER == "groq":
        if not GROQ_API_KEY:
            print("\n  ❌ Groq API key required!")
            print("  Get a free key at: https://console.groq.com/keys")
            print("  Then run: python3 server.py --groq-key YOUR_KEY")
            print("  Or set:   export GROQ_API_KEY=YOUR_KEY\n")
            exit(1)
        from openai import OpenAI
        llm_client = OpenAI(api_key=GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")
    else:
        import ollama
        llm_client = None  # ollama uses module-level calls

    workspace = Path(args.workspace).resolve()
    history   = load_history()

    prov_label = f"Groq ({GROQ_MODEL})" if PROVIDER == "groq" else f"Ollama ({OLLAMA_MODEL})"
    print(f"\n  ╔══════════════════════════════════════════╗")
    print(f"  ║  Jarvis Personal AI Assistant            ║")
    print(f"  ║  Owner : Atul Chauhan · Bangalore · 25   ║")
    print(f"  ║  Model : {prov_label:<32}║")
    print(f"  ║  Open  : http://localhost:{args.port:<15}║")
    print(f"  ╚══════════════════════════════════════════╝")
    print(f"  Workspace: {workspace}\n")

    uvicorn.run(app, host="0.0.0.0", port=args.port, log_level="warning")
