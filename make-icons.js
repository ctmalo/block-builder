// make-icons.js — generates icon-192.png and icon-512.png for Block Builder PWA
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const BG       = '#F5F4F0';
  const GREEN    = '#2d8a2d';
  const BLACK    = '#1a1a1a';
  const OFFWHITE = '#F5F4F0';

  // ── Background with rounded corners ──
  const cornerR = size * 0.18;          // ~iOS-style corner radius
  ctx.fillStyle = BG;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, cornerR);
  ctx.fill();

  // ── Grid layout ──
  const pad  = size * 0.08;            // outer padding from edge
  const gap  = size * 0.04;            // gap between squares
  const sq   = (size - pad * 2 - gap) / 2;  // square side length
  const sqR  = size * 0.06;           // square corner radius

  const col0 = pad;                   // left column x
  const col1 = pad + sq + gap;        // right column x
  const row0 = pad;                   // top row y
  const row1 = pad + sq + gap;        // bottom row y

  // ── Helper: draw a rounded square ──
  function fillRoundRect(x, y, w, h, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  }

  // ── Helper: draw bold 'B' centred in a square ──
  function drawB(x, y, w, color) {
    const fontSize = w * 0.58;
    ctx.fillStyle = color;
    ctx.font = `900 ${fontSize}px 'Arial Black', Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Optical centre tweak: characters often read visually low, nudge up slightly
    ctx.fillText('B', x + w / 2, y + w / 2 - fontSize * 0.04);
  }

  // Top-left: GREEN square + BLACK 'B'
  fillRoundRect(col0, row0, sq, sq, sqR, GREEN);
  drawB(col0, row0, sq, BLACK);

  // Top-right: BLACK square — no letter
  fillRoundRect(col1, row0, sq, sq, sqR, BLACK);

  // Bottom-left: BLACK square — no letter
  fillRoundRect(col0, row1, sq, sq, sqR, BLACK);

  // Bottom-right: GREEN square + OFF-WHITE 'B'
  fillRoundRect(col1, row1, sq, sq, sqR, GREEN);
  drawB(col1, row1, sq, OFFWHITE);

  return canvas;
}

const dir = __dirname;

[192, 512].forEach(size => {
  const canvas = drawIcon(size);
  const out = path.join(dir, `icon-${size}.png`);
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(out, buf);
  console.log(`✓ icon-${size}.png  (${(buf.length / 1024).toFixed(1)} KB)`);
});
