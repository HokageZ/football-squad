'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Upload, X, EyeOff, Eye, Zap, Info, AlertTriangle, Sparkles, Target, Save, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Player,
  PlayerStats,
  PlayerPosition,
  StatKey,
  STAT_KEYS,
  STAT_LABELS,
  STAT_DESCRIPTIONS,
  DEFAULT_STATS,
  POSITIONS,
  POSITION_LABELS,
  POSITION_COLORS,
  STAT_PRESETS,
  POSITION_STAT_WEIGHTS,
} from '@/lib/types';
import { calculateOverall, calculatePositionOverall, detectBestPosition, validateStats } from '@/lib/team-balancer';
import { compressImage } from '@/lib/image';
import { StatSlider } from './StatSlider';

const PRESET_LEVELS = [
  { key: 'Beginner', label: 'Beginner', emoji: '🟤', description: 'Just starting out (40-55 OVR)' },
  { key: 'Average', label: 'Average', emoji: '⚪', description: 'Casual player (55-70 OVR)' },
  { key: 'Good', label: 'Good', emoji: '🟢', description: 'Experienced player (70-82 OVR)' },
  { key: 'Elite', label: 'Elite', emoji: '🟡', description: 'Top tier player (85-95 OVR)' },
];

interface PlayerFormProps {
  player?: Player;
  onSubmit: (data: { name: string; stats: PlayerStats; image?: string; isUnknown?: boolean; position?: PlayerPosition }) => void;
  onCancel: () => void;
}

