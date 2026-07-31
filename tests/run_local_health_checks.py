import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

from run_health_checks import BlueTextHealthCheckRunner


ROOT = Path(__file__).resolve().parents[1]
SERVER_PATH = ROOT / "server.py"
BASE_URL = "http://localhost:8080"


def wait_for_server(url, timeout_seconds=20):
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url) as resp:
                if resp.status == 200:
                    return
        except urllib.error.URLError:
            time.sleep(0.25)
    raise RuntimeError(f"Server did not become ready within {timeout_seconds}s: {url}")


def stop_process(proc):
    if proc.poll() is not None:
        return
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        proc.kill()
        proc.wait(timeout=5)


def main():
    proc = subprocess.Popen(
        [sys.executable, str(SERVER_PATH)],
        cwd=str(ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == "nt" else 0,
    )
    try:
        wait_for_server(BASE_URL)
        runner = BlueTextHealthCheckRunner(base_url=BASE_URL)
        report = runner.run_health_checks()
        print(report)
    finally:
        stop_process(proc)


if __name__ == "__main__":
    main()
