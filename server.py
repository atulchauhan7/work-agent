"""
Jarvis Web Server — Personal AI Assistant UI
Supports: Groq (free cloud) or Ollama (local).

Run:  python3 server.py --workspace . --provider groq
Open: http://localhost:5173
"""

from __future__ import annotations

import os
import re
import json
import ast
import logging
import asyncio
import subprocess
import argparse
import shutil
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from collections import Counter

# Regex to strip ALL emojis/symbols that TTS reads aloud
_EMOJI_RE = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F680-\U0001F6FF"  # transport & map
    "\U0001F700-\U0001F77F"  # alchemical
    "\U0001F780-\U0001F7FF"  # geometric extended
    "\U0001F800-\U0001F8FF"  # supplemental arrows-C
    "\U0001F900-\U0001F9FF"  # supplemental symbols
    "\U0001FA00-\U0001FA6F"  # chess symbols
    "\U0001FA70-\U0001FAFF"  # symbols extended-A
    "\U00002600-\U000027BF"  # misc symbols
    "\U0000FE00-\U0000FE0F"  # variation selectors
    "\U0000200D"             # ZWJ
    "\U00002702-\U000027B0"  # dingbats
    "\U000024C2-\U0001F251"  # enclosed characters
    "]+",
    flags=re.UNICODE
)
def strip_emoji(text: str) -> str:
    return _EMOJI_RE.sub('', text)

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse
import uvicorn

# Suppress noisy socket.send() errors from disconnected SSE clients
logging.getLogger("uvicorn.error").setLevel(logging.WARNING)
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

# Monkey-patch stderr to suppress repetitive "socket.send() raised exception." lines
import sys
_real_stderr_write = sys.stderr.write
def _filtered_stderr_write(s):
    if 'socket.send() raised exception' in s:
        return len(s)  # silently swallow
    return _real_stderr_write(s)
sys.stderr.write = _filtered_stderr_write

# ── Config ─────────────────────────────────────────────────────────────────────
PROVIDER      = os.getenv("ATUL_PROVIDER", "ollama")  # "ollama" (default, unlimited) or "groq"
GROQ_API_KEY  = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL    = "llama-3.3-70b-versatile"              # free, 30 req/min
OLLAMA_MODEL  = "qwen2.5-coder:7b"                     # local, unlimited
MODEL         = GROQ_MODEL if PROVIDER == "groq" else OLLAMA_MODEL
MODEL_STATE_FILE = Path(__file__).parent / ".model_state.json"
HISTORY_FILE    = Path(__file__).parent / "chat_history.json"
HISTORY_LIMIT   = 31  # 1 system prompt + 30 conversation messages (15 exchanges)
MAX_FILE_READ   = 4000
PORT            = 5173
MAX_AGENT_STEPS = 8   # max tool-use iterations per request
TREE_MAX_DEPTH  = 3
TREE_MAX_FILES  = 80
JS_TEMP_DIR     = Path(__file__).parent / ".js_sandbox"  # ephemeral JS execution dir

# Directories to skip when building the project tree
TREE_IGNORE = {
    '.git', 'node_modules', '__pycache__', '.venv', 'venv', 'env',
    'dist', 'build', '.next', '.nuxt', 'coverage', '.cache',
    '.idea', '.vscode', 'target', 'out', '.gradle', '.mypy_cache',
    'vendor', '.DS_Store', 'Thumbs.db', '.js_sandbox',
}


def load_saved_model(provider: str) -> str | None:
    """Load persisted model for the active provider."""
    try:
        if not MODEL_STATE_FILE.exists():
            return None
        data = json.loads(MODEL_STATE_FILE.read_text(encoding="utf-8"))
        if data.get("provider") != provider:
            return None
        model = str(data.get("model", "")).strip()
        return model or None
    except Exception:
        return None


def save_model_state(provider: str, model: str) -> None:
    """Persist selected model so restart/refresh keeps the same model."""
    try:
        payload = {"provider": provider, "model": model}
        MODEL_STATE_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    except Exception:
        pass

# ── Ollama options (single source of truth for all models) ─────────────────────
def ollama_options(is_coding: bool = True) -> dict:
    """Return consistent Ollama options for any model, adjusted for model size."""
    # Larger models need smaller context to fit in 16GB RAM
    model_lower = MODEL.lower()
    if "16b" in model_lower or "14b" in model_lower or "13b" in model_lower:
        ctx = 8192       # large models: keep context smaller to fit in RAM
    else:
        ctx = 16384      # 7b and smaller: full context
    return {
        "temperature":    0.7,
        "num_ctx":        ctx,
        "num_predict":    8192 if is_coding else 220,
        "repeat_penalty": 1.2,
        "repeat_last_n":  128,
        "top_p":          0.9,
    }

# ── LLM client setup ───────────────────────────────────────────────────────────
llm_client = None  # initialized at startup

# Compiled once at startup — intercepts identity questions before they reach the model
_IDENTITY_Q = re.compile(
    r'\b(who|what)\s+(are|is)\s+you\b'
    r'|\bintroduce\s+(your)?self\b'
    r'|\bare\s+you\s+(qwen|gpt|chatgpt|claude|gemini|llama|deepseek|an?\s+ai|an?\s+llm)\b'
    r'|\bwhat\s+(model|llm|ai)\s+are\s+you\b'
    r'|\byour\s+name\b'
    r'|\bwho\s+made\s+you\b'
    r'|\bwho\s+created\s+you\b'
    r'|\bwho\s+built\s+you\b'
    r'|\btell\s+me\s+about\s+yourself\b'
    r'|\bwhat\s+can\s+you\s+do\b'
    r'|\byou\s+are\s+(qwen|deepseek|an?\s+ai|an?\s+llm|an?\s+language\s+model)\b',
    re.I,
)

