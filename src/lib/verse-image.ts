// The share image for the verse of the day: a 1080×1350 card (the size social feeds show in full),
// painted in the browser. Modeled on The Word's photograph cards, in The Well's navy and gold,
// with the white logo small at the foot.

export type VerseCard = {
  text: string;
  reference: string;
  date: string;
  background: string;
  dark: boolean;
  logo: string;
  /** The site's address, set small at the very bottom. */
  site: string;
};

const WIDTH = 1080;
const HEIGHT = 1350;
const SERIF = 'Fraunces, Georgia, serif';
const SANS = 'Outfit, Arial, sans-serif';
const CREAM = '#fbf8f1';
const GOLD = '#e2bb72';

function load(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

/** Letter-spaced capitals, centred on x. */
function tracked(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, spacing: number, weight = 600) {
  ctx.font = `${weight} ${size}px ${SANS}`;
  const letters = Array.from(text);
  const total = letters.reduce((sum, letter) => sum + ctx.measureText(letter).width + spacing, -spacing);
  let at = x - total / 2;
  ctx.textAlign = 'left';
  for (const letter of letters) {
    ctx.fillText(letter, at, y);
    at += ctx.measureText(letter).width + spacing;
  }
  return total;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export async function paintVerseCard(card: VerseCard): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d')!;

  if (document.fonts) {
    await Promise.all([
      document.fonts.load(`italic 500 64px Fraunces`),
      document.fonts.load(`600 22px Outfit`),
      document.fonts.load(`500 22px Outfit`),
    ]).catch(() => undefined);
  }
  const [photo, logo] = await Promise.all([load(card.background), load(card.logo)]);

  // Photograph, full bleed.
  ctx.fillStyle = '#0c2a3f';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  if (photo) {
    const scale = Math.max(WIDTH / photo.naturalWidth, HEIGHT / photo.naturalHeight);
    const w = photo.naturalWidth * scale;
    const h = photo.naturalHeight * scale;
    ctx.drawImage(photo, (WIDTH - w) / 2, (HEIGHT - h) / 2, w, h);
  }

  // A light veil, as in The Word, so the photograph stays the picture: just enough, deepest behind
  // the verse, for cream type to read. Already-dark photos get less.
  const opacity = card.dark ? 0.22 : 0.34;
  const veil = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  veil.addColorStop(0, `rgba(6, 18, 28, ${opacity * 0.42})`);
  veil.addColorStop(0.34, `rgba(6, 18, 28, ${opacity * 0.5 + 0.1})`);
  veil.addColorStop(0.7, `rgba(6, 18, 28, ${opacity * 0.62 + 0.16})`);
  veil.addColorStop(1, `rgba(6, 18, 28, ${opacity * 0.48 + 0.08})`);
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  const glow = ctx.createRadialGradient(WIDTH / 2, HEIGHT * 0.42, 0, WIDTH / 2, HEIGHT * 0.42, WIDTH * 0.75);
  glow.addColorStop(0, 'rgba(226, 187, 114, 0.10)');
  glow.addColorStop(1, 'rgba(226, 187, 114, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Ripples from the centre: the well.
  ctx.save();
  ctx.lineWidth = 1.5;
  for (let ring = 1; ring <= 6; ring += 1) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.085 - ring * 0.01})`;
    ctx.beginPath();
    ctx.arc(WIDTH / 2, HEIGHT * 0.45, ring * 120, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Hairline frame.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(48, 48, WIDTH - 96, HEIGHT - 96);

  // Heading.
  ctx.fillStyle = CREAM;
  ctx.textBaseline = 'middle';
  const headingWidth = tracked(ctx, 'A WORD FOR TODAY', WIDTH / 2, 156, 22, 6);
  ctx.fillStyle = GOLD;
  ctx.fillRect(WIDTH / 2 - headingWidth / 2 - 62, 155, 40, 2);
  ctx.fillRect(WIDTH / 2 + headingWidth / 2 + 22, 155, 40, 2);
  ctx.fillStyle = 'rgba(251, 248, 241, 0.72)';
  tracked(ctx, card.date.toUpperCase(), WIDTH / 2, 198, 17, 3.5, 500);

  // The verse: the largest size that fits between the heading and the logo.
  const quoted = `“${card.text}”`;
  const maxWidth = 840;
  const top = 270;
  const bottom = 1010;
  let size = 78;
  let lines: string[] = [];
  let lineHeight = 0;
  for (; size >= 34; size -= 2) {
    ctx.font = `italic 500 ${size}px ${SERIF}`;
    lines = wrap(ctx, quoted, maxWidth);
    lineHeight = size * 1.3;
    if (lines.length * lineHeight + 110 <= bottom - top) break;
  }
  // Even out the line lengths without adding a line.
  for (let width = maxWidth - 20; width >= maxWidth * 0.7; width -= 20) {
    const balanced = wrap(ctx, quoted, width);
    if (balanced.length !== lines.length) break;
    lines = balanced;
  }
  const block = lines.length * lineHeight;
  const start = top + (bottom - top - block - 110) / 2;
  ctx.save();
  ctx.fillStyle = CREAM;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 10, 18, 0.65)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 2;
  ctx.font = `italic 500 ${size}px ${SERIF}`;
  lines.forEach((line, index) => ctx.fillText(line, WIDTH / 2, start + lineHeight * (index + 0.5)));
  ctx.restore();

  // Reference.
  const refY = start + block + 66;
  ctx.fillStyle = GOLD;
  ctx.fillRect(WIDTH / 2 - 22, refY - 40, 44, 2);
  tracked(ctx, card.reference.toUpperCase(), WIDTH / 2, refY, 26, 5);
  ctx.fillStyle = 'rgba(251, 248, 241, 0.6)';
  tracked(ctx, 'KING JAMES VERSION', WIDTH / 2, refY + 40, 15, 4, 500);

  // The Well's logo, small and quiet at the foot.
  if (logo) {
    const w = 92;
    const h = (logo.naturalHeight / logo.naturalWidth) * w;
    ctx.globalAlpha = 0.9;
    ctx.drawImage(logo, (WIDTH - w) / 2, HEIGHT - 82 - h, w, h);
    ctx.globalAlpha = 1;
  }

  // The site's address, quiet in the margin below the frame.
  ctx.fillStyle = 'rgba(251, 248, 241, 0.62)';
  tracked(ctx, card.site.toUpperCase(), WIDTH / 2, HEIGHT - 24, 14, 3, 500);
  return canvas;
}

export function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create the image.'))), 'image/png'));
}