export function PlayerForm({ player, onSubmit, onCancel }: PlayerFormProps) {
  const isEditing = !!player;
  const [name, setName] = useState(player?.name || '');
  const [image, setImage] = useState(player?.image || '');
  const [stats, setStats] = useState<PlayerStats>(
    player?.stats || { ...DEFAULT_STATS }
  );
  const [isUnknown, setIsUnknown] = useState(player?.isUnknown || false);
  const [position, setPosition] = useState<PlayerPosition | undefined>(player?.position);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [showGuide, setShowGuide] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [detectedPosition, setDetectedPosition] = useState<PlayerPosition | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  // Detect best position and validate stats when stats change
  useEffect(() => {
    if (isUnknown) return;
    const detected = detectBestPosition(stats);
    setDetectedPosition(detected);
    const w = validateStats(stats, position);
    setWarnings(w);
  }, [stats, position, isUnknown]);

  const handleStatChange = useCallback((key: keyof PlayerStats, value: number) => {
    setStats((prev) => ({ ...prev, [key]: value }));
    setActivePreset(null);
  }, []);

  const handleApplyPreset = (presetKey: string) => {
    const posKey = position || 'ANY';
    const preset = STAT_PRESETS[presetKey]?.[posKey];
    if (preset) {
      setStats({ ...preset });
      setActivePreset(presetKey);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);
    setImageLoading(true);

    try {
      const compressed = await compressImage(file, {
        maxWidth: 256,
        maxHeight: 256,
        quality: 0.7,
      });
      setImage(compressed);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setImageLoading(false);
      // Reset input so the same file can be re-selected
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { name?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      stats,
      image: image || undefined,
      isUnknown,
      position,
    });
  };

  const overall = position ? calculatePositionOverall(stats, position) : calculateOverall(stats);
  const baseOverall = calculateOverall(stats);
  const positionOverall = position ? calculatePositionOverall(stats, position) : null;

  // Get the importance weight for a stat in the selected position
  const getStatWeight = (key: StatKey): number | null => {
    if (!position) return null;
    return POSITION_STAT_WEIGHTS[position]?.[key] ?? null;
  };

  return (
    <TooltipProvider delayDuration={200}>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <Avatar className={`h-32 w-32 border-4 shadow-2xl transition-[border-color,opacity] duration-300 ${isUnknown ? 'border-white/10 opacity-50' : 'border-primary/30 group-hover:border-primary/50'}`}>
              <AvatarImage src={image} alt={name || 'Player'} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-white/10 to-black/20 text-4xl font-black">
                {isUnknown ? '?' : (name ? name.substring(0, 2).toUpperCase() : <User className="h-12 w-12" />)}
              </AvatarFallback>
            </Avatar>
            {image && (
              <button
                type="button"
                onClick={() => setImage('')}
                className="absolute top-0 right-0 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex flex-col items-center gap-2">
            <Label
              htmlFor="image-upload"
              className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors font-bold text-xs uppercase tracking-wider ${imageLoading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <Upload className="h-3.5 w-3.5" />
              {imageLoading ? 'Processing...' : image ? 'Change Photo' : 'Upload Photo'}
            </Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={imageLoading}
            />
            {imageError && (
              <p className="text-xs font-bold text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {imageError}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Player Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({});
              }}
              placeholder="Enter player name"
              className={`bg-white/5 border-white/10 h-12 text-lg font-bold ${errors.name ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
            />
            {errors.name && (
              <p className="text-xs font-bold text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          {/* Position Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Position</Label>
              {/* Auto-detect suggestion */}
              {!position && detectedPosition && !isUnknown && (
                <button
                  type="button"
                  onClick={() => setPosition(detectedPosition)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-2 py-1 rounded-full"
                >
                  <Target className="h-3 w-3" />
                  Suggested: {detectedPosition}
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setPosition(position === pos ? undefined : pos)}
                  className={`
                    relative overflow-hidden p-3 rounded-xl border-2 transition-[border-color,background-color] duration-200 group
                    ${position === pos 
                      ? 'border-current bg-current/10 shadow-[0_0_15px_-5px_currentColor]' 
                      : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10'
                    }
                    ${!position && detectedPosition === pos ? 'ring-1 ring-primary/30 ring-offset-1 ring-offset-black' : ''}
                  `}
                  style={{ 
                    color: position === pos ? POSITION_COLORS[pos] : undefined,
                    borderColor: position === pos ? POSITION_COLORS[pos] : undefined
                  }}
                >
                  <div className="relative z-10 text-center">
                    <span className="block text-lg font-black tracking-tight">{pos}</span>
                    <span className="block text-[10px] font-bold uppercase tracking-wider opacity-60 mt-0.5 group-hover:opacity-100 transition-opacity">
                      {POSITION_LABELS[pos]}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Unknown Stats Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors">
            <div className="space-y-1">
              <Label className="text-sm font-bold flex items-center gap-2">
                {isUnknown ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-primary" />}
                Scouting Mode
              </Label>
              <p className="text-xs text-muted-foreground font-medium">
                Hide stats until fully scouted
              </p>
            </div>
            <Switch
              checked={isUnknown}
              onCheckedChange={setIsUnknown}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {!isUnknown && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300 pt-2">
              {/* Overall Display */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-black border border-white/10 p-6 text-center group">
                <div className="relative z-10">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Overall Rating</p>
                  <span className={`text-6xl font-black tracking-tighter transition-colors duration-300 ${
                    overall >= 90 ? 'text-yellow-500' :
                    overall >= 80 ? 'text-emerald-500' :
                    overall >= 70 ? 'text-blue-500' :
                    'text-white'
                  }`}>
                    {overall}
                  </span>
                  {/* Base overall (when different from position-weighted) */}
                  {positionOverall !== null && positionOverall !== baseOverall && (
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">Base OVR:</span>
                      <span className={`text-lg font-black ${
                        baseOverall >= 80 ? 'text-emerald-400' :
                        baseOverall >= 70 ? 'text-blue-400' :
                        'text-muted-foreground'
                      }`}>
                        {baseOverall}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Quick Presets
                  </Label>
                  <span className="text-xs text-muted-foreground font-medium bg-white/5 px-2 py-1 rounded-full">
                    {position ? `Tuned for ${position}` : 'General templates'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_LEVELS.map(({ key, label, emoji, description }) => (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(key)}
                          className={`
                            relative overflow-hidden p-3 rounded-2xl border transition-[border-color,background-color] duration-300 group
                            ${activePreset === key 
                              ? 'border-primary bg-primary/10 shadow-lg' 
                              : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                            }
                          `}
                        >
                          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-white/5 to-transparent`} />
                          <div className="relative z-10 flex flex-col items-center gap-1">
                            <span className="text-2xl">{emoji}</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${activePreset === key ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                              {label}
                            </span>
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-zinc-900 border-white/10 text-white">
                        <p className="text-xs font-bold">{description}</p>
                        {position && <p className="text-[10px] text-muted-foreground mt-1">Stats optimized for {POSITION_LABELS[position]}</p>}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Stat Warnings */}
              {warnings.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400">Stat Review</span>
                  </div>
                  {warnings.map((w, i) => (
                    <p key={i} className="text-[11px] text-amber-300/70 pl-5">{w}</p>
                  ))}
                </div>
              )}

              {/* Stats Guide Toggle */}
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors w-full"
              >
                <Info className="h-3.5 w-3.5" />
                <span>{showGuide ? 'Hide' : 'Show'} stat guide</span>
              </button>

              {showGuide && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">How to Rate Stats (1-99 Scale)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-[11px]"><b>1-39</b> — Below average</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="text-[11px]"><b>40-59</b> — Average</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span className="text-[11px]"><b>60-74</b> — Good</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[11px]"><b>75-89</b> — Very good</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-[11px]"><b>90-99</b> — World class (use very sparingly)</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Tip: Be honest with ratings. A 50 is an average player, not bad. Most casual players will be 45-70 overall.
                  </p>
                </div>
              )}

              {/* Stats Sliders */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Attributes</Label>
                  <span className="text-[10px] font-bold text-muted-foreground bg-white/5 px-2 py-1 rounded">1-99</span>
                </div>
                <div className="grid gap-7 bg-white/5 p-6 rounded-2xl border border-white/10">
                  {STAT_KEYS.map((key) => {
                    const weight = getStatWeight(key);
                    return (
                      <div key={key} className="relative">
                        <StatSlider
                          statKey={key}
                          label={STAT_LABELS[key]}
                          value={stats[key]}
                          onChange={(value) => handleStatChange(key, value)}
                          description={STAT_DESCRIPTIONS[key]}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1 h-12 font-bold rounded-xl border-white/10 hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            {isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Player
              </>
            )}
          </Button>
        </div>
      </form>
    </TooltipProvider>
  );
}
