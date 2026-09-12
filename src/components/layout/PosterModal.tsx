import { useEffect, useRef, useState } from 'react';
import { Download, Share2, Maximize2, X, Printer } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useLanguage } from '../../contexts/LanguageContext';
import { drawGroupPoster, POSTER_WIDTH, POSTER_HEIGHT } from '../../lib/poster';
import type { Group } from '../../types';

interface PosterModalProps {
  open: boolean;
  onClose: () => void;
  group: Group;
}

export function PosterModal({ open, onClose, group }: PosterModalProps) {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [ready, setReady] = useState(false);

  const inviteUrl = `${window.location.origin}/join/${group.inviteCode}`;

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    setReady(false);
    drawGroupPoster(canvasRef.current, { groupName: group.name, inviteUrl }).then(() =>
      setReady(true)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, group.name, inviteUrl]);

  const filename = `padel-ensemble-${group.inviteCode.toLowerCase()}.png`;

  const getBlob = (): Promise<Blob | null> =>
    new Promise((resolve) => canvasRef.current?.toBlob((b) => resolve(b), 'image/png'));

  const handleDownload = async () => {
    const blob = await getBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const blob = await getBlob();
    if (!blob) return;
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: group.name,
        text: t('poster.shareText').replace('{name}', group.name),
      });
    } else {
      // No native share sheet (most desktop browsers) — fall back to download.
      await handleDownload();
    }
  };

  const handlePrint = () => {
    const dataUrl = canvasRef.current?.toDataURL('image/png');
    if (!dataUrl) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(
      `<html><head><title>${group.name}</title></head><body style="margin:0"><img src="${dataUrl}" style="width:100%" onload="window.print()" /></body></html>`
    );
    win.document.close();
  };

  return (
    <>
      <Modal open={open && !fullscreen} onClose={onClose} title={t('poster.title')}>
        <p className="mb-4 text-sm text-mist-300">{t('poster.subtitle')}</p>

        <button
          onClick={() => setFullscreen(true)}
          className="group relative mx-auto block w-full max-w-[220px] overflow-hidden rounded-xl border border-court-600"
          aria-label={t('poster.enlarge')}
        >
          <canvas
            ref={canvasRef}
            width={POSTER_WIDTH}
            height={POSTER_HEIGHT}
            className="block w-full"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-court-950/0 opacity-0 transition-opacity group-hover:bg-court-950/40 group-hover:opacity-100">
            <Maximize2 className="text-mist-100" size={28} />
          </div>
        </button>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <button
            onClick={handleDownload}
            disabled={!ready}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-court-600 bg-court-800 px-3 py-3 text-xs font-medium text-mist-100 transition-colors hover:border-ball/50 disabled:opacity-50"
          >
            <Download size={18} className="text-ball" />
            {t('poster.download')}
          </button>
          <button
            onClick={handleShare}
            disabled={!ready}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-court-600 bg-court-800 px-3 py-3 text-xs font-medium text-mist-100 transition-colors hover:border-ball/50 disabled:opacity-50"
          >
            <Share2 size={18} className="text-ball" />
            {t('poster.share')}
          </button>
          <button
            onClick={handlePrint}
            disabled={!ready}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-court-600 bg-court-800 px-3 py-3 text-xs font-medium text-mist-100 transition-colors hover:border-ball/50 disabled:opacity-50"
          >
            <Printer size={18} className="text-ball" />
            {t('poster.print')}
          </button>
        </div>
      </Modal>

      {fullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-court-950/95 p-4">
          <button
            onClick={() => setFullscreen(false)}
            className="absolute right-4 top-4 rounded-lg p-2 text-mist-300 hover:bg-court-800 hover:text-mist-100"
            aria-label={t('modal.close')}
          >
            <X size={24} />
          </button>
          <img
            src={canvasRef.current?.toDataURL('image/png')}
            alt={group.name}
            className="max-h-[85vh] rounded-xl shadow-2xl"
          />
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-xl bg-ball px-4 py-2 text-sm font-semibold text-court-950"
            >
              <Download size={16} /> {t('poster.download')}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-xl border border-court-600 bg-court-800 px-4 py-2 text-sm font-medium text-mist-100"
            >
              <Share2 size={16} /> {t('poster.share')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
