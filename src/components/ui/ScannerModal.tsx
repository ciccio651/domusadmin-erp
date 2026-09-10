import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Upload, X, RotateCcw, Check, ScanLine, Image } from 'lucide-react';

export interface ScannedFile {
  dataUrl: string;     // base64 image
  name: string;
  source: 'camera' | 'upload';
  timestamp: string;
}

interface Props {
  onCapture: (file: ScannedFile) => void;
  onClose: () => void;
}

type Mode = 'choose' | 'camera' | 'upload' | 'preview';

export function ScannerModal({ onCapture, onClose }: Props) {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const fileRef    = useRef<HTMLInputElement>(null);
  const streamRef  = useRef<MediaStream | null>(null);

  const [mode, setMode]         = useState<Mode>('choose');
  const [preview, setPreview]   = useState<string | null>(null);
  const [name, setName]         = useState('Documento scansionato');
  const [cameraErr, setCamErr]  = useState('');
  const [loading, setLoading]   = useState(false);

  // ── Start camera ─────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCamErr('');
    setLoading(true);
    setMode('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setCamErr('Fotocamera non disponibile o permesso negato. Usa il caricamento file.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Stop camera ───────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // ── Capture frame ─────────────────────────────────────────────────────────
  const capture = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    stopCamera();
    setPreview(dataUrl);
    setMode('preview');
  };

  // ── Upload file ───────────────────────────────────────────────────────────
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setName(file.name.replace(/\.[^.]+$/, ''));
    const reader = new FileReader();
    reader.onload = ev => {
      setPreview(ev.target?.result as string);
      setMode('preview');
    };
    reader.readAsDataURL(file);
  };

  // ── Confirm ───────────────────────────────────────────────────────────────
  const confirm = () => {
    if (!preview) return;
    onCapture({
      dataUrl: preview,
      name: name.trim() || 'Documento',
      source: mode === 'preview' ? (streamRef.current ? 'camera' : 'upload') : 'upload',
      timestamp: new Date().toISOString(),
    });
    onClose();
  };

  const reset = () => {
    setPreview(null);
    setCamErr('');
    stopCamera();
    setMode('choose');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg animate-fade-up overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-blue-600" />
            <h2 className="font-display font-bold text-slate-800">Scanner Documenti</h2>
          </div>
          <button onClick={onClose} className="btn-icon text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* ── CHOOSE mode ── */}
          {mode === 'choose' && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={startCamera}
                data-testid="scanner-camera-btn"
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-slate-200
                           hover:border-blue-400 hover:bg-blue-50 transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center
                                group-hover:bg-blue-200 transition-colors">
                  <Camera className="w-7 h-7 text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="font-display font-bold text-slate-800">Fotocamera</p>
                  <p className="text-xs text-slate-400 mt-0.5">Scansiona con la webcam</p>
                </div>
              </button>

              <button
                onClick={() => { setMode('upload'); fileRef.current?.click(); }}
                data-testid="scanner-upload-btn"
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-slate-200
                           hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center
                                group-hover:bg-emerald-200 transition-colors">
                  <Upload className="w-7 h-7 text-emerald-600" />
                </div>
                <div className="text-center">
                  <p className="font-display font-bold text-slate-800">Carica file</p>
                  <p className="text-xs text-slate-400 mt-0.5">Immagine o PDF</p>
                </div>
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFile}
              />
            </div>
          )}

          {/* ── CAMERA mode ── */}
          {mode === 'camera' && (
            <div className="space-y-3">
              {cameraErr ? (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 text-center">
                  {cameraErr}
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                  {/* Scan overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-6 border-2 border-white/30 rounded-lg" />
                    <div className="absolute left-6 right-6 h-0.5 bg-blue-400/70 top-1/2 animate-bounce" />
                    <div className="absolute top-6 left-6 w-6 h-6 border-l-2 border-t-2 border-white rounded-tl" />
                    <div className="absolute top-6 right-6 w-6 h-6 border-r-2 border-t-2 border-white rounded-tr" />
                    <div className="absolute bottom-6 left-6 w-6 h-6 border-l-2 border-b-2 border-white rounded-bl" />
                    <div className="absolute bottom-6 right-6 w-6 h-6 border-r-2 border-b-2 border-white rounded-br" />
                  </div>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-2">
                <button onClick={reset} className="btn-secondary flex-1"><RotateCcw className="w-4 h-4" /> Indietro</button>
                {!cameraErr && (
                  <button
                    onClick={capture}
                    className="btn-primary flex-[2] justify-center gap-2"
                    data-testid="scanner-capture-btn"
                  >
                    <Camera className="w-4 h-4" /> Scatta
                  </button>
                )}
                {cameraErr && (
                  <button
                    onClick={() => { setMode('upload'); fileRef.current?.click(); }}
                    className="btn-primary flex-[2] justify-center"
                  >
                    <Upload className="w-4 h-4" /> Carica file
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── PREVIEW mode ── */}
          {mode === 'preview' && preview && (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center min-h-[200px]">
                {preview.startsWith('data:image') ? (
                  <img src={preview} alt="Anteprima" className="max-h-72 w-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                    <Image className="w-12 h-12 opacity-40" />
                    <p className="text-sm">File PDF caricato</p>
                  </div>
                )}
              </div>

              <div>
                <label className="input-label">Nome documento</label>
                <input
                  className="input mt-1"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  data-testid="scanner-name-input"
                />
              </div>

              <div className="flex gap-2">
                <button onClick={reset} className="btn-secondary flex-1">
                  <RotateCcw className="w-4 h-4" /> Riprendi
                </button>
                <button
                  onClick={confirm}
                  className="btn-primary flex-[2] justify-center"
                  data-testid="scanner-confirm-btn"
                >
                  <Check className="w-4 h-4" /> Salva documento
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
