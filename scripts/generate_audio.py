"""Record every sentence in scripts/prompts.json to public/audio/<id>.m4a.

Voice: Piper "en_US-ljspeech-high" (trained on the public-domain LJ Speech
dataset), run with sherpa-onnx. AAC encoding uses macOS `afconvert`.

Setup (once):
  python3.11 -m venv .venv-tts && .venv-tts/bin/pip install sherpa-onnx soundfile
  curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-en_US-ljspeech-high.tar.bz2
  tar xjf vits-piper-en_US-ljspeech-high.tar.bz2

Run (after `npx tsx scripts/collect-prompts.ts`):
  TTS_MODEL_DIR=path/to/vits-piper-en_US-ljspeech-high .venv-tts/bin/python scripts/generate_audio.py
Only missing clips are recorded; clips for sentences no longer used are removed.
"""

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

import sherpa_onnx
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
AUDIO_DIR = ROOT / "public" / "audio"
MANIFEST = ROOT / "src" / "audio" / "clips.json"

# Slightly slower than the model's default pace, for a 7-year-old listener.
LENGTH_SCALE = 1.12


def main() -> None:
    model_dir = Path(os.environ.get("TTS_MODEL_DIR", "vits-piper-en_US-ljspeech-high"))
    if not (model_dir / "tokens.txt").exists():
        sys.exit(f"Model not found in {model_dir}; set TTS_MODEL_DIR (see the setup notes at the top).")

    prompts = json.loads((ROOT / "scripts" / "prompts.json").read_text())
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    tts = sherpa_onnx.OfflineTts(
        sherpa_onnx.OfflineTtsConfig(
            model=sherpa_onnx.OfflineTtsModelConfig(
                vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                    model=str(model_dir / "en_US-ljspeech-high.onnx"),
                    tokens=str(model_dir / "tokens.txt"),
                    data_dir=str(model_dir / "espeak-ng-data"),
                    length_scale=LENGTH_SCALE,
                ),
                num_threads=4,
            )
        )
    )

    wanted = {p["id"] for p in prompts}
    made = 0
    with tempfile.TemporaryDirectory() as tmp:
        for p in prompts:
            out = AUDIO_DIR / f"{p['id']}.m4a"
            if out.exists():
                continue
            audio = tts.generate(p["text"], sid=0, speed=1.0)
            wav = Path(tmp) / f"{p['id']}.wav"
            sf.write(wav, audio.samples, samplerate=audio.sample_rate)
            subprocess.run(
                ["afconvert", "-f", "m4af", "-d", "aac", "-b", "48000", "-c", "1", str(wav), str(out)],
                check=True,
            )
            made += 1
            print(f"recorded {p['id']}: {p['text'][:60]}")

    removed = 0
    for f in AUDIO_DIR.glob("*.m4a"):
        if f.stem not in wanted:
            f.unlink()
            removed += 1

    MANIFEST.write_text(json.dumps(sorted(wanted), indent=2) + "\n")
    print(f"{made} recorded, {removed} removed, {len(wanted)} total clips")


if __name__ == "__main__":
    main()
