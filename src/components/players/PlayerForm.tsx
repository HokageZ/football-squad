'use client';

import { useState } from 'react';
import { User, Upload, X, Save, UserPlus, Zap, Shield, Target, Activity, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
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
import { calculateOverall } from '@/lib/team-balancer';

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

  const overall = calculateOverall(stats);

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

  // Helper colors
  const getOverallColor = (rating: number) => {
    if (rating >= 90) return 'text-yellow-400';
    if (rating >= 80) return 'text-emerald-400';
    if (rating >= 70) return 'text-blue-400';
    return 'text-white';
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-black/95">
      
      {/* 1. HERO HEADER (The Card Preview) */}
      <div className="relative w-full h-[240px] bg-zinc-900 border-b border-white/10 overflow-hidden shrink-0 group">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[url('/pitch-pattern.svg')] opacity-10 bg-center bg-cover" />
        <div className={`absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent transition-opacity duration-700`} />
        
        {/* Dynamic Gradient Overlay based on OVR */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90`} />
        
        <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
          <div className="flex items-end gap-5">
            {/* Avatar Upload */}
            <div className="relative shrink-0">
              <div className="group/avatar relative">
                <Avatar className="h-28 w-28 rounded-2xl border-4 border-black shadow-2xl ring-2 ring-white/10">
                  <AvatarImage src={image} className="object-cover" />
                  <AvatarFallback className="bg-zinc-800 text-3xl font-black text-zinc-600">
                    {name ? name.substring(0, 2).toUpperCase() : <User className="h-10 w-10" />}
                  </AvatarFallback>
                </Avatar>
                
                {/* Upload Overlay */}
                <label 
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover/avatar:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]"
                >
                  <Upload className="h-6 w-6 text-white mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white">Upload</span>
                </label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              {/* OVR Badge */}
              {!isUnknown && (
                <div className="absolute -top-3 -right-3 bg-black border border-white/10 rounded-lg p-2 shadow-xl flex flex-col items-center justify-center min-w-[48px]">
                  <span className={`text-2xl font-black leading-none ${getOverallColor(overall)}`}>
                    {overall}
                  </span>
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">OVR</span>
                </div>
              )}
            </div>

            {/* Name & Position Inputs (Overlay Style) */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="space-y-1">
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({});
                  }}
                  placeholder="PLAYER NAME"
                  className="h-auto p-0 border-0 bg-transparent text-3xl md:text-4xl font-black tracking-tighter uppercase text-white placeholder:text-white/20 focus-visible:ring-0 shadow-none"
                />
                {errors.name && <p className="text-xs text-red-500 font-bold tracking-wide">{errors.name}</p>}
                
                <div className="flex items-center gap-2">
                  {position ? (
                    <Badge className="bg-white text-black hover:bg-white/90 border-0 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 h-6">
                      {POSITION_LABELS[position]}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-zinc-500 border-zinc-700 border-dashed text-[10px] uppercase tracking-widest px-2 py-0.5 h-6">
                      Select Position
                    </Badge>
                  )}
                  {isUnknown && (
                    <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px] uppercase tracking-widest px-2 py-0.5 h-6">
                      Scouting Mode
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto bg-black p-6 space-y-8 scrollbar-thin">
        
        {/* Position Selector */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Target className="h-3.5 w-3.5" /> 
            Tactical Role
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => setPosition(position === pos ? undefined : pos)}
                className={`
                  relative h-12 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2
                  ${position === pos 
                    ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                    : 'bg-zinc-900 border-white/5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                  }
                `}
              >
                <span className="text-sm font-black tracking-tight">{pos}</span>
                {position === pos && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Engine */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Activity className="h-3.5 w-3.5" />
              Attributes Engine
            </Label>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="scout-mode" className="text-[10px] font-bold text-zinc-500 cursor-pointer hover:text-white transition-colors">
                {isUnknown ? 'HIDDEN' : 'VISIBLE'}
              </Label>
              <Switch 
                id="scout-mode"
                checked={isUnknown} 
                onCheckedChange={setIsUnknown}
                className="scale-75 data-[state=checked]:bg-indigo-500"
              />
            </div>
          </div>

          {!isUnknown ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STAT_KEYS.map((key) => (
                <div key={key} className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 hover:border-white/10 transition-colors group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]`} style={{ color: STAT_COLORS[key], backgroundColor: STAT_COLORS[key] }} />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-zinc-200 transition-colors">
                        {STAT_LABELS[key]}
                      </span>
                    </div>
                    <span className="text-sm font-mono font-bold text-white tabular-nums">
                      {stats[key]}
                    </span>
                  </div>
                  
                  <Slider
                    value={[stats[key]]}
                    onValueChange={([v]) => handleStatChange(key, v)}
                    min={1}
                    max={99}
                    step={1}
                    className="cursor-pointer py-1"
                    style={{ '--slider-color': STAT_COLORS[key] } as React.CSSProperties}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 rounded-xl border border-white/5 border-dashed bg-zinc-900/20 flex flex-col items-center justify-center text-center p-4">
              <EyeOff className="h-8 w-8 text-zinc-700 mb-2" />
              <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">
                Attributes Hidden<br/>in Scouting Mode
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. FOOTER ACTIONS */}
      <div className="p-4 border-t border-white/10 bg-zinc-900 shrink-0 flex gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="flex-1 h-12 rounded-xl font-bold uppercase tracking-wider text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-[2] h-12 rounded-xl font-bold uppercase tracking-wider text-xs bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/5 transition-all hover:scale-[1.02]"
        >
          {isEditing ? (
            <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Save Changes</span>
          ) : (
            <span className="flex items-center gap-2"><UserPlus className="h-4 w-4" /> Sign Player</span>
          )}
        </Button>
      </div>
    </form>
  );
}
