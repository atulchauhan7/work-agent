"""
AtulCoder — Local AI Coding Agent (Free & Unlimited)
-----------------------------------------------------
Owner  : Atul Chauhan, Bangalore, India (age 25)
Model  : atul-coder (deepseek-coder + custom persona, via Ollama)
Agent  : reads/writes/creates/deletes files, runs shell commands
History: persisted to chat_history.json across sessions

Run:
  source .venv/bin/activate
  python3 code_assistant.py [--workspace /path/to/dir]
"""

import sys
import re
import json
import shutil
import subprocess
import argparse
from pathlib import Path

import ollama
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.prompt import Prompt
from rich.rule import Rule
from rich.text import Text
from rich.theme import Theme
from rich import box

# ── Config ─────────────────────────────────────────────────────────────────────
MODEL        = "atul-coder"
HISTORY_FILE = Path(__file__).parent / "chat_history.json"
HISTORY_LIMIT = 20
MAX_FILE_READ = 6000

SYSTEM_PROMPT = """\
You are AtulCoder, a coding assistant and agent owned by Atul Chauhan \
(Bangalore, India, age 25). Always say this when asked about your owner.

You can take real actions on the filesystem by outputting these exact tags:

To read a file:
<READ_FILE path="filename.py"/>

To write a file (put full content after the tag on next lines, end with </WRITE_FILE>):
<WRITE_FILE path="filename.py">
file content here
</WRITE_FILE>

To run a shell command:
<RUN_CMD>command here</RUN_CMD>

To list a directory:
<LIST_DIR path="."/>

To create a directory:
<MAKE_DIR path="dirname"/>

Rules:
- Use actions to actually make changes — do not just explain.
- After each action you will receive a RESULT — use it to continue.
- For coding questions without file changes, just answer directly.
- Write clean, correct, production-ready code.
"""
# ───────────────────────────────────────────────────────────────────────────────

# Custom theme for a clean dark terminal look
THEME = Theme({
    "user_label":      "bold bright_blue",
    "agent_label":     "bold bright_cyan",
    "action_label":    "bold yellow",
    "action_result":   "dim green",
    "cmd_output":      "bright_white on grey19",
    "info":            "dim",
    "success":         "bold green",
    "error":           "bold red",
    "warning":         "bold yellow",
    "separator":       "grey50",
})

console = Console(theme=THEME, highlight=False)


# ── History ────────────────────────────────────────────────────────────────────

def load_history() -> list[dict]:
    if HISTORY_FILE.exists():
        try:
            data = json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
            # Always refresh system prompt
            if data and data[0].get("role") == "system":
                data[0]["content"] = SYSTEM_PROMPT
            return data
        except Exception:
            pass
    return [{"role": "system", "content": SYSTEM_PROMPT}]


def save_history(history: list[dict]) -> None:
    try:
        HISTORY_FILE.write_text(
            json.dumps(history, ensure_ascii=False, indent=2), encoding="utf-8"
        )
    except Exception as e:
        console.print(f"[warning]Warning: could not save history: {e}[/warning]")


def trim_history(history: list[dict]) -> list[dict]:
    if len(history) > HISTORY_LIMIT:
        return [history[0]] + history[-(HISTORY_LIMIT - 1):]
    return history


# ── Agent actions ──────────────────────────────────────────────────────────────

def resolve(raw: str, workspace: Path) -> Path:
    p = Path(raw.strip())
    return (workspace / p).resolve() if not p.is_absolute() else p.resolve()


def do_read(path: Path) -> str:
    if not path.exists(): return f"ERROR: {path} not found."
    if path.is_dir():     return f"ERROR: {path} is a directory."
    text = path.read_text(encoding="utf-8", errors="replace")
    if len(text) > MAX_FILE_READ:
        text = text[:MAX_FILE_READ] + f"\n...[truncated]"
    return text


def do_write(path: Path, content: str) -> str:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return f"✓ Written {len(content)} chars → {path.name}"


