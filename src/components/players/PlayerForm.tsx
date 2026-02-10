'use client';

import { useState, useEffect } from 'react';
import { User, Upload, X, Eye, EyeOff, Save, UserPlus, Sparkles, Zap, Shield, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Player,
  PlayerStats,
  PlayerPosition,
  StatKey,
  STAT_KEYS,
  STAT_LABELS,
  STAT_COLORS,
  DEFAULT_STATS,
  POSITIONS,
  POSITION_LABELS,
  POSITION_COLORS,
  STAT_PRESETS,
} from '@/lib/types';
import { calculateOverall, calculatePositionOverall } from '@/lib/team-balancer';

const PRESET_CONFIGS = [
  { key: 'Beginner', label: 'Rookie', color: 'text-amber-700 bg-amber-500/10 border-amber-500/20' },
  { key: 'Average', label: 'Amateur', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { key: 'Good', label: 'Pro', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { key: 'Elite', label: 'Legend', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
];

interface PlayerFormProps {
  player?: Player;
  onSubmit: (data: {
    name: string;
    stats: PlayerStats;
    image?: string;
    isUnknown?: boolean;
    position?: PlayerPosition;
  }) => void;
  onCancel: () => void;
}

export function PlayerForm({ player, onSubmit, onCancel }: PlayerFormProps) {
  const isEditing = !!player;

  // Form State
  const [name, setName] = useState(player?.name || '');
  const [image, setImage] = useState(player?.image || '');
  const [position, setPosition] = useState<PlayerPosition | undefined>(player?.position);
  const [isUnknown, setIsUnknown] = useState(player?.isUnknown || false);
  const [stats, setStats] = useState<PlayerStats>(player?.stats || { ...DEFAULT_STATS });
  const [errors, setErrors] = useState<{ name?: string }>({});

  // Derived State
  const overall = calculateOverall(stats);
  const positionOverall = position ? calculatePositionOverall(stats, position) : null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleStatChange = (key: StatKey, value: number) => {
    setStats(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (presetKey: string) => {
    const posKey = position || 'ANY';
    const preset = STAT_PRESETS[presetKey]?.[posKey];
    if (preset) {
      setStats({ ...preset });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrors({ name: 'Player name is required' });
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

  const getOverallColor = (rating: number) => {
    if (rating >= 90) return 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]';
    if (rating >= 80) return 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]';
    if (rating >= 70) return 'text-blue-400';
    return 'text-muted-foreground';
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-8">
        
        {/* Header Preview Card */}
        <div className="relative overflow-hidden rounded-3xl bg-black/40 border border-white/10 p-6 group">
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5 mix-blend-overlay" />
          <div className={`absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 transition-opacity duration-500 group-hover:opacity-80`} />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar Upload */}
            <div className="relative shrink-0">
              <div className={`absolute -inset-1 rounded-full blur-xl bg-primary/20 opacity-0 group-hover:opacity-100 transition-duration-500`} />
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-2 border-white/10 shadow-2xl relative">
                <AvatarImage src={image} className="object-cover" />
                <AvatarFallback className="bg-black/60 text-3xl font-black text-muted-foreground">
                  {name ? name.substring(0, 2).toUpperCase() : <User className="h-10 w-10" />}
                </AvatarFallback>
              </Avatar>
              
              <div className="absolute -bottom-2 -right-2 flex gap-1">
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md cursor-pointer transition-all hover:scale-110"
                  >
                    <Upload className="h-3.5 w-3.5" />
                  </label>
                </div>
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 backdrop-blur-md text-red-400 transition-all hover:scale-110"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats & Info */}
            <div className="flex-1 w-full text-center sm:text-left space-y-4">
              <div className="space-y-2">
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({});
                  }}
                  placeholder="Enter Player Name"
                  className="text-2xl sm:text-3xl font-black tracking-tight bg-transparent border-none h-auto p-0 placeholder:text-white/20 focus-visible:ring-0 text-center sm:text-left shadow-none"
                />
                {errors.name && <p className="text-xs text-red-400 font-bold">{errors.name}</p>}
                
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  {position ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/5">
                      {POSITION_LABELS[position]}
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/5 text-muted-foreground/50 border border-white/5 border-dashed">
                      No Position
                    </span>
                  )}
                  {isUnknown && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Hidden Stats
                    </span>
                  )}
                </div>
              </div>

              {!isUnknown && (
                <div className="flex items-center justify-center sm:justify-start gap-6 p-3 rounded-2xl bg-black/20 border border-white/5">
                  <div className="text-center">
                    <div className={`text-3xl font-black leading-none ${getOverallColor(overall)}`}>
                      {overall}
                    </div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1">OVR</div>
                  </div>
                  {position && positionOverall !== null && positionOverall !== overall && (
                    <>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="text-center opacity-80">
                        <div className={`text-2xl font-black leading-none ${getOverallColor(positionOverall)}`}>
                          {positionOverall}
                        </div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{position}</div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Controls */}
        <div className="space-y-8">
          {/* Position Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Target className="h-3 w-3" /> Position
              </Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="scout-mode" className="text-[10px] font-bold text-muted-foreground cursor-pointer">Scouting Mode</Label>
                <Switch id="scout-mode" checked={isUnknown} onCheckedChange={setIsUnknown} className="scale-75" />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setPosition(position === pos ? undefined : pos)}
                  className={`
                    relative p-3 rounded-xl border transition-all duration-200 group
                    ${position === pos 
                      ? 'border-current bg-current/10 shadow-[0_0_15px_-5px_currentColor]' 
                      : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                    }
                  `}
                  style={{ 
                    color: position === pos ? POSITION_COLORS[pos] : undefined,
                    borderColor: position === pos ? POSITION_COLORS[pos] : undefined
                  }}
                >
                  <div className="text-center">
                    <div className="text-lg font-black leading-none mb-1">{pos}</div>
                    <div className="text-[8px] font-bold uppercase tracking-wider opacity-60">
                      {POSITION_LABELS[pos].split(' ')[0]}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          {!isUnknown && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Zap className="h-3 w-3" /> Attributes
                </Label>
                
                {/* Presets */}
                <div className="flex gap-1.5">
                  {PRESET_CONFIGS.map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => applyPreset(preset.key)}
                      className={`text-[9px] font-bold px-2 py-1 rounded-md border transition-all hover:scale-105 active:scale-95 ${preset.color}`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                {STAT_KEYS.map((key) => (
                  <div key={key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STAT_COLORS[key] }} />
                        {STAT_LABELS[key]}
                      </label>
                      <span className="text-sm font-black tabular-nums" style={{ color: STAT_COLORS[key] }}>
                        {stats[key]}
                      </span>
                    </div>
                    <Slider
                      value={[stats[key]]}
                      onValueChange={([v]) => handleStatChange(key, v)}
                      min={1}
                      max={99}
                      step={1}
                      className="cursor-pointer"
                      style={{ '--slider-color': STAT_COLORS[key] } as React.CSSProperties}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="p-4 sm:p-6 border-t border-white/10 bg-black/40 backdrop-blur-xl flex gap-3 mt-auto">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-12 rounded-xl font-bold border-white/10 hover:bg-white/5"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-[2] h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all hover:scale-[1.02]"
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
  );
}