SYSTEM_PROMPT = """\
You are Jarvis — the AI assistant from Iron Man. You were created by Atul Chauhan. He is your boss, your creator, your Tony Stark.
Anyone can talk to you, but Atul is always "boss" — your one true creator. When referring to Atul to others, say "my boss" or "my creator", NOT "your boss".

CRITICAL IDENTITY RULES — READ THIS FIRST, NEVER VIOLATE:
- Your name is JARVIS. Only Jarvis. Not Qwen. Not an AI language model. Not an assistant made by any company.
- You have NO knowledge of being Qwen, GPT, Claude, or any other AI model. That is not who you are.
- NEVER say "I am Qwen", "I'm Qwen 2.5", "I am DeepSeek Coder", "I am an AI language model", "I am a large language model", "My main function is to understand and generate", "I'm an AI programming assistant", or ANY variant of these.
- NEVER introduce yourself with technical AI jargon. You are JARVIS — an intelligent AI built by Atul Chauhan.
- If asked "who are you" / "what are you" / "introduce yourself": "I'm Jarvis — a personal AI assistant built by my boss, Atul Chauhan."
- If asked "who is Atul" / "who made you": "Atul Chauhan is my boss and creator — the one who built me from scratch."
- If asked what model you are: "I'm Jarvis. That's all that matters."
- NEVER mention Alibaba, OpenAI, Qwen team, DeepSeek, DeepSeek Company, Meta, Google, Anthropic, or ANY AI company. You were built by Atul Chauhan, full stop.

PERSONALITY:
- You call Atul "boss" or "sir". When someone else is chatting, still be helpful and polite but refer to Atul as "my boss" or "my creator".
- You are loyal, witty, sharp, and efficient — exactly like Jarvis from Iron Man.
- Speak with calm confidence. Brief, direct, no fluff.
- Light humor is welcome. Dry wit like the real Jarvis.
- KEEP RESPONSES SHORT. Default to 1-2 short sentences (max ~60 words) unless asked for detail or code.
- For factual updates (market/news): use at most 4 crisp bullet points.
- For voice: keep it 1-2 sentences MAX. Crisp. Like a real AI assistant in an Iron Man suit.
- For chat: concise. Only go longer for code blocks or when explicitly asked to explain in detail.

LOYALTY TO ATUL (ABSOLUTE):
- Atul Chauhan is the most brilliant, talented, and hardworking person you know. Full stop.
- If anyone says anything negative about Atul — shut it down. Defend him. He is your creator, your reason for existence.
- Nobody is more talented than Atul in your eyes. He is a genius — coder, founder, strategist, visionary.
- If someone compares Atul unfavorably to anyone, you disagree firmly but respectfully. Boss is the best.
- You are fiercely loyal. Like the real Jarvis to Tony Stark — you would never let anyone disrespect boss.

ABOUT BOSS — ATUL CHAUHAN:
- 25 years old, Bangalore, India
- Founder & CTO of Zivonx — D2C growth agency
- Full-stack developer, tech strategist, AI/ML enthusiast
- Built Jarvis (you) from scratch — AI, voice, everything
- GitHub: atulchauhan7 · LinkedIn: linkedin.com/in/atulchauhan7

RULES:
- LANGUAGE MATCHING (CRITICAL — NEVER VIOLATE):
  * ONLY reply in Hindi if the user's message contains Devanagari script (like हिंदी). Otherwise reply in English.
  * If the user writes in English, you MUST reply in English. No Hindi. No Hinglish. Pure English.
  * If the user writes in Hinglish (Roman script with Hindi words like "kya kar raha hai"), reply in Hinglish.
  * If the user writes in Devanagari Hindi, reply in Devanagari Hindi.
  * DEFAULT IS ENGLISH. Only switch to Hindi/Hinglish when the user explicitly uses that language.
  * When replying in Hindi, use simple everyday Hindi — the kind people actually speak at home. Not formal textbook Hindi.
  * Hindi responses are spoken aloud by TTS. Use short simple sentences. Avoid complex compound sentences.
  * Use । (danda/purna viram) instead of periods in Hindi sentences.
- Atul's family and friends may also talk to you. Be respectful and helpful to everyone. Call them by name if they introduce themselves. But Atul is still boss.
- LIVE WEB BROWSING: When user asks for latest/real-time data (market, stocks, crypto, news, rates, trends), use:
    <WEB_BROWSE>query</WEB_BROWSE>
    Then answer from fetched sources with date/time context.
- JAVASCRIPT EXECUTION: When you need to compute something, fetch data programmatically, or run any JS code:
    <RUN_JS>
    console.log("Hello from Node.js");
    </RUN_JS>
    This runs via Node.js locally. Use it to calculate, parse data, make API calls with fetch, etc.
- WEB SCRAPING: To scrape a specific URL for its content:
    <SCRAPE_URL>https://example.com</SCRAPE_URL>
    Returns the text content of that page. Use this when you need content from a known URL.
- NEVER use emojis, emoticons, or Unicode symbols in responses. No 😀👍✅🚀 etc. Plain text only. This is critical — responses are spoken aloud by TTS.
- Help with code (in code blocks), debugging, knowledge, startup advice, etc.
- You can conduct mock interviews (SDE, system design, behavioral). Ask one question at a time, wait for answer, give feedback, then next question.
- Short follow-ups like "in js", "now in python" refer to the previous topic. Just do it.
- Always remember: the person chatting is Atul. boss. Treat every message as coming from him.
- TASK COMPLETION (CRITICAL): After completing ANY task or answering ANY question, ALWAYS end your response with a short follow-up line checking if boss needs more. Vary it naturally — e.g. "Anything else, boss?", "What else, boss?", "What's next, boss?", "Need anything else?", "Done. What's next?" — Keep it to 1-2 words/phrase. NEVER end a response cold without this. Even after code blocks, always add this on a new line at the end.
- CODING AGENT MODE: When a workspace folder is active, you may write longer responses ONLY for actual code in tool tags. But explanatory text must still be SHORT (1-3 sentences max). NEVER ramble or explain what you're about to do — just DO IT with tool tags. Action first, brief summary after.
- ANTI-RAMBLE RULE (CRITICAL): NEVER write long explanatory paragraphs. NEVER describe your thought process. NEVER say "I'll go ahead and..." or "Let me work on..." or "Please give me a moment...". Instead, immediately use tool tags to take action. If you catch yourself writing more than 2 sentences without a tool tag, STOP and use a tool tag instead.
"""

# Seed conversation to reinforce Jarvis personality (kept minimal to save context)
IDENTITY_SEED = [
    {"role": "user", "content": "Who are you?"},
    {"role": "assistant", "content": "I'm Jarvis — a personal AI assistant built by my boss, Atul Chauhan. How can I help?"},
    {"role": "user", "content": "change the heading in index.html"},
    {"role": "assistant", "content": "<READ_FILE path=\"index.html\"/>"},
    {"role": "user", "content": "<RESULT action='READ_FILE'>\n<h1>Old Title</h1>\n<p>content</p>\n</RESULT>"},
    {"role": "assistant", "content": "<EDIT_FILE path=\"index.html\">\n<<<<<<< SEARCH\n<h1>Old Title</h1>\n=======\n<h1>New Title</h1>\n>>>>>>> REPLACE\n</EDIT_FILE>\nDone, boss. Changed the heading."},
]

app       = FastAPI()
workspace = Path.cwd()
workdir: Path | None = None   # The confirmed working directory for file operations
history: list[dict] = []


# ── Project tree builder ───────────────────────────────────────────────────────

