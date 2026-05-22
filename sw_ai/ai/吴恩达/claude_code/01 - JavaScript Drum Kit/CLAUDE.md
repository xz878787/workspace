# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

JavaScript Drum Kit — a browser-based drum machine from Wes Bos's JavaScript30 course. No build tools, no dependencies, no server. Just open the HTML file in a browser.

- `index-START.html` — starter template with empty `<script>` tag (course exercise starting point)
- `index-FINISHED.html` — completed working version with JavaScript
- `style.css` — all styling
- `sounds/` — 9 WAV drum samples

## How it works

Each drum pad is a `<div data-key="<keyCode>">` paired with an `<audio data-key="<keyCode>">`. Pressing keys A–L triggers `playSound()`:
1. `keydown` event → look up `<audio>` and `<div>` by `e.keyCode` via `data-key` attribute
2. Reset `audio.currentTime = 0` (enables rapid re-triggers without waiting for the sample to end)
3. Add `.playing` class for the yellow glow/scale-up CSS transition
4. `transitionend` listener on each `.key` removes `.playing` after the transition completes

## How to run

Open `index-FINISHED.html` (or `index-START.html`) directly in a browser. No server needed — it's static HTML/CSS/JS.
