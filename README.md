# Jarvis — Personal AI Assistant

Iron Man-style AI assistant built by **Atul Chauhan**.

## Setup

```bash
cd code_assistant
python3 -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn ollama
```

## Start Server

```bash
source .venv/bin/activate
python3 server.py --workspace . --provider ollama
```

Open: [http://localhost:5173](http://localhost:5173)

## Options

| Flag | Description |
|------|-------------|
| `--provider ollama` | Local LLM (default, unlimited) |
| `--provider groq` | Cloud LLM (free, rate-limited) |
| `--groq-key KEY` | Groq API key (or set `GROQ_API_KEY` env var) |
| `--port 5173` | Server port (default: 5173) |
| `--workspace .` | Working directory for file operations |

## Features

- Voice mode (Chrome/Edge) — speak to Jarvis, he speaks back
- Streaming responses with sentence-by-sentence speech
- Hindi + English support
- Chat history (40 messages)
- Iron Man Jarvis personality — always calls you "boss"