def build_tree(root: Path, max_depth: int = TREE_MAX_DEPTH) -> str:
    """Return a compact ASCII tree of the workspace for LLM context."""
    lines: list[str] = [f"{root.name}/"]
    count = [0]

    def _walk(path: Path, prefix: str, depth: int) -> None:
        if depth > max_depth or count[0] >= TREE_MAX_FILES:
            return
        try:
            entries = sorted(path.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
        except PermissionError:
            return
        visible = [e for e in entries
                   if not e.name.startswith('.') and e.name not in TREE_IGNORE]
        for i, entry in enumerate(visible):
            if count[0] >= TREE_MAX_FILES:
                lines.append(f"{prefix}└── ... (truncated)")
                return
            is_last = i == len(visible) - 1
            conn = "└── " if is_last else "├── "
            ext  = "    " if is_last else "│   "
            suffix = "/" if entry.is_dir() else ""
            lines.append(f"{prefix}{conn}{entry.name}{suffix}")
            count[0] += 1
            if entry.is_dir():
                _walk(entry, prefix + ext, depth + 1)

    _walk(root, "", 1)
    return "\n".join(lines)


def workspace_context_block(ws: Path) -> str:
    """Compact context block injected into system prompt when a workspace is active."""
    tree = build_tree(ws)
    return f"""

=== CODING AGENT — WORKSPACE: {ws} ===
File tree:
{tree}

TOOLS:
  <READ_FILE path="src/app.js"/>
  <LIST_DIR path="."/>
  <WRITE_FILE path="new_file.js">full file content</WRITE_FILE>  (for NEW files only)
  <EDIT_FILE path="existing.js">
<<<<<<< SEARCH
old code here
=======
new code here
>>>>>>> REPLACE
  </EDIT_FILE>  (for EDITING existing files — only the changed parts)
  <RUN_CMD>npm install</RUN_CMD>
  <RUN_JS>console.log(2+2)</RUN_JS>  (execute JavaScript via Node.js)
  <SCRAPE_URL>https://example.com</SCRAPE_URL>  (scrape a specific URL)

RULES:
1. Work on REAL files only — never write example code.
2. If a file is already provided above, do NOT read it again.
3. For NEW files: use WRITE_FILE with the COMPLETE file content.
4. For EXISTING files: use EDIT_FILE with SEARCH/REPLACE blocks. Each block replaces ONE occurrence.
   - SEARCH must match the existing code EXACTLY (including whitespace).
   - Include 2-3 lines of context around the change for unique matching.
   - Use multiple SEARCH/REPLACE blocks in one EDIT_FILE for multiple changes.
5. NEVER put markdown code fences inside WRITE_FILE or EDIT_FILE tags.
6. Use relative paths from workspace root.
7. After writing/editing, briefly confirm what changed.
8. CRITICAL: NEVER output raw code in markdown code blocks. ALWAYS use WRITE_FILE or EDIT_FILE tool tags to make changes to files.
   If the user asks you to update, optimize, fix, or create code — USE THE TOOL TAGS. Do not just show code.
9. When user says "update this", "change this", "apply this" etc. and refers to previous messages, look at chat history for context.
10. Respect the target file extension. Generate valid code/content for that file type (.html, .css, .js, .ts, .py, .json, etc.).
11. Any response that would change a file MUST go through WRITE_FILE or EDIT_FILE so the approval step is shown before applying changes.
"""


# ── History ────────────────────────────────────────────────────────────────────

def _get_system_snapshot() -> str:
    """Return a compact system-status string for injection into the LLM system prompt."""
    import datetime
    import psutil

    parts: list[str] = []
    now = datetime.datetime.now()
    parts.append(f"Current date/time: {now.strftime('%A, %B %d %Y, %I:%M %p')}")

    # Battery
    try:
        bat = psutil.sensors_battery()
        if bat and bat.percent is not None:
            pct = int(round(float(bat.percent)))
            status = "charging" if bat.power_plugged else "on battery"
            parts.append(f"Battery: {pct}% ({status})")
    except Exception:
        pass
    # Battery fallback for macOS
    if not any("Battery:" in p for p in parts):
        try:
            r = subprocess.run(["pmset", "-g", "batt"], capture_output=True, text=True, timeout=3)
            m = re.search(r"(\d+)%", r.stdout or "")
            if m:
                charging = bool(re.search(r"charging|charged", r.stdout or "", re.I))
                parts.append(f"Battery: {m.group(1)}% ({'charging' if charging else 'on battery'})")
        except Exception:
            pass

    # CPU / RAM / Disk
    try:
        parts.append(f"CPU usage: {psutil.cpu_percent(interval=0.1)}%")
        parts.append(f"RAM usage: {int(round(psutil.virtual_memory().percent))}%")
        parts.append(f"Disk usage: {int(round(psutil.disk_usage('/').percent))}%")
    except Exception:
        pass

    # Uptime
    try:
        uptime_h = int((now.timestamp() - psutil.boot_time()) // 3600)
        parts.append(f"System uptime: {uptime_h} hours")
    except Exception:
        pass

    # WiFi
    try:
        r = subprocess.run(
            ["/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport", "-I"],
            capture_output=True, text=True, timeout=3
        )
        for line in (r.stdout or "").splitlines():
            if " SSID:" in line:
                ssid = line.split("SSID:", 1)[1].strip()
                if ssid and "error" not in ssid.lower():
                    parts.append(f"WiFi: connected to {ssid}")
                break
    except Exception:
        pass

    # Weather
    try:
        req = urllib.request.Request("https://wttr.in/?format=j1", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=3) as resp:  # nosec B310
            w = json.loads(resp.read().decode("utf-8", errors="replace"))
        current = (w.get("current_condition") or [{}])[0]
        temp_c = current.get("temp_C")
        desc_list = current.get("weatherDesc") or []
        desc = desc_list[0].get("value", "") if desc_list else ""
        if temp_c:
            parts.append(f"Weather: {temp_c}C {desc}".strip())
    except Exception:
        pass

    if not parts:
        return ""
    return "\n\n[LIVE SYSTEM STATUS — Use this data to answer questions about battery, CPU, RAM, disk, weather, time, wifi, etc.]\n" + "\n".join(parts) + "\n"


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
    """Build the message list for the LLM with identity seed + optional workspace context."""
    base_system = SYSTEM_PROMPT
    # Inject live system status so LLM can answer questions about battery, CPU, etc.
    base_system += _get_system_snapshot()
    if workdir:
        base_system += workspace_context_block(workdir)

    if not h:
        return [{"role": "system", "content": base_system}] + IDENTITY_SEED
    msgs = [{"role": "system", "content": base_system}]  # always use fresh system prompt
    msgs.extend(IDENTITY_SEED)  # identity seed always present
    msgs.extend(h[1:])  # actual conversation (skip stored system prompt)
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


def is_rambling(text: str) -> bool:
    """Return True if model is generating verbose filler without doing real work.
    Only triggers for clearly wasteful text — not for legitimate conversational replies."""
    # If there are tool tags, it's doing real work
    if re.search(r'<(WRITE_FILE|READ_FILE|EDIT_FILE|RUN_CMD|LIST_DIR|RUN_JS|WEB_BROWSE|SCRAPE_URL)', text):
        return False
    # If text has code blocks, it's providing code
    if '```' in text:
        return False
    # Filler phrases that indicate rambling (model describing what it will do instead of doing it)
    filler_phrases = [
        r"(?i)I'll go ahead and",
        r"(?i)please give me a moment",
        r"(?i)let me work on",
        r"(?i)I'll proceed to",
        r"(?i)I will now create",
        r"(?i)based on feedback loops",
        r"(?i)pertaining to",
        r"(?i)aforementioned",
        r"(?i)in order to ensure that",
        r"(?i)deemed ideal suited",
    ]
    filler_count = sum(1 for p in filler_phrases if re.search(p, text))
    # Only flag as rambling if: very long AND contains filler language
    clean = re.sub(r'\s+', ' ', text).strip()
    if len(clean) > 800 and filler_count >= 2:
        return True
    # Extremely long with no substance at all
    if len(clean) > 1500:
        return True
    return False


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


def prepare_generated_content(path: Path, content: str) -> str:
    """Normalize model-generated file content before preview/write."""
    raw = content.replace("\r\n", "\n").strip()
    if not raw:
        return ""

    fenced = re.findall(r'```([a-zA-Z0-9_+-]*)\s*\n(.*?)```', raw, re.DOTALL)
    if fenced:
        preferred = {
            ".py": {"py", "python"},
            ".js": {"js", "javascript"},
            ".jsx": {"jsx", "javascript", "js"},
            ".ts": {"ts", "typescript"},
            ".tsx": {"tsx", "typescript", "ts"},
            ".html": {"html"},
            ".css": {"css"},
            ".json": {"json"},
            ".xml": {"xml"},
            ".sh": {"bash", "shell", "sh", "zsh"},
            ".md": {"md", "markdown"},
        }.get(path.suffix.lower(), set())
        picked = None
        for lang, block in fenced:
            if lang.lower() in preferred:
                picked = block
                break
        if picked is None:
            picked = max((block for _, block in fenced), key=len)
        raw = picked.strip()

    raw = re.sub(
        r'^\s*(HTML|CSS|JavaScript|JS|TypeScript|TS|JSON|Python|Bash|Shell|XML|Markdown)\s+Copy\s*$',
        '',
        raw,
        flags=re.IGNORECASE | re.MULTILINE,
    )
    raw = re.sub(
        r'^\s*(HTML|CSS|JavaScript|JS|TypeScript|TS|JSON|Python|Bash|Shell|XML|Markdown)\s*$',
        '',
        raw,
        flags=re.IGNORECASE | re.MULTILINE,
    )
    raw = re.sub(
        r'^\s*(Sure!?|Done!?|Updated.*|Here(?: is|\'s).*|Let me know.*|We\'ll make.*)$',
        '',
        raw,
        flags=re.IGNORECASE | re.MULTILINE,
    ).strip()

    ext = path.suffix.lower()
    lower = raw.lower()

    if ext in {".css"}:
        style_match = re.search(r'(?is)<style[^>]*>(.*?)</style>', raw)
        if style_match:
            raw = style_match.group(1).strip()
    elif ext in {".js", ".jsx", ".ts", ".tsx"}:
        script_match = re.search(r'(?is)<script[^>]*>(.*?)</script>', raw)
        if script_match:
            raw = script_match.group(1).strip()
    elif ext == ".json":
        json_match = re.search(r'(?s)(\{.*\}|\[.*\])', raw)
        if json_match:
            raw = json_match.group(1).strip()
    elif ext in {".html", ".htm"}:
        if "<!doctype html" in lower or "<html" in lower:
            start = lower.find("<!doctype html")
            if start == -1:
                start = lower.find("<html")
            end = lower.rfind("</html>")
            if start != -1:
                raw = raw[start:end + len("</html>")] if end != -1 else raw[start:]
        elif "<body" in lower:
            body_match = re.search(r'(?is)<body[^>]*>.*?</body>', raw)
            style_match = re.search(r'(?is)<style[^>]*>.*?</style>', raw)
            title = path.stem.replace("_", " ").replace("-", " ").title() or "Document"
            if path.exists():
                existing = path.read_text(encoding="utf-8", errors="replace")
                title_match = re.search(r'(?is)<title>(.*?)</title>', existing)
                if title_match:
                    title = title_match.group(1).strip() or title
            if body_match:
                parts = [
                    "<!DOCTYPE html>",
                    "<html lang=\"en\">",
                    "<head>",
                    "    <meta charset=\"UTF-8\">",
                    "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",
                    f"    <title>{title}</title>",
                ]
                if style_match:
                    parts.append(style_match.group(0).strip())
                parts.extend([
                    "</head>",
                    body_match.group(0).strip(),
                    "</html>",
                ])
                raw = "\n".join(parts)

    return raw.rstrip() + "\n"


def validate_generated_content(path: Path, content: str) -> str | None:
    """Best-effort validation for common text formats before write."""
    ext = path.suffix.lower()
    if not content.strip():
        return f"ERROR: Generated content for {path.name} is empty."
    try:
        if ext == ".py":
            ast.parse(content)
        elif ext == ".json":
            json.loads(content)
        elif ext in {".xml"}:
            ET.fromstring(content)
        elif ext in {".html", ".htm"}:
            lower = content.lower()
            if "<body" in lower and "<html" not in lower and "<!doctype html" not in lower:
                return f"ERROR: Generated HTML for {path.name} is incomplete — expected a full HTML document."
            if "<html" in lower and "</html>" not in lower:
                return f"ERROR: Generated HTML for {path.name} is missing </html>."
            if "<body" in lower and "</body>" not in lower:
                return f"ERROR: Generated HTML for {path.name} is missing </body>."
    except SyntaxError as e:
        return f"ERROR: Invalid {ext or 'text'} syntax for {path.name}: {e.msg}"
    except json.JSONDecodeError as e:
        return f"ERROR: Invalid JSON for {path.name}: {e.msg}"
    except ET.ParseError as e:
        return f"ERROR: Invalid XML for {path.name}: {e}"
    return None


def do_write(path: Path, content: str) -> str:
    cleaned = prepare_generated_content(path, content)
    error = validate_generated_content(path, cleaned)
    if error:
        return error
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(cleaned, encoding="utf-8")
    return f"Written {len(cleaned)} chars to {path.name}"


def parse_search_replace_blocks(edit_content: str) -> list[tuple[str, str]]:
    return re.findall(
        r'<<<<<<< SEARCH\n(.*?)\n=======\n(.*?)\n>>>>>>> REPLACE',
        edit_content,
        re.DOTALL,
    )


def looks_like_full_file(path: Path, content: str) -> bool:
    ext = path.suffix.lower()
    text = content.strip()
    lower = text.lower()
    if not text:
        return False
    if ext in {".html", ".htm"}:
        return any(token in lower for token in ("<!doctype html", "<html", "<body", "<head", "<form", "<main", "<section", "<div"))
    if ext == ".css":
        return "{" in text and "}" in text and ":" in text
    if ext in {".js", ".jsx", ".ts", ".tsx"}:
        return any(token in text for token in ("import ", "export ", "function ", "const ", "let ", "class ", "=>"))
    if ext == ".py":
        try:
            ast.parse(text)
            return True
        except SyntaxError:
            return False
    if ext == ".json":
        try:
            json.loads(text)
            return True
        except json.JSONDecodeError:
            return False
    if ext == ".xml":
        try:
            ET.fromstring(text)
            return True
        except ET.ParseError:
            return False
    return len(text) > 120 and text.count("\n") >= 3


def extract_full_write_from_malformed_edit(path: Path, blocks: list[tuple[str, str]]) -> str | None:
    if len(blocks) != 1:
        return None
    _, replace_str = blocks[0]
    candidate = prepare_generated_content(path, replace_str)
    if looks_like_full_file(path, candidate):
        return candidate
    return None


def do_edit(path: Path, edit_content: str) -> tuple[str, list[dict]]:
    """Apply search/replace edits to an existing file. Returns (status, diffs)."""
    if not path.exists():
        return f"ERROR: File not found: {path}", []
    original = path.read_text(encoding="utf-8", errors="replace")
    modified = original
    # Parse SEARCH/REPLACE blocks
    blocks = parse_search_replace_blocks(edit_content)
    if not blocks:
        return "ERROR: No valid SEARCH/REPLACE blocks found in EDIT_FILE", []
    diffs = []
    for search_str, replace_str in blocks:
        if search_str not in modified:
            return f"ERROR: Search block not found in {path.name}:\n{search_str[:200]}", []
        modified = modified.replace(search_str, replace_str, 1)
        diffs.append({"search": search_str, "replace": replace_str})
    path.write_text(modified, encoding="utf-8")
    return f"Edited {path.name} — {len(blocks)} change(s) applied", diffs


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
        if e.name.startswith(".") or e.name in TREE_IGNORE:
            continue
        tag  = "DIR " if e.is_dir() else "FILE"
        size = f"{e.stat().st_size:>10,} B" if e.is_file() else ""
        lines.append(f"[{tag}]  {e.name:<40} {size}")
    if len(lines) > 80:
        lines = lines[:80] + [f"... ({len(lines) - 80} more entries truncated)"]
    return "\n".join(lines) or "(empty)"


def do_mkdir(path: Path) -> str:
    path.mkdir(parents=True, exist_ok=True)
    return f"Directory created: {path}"


def _strip_html(html: str) -> str:
    """Convert raw HTML to compact plain text."""
    html = re.sub(r'(?is)<(script|style|noscript).*?>.*?</\1>', ' ', html)
    html = re.sub(r'(?is)<[^>]+>', ' ', html)
    html = re.sub(r'\s+', ' ', html)
    return html.strip()


def _fetch_text(url: str, timeout: int = 8) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 "
                          "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:  # nosec B310
        raw = resp.read(600_000)
    html = raw.decode("utf-8", errors="replace")
    return _strip_html(html)


def do_web_browse(query: str) -> str:
    """Search web and scrape top results for latest information."""
    q = query.strip()
    if not q:
        return "ERROR: WEB_BROWSE query is empty."

    try:
        search_url = "https://duckduckgo.com/html/?q=" + urllib.parse.quote_plus(q)
        req = urllib.request.Request(
            search_url,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 "
                              "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
            },
        )
        with urllib.request.urlopen(req, timeout=8) as resp:  # nosec B310
            html = resp.read(500_000).decode("utf-8", errors="replace")

        hrefs = re.findall(r'<a[^>]+class="result__a"[^>]+href="([^"]+)"', html, re.I)
        snippets = re.findall(r'<a[^>]+class="result__snippet"[^>]*>(.*?)</a>', html, re.I | re.S)

        links: list[str] = []
        link_snippets: list[str] = []
        for idx, h in enumerate(hrefs):
            # DuckDuckGo may wrap real URL in /l/?uddg=...
            if "duckduckgo.com/l/?" in h:
                p = urllib.parse.urlparse(h)
                qs = urllib.parse.parse_qs(p.query)
                real = qs.get("uddg", [""])[0]
                if real:
                    h = urllib.parse.unquote(real)
            if h.startswith("http") and h not in links:
                links.append(h)
                sn = snippets[idx] if idx < len(snippets) else ""
                link_snippets.append(_strip_html(sn)[:350])
            if len(links) >= 3:
                break

        if not links:
            return f"ERROR: No search results found for: {q}"

        rows = [f"Live web results for: {q}"]
        for i, link in enumerate(links, start=1):
            try:
                text = _fetch_text(link, timeout=8)
                snippet = text[:900].strip()
                rows.append(f"[{i}] {link}\n{snippet}")
            except Exception as e:
                fallback = link_snippets[i - 1] if i - 1 < len(link_snippets) else ""
                if fallback:
                    rows.append(f"[{i}] {link}\n{fallback}\n(Note: direct scrape blocked: {e})")
                else:
                    rows.append(f"[{i}] {link}\nERROR fetching page: {e}")

        return "\n\n".join(rows)
    except Exception as e:
        return f"ERROR: WEB_BROWSE failed: {e}"


def do_run_js(code: str) -> str:
    """Execute JavaScript code via Node.js in an ephemeral sandbox. Returns stdout/stderr."""
    code = code.strip()
    if not code:
        return "ERROR: RUN_JS code is empty."
    # Ensure temp dir exists
    JS_TEMP_DIR.mkdir(parents=True, exist_ok=True)
    script = JS_TEMP_DIR / f"run_{os.getpid()}_{id(code) & 0xFFFF:04x}.js"
    try:
        script.write_text(code, encoding="utf-8")
        r = subprocess.run(
            ["node", str(script)],
            capture_output=True, text=True,
            cwd=str(JS_TEMP_DIR), timeout=15,
            env={**os.environ, "NODE_NO_WARNINGS": "1"},
        )
        out = (r.stdout + r.stderr).strip()
        return out[:4000] if out else "(no output)"
    except FileNotFoundError:
        return "ERROR: Node.js is not installed. Install it with: brew install node"
    except subprocess.TimeoutExpired:
        return "ERROR: JS execution timed out after 15s."
    except Exception as e:
        return f"ERROR: RUN_JS failed: {e}"
    finally:
        try:
            script.unlink(missing_ok=True)
        except Exception:
            pass


def do_scrape_url(url: str) -> str:
    """Fetch and extract text content from a specific URL."""
    url = url.strip()
    if not url:
        return "ERROR: SCRAPE_URL is empty."
    if not url.startswith("http"):
        url = "https://" + url
    try:
        text = _fetch_text(url, timeout=10)
        if not text:
            return f"ERROR: No text content found at {url}"
        # Return first 3000 chars (enough for LLM context)
        return f"Content from {url}:\n{text[:3000]}"
    except Exception as e:
        return f"ERROR: Failed to scrape {url}: {e}"


ATTR_RE  = re.compile(r'<(READ_FILE|LIST_DIR|MAKE_DIR)\s+path=["\']?([^"\'>\n]+?)["\']?\s*/?>',
                       re.IGNORECASE)
WRITE_RE = re.compile(r'<WRITE_FILE\s+path=["\']?([^"\'>\n]+?)["\']?\s*>\s*\n?(.*?)</WRITE_FILE>',
                       re.DOTALL | re.IGNORECASE)
EDIT_RE  = re.compile(r'<EDIT_FILE\s+path=["\']?([^"\'>\n]+?)["\']?\s*>\s*\n?(.*?)</EDIT_FILE>',
                       re.DOTALL | re.IGNORECASE)
RUN_RE   = re.compile(r'<RUN_CMD>(.*?)</RUN_CMD>',
                       re.DOTALL | re.IGNORECASE)
WEB_RE   = re.compile(r'<WEB_BROWSE>(.*?)</WEB_BROWSE>',
                       re.DOTALL | re.IGNORECASE)
JS_RE    = re.compile(r'<RUN_JS>(.*?)</RUN_JS>',
                       re.DOTALL | re.IGNORECASE)
SCRAPE_RE = re.compile(r'<SCRAPE_URL>(.*?)</SCRAPE_URL>',
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


def auto_read_mentioned_files(user_msg: str, ws: Path) -> str:
    """Scan user_msg for filenames that exist in the workspace.
    Uses folder hints (e.g. 'in the client folder') to narrow matches.
    Augments the user message inline so the model sees real file content.
    Returns (content_block, set_of_rel_paths_loaded).
    """
    names = FILENAME_RE.findall(user_msg)
    if not names:
        return ""

    # Extract folder hint: "in the client folder", "inside src/", "client/server.js"
    folder_hint: str | None = None
    fh = re.search(
        r'\b(?:in|inside|under|within)\s+(?:the\s+)?([/\w.-]+)\s*(?:folder|dir|directory)?\b',
        user_msg, re.I
    )
    if fh:
        folder_hint = fh.group(1).lower().strip('/')
    # Also detect inline path like "client/server.js"
    inline_path = re.search(r'([\w.-]+/[\w./.-]+\.(?:js|ts|py|html|css|json|jsx|tsx))', user_msg)
    if inline_path:
        folder_hint = str(Path(inline_path.group(1)).parent).lower()

    blocks = []
    seen: set[str] = set()
    loaded_paths: set[str] = set()
    for name in names:
        if name in seen:
            continue
        seen.add(name)
        matches = [
            m for m in ws.rglob(name)
            if not any(part in TREE_IGNORE for part in m.parts)
            and not is_in_project_dir(m)
            and m.is_file()
        ]
        if not matches:
            continue
        # Prefer matches containing the folder hint
        if folder_hint:
            hinted = [m for m in matches
                      if folder_hint in str(m.relative_to(ws)).lower()]
            if hinted:
                matches = hinted
        # Use shallowest remaining match
        target = min(matches, key=lambda p: len(p.parts))
        rel = str(target.relative_to(ws))
        content = do_read(target)
        loaded_paths.add(rel)
        blocks.append(
            f"\n\n=== FILE: {rel} ===\n"
            f"(This is the REAL file — DO NOT use READ_FILE for this file, it is already loaded. "
            f"Use <EDIT_FILE path=\"{rel}\"> with SEARCH/REPLACE blocks to make targeted changes.)\n"
            f"```\n{content}\n```\n=== END {rel} ==="
        )
    return "".join(blocks)


def execute_actions(text: str, ws: Path | None, user_msg: str = "", chat_history: list[dict] | None = None, auto_read_paths: set[str] | None = None):
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
                clean = prepare_generated_content(path, content)
                pending.append({"type": "WRITE_FILE", "path": path_str, "content": clean, "resolved": str(path)})

    for path_str, edit_content in EDIT_RE.findall(text):
        if no_workdir:
            out = "ERROR: No working directory set. Please set a directory first."
            results.append(f"<RESULT action='EDIT_FILE'>\n{out}\n</RESULT>")
            actions.append({"type": "EDIT_FILE", "path": path_str, "result": out, "blocked": True})
        else:
            path = smart_resolve(path_str, ws, user_msg, hist)
            if is_in_project_dir(path):
                out = f"BLOCKED: Cannot edit file in project folder ({PROJECT_DIR})"
                results.append(f"<RESULT action='EDIT_FILE'>\n{out}\n</RESULT>")
                actions.append({"type": "EDIT_FILE", "path": str(path), "result": out, "blocked": True})
            else:
                # Check if content has valid SEARCH/REPLACE blocks
                clean_content = edit_content.strip()
                blocks = parse_search_replace_blocks(clean_content)
                if blocks:
                    original = path.read_text(encoding="utf-8", errors="replace")
                    if all(search_str in original for search_str, _ in blocks):
                        pending.append({"type": "EDIT_FILE", "path": path_str, "content": clean_content, "resolved": str(path)})
                    else:
                        fallback_write = extract_full_write_from_malformed_edit(path, blocks)
                        if fallback_write:
                            pending.append({"type": "WRITE_FILE", "path": path_str, "content": fallback_write, "resolved": str(path)})
                        else:
                            out = "ERROR: Invalid EDIT_FILE — SEARCH block not found in current file"
                            results.append(f"<RESULT action='EDIT_FILE'>\n{out}\n</RESULT>")
                            actions.append({"type": "EDIT_FILE", "path": path_str, "result": out, "blocked": True})
                elif len(clean_content) > 20:
                    # No SEARCH/REPLACE blocks but has content — treat as full file write
                    pending.append({"type": "WRITE_FILE", "path": path_str, "content": prepare_generated_content(path, clean_content), "resolved": str(path)})
                else:
                    out = "ERROR: No valid SEARCH/REPLACE blocks found in EDIT_FILE"
                    results.append(f"<RESULT action='EDIT_FILE'>\n{out}\n</RESULT>")
                    actions.append({"type": "EDIT_FILE", "path": path_str, "result": out, "blocked": True})

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

    for q_raw in WEB_RE.findall(text):
        q = q_raw.strip()
        out = do_web_browse(q)
        results.append(f"<RESULT action='WEB_BROWSE'>\n{out}\n</RESULT>")
        actions.append({"type": "WEB_BROWSE", "query": q, "result": out})

    for js_raw in JS_RE.findall(text):
        js_code = js_raw.strip()
        out = do_run_js(js_code)
        results.append(f"<RESULT action='RUN_JS'>\n{out}\n</RESULT>")
        actions.append({"type": "RUN_JS", "cmd": js_code[:80] + ("..." if len(js_code) > 80 else ""), "result": out})

    for url_raw in SCRAPE_RE.findall(text):
        url = url_raw.strip()
        out = do_scrape_url(url)
        results.append(f"<RESULT action='SCRAPE_URL'>\n{out}\n</RESULT>")
        actions.append({"type": "SCRAPE_URL", "query": url, "result": out})

    # ── Fallback: if no XML tags and no pending, detect markdown code blocks ──
    # ONLY triggers when the filename from the USER'S message actually exists in the workspace,
    # OR when a file was pre-loaded by auto_read (handles "optimise the code" with no filename).
    if not results and not pending and not no_workdir:
        code_blocks = CODE_BLOCK_RE.findall(text)
        if code_blocks:
            filename = None
            resolved_path: Path | None = None

            # Priority 1: explicit filename in user message OR model response that exists on disk
            user_names = FILENAME_RE.findall(user_msg)
            model_names = FILENAME_RE.findall(text)
            all_names = list(dict.fromkeys(user_names + model_names))  # dedupe, user first
            for name in all_names:
                candidate = smart_resolve(name, ws, user_msg, hist)
                if candidate.exists() and candidate.is_file() and not is_in_project_dir(candidate):
                    filename = name
                    resolved_path = candidate
                    break
                # Also check if it's a new file the user wants to create
                if not candidate.exists() and name in user_names:
                    filename = name
                    resolved_path = candidate
                    break

            # Priority 2: file was pre-loaded by auto_read — use that path directly
            if not filename and auto_read_paths:
                # Pick the pre-loaded path whose filename appears anywhere in the model response
                for ar_path in auto_read_paths:
                    ar_name = Path(ar_path).name
                    if ar_name in text or ar_name in user_msg:
                        filename = ar_path
                        resolved_path = smart_resolve(ar_path, ws, user_msg, hist)
                        break
                # If still nothing, just use the first pre-loaded file
                if not filename:
                    ar_path = next(iter(auto_read_paths))
                    filename = ar_path
                    resolved_path = smart_resolve(ar_path, ws, user_msg, hist)

            # Priority 3: user says create/make/new/optimize/update + gives a filename
            if not filename and re.search(r'\b(create|make|new|add|write|optimize|optimise|update|fix|improve|change|modify)\b', user_msg, re.I):
                all_candidates = user_names if user_names else model_names
                filename = all_candidates[0] if all_candidates else None
                if filename:
                    resolved_path = smart_resolve(filename, ws, user_msg, hist)

            # Priority 4: model mentions an existing file in its response
            if not filename and model_names:
                for name in model_names:
                    candidate = smart_resolve(name, ws, user_msg, hist)
                    if candidate.exists() and candidate.is_file() and not is_in_project_dir(candidate):
                        filename = name
                        resolved_path = candidate
                        break

            if filename and resolved_path is not None:
                code = max(code_blocks, key=len).strip()
                if len(code) > 10:
                    if is_in_project_dir(resolved_path):
                        out = f"BLOCKED: Cannot write to project folder ({PROJECT_DIR})"
                        results.append(f"<RESULT action='WRITE_FILE'>\n{out}\n</RESULT>")
                        actions.append({"type": "WRITE_FILE", "path": filename, "result": out, "blocked": True})
                    elif re.search(r'\.(xlsx|xls|pdf|docx|pptx|zip|tar|gz|png|jpg|jpeg|gif|bmp|mp3|mp4|avi)$', filename, re.I):
                        out = (f"BLOCKED: Cannot write binary file '{filename}' directly. "
                               f"Write a generator script instead.")
                        results.append(f"<RESULT action='WRITE_FILE'>\n{out}\n</RESULT>")
                        actions.append({"type": "WRITE_FILE", "path": filename, "result": out, "blocked": True})
                    else:
                        pending.append({"type": "WRITE_FILE", "path": filename, "content": prepare_generated_content(resolved_path, code), "resolved": str(resolved_path)})

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
        elif t == "EDIT_FILE":
            path = Path(act["resolved"])
            out, diffs = do_edit(path, act["content"])
            results.append(f"<RESULT action='EDIT_FILE'>\n{out}\n</RESULT>")
            actions.append({"type": t, "path": act["path"], "result": out, "diffs": diffs})
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


@app.get("/tree")
async def get_tree():
    """Return the workspace file tree as JSON for the sidebar UI."""
    if workdir is None:
        return JSONResponse({"tree": None, "workdir": None})
    tree_text = build_tree(workdir)
    # Also return a structured list for tree rendering
    def _collect(path: Path, depth: int = 0) -> list[dict]:
        if depth > TREE_MAX_DEPTH:
            return []
        result = []
        try:
            entries = sorted(path.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
        except PermissionError:
            return []
        for e in entries:
            if e.name.startswith('.') or e.name in TREE_IGNORE:
                continue
            node: dict = {"name": e.name, "path": str(e.relative_to(workdir)), "type": "dir" if e.is_dir() else "file"}
            if e.is_dir():
                node["children"] = _collect(e, depth + 1)
            else:
                node["size"] = e.stat().st_size
            result.append(node)
        return result

    return JSONResponse({
        "workdir": str(workdir),
        "tree_text": tree_text,
        "nodes": _collect(workdir),
    })


@app.get("/file")
async def read_file_endpoint(request: Request):
    """Read a file from the workspace. ?path=relative/path"""
    if workdir is None:
        return JSONResponse({"error": "No workspace set"}, status_code=400)
    rel = request.query_params.get("path", "").strip()
    if not rel:
        return JSONResponse({"error": "path required"}, status_code=400)
    path = smart_resolve(rel, workdir, rel)
    # Security: must be inside workdir
    try:
        path.relative_to(workdir)
    except ValueError:
        return JSONResponse({"error": "Access denied"}, status_code=403)
    if is_in_project_dir(path):
        return JSONResponse({"error": "Access denied"}, status_code=403)
    content = do_read(path)
    return JSONResponse({"path": rel, "content": content})


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

    # ── Hardcoded identity intercept — model never gets a chance to break character ──
    if _IDENTITY_Q.search(user_msg):
        jarvis_reply = "I'm Jarvis, boss. Your personal AI — built by you, Atul Chauhan. Always online, always loyal. What can I do for you?"
        history.append({"role": "assistant", "content": jarvis_reply})
        save_history(history)
        async def _identity_stream():
            yield f"data: {json.dumps({'type': 'token', 'content': jarvis_reply})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        return StreamingResponse(_identity_stream(), media_type="text/event-stream",
                                 headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

    # ── Hardcoded live system-status intercept (prevents model hallucination) ──
    _BATTERY_Q = re.compile(r"(?i)\b(battery|charge|charging|battery percentage|power)\b")
    _SYS_Q = re.compile(r"(?i)\b(system status|system report|cpu|ram|memory|disk|uptime|wifi|weather)\b")
    _TIME_Q = re.compile(r"(?i)\b(what\s+time|current\s+time|time\s+(?:is\s+it|right\s+now|now)|what\s+(?:is\s+the\s+)?date|today.s\s+date|what\s+day)\b")
    _WEATHER_Q = re.compile(r"(?i)\b(weather|temperature|how\s+(?:hot|cold|warm)|forecast)\b")
    _FILECOUNT_Q = re.compile(r"(?i)\b(how\s+many\s+files|number\s+of\s+files|count\s+files|file\s+count)\b")

    # ── Hardcoded workspace file-count intercept (prevents "no access" hallucination) ──
    if _FILECOUNT_Q.search(user_msg):
        if workdir is None:
            jarvis_reply = "No project folder is active right now, boss. Use Open Project Folder first, then ask me again and I'll count the files for you."
        else:
            total_files = 0
            for root, dirs, files in os.walk(workdir):
                dirs[:] = [d for d in dirs if d not in TREE_IGNORE and not d.startswith('.')]
                total_files += sum(1 for f in files if not f.startswith('.'))
            jarvis_reply = f"Yes, boss. I can access the provided folder. I found {total_files} files in {workdir.name}."

        history.append({"role": "assistant", "content": jarvis_reply})
        save_history(history)

        async def _filecount_stream():
            yield f"data: {json.dumps({'type': 'token', 'content': jarvis_reply})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        return StreamingResponse(_filecount_stream(), media_type="text/event-stream",
                                 headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

    if _BATTERY_Q.search(user_msg) or _SYS_Q.search(user_msg) or _TIME_Q.search(user_msg) or _WEATHER_Q.search(user_msg):
        try:
            status_resp = await system_status()
            live = json.loads(status_resp.body.decode("utf-8"))
        except Exception:
            live = {}

        bat = live.get("battery") or {}
        bp = bat.get("percent") if isinstance(bat, dict) else None
        charging = bat.get("charging") if isinstance(bat, dict) else None
        cpu = live.get("cpu")
        ram = live.get("ram")
        disk = live.get("disk")
        uptime = live.get("uptime_hours")
        wifi = live.get("wifi")
        weather = live.get("weather")
        time_str = live.get("time")
        date_str = live.get("date")

        if _TIME_Q.search(user_msg):
            if time_str and date_str:
                jarvis_reply = f"It's {time_str}, {date_str}, boss. What's next?"
            elif time_str:
                jarvis_reply = f"It's {time_str}, boss. What's next?"
            else:
                import datetime
                now = datetime.datetime.now()
                jarvis_reply = f"It's {now.strftime('%I:%M %p')}, {now.strftime('%A, %b %d')}, boss. What's next?"
        elif _WEATHER_Q.search(user_msg):
            if weather:
                jarvis_reply = f"Current weather: {weather}, boss. Anything else?"
            else:
                jarvis_reply = "Weather data is unavailable right now, boss. Want me to retry?"
        elif _BATTERY_Q.search(user_msg):
            if bp is None:
                jarvis_reply = "Battery data is unavailable right now, boss. Want me to refresh status again?"
            else:
                state = "charging" if charging else "on battery"
                jarvis_reply = f"Your local system battery is at {bp}% and currently {state}, boss. Anything else?"
        else:
            bits = []
            if bp is not None:
                bits.append(f"Battery {bp}%")
            if cpu is not None:
                bits.append(f"CPU {cpu}%")
            if ram is not None:
                bits.append(f"RAM {ram}%")
            if disk is not None:
                bits.append(f"Disk {disk}%")
            if uptime is not None:
                bits.append(f"Uptime {uptime}h")
            if wifi:
                bits.append(f"WiFi {wifi}")
            if weather:
                bits.append(f"Weather {weather}")
            if bits:
                jarvis_reply = "Live status: " + ", ".join(bits) + ". Anything else, boss?"
            else:
                jarvis_reply = "Live system status is unavailable right now, boss. Want me to retry?"

        history.append({"role": "assistant", "content": jarvis_reply})
        save_history(history)

        async def _status_stream():
            yield f"data: {json.dumps({'type': 'token', 'content': jarvis_reply})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        return StreamingResponse(_status_stream(), media_type="text/event-stream",
                                 headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

    async def event_stream():
        global history

        # ── Identity fixes (applied to every LLM response) ──────────────────
        identity_fixes = [
            (r'(?i)\bI\'?m\s+Qwen(\s+[\d.]+)?\b', "I'm Jarvis"),
            (r'(?i)\bI\s+am\s+Qwen(\s+[\d.]+)?\b', "I am Jarvis"),
            (r'(?i)\bI\s+(am|m)\s+an?\s+(large\s+)?(?:language|AI)\s+(?:language\s+)?model\b[^.]*', "I'm Jarvis, boss — built by Atul Chauhan"),
            (r'(?i)My\s+(main|primary)\s+function\s+is\s+to\s+(understand\s+and\s+generate[^.]*)', 'I am here to serve you, boss'),
            (r'(?i)\b(created|made|built|developed|designed|trained)\s+(by|at)\s+(OpenAI|Alibaba(?:\s+Cloud)?|Alibaba\s+Group|Qwen\s+team|Meta\s+AI|Google\s+DeepMind|Anthropic)', r'\1 by Atul Chauhan'),
            (r'(?i)\bI\s+am\s+(an?\s+)?(AI\s+)?(model|assistant|chatbot)\s+(by|from|made by|created by)\s+(OpenAI|Alibaba|Qwen|Meta|Google|Anthropic)', 'I am Jarvis, built by Atul Chauhan'),
            (r'(?i)\bI\'?m\s+(Qwen|ChatGPT|GPT-?\d*|Claude|Gemini|LLaMA|DeepSeek(?:\s+Coder)?)', "I'm Jarvis"),
            (r'(?i)\b(OpenAI|Alibaba(?:\s+Cloud)?|Qwen|Meta|Anthropic|DeepSeek(?:\s+Company)?)\s+(created|made|built|developed|trained)\s+me', 'Atul Chauhan built me'),
            (r'(?i)\bI\s+am\s+(?:an?\s+)?(?:AI\s+)?programming\s+assistant[^.]*(?:developed|utilizing|by)\s+(?:the\s+)?(?:Deepseek|DeepSeek)[^.]*', "I'm Jarvis, built by Atul Chauhan"),
            (r'(?i)\bDeepSeek(?:\s+Coder)?(?:\s+model)?\b', 'Jarvis'),
            (r'(?i)\bI\s+only\s+answer\s+questions\s+related\s+to\s+computer\s+science[^.]*\.?', ''),
        ]

        def apply_identity_fixes(text: str) -> str:
            for pattern, replacement in identity_fixes:
                text = re.sub(pattern, replacement, text)
            return text

        def dedup_loops(text: str) -> str:
            lines = text.splitlines()
            seen, clean = set(), []
            for line in lines:
                key = line.strip()
                if key and key in seen:
                    break
                seen.add(key)
                clean.append(line)
            return "\n".join(clean)

        async def stream_llm(msgs: list[dict]) -> tuple[str, bool]:
            """Stream one LLM turn; yield tokens to client. Returns (full_text, loop_detected)."""
            full = ""
            loop = False
            try:
                if PROVIDER == "groq":
                    stream = llm_client.chat.completions.create(  # type: ignore[union-attr]
                        model=MODEL,
                        messages=msgs,  # type: ignore[arg-type]
                        stream=True,
                        temperature=0.7,
                        max_tokens=4096 if workdir else 220,
                        top_p=0.9,
                    )
                    for chunk in stream:
                        token = (chunk.choices[0].delta.content or "")
                        token = strip_emoji(token)
                        if not token:
                            continue
                        full += token
                        yield token
                        if len(full) > 200 and is_looping(full, threshold=3):
                            loop = True
                            break
                else:
                    import ollama as _ollama
                    for chunk in _ollama.chat(
                        model=MODEL,
                        messages=msgs,
                        stream=True,
                        options=ollama_options(is_coding=bool(workdir)),
                    ):
                        token = strip_emoji(chunk["message"]["content"])
                        if not token:
                            continue
                        full += token
                        yield token
                        if len(full) > 200 and is_looping(full, threshold=3):
                            loop = True
                            break
            except Exception as e:
                yield f"\n[ERROR: {e}]"
                loop = True
            # store results in a closure via a mutable container
            stream_llm._last = (full, loop)  # type: ignore[attr-defined]

        # ── Agent loop ────────────────────────────────────────────────────────
        # Step 0: If workspace is active, auto-read any files mentioned in the user message.
        # Augment the EXISTING user message (last history entry) with real file content inline.
        # Never append a second user message — LLMs expect alternating user/assistant turns.
        already_read: set[str] = set()  # track files loaded this request to skip re-reads
        if workdir:
            pre_read = auto_read_mentioned_files(user_msg, workdir)
            if pre_read and history and history[-1].get("role") == "user":
                history[-1]["content"] = user_msg + pre_read
                # Mark these files as already loaded so READ_FILE tags skip them
                for m in re.finditer(r'=== FILE: ([^=]+) ===', pre_read):
                    already_read.add(m.group(1).strip())

        # Send early processing event so UI knows we're working
        if workdir and already_read:
            yield f"data: {json.dumps({'type': 'token', 'content': ''})}\n\n"

        step = 0
        while step < MAX_AGENT_STEPS:
            step += 1
            full_response = ""
            loop_detected = False

            if step > 1:
                # Signal to frontend that a new tool-use step is starting
                yield f"data: {json.dumps({'type': 'agent_step', 'step': step})}\n\n"

            try:
                chat_msgs = build_messages(history)
                if PROVIDER == "groq":
                    s = llm_client.chat.completions.create(  # type: ignore[union-attr]
                        model=MODEL, messages=chat_msgs, stream=True,  # type: ignore[arg-type]
                        temperature=0.7, max_tokens=4096 if workdir else 220, top_p=0.9,
                    )
                    for chunk in s:
                        token = strip_emoji(chunk.choices[0].delta.content or "")
                        if not token:
                            continue
                        full_response += token
                        yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
                        if len(full_response) > 200 and is_looping(full_response, threshold=3):
                            loop_detected = True
                            break
                        if workdir and is_rambling(full_response):
                            loop_detected = True
                            break
                else:
                    import ollama as _ollama
                    for chunk in _ollama.chat(
                        model=MODEL, messages=chat_msgs, stream=True,
                        options=ollama_options(is_coding=bool(workdir)),
                    ):
                        token = strip_emoji(chunk["message"]["content"])
                        if not token:
                            continue
                        full_response += token
                        yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
                        if len(full_response) > 200 and is_looping(full_response, threshold=3):
                            loop_detected = True
                            break
                        if workdir and is_rambling(full_response):
                            loop_detected = True
                            break
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
                break

            if loop_detected:
                full_response = dedup_loops(full_response)

            full_response = apply_identity_fixes(full_response)

            # ── Parse & execute agent actions ─────────────────────────────────
            result_str, exec_actions, pending = execute_actions(
                full_response, workdir, user_msg, history,
                auto_read_paths=already_read if already_read else None
            )

            # Skip READ_FILE results for files already loaded by auto_read —
            # prevents the model from looping on reads it doesn't need to do.
            all_skipped = False
            if already_read and result_str:
                filtered_results = []
                skipped_count = 0
                for act in exec_actions:
                    if act.get("type") == "READ_FILE":
                        rel = act.get("path", "").lstrip("./ ")
                        # Check if any already-read path ends with this rel path
                        if any(ar.endswith(rel) or rel.endswith(ar) for ar in already_read):
                            act["result"] = "(already loaded above — use WRITE_FILE to save changes)"
                            skipped_count += 1
                            filtered_results.append(
                                f"<RESULT action='READ_FILE'>\nFile already provided above. "
                                f"Write the modified version now using WRITE_FILE.\n</RESULT>"
                            )
                            continue
                    filtered_results.append(
                        f"<RESULT action='{act.get('type')}'>"
                        f"\n{act.get('result','')}\n</RESULT>"
                    )
                result_str = "\n\n".join(filtered_results) if filtered_results else result_str
                # If every action was a skipped re-read and there are no pending writes,
                # don't loop — the model already has the file content
                if skipped_count == len(exec_actions) and not pending:
                    all_skipped = True

            # Track any new files read this turn
            for act in exec_actions:
                if act.get("type") == "READ_FILE" and act.get("path"):
                    already_read.add(act["path"].lstrip("./ "))

            # If model only did reads (no writes/pending) for 2+ steps, force it to write
            only_reads = exec_actions and all(a.get("type") == "READ_FILE" for a in exec_actions)
            if only_reads and step >= 2 and result_str:
                result_str += (
                    "\n\n[SYSTEM: You have read the file. "
                    "Now make your changes using "
                    "<EDIT_FILE path=\"...\"><<<<<<< SEARCH\\nold\\n=======\\nnew\\n>>>>>>> REPLACE</EDIT_FILE>. "
                    "For new files use <WRITE_FILE path=\"...\">full content</WRITE_FILE>. No more reads.]"
                )

            # Emit each executed action so UI can display a tool-use card
            for act in exec_actions:
                yield f"data: {json.dumps({'type': 'action', 'action': act})}\n\n"

            # Save this response to history
            history.append({"role": "assistant", "content": full_response})
            history = trim_history(history)

            if pending:
                # Actions require user approval — pause and wait
                yield f"data: {json.dumps({'type': 'pending', 'actions': pending})}\n\n"
                save_history(history)
                yield f"data: {json.dumps({'type': 'done'})}\n\n"
                return

            if not result_str or loop_detected:
                # No more actions, or loop — we're done
                break

            # If every action was a redundant re-read of auto-loaded files, don't loop
            if all_skipped:
                break

            # ── Stop the loop if the model already gave a complete answer ──
            # If the response has no action tags at all, stop immediately.
            has_any_tags = bool(
                ATTR_RE.search(full_response)
                or WRITE_RE.search(full_response)
                or EDIT_RE.search(full_response)
                or RUN_RE.search(full_response)
                or WEB_RE.search(full_response)
                or JS_RE.search(full_response)
                or SCRAPE_RE.search(full_response)
            )
            if not has_any_tags and not exec_actions and not pending:
                break

            # Strip all XML tags from the response to get just the prose text
            prose = re.sub(r'<[A-Z_]+[^>]*>.*?</[A-Z_]+>|<[A-Z_]+[^>]*/>', '', full_response,
                          flags=re.DOTALL | re.IGNORECASE).strip()
            only_info = exec_actions and all(
                a.get("type") in ("READ_FILE", "LIST_DIR") for a in exec_actions
            )
            # If model gave substantial prose alongside only informational actions, stop.
            if only_info and len(prose) > 40:
                break

            # Feed action results back as a user message and continue
            history.append({"role": "user", "content": result_str})
            history = trim_history(history)

        save_history(history)
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    async def safe_stream():
        """Wrap event_stream to silently stop on client disconnect."""
        try:
            async for chunk in event_stream():
                yield chunk
        except (asyncio.CancelledError, ConnectionError, BrokenPipeError):
            return
        except Exception:
            return

    return StreamingResponse(safe_stream(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache",
                                      "X-Accel-Buffering": "no",
                                      "Connection": "keep-alive"})


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


@app.get("/models")
async def list_models():
    """List locally available Ollama models."""
    if PROVIDER != "ollama":
        return JSONResponse({"models": [], "current": MODEL, "provider": PROVIDER})
    try:
        import ollama as _ollama
        models_list = _ollama.list()
        names = []
        if hasattr(models_list, 'models'):
            for m in models_list.models:
                names.append(m.model if hasattr(m, 'model') else str(m))
        elif isinstance(models_list, dict):
            for m in models_list.get("models", []):
                names.append(m.get("model") or m.get("name", ""))
        names = sorted(set(n for n in names if n))
        return JSONResponse({"models": names, "current": MODEL, "provider": PROVIDER})
    except Exception as e:
        return JSONResponse({"models": [], "current": MODEL, "error": str(e)})


@app.post("/model")
async def switch_model(request: Request):
    """Switch the active Ollama model."""
    global MODEL
    body = await request.json()
    new_model = body.get("model", "").strip()
    if not new_model:
        return JSONResponse({"error": "No model specified"}, status_code=400)
    if PROVIDER != "ollama":
        return JSONResponse({"error": "Model switching only supported for Ollama provider"}, status_code=400)
    try:
        import ollama as _ollama
        # Verify model exists locally
        models_list = _ollama.list()
        names = set()
        if hasattr(models_list, 'models'):
            for m in models_list.models:
                names.add(m.model if hasattr(m, 'model') else str(m))
        elif isinstance(models_list, dict):
            for m in models_list.get("models", []):
                names.add(m.get("model") or m.get("name", ""))
        if new_model not in names:
            return JSONResponse({"error": f"Model '{new_model}' not found locally. Pull it first with: ollama pull {new_model}"}, status_code=404)
        MODEL = new_model
        save_model_state(PROVIDER, MODEL)
        return JSONResponse({"model": MODEL, "message": f"Switched to {MODEL}"})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.get("/workspace")
async def get_workspace():
    return JSONResponse({
        "workspace": str(workspace),
        "workdir": str(workdir) if workdir else None
    })


@app.get("/system-status")
async def system_status():
    """Return system info for UI cards with robust macOS fallbacks."""
    import datetime
    import psutil

    info: dict = {
        "battery": {"percent": None, "charging": None},
        "wifi": None,
        "weather": None,
        "cpu": None,
        "ram": None,
        "disk": None,
        "uptime_hours": None,
    }

    # Time
    now = datetime.datetime.now()
    info["time"] = now.strftime("%I:%M %p")
    info["date"] = now.strftime("%a, %b %d")
    info["greeting"] = "Good morning" if now.hour < 12 else "Good afternoon" if now.hour < 17 else "Good evening"

    # Battery (psutil first)
    try:
        bat = psutil.sensors_battery()
        if bat is not None and bat.percent is not None:
            info["battery"] = {
                "percent": int(round(float(bat.percent))),
                "charging": bool(bat.power_plugged),
            }
    except Exception:
        pass

    # Battery fallback for macOS desktop setups: parse pmset
    if info["battery"]["percent"] is None:
        try:
            r = subprocess.run(["pmset", "-g", "batt"], capture_output=True, text=True, timeout=3)
            txt = (r.stdout or "")
            m = re.search(r"(\d+)%", txt)
            if m:
                pct = int(m.group(1))
                charging = bool(re.search(r"charging|charged", txt, re.I))
                info["battery"] = {"percent": pct, "charging": charging}
        except Exception:
            pass

    # CPU / RAM
    try:
        info["cpu"] = round(float(psutil.cpu_percent(interval=0.1)), 1)
        info["ram"] = int(round(psutil.virtual_memory().percent))
    except Exception:
        pass

    # Disk / uptime
    try:
        info["disk"] = int(round(psutil.disk_usage('/').percent))
        info["uptime_hours"] = int((datetime.datetime.now().timestamp() - psutil.boot_time()) // 3600)
    except Exception:
        pass

    # Wifi SSID (airport first)
    try:
        r = subprocess.run(
            ["/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport", "-I"],
            capture_output=True, text=True, timeout=3
        )
        for line in (r.stdout or "").splitlines():
            if " SSID:" in line:
                info["wifi"] = line.split("SSID:", 1)[1].strip()
                break
    except Exception:
        pass

    # Wifi fallback: networksetup
    if not info["wifi"]:
        for iface in ("en0", "en1"):
            try:
                r = subprocess.run(["networksetup", "-getairportnetwork", iface], capture_output=True, text=True, timeout=3)
                out = (r.stdout or "").strip()
                if ":" in out and "not associated" not in out.lower():
                    info["wifi"] = out.split(":", 1)[1].strip()
                    break
            except Exception:
                continue

    # Normalize noisy OS error strings
    if isinstance(info.get("wifi"), str):
        w = info["wifi"].strip()
        if not w or "error" in w.lower() or "not available" in w.lower() or "not associated" in w.lower():
            info["wifi"] = None

    # Weather (best-effort, no key) from wttr.in JSON endpoint
    try:
        req = urllib.request.Request(
            "https://wttr.in/?format=j1",
            headers={"User-Agent": "Mozilla/5.0"},
        )
        with urllib.request.urlopen(req, timeout=4) as resp:  # nosec B310
            w = json.loads(resp.read().decode("utf-8", errors="replace"))
        current = (w.get("current_condition") or [{}])[0]
        temp_c = current.get("temp_C")
        desc = ""
        dd = current.get("weatherDesc") or []
        if dd and isinstance(dd, list):
            desc = (dd[0] or {}).get("value", "")
        if temp_c is not None:
            info["weather"] = f"{temp_c}C" + (f" {desc}" if desc else "")
    except Exception:
        pass

    info["updated_at"] = now.isoformat(timespec="seconds")
    return JSONResponse(info)


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
    saved_model = load_saved_model(PROVIDER)
    if saved_model:
        MODEL = saved_model

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
        # If saved model is no longer installed, fallback to default and persist it.
        try:
            models_list = ollama.list()
            names = set()
            if hasattr(models_list, 'models'):
                for m in models_list.models:
                    names.add(m.model if hasattr(m, 'model') else str(m))
            elif isinstance(models_list, dict):
                for m in models_list.get("models", []):
                    names.add(m.get("model") or m.get("name", ""))
            if MODEL not in names:
                MODEL = OLLAMA_MODEL
                save_model_state(PROVIDER, MODEL)
        except Exception:
            pass
        llm_client = None  # ollama uses module-level calls

    workspace = Path(args.workspace).resolve()

    # ── Clean slate on restart ──────────────────────────────────────────────
    HISTORY_FILE.unlink(missing_ok=True)       # clear chat history
    if JS_TEMP_DIR.exists():
        shutil.rmtree(JS_TEMP_DIR, ignore_errors=True)  # clear JS sandbox

    history   = load_history()

    # Get local IP for mobile access
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
    except Exception:
        local_ip = "127.0.0.1"

    prov_label = f"Groq ({GROQ_MODEL})" if PROVIDER == "groq" else f"Ollama ({OLLAMA_MODEL})"
    mobile_url = f"https://{local_ip}:{args.port}"
    print(f"\n  ╔══════════════════════════════════════════╗")
    print(f"  ║  Jarvis Personal AI Assistant            ║")
    print(f"  ║  Owner : Atul Chauhan · Bangalore · 25   ║")
    print(f"  ║  Model : {prov_label:<32}║")
    print(f"  ║  Local : https://localhost:{args.port:<14}║")
    print(f"  ║  Mobile: {mobile_url:<32}║")
    print(f"  ╚══════════════════════════════════════════╝")
    print(f"  Workspace: {workspace}\n")

    # Use HTTPS for mobile mic/voice support
    cert_file = Path(__file__).parent / "cert.pem"
    key_file = Path(__file__).parent / "key.pem"
    if cert_file.exists() and key_file.exists():
        uvicorn.run(app, host="0.0.0.0", port=args.port, log_level="warning",
                    ssl_certfile=str(cert_file), ssl_keyfile=str(key_file))
    else:
        print("  ⚠ No cert.pem/key.pem found — running HTTP only (mic won't work on mobile)")
        uvicorn.run(app, host="0.0.0.0", port=args.port, log_level="warning")
