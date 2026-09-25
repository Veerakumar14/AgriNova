import { useState, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { useToast } from '../components/Toast';
import { Scan, Upload, AlertTriangle, CheckCircle, X, ImageIcon } from 'lucide-react';
import { analyzeCropImage } from '../services/aiService';
import type { CropAnalysis } from '../types';

const severityColors = {
  low: { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', badge: 'badge-green' },
  medium: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', badge: 'badge-amber' },
  high: { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', badge: 'badge-red' },
  critical: { bg: '#FEF2F2', border: '#FCA5A5', text: '#7F1D1D', badge: 'badge-red' },
};

export default function CropDoctor() {
  const { state, dispatch, currentFarm, addNotification } = useApp();
  const { showToast } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<CropAnalysis | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const history = state.cropAnalyses.filter(a => a.farmId === currentFarm?.id);

  const handleFile = async (file: File) => {
    setError('');
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Unsupported file type. Please upload JPG, PNG, or WEBP images.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Please upload an image under 10MB.');
      return;
    }

    setUploading(true);
    setResult(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    await new Promise(r => setTimeout(r, 800));
    setUploading(false);
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 2000));

    try {
      const analysis = analyzeCropImage(file.name);
      const record: CropAnalysis = {
        id: crypto.randomUUID(), farmId: currentFarm?.id || '',
        imageUrl: url, ...analysis, analyzedAt: new Date().toISOString(),
      };
      setResult(record);
      dispatch({ type: 'ADD_CROP_ANALYSIS', payload: record });
      addNotification('Crop Analysis Complete', `${analysis.disease} detected in ${analysis.crop} with ${analysis.confidence}% confidence.`, analysis.severity === 'low' ? 'success' : 'warning');
      showToast('Analysis complete!');
    } catch {
      setError('Analysis failed. Please try again with a clearer image.');
    }
    setAnalyzing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const reset = () => { setResult(null); setPreview(null); setError(''); };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>AI Crop Doctor</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Upload a photo of your crop to detect diseases and get treatment recommendations.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload area */}
        <div>
          {!result ? (
            <div className={`border-2 border-dashed rounded-2xl transition-all cursor-pointer ${dragOver ? 'scale-[1.01]' : ''}`}
              style={{ borderColor: dragOver ? 'var(--primary)' : 'var(--border)', background: dragOver ? 'var(--secondary)' : 'var(--card)', padding: 32 }}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}>
              <input ref={fileRef} type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

              {preview && (analyzing || uploading) ? (
                <div className="text-center">
                  <img src={preview} alt="Uploaded crop" className="rounded-xl mx-auto mb-4 object-cover" style={{ maxHeight: 200, maxWidth: '100%' }} />
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {uploading ? 'Uploading image...' : 'Analyzing crop disease...'}
                  </div>
                  <div className="mt-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {analyzing && 'AI is scanning for pathogens, nutrient deficiencies, and stress patterns...'}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  {preview ? (
                    <img src={preview} alt="Preview" className="rounded-xl mx-auto mb-4 object-cover" style={{ maxHeight: 180, maxWidth: '100%' }} />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--secondary)' }}>
                      <ImageIcon size={28} style={{ color: 'var(--muted-foreground)' }} />
                    </div>
                  )}
                  <p className="font-semibold mb-1" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Drop your crop image here</p>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>or click to browse · JPG, PNG, WEBP · Max 10MB</p>
                  <button className="btn-primary mt-4 mx-auto" onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>
                    <Upload size={16} /> Choose Image
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-5">
              <img src={result.imageUrl} alt="Analyzed crop" className="rounded-xl w-full object-cover mb-4" style={{ maxHeight: 220 }} />
              <button onClick={reset} className="btn-secondary w-full justify-center">Analyze Another Image</button>
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 rounded-xl flex items-center gap-2" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
              <AlertTriangle size={16} style={{ color: '#DC2626' }} />
              <span className="text-sm" style={{ color: '#991B1B' }}>{error}</span>
            </div>
          )}

          <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--secondary)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Tips for best results:</p>
            <ul className="text-xs space-y-1" style={{ color: 'var(--muted-foreground)' }}>
              {['Take photos in natural daylight', 'Focus on affected leaves or fruits', 'Include multiple leaves if possible', 'Ensure image is clear and not blurry'].map(t => (
                <li key={t} className="flex items-start gap-2"><span style={{ color: 'var(--primary)' }}>·</span>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Results */}
        <div>
          {result ? (
            <div className="animate-fade-in space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={18} style={{ color: '#16A34A' }} />
                <span className="font-bold text-sm" style={{ color: '#16A34A' }}>Analysis Complete</span>
              </div>

              <div className="card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-bold mb-1" style={{ color: 'var(--muted-foreground)' }}>DETECTED CONDITION</div>
                    <h3 className="text-xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{result.disease}</h3>
                    <div className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>in {result.crop}</div>
                  </div>
                  <span className={severityColors[result.severity].badge}>{result.severity.toUpperCase()}</span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>AI Confidence</span>
                    <span className="text-sm font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{result.confidence}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: 'var(--muted)' }}>
                    <div className="h-2 rounded-full" style={{ width: `${result.confidence}%`, background: result.confidence > 85 ? '#16A34A' : '#D97706' }} />
                  </div>
                </div>

                <div className="mb-4 p-3 rounded-xl" style={{ background: severityColors[result.severity].bg, border: `1px solid ${severityColors[result.severity].border}` }}>
                  <div className="text-xs font-bold mb-2" style={{ color: severityColors[result.severity].text }}>OBSERVED SYMPTOMS</div>
                  <ul className="space-y-1">
                    {result.symptoms.map((s, i) => <li key={i} className="text-sm flex items-start gap-2" style={{ color: severityColors[result.severity].text }}><span>·</span>{s}</li>)}
                  </ul>
                </div>

                <div className="p-3 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <div className="text-xs font-bold mb-2" style={{ color: '#166534' }}>RECOMMENDED ACTIONS</div>
                  <ul className="space-y-1.5">
                    {result.actions.map((a, i) => (
                      <li key={i} className="text-sm flex items-start gap-2" style={{ color: '#14532D' }}>
                        <span className="flex-shrink-0 font-bold" style={{ color: '#16A34A' }}>{i + 1}.</span>{a}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Analyzed on {new Date(result.analyzedAt).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-bold text-sm mb-3" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Analysis History</h3>
              {history.length === 0 ? (
                <div className="card p-8 text-center">
                  <Scan size={32} style={{ color: 'var(--muted-foreground)', margin: '0 auto 12px' }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>No analyses yet</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Upload a crop image to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.slice(0, 5).map(a => (
                    <div key={a.id} className="card card-hover p-4 flex items-center gap-3 cursor-pointer" onClick={() => setResult(a)}>
                      {a.imageUrl && <img src={a.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{a.disease}</div>
                        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{a.crop} · {a.confidence}% confidence</div>
                      </div>
                      <span className={severityColors[a.severity].badge}>{a.severity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
