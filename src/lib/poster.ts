/**
 * The poster background (public/poster-bg.jpg) is the user-provided photo
 * template — logo, title, "Scannez et rejoignez" caption and the 3-step
 * footer are all already baked into that image. This module only overlays
 * the two things that vary per group: the QR code and the group's name.
 *
 * If poster-bg.jpg is ever missing (e.g. a deploy before the asset was
 * added), we fall back to a generated background in the app's own theme so
 * the poster never breaks — see drawGeneratedBackground below.
 */
import qrcode from './qrcode-generator';

export const POSTER_WIDTH = 1024;
export const POSTER_HEIGHT = 1536;

// Empty court area in poster-bg.jpg, hand-picked to sit clear of the net
// (left), the paddle/ball (bottom), and the title (top). Square, centered.
const QR_BOX = { x: 322, y: 510, size: 380 };

// Top-right area of poster-bg.jpg, level with the "Padel Ensemble" logo.
const NAME_PILL = { top: 96, bottom: 200, right: 64, maxWidth: 460 };

interface DrawPosterOptions {
  groupName: string;
  inviteUrl: string;
  backgroundSrc?: string; // defaults to /poster-bg.jpg
  logoSrc?: string; // defaults to /logo.webp
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 1 && ctx.measureText(truncated + '…').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '…';
}

/** Generated fallback used only if poster-bg.jpg fails to load. */
function drawGeneratedBackground(ctx: CanvasRenderingContext2D) {
  const W = POSTER_WIDTH;
  const H = POSTER_HEIGHT;
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0c2628');
  bg.addColorStop(0.55, '#071a1a');
  bg.addColorStop(1, '#050f0f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(238, 245, 244, 0.05)';
  ctx.lineWidth = 2;
  for (let gx = 0; gx <= W; gx += 64) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, H);
    ctx.stroke();
  }

  ctx.font = '800 76px Unbounded, sans-serif';
  ctx.fillStyle = '#eef5f4';
  ctx.fillText('Organisez vos', 72, 300);
  ctx.fillStyle = '#c8f13c';
  ctx.fillText('matchs de padel', 72, 392);

  ctx.font = 'italic 700 40px Unbounded, sans-serif';
  ctx.fillStyle = '#c8f13c';
  ctx.fillText('Scannez et rejoignez', 72, 1060);
}

/** Draws the group name pill in the top-right, over whatever sits behind it
 * in the photo — always legible thanks to the translucent dark backing. */
function drawNamePill(ctx: CanvasRenderingContext2D, groupName: string) {
  const pillHeight = NAME_PILL.bottom - NAME_PILL.top;
  ctx.font = '700 34px Unbounded, sans-serif';
  const text = fitText(ctx, groupName.toUpperCase(), NAME_PILL.maxWidth - 48);
  const textWidth = ctx.measureText(text).width;
  const pillWidth = Math.min(NAME_PILL.maxWidth, textWidth + 56);
  const pillX = POSTER_WIDTH - NAME_PILL.right - pillWidth;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 20;
  roundRect(ctx, pillX, NAME_PILL.top, pillWidth, pillHeight, pillHeight / 2);
  ctx.fillStyle = 'rgba(7, 26, 26, 0.72)';
  ctx.fill();
  ctx.restore();

  roundRect(ctx, pillX, NAME_PILL.top, pillWidth, pillHeight, pillHeight / 2);
  ctx.strokeStyle = 'rgba(200, 241, 60, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#eef5f4';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, pillX + 28, NAME_PILL.top + pillHeight / 2 + 2);
}

async function drawQrBlock(ctx: CanvasRenderingContext2D, inviteUrl: string, logoSrc: string) {
  const { x, y, size } = QR_BOX;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 36;
  ctx.shadowOffsetY = 10;
  roundRect(ctx, x, y, size, size, 24);
  ctx.fillStyle = '#eef5f4';
  ctx.fill();
  ctx.restore();

  const qr = (qrcode as any)(0, 'H'); // typeNumber 0 = auto-size, 'H' = highest error correction
  qr.addData(inviteUrl);
  qr.make();
  const moduleCount = qr.getModuleCount();

  const pad = size * 0.09;
  const inner = size - pad * 2;
  const cell = inner / moduleCount;

  ctx.fillStyle = '#071a1a';
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        ctx.fillRect(x + pad + col * cell, y + pad + row * cell, cell + 0.5, cell + 0.5);
      }
    }
  }

  // Small logo badge centered on the QR — safe at errorCorrectionLevel 'H'.
  const logo = await loadImage(logoSrc);
  const badgeR = size * 0.12;
  const cx = x + size / 2;
  const cy = y + size / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, badgeR, 0, Math.PI * 2);
  ctx.fillStyle = '#0c2628';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#c8f13c';
  ctx.stroke();
  if (logo) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, badgeR - 8, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logo, cx - (badgeR - 8), cy - (badgeR - 8), (badgeR - 8) * 2, (badgeR - 8) * 2);
    ctx.restore();
  }
}

export async function drawGroupPoster(
  canvas: HTMLCanvasElement,
  { groupName, inviteUrl, backgroundSrc = '/poster-bg.jpg', logoSrc = '/logo.webp' }: DrawPosterOptions
): Promise<void> {
  canvas.width = POSTER_WIDTH;
  canvas.height = POSTER_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const bgImg = await loadImage(backgroundSrc);
  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, POSTER_WIDTH, POSTER_HEIGHT);
  } else {
    drawGeneratedBackground(ctx);
  }

  drawNamePill(ctx, groupName);
  await drawQrBlock(ctx, inviteUrl, logoSrc);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}
