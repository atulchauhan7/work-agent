#!/usr/bin/env python3
"""
Jarvis Personal AI Assistant — Start Server
Simple startup script that displays the IP and starts the server.
Usage:
    python3 start.py
    python3 start.py --provider groq
    python3 start.py --provider ollama
"""

import os
import sys
import socket
import subprocess
import argparse

def get_local_ip():
    """Get the local IP address."""
    try:
        # Connect to external IP to determine local network interface
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "localhost"

def main():
    parser = argparse.ArgumentParser(description="Jarvis Personal AI Assistant")
    parser.add_argument("--provider", default="ollama", choices=["ollama", "groq"],
                        help="LLM provider: ollama (local, unlimited) or groq (cloud, rate-limited)")
    args = parser.parse_args()
    
    local_ip = get_local_ip()
    port = 5173
    
    print("\n" + "━" * 50)
    print("  🤖 Jarvis Personal AI Assistant")
    print("━" * 50)
    print("\n  📱 Access URLs:")
    print("  ━" * 25)
    print(f"  🖥  Desktop (localhost):")
    print(f"      http://localhost:{port}")
    print(f"\n  📲 Mobile (same WiFi):")
    print(f"      http://{local_ip}:{port}")
    print(f"\n  Provider: {args.provider}")
    print("  ━" * 25 + "\n")
    
    # Start server
    if args.provider == "groq":
        if not os.getenv("GROQ_API_KEY"):
            print("❌ GROQ_API_KEY not set!")
            print("   Set it: export GROQ_API_KEY=your_key")
            sys.exit(1)
        cmd = ["python3", "server.py", "--workspace", ".", "--provider", "groq"]
    else:
        cmd = ["python3", "server.py", "--workspace", ".", "--provider", "ollama"]
    
    try:
        subprocess.run(cmd, check=False)
    except KeyboardInterrupt:
        print("\n\n✋ Server stopped by user.")
        sys.exit(0)

if __name__ == "__main__":
    main()
