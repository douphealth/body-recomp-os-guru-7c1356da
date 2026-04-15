import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PhotoEntry {
  id: string;
  week: number;
  imageUrl: string;
  date: string;
}

const WEEKS = [1, 2, 3, 4, 5, 6, 7, 8];
const MAX_WIDTH = 600;
const QUALITY = 0.7;

/** Compress image to avoid blowing localStorage quota */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, MAX_WIDTH / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', QUALITY));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

const ProgressPhotos = () => {
  const [photos, setPhotos] = useState<PhotoEntry[]>(() => {
    try {
      const stored = localStorage.getItem('recomp-progress-photos');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [compareWeeks, setCompareWeeks] = useState<[number, number]>([1, 8]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingWeek, setUploadingWeek] = useState<number | null>(null);

  const savePhotos = useCallback((updated: PhotoEntry[]) => {
    setPhotos(updated);
    try {
      localStorage.setItem('recomp-progress-photos', JSON.stringify(updated));
    } catch {
      toast.error('Storage full — please remove old photos first');
    }
  }, []);

  const handleUpload = (week: number) => {
    setUploadingWeek(week);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingWeek === null) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }

    try {
      const compressed = await compressImage(file);
      const entry: PhotoEntry = {
        id: crypto.randomUUID(),
        week: uploadingWeek,
        imageUrl: compressed,
        date: new Date().toLocaleDateString(),
      };
      const updated = [...photos.filter(p => p.week !== uploadingWeek), entry];
      savePhotos(updated);
      toast.success(`Week ${uploadingWeek} photo saved!`);
    } catch {
      toast.error('Failed to process image');
    }
    setUploadingWeek(null);
    e.target.value = '';
  };

  const removePhoto = (week: number) => {
    const updated = photos.filter(p => p.week !== week);
    savePhotos(updated);
    toast.success('Photo removed');
  };

  const getPhoto = (week: number) => photos.find(p => p.week === week);
  const leftPhoto = getPhoto(compareWeeks[0]);
  const rightPhoto = getPhoto(compareWeeks[1]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Camera className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider font-['Oswald']">Progress Photos</h3>
          <p className="text-[10px] text-muted-foreground">Track your visual transformation over 8 weeks</p>
        </div>
      </div>

      {/* Weekly photo grid */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-4">
        {WEEKS.map(week => {
          const photo = getPhoto(week);
          return (
            <div key={week} className="relative group">
              <button
                onClick={() => photo ? undefined : handleUpload(week)}
                className={`w-full aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-[10px] transition-all ${
                  photo
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border/50 hover:border-primary/40 hover:bg-primary/5'
                }`}
              >
                {photo ? (
                  <img src={photo.imageUrl} alt={`Week ${week}`} className="w-full h-full object-cover rounded-md" />
                ) : (
                  <>
                    <Upload className="h-3 w-3 text-muted-foreground mb-0.5" />
                    <span className="text-muted-foreground">Wk {week}</span>
                  </>
                )}
              </button>
              {photo && (
                <button
                  onClick={() => removePhoto(week)}
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison view */}
      <div className="rounded-xl bg-secondary/20 border border-border/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Side-by-Side Comparison</span>
          <div className="flex items-center gap-2 text-[10px]">
            <select
              value={compareWeeks[0]}
              onChange={e => setCompareWeeks([parseInt(e.target.value), compareWeeks[1]])}
              className="bg-secondary/50 border border-border/50 rounded px-2 py-1 text-xs"
            >
              {WEEKS.map(w => <option key={w} value={w}>Week {w}</option>)}
            </select>
            <span className="text-muted-foreground">vs</span>
            <select
              value={compareWeeks[1]}
              onChange={e => setCompareWeeks([compareWeeks[0], parseInt(e.target.value)])}
              className="bg-secondary/50 border border-border/50 rounded px-2 py-1 text-xs"
            >
              {WEEKS.map(w => <option key={w} value={w}>Week {w}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[{ photo: leftPhoto, week: compareWeeks[0], label: 'Before' }, { photo: rightPhoto, week: compareWeeks[1], label: 'After' }].map(({ photo, week, label }) => (
            <div key={label} className="relative">
              <div className="aspect-[3/4] rounded-lg bg-secondary/30 border border-border/30 overflow-hidden flex items-center justify-center">
                {photo ? (
                  <img src={photo.imageUrl} alt={`${label} - Week ${week}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-[10px] text-muted-foreground">No photo yet</p>
                    <Button variant="ghost" size="sm" className="mt-2 text-[10px] h-7" onClick={() => handleUpload(week)}>
                      Upload Week {week}
                    </Button>
                  </div>
                )}
              </div>
              <div className="absolute top-2 left-2">
                <span className="text-[10px] font-bold bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-md border border-border/30">
                  {label} — Wk {week}
                </span>
              </div>
              {photo && <p className="text-[9px] text-muted-foreground text-center mt-1">{photo.date}</p>}
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground mt-3 italic">
        Tips: Take photos in the same lighting, same pose, same time of day (morning, fasted). Photos are compressed and stored locally on your device.
      </p>
    </motion.div>
  );
};

export default ProgressPhotos;
