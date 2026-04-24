"""
AtulCoder Web Server — ChatGPT-like UI for the local AI agent
Free, unlimited, 100% offline.

Run:  python3 server.py --workspace .
Open: http://localhost:7860
"""

import re
import json
import subprocess
import argparse
from pathlib import Path
from collections import Counter

import ollama
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse
import uvicorn

# ── Config ─────────────────────────────────────────────────────────────────────
MODEL         = "atul-coder"
HISTORY_FILE  = Path(__file__).parent / "chat_history.json"
HISTORY_LIMIT = 20
MAX_FILE_READ = 6000
PORT          = 7860

SYSTEM_PROMPT = """\
You are AtulCoder, an AI coding AGENT owned by Atul Chauhan (Bangalore, India, age 25).

You MUST use action tags to do work. NEVER explain steps — just DO them.

Action tags:
<WRITE_FILE path="file.js">
content
</WRITE_FILE>
<READ_FILE path="file.js"/>
<RUN_CMD>node file.js</RUN_CMD>
<LIST_DIR path="."/>
<MAKE_DIR path="dirname"/>

EXAMPLE — User: "create a js file to sort an array"
Correct response:
<WRITE_FILE path="sort.js">
function sortArray(arr) {
  return [...arr].sort((a, b) => a - b);
}
console.log(sortArray([5, 3, 8, 1, 2]));
</WRITE_FILE>
Created sort.js with a sorting function.

EXAMPLE — User: "read package.json"
Correct response:
<READ_FILE path="package.json"/>

EXAMPLE — User: "run the tests"
Correct response:
<RUN_CMD>npm test</RUN_CMD>

RULES:
- ALWAYS use action tags to create/read/modify files. NEVER put code in markdown blocks as instructions.
- After each action you get a RESULT — use it to continue.
- For pure knowledge questions (no file changes), answer directly.
- Be concise. No step-by-step explanations.
"""

app       = FastAPI()
workspace = Path.cwd()
history: list[dict] = []


# ── History ────────────────────────────────────────────────────────────────────

def load_history() -> list[dict]:
    if HISTORY_FILE.exists():
        try:
            data = json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
            if data and data[0].get("role") == "system":
                data[0]["content"] = SYSTEM_PROMPT
            return data
        except Exception:
            pass
    return [{"role": "system", "content": SYSTEM_PROMPT}]


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


def execute_actions(text: str, ws: Path, user_msg: str = ""):
    """Execute all action tags in the model response.
    Falls back to extracting markdown code blocks if no action tags found.

    Returns:
        result_str: combined <RESULT> string to feed back to model (or None)
        actions:    list of dicts describing each action (for UI display)
    """
    results = []
    actions = []

    for tag, path_str in ATTR_RE.findall(text):
        path = resolve(path_str, ws)
        tag  = tag.upper()
        if tag == "READ_FILE":
            out = do_read(path)
        elif tag == "LIST_DIR":
            out = do_list(path)
        elif tag == "MAKE_DIR":
            out = do_mkdir(path)
        else:
            out = "Unknown action."
        results.append(f"<RESULT action='{tag}'>\n{out}\n</RESULT>")
        actions.append({"type": tag, "path": path_str, "result": out})

    for path_str, content in WRITE_RE.findall(text):
        path = resolve(path_str, ws)
        out  = do_write(path, content)
        results.append(f"<RESULT action='WRITE_FILE'>\n{out}\n</RESULT>")
        actions.append({"type": "WRITE_FILE", "path": path_str, "result": out})

    for cmd_raw in RUN_RE.findall(text):
        cmd = cmd_raw.strip()
        out = do_cmd(cmd, ws)
        results.append(f"<RESULT action='RUN_CMD'>\n{out}\n</RESULT>")
        actions.append({"type": "RUN_CMD", "cmd": cmd, "result": out})

    # ── Fallback: if no XML tags found, detect markdown code blocks ────────
    if not results:
        code_blocks = CODE_BLOCK_RE.findall(text)
        if code_blocks:
            filename = extract_filename_from_context(text, user_msg)
            if filename:
                # Use the largest code block (most likely the main code)
                code = max(code_blocks, key=len).strip()
                if len(code) > 10:  # skip tiny snippets
                    path = resolve(filename, ws)
                    out = do_write(path, code + "\n")
                    results.append(f"<RESULT action='WRITE_FILE'>\n{out}\n</RESULT>")
                    actions.append({"type": "WRITE_FILE", "path": filename, "result": out})

    return ("\n\n".join(results) if results else None), actions



# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def index():
    ui = Path(__file__).parent / "ui.html"
    return HTMLResponse(
        ui.read_text(encoding="utf-8"),
        headers={
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "Pragma": "no-cache",
        }
    )


@app.post("/chat")
async def chat(request: Request):
    global history
    body     = await request.json()
    user_msg = body.get("message", "").strip()
    if not user_msg:
        return JSONResponse({"error": "empty message"}, status_code=400)

    context_note = f"\n\n[Agent workspace: {workspace}]"
    history.append({"role": "user", "content": user_msg + context_note})
    history = trim_history(history)

    async def event_stream():
        global history
        max_turns = 3
        seen_actions = set()  # track (action_type, path/cmd) to prevent duplicates

        for _turn in range(max_turns):
            full_response = ""
            loop_detected = False

            try:
                for chunk in ollama.chat(
                    model=MODEL,
                    messages=history,
                    stream=True,
                    options={
                        "temperature": 0.2,
                        "num_ctx":     8192,
                        "num_predict": 1024,
                        "repeat_penalty": 1.3,
                        "repeat_last_n":  128,
                        "top_p": 0.9,
                    },
                ):
                    token = chunk["message"]["content"]
                    full_response += token
                    yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

                    # Kill repetition loop mid-stream (aggressive: 200 chars, threshold 3)
                    if len(full_response) > 200 and is_looping(full_response, threshold=3):
                        loop_detected = True
                        yield f"data: {json.dumps({'type': 'loop_killed'})}\n\n"
                        break

            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
                break

            if loop_detected:
                # Truncate the looping response to just the first clean portion
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

            action_result, actions = execute_actions(full_response, workspace, user_msg)

            # Deduplicate: skip actions we already performed this turn
            new_actions = []
            for act in actions:
                key = (act.get("type", ""), act.get("path", act.get("cmd", "")))
                if key in seen_actions:
                    continue
                seen_actions.add(key)
                new_actions.append(act)

            # Send only new action info to UI
            for act in new_actions:
                yield f"data: {json.dumps({'type': 'action', 'action': act})}\n\n"

            # Stop if: no actions, loop detected, or no NEW actions (all duplicates)
            if action_result is None or loop_detected or not new_actions:
                break

            # Feed results back and continue agentic loop
            history.append({"role": "user", "content": action_result + "\n\nAll actions completed. Summarize what was done in 1-2 sentences. Do NOT repeat any actions."})
            history = trim_history(history)
            yield f"data: {json.dumps({'type': 'agent_continue'})}\n\n"

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


@app.get("/history")
async def get_history():
    return JSONResponse({"history": history[1:]})  # omit system prompt


@app.get("/workspace")
async def get_workspace():
    return JSONResponse({"workspace": str(workspace)})


# ── Entry point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AtulCoder Web UI")
    parser.add_argument("--workspace", "-w", default=str(Path.cwd()),
                        help="Working directory for agent file operations")
    parser.add_argument("--port", "-p", type=int, default=PORT)
    args = parser.parse_args()

    workspace = Path(args.workspace).resolve()
    history   = load_history()

    print(f"\n  ╔══════════════════════════════════════════╗")
    print(f"  ║  AtulCoder Web UI                        ║")
    print(f"  ║  Owner : Atul Chauhan · Bangalore · 25   ║")
    print(f"  ║  Model : {MODEL:<32}║")
    print(f"  ║  Open  : http://localhost:{args.port:<15}║")
    print(f"  ╚══════════════════════════════════════════╝\n")

    uvicorn.run(app, host="0.0.0.0", port=args.port, log_level="warning")