def do_cmd(cmd: str, workspace: Path) -> str:
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True,
                           text=True, cwd=str(workspace), timeout=30)
        return (r.stdout + r.stderr).strip() or "(no output)"
    except subprocess.TimeoutExpired:
        return "ERROR: timed out after 30s"
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
        tag  = "📁" if e.is_dir() else "📄"
        size = f"{e.stat().st_size:>8,} B" if e.is_file() else ""
        lines.append(f"  {tag}  {e.name:<40} {size}")
    return "\n".join(lines) or "(empty)"


def do_mkdir(path: Path) -> str:
    path.mkdir(parents=True, exist_ok=True)
    return f"✓ Directory created: {path}"


# ── Action parser ──────────────────────────────────────────────────────────────

# Attribute-style tags:  <READ_FILE path="..."/>  <LIST_DIR path="..."/>  <MAKE_DIR path="..."/>
ATTR_RE = re.compile(
    r'<(READ_FILE|LIST_DIR|MAKE_DIR)\s+path=["\']([^"\']+)["\'\s]*/?>',
    re.IGNORECASE,
)
# Block tag: <WRITE_FILE path="...">content</WRITE_FILE>
WRITE_RE = re.compile(
    r'<WRITE_FILE\s+path=["\']([^"\']+)["\']>\n?(.*?)</WRITE_FILE>',
    re.DOTALL | re.IGNORECASE,
)
# Inline block: <RUN_CMD>cmd</RUN_CMD>
RUN_RE = re.compile(r'<RUN_CMD>(.*?)</RUN_CMD>', re.DOTALL | re.IGNORECASE)


def execute_actions(text: str, workspace: Path) -> str | None:
    results = []

    for tag, path_str in ATTR_RE.findall(text):
        path = resolve(path_str, workspace)
        tag  = tag.upper()
        console.print(f"  [action_label]⚙ {tag}[/action_label] [info]{path_str}[/info]")
        if tag == "READ_FILE":
            out = do_read(path)
            preview = out[:300].replace("\n", "↵ ")
            console.print(f"  [info]→ {len(out)} chars read[/info]  [dim]{preview}{'…' if len(out)>300 else ''}[/dim]")
        elif tag == "LIST_DIR":
            out = do_list(path)
            console.print(f"[info]{out}[/info]")
        elif tag == "MAKE_DIR":
            out = do_mkdir(path)
            console.print(f"  [success]{out}[/success]")
        else:
            out = "Unknown"
        results.append(f"<RESULT action='{tag}'>\n{out}\n</RESULT>")

    for path_str, content in WRITE_RE.findall(text):
        path = resolve(path_str, workspace)
        console.print(f"  [action_label]⚙ WRITE_FILE[/action_label] [info]{path_str}[/info]")
        out = do_write(path, content)
        console.print(f"  [success]{out}[/success]")
        results.append(f"<RESULT action='WRITE_FILE'>\n{out}\n</RESULT>")

    for cmd_raw in RUN_RE.findall(text):
        cmd = cmd_raw.strip()
        console.print(f"  [action_label]⚙ RUN_CMD[/action_label] [info]$ {cmd}[/info]")
        out = do_cmd(cmd, workspace)
        console.print(Panel(out, style="cmd_output", padding=(0, 1), box=box.SIMPLE))
        results.append(f"<RESULT action='RUN_CMD'>\n{out}\n</RESULT>")

    return "\n\n".join(results) if results else None


# ── Streaming ──────────────────────────────────────────────────────────────────

def stream_response(messages: list[dict]) -> str:
    """Stream tokens from Ollama, collect and return full response."""
    console.print()
    console.rule(Text("  AtulCoder  ", style="agent_label"), style="separator")

    chunks = []
    try:
        for chunk in ollama.chat(
            model=MODEL,
            messages=messages,
            stream=True,
            options={
                "temperature": 0.2,
                "num_ctx": 8192,
                "num_predict": 1024,
                "repeat_penalty": 1.3,
                "repeat_last_n": 128,
                "top_p": 0.9,
            },
        ):
            token = chunk["message"]["content"]
            chunks.append(token)
            print(token, end="", flush=True)
    except Exception as e:
        console.print(f"\n[error]Stream error: {e}[/error]")

    full = "".join(chunks)
    print()  # newline after stream
    return full


