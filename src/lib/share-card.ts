interface ShareCardOptions {
  title: string;
  subtitle?: string;
  body: string;
  footer?: string;
}

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';

  words.forEach(word => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });
  if (line) lines.push(line);
  return lines;
};

export const generateShareCard = async (options: ShareCardOptions): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas not supported');
  }

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1350);
  gradient.addColorStop(0, '#0f172a');
  gradient.addColorStop(1, '#1e293b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Soft glow
  ctx.fillStyle = 'rgba(251, 191, 36, 0.08)';
  ctx.beginPath();
  ctx.arc(820, 200, 220, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
  ctx.beginPath();
  ctx.arc(220, 1100, 240, 0, Math.PI * 2);
  ctx.fill();

  // Border
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.25)';
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

  // Title
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 48px "Playfair Display", serif';
  ctx.fillText(options.title, 80, 170);

  if (options.subtitle) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(options.subtitle, 80, 220);
  }

  // Body
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '32px "Plus Jakarta Sans", sans-serif';
  const lines = wrapText(ctx, options.body, 900);
  let y = 320;
  lines.slice(0, 12).forEach(line => {
    ctx.fillText(line, 80, y);
    y += 48;
  });

  // Footer
  ctx.fillStyle = '#94a3b8';
  ctx.font = '22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(options.footer || 'MyRamadhanku', 80, 1230);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Failed to create image'));
      } else {
        resolve(blob);
      }
    }, 'image/png');
  });
};

export const shareImage = async (blob: Blob, fallbackName: string) => {
  const file = new File([blob], fallbackName, { type: 'image/png' });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: 'MyRamadhanku' });
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fallbackName;
  link.click();
  URL.revokeObjectURL(url);
};