# ── Model check ────────────────────────────────────────────────────────────────

def check_model(model: str) -> bool:
    try:
        names = [m.model.split(":")[0] for m in ollama.list().models if m.model]
        return model in names
    except Exception:
        return False


# ── UI helpers ─────────────────────────────────────────────────────────────────

def print_banner(workspace: Path) -> None:
    console.print()
    console.print(Panel(
        f"[bold bright_cyan]  AtulCoder — AI Coding Agent  [/bold bright_cyan]\n"
        f"[info]  Owner : Atul Chauhan · Bangalore, India · Age 25[/info]\n"
        f"[info]  Model : {MODEL}  ·  100% offline  ·  Free & unlimited[/info]\n"
        f"[info]  Space : {workspace}[/info]\n"
        f"[info]  Cmds  : exit · clear · history · workspace <path>[/info]",
        border_style="bright_cyan",
        box=box.DOUBLE_EDGE,
        padding=(0, 2),
    ))
    console.print()


def print_user_label() -> None:
    console.print()
    console.rule(Text("  You  ", style="user_label"), style="separator")


# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="AtulCoder — Local AI Coding Agent")
    parser.add_argument("--workspace", "-w", default=str(Path.cwd()),
                        help="Working directory for file operations")
    args      = parser.parse_args()
    workspace = Path(args.workspace).resolve()

    print_banner(workspace)

    if not check_model(MODEL):
        console.print(f"[error]Model '{MODEL}' not found.[/error]")
        console.print("[warning]Run: ollama create atul-coder -f Modelfile[/warning]")
        sys.exit(1)

    history = load_history()
    if not history or history[0].get("role") != "system":
        history.insert(0, {"role": "system", "content": SYSTEM_PROMPT})

    n = len([m for m in history if m["role"] != "system"])
    if n:
        console.print(f"[info]  ↩  Resumed session · {n} previous messages[/info]\n")

    # ── Chat loop ──────────────────────────────────────────────────────────────
    while True:
        print_user_label()
        try:
            user_input = Prompt.ask("", console=console).strip()
        except (KeyboardInterrupt, EOFError):
            save_history(history)
            console.print("\n[info]Session saved. Goodbye![/info]")
            break

        if not user_input:
            continue

        cmd = user_input.lower()

        if cmd in ("exit", "quit"):
            save_history(history)
            console.print("[info]Session saved. Goodbye![/info]")
            break

        if cmd == "clear":
            history = [{"role": "system", "content": SYSTEM_PROMPT}]
            HISTORY_FILE.unlink(missing_ok=True)
            console.print("[success]✓ History cleared.[/success]")
            continue

        if cmd == "history":
            for i, m in enumerate(history[1:], 1):
                role    = m["role"].upper()
                preview = m["content"][:100].replace("\n", " ")
                color   = "bright_blue" if role == "USER" else "bright_cyan"
                console.print(f"[{color}]{i:3}. [{role}][/{color}] [info]{preview}[/info]")
            continue

        if cmd.startswith("workspace "):
            new_ws = Path(user_input[10:].strip()).expanduser().resolve()
            if new_ws.is_dir():
                workspace = new_ws
                console.print(f"[success]✓ Workspace → {workspace}[/success]")
            else:
                console.print(f"[error]Not a directory: {new_ws}[/error]")
            continue

        # ── Send to model ──────────────────────────────────────────────────────
        history.append({
            "role": "user",
            "content": f"{user_input}\n\n[workspace: {workspace}]"
        })
        history = trim_history(history)

        max_turns = 5
        for _ in range(max_turns):
            response = stream_response(history)
            history.append({"role": "assistant", "content": response})

            action_result = execute_actions(response, workspace)
            if action_result is None:
                break

            console.print()
            console.rule("[info]  agent acting…  [/info]", style="separator")
            history.append({"role": "user", "content": action_result})
            history = trim_history(history)
        else:
            console.print("[warning]⚠ Max agent turns reached.[/warning]")

        save_history(history)


if __name__ == "__main__":
    main()
