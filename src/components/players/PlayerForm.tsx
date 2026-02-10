'use client';

import { useState, useEffect } from 'react';
import { User, Upload, X, Eye, Save, UserPlus, Zap, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { PlayerCard } from './PlayerCard';

const PRESET_CONFIGS = [
  { key: 'Beginner', label: 'Rookie', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
  { key: 'Average', label: 'Amateur', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { key: 'Good', label: 'Pro', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { key: 'Elite', label: 'Legend', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
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

  // Mock player object for preview
  const previewPlayer: Player = {
    id: player?.id || 'preview',
    name: name || 'Player Name',
    image,
    position,
    isUnknown,
    stats,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

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

  return (
    <div className="flex flex-col md:flex-row h-[80vh] md:h-[600px] w-full overflow-hidden bg-background">
      {/* Left Column: Preview (Sticky on Desktop) */}
      <div className="w-full md:w-[320px] bg-black/20 border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5 mix-blend-overlay" />
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
        
        <div className="relative z-10 w-full max-w-[280px]">
          <div className="text-center mb-6 space-y-1">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-2">
              <Eye className="h-3 w-3" /> Live Preview
            </h3>
          </div>
          <div className="transform transition-transform hover:scale-105 duration-500 shadow-2xl rounded-xl">
             <PlayerCard player={previewPlayer} />
          </div>
        </div>
      </div>

      {/* Right Column: Form Inputs */}
      <div className="flex-1 flex flex-col min-h-0 bg-background/50 backdrop-blur-sm">
        <ScrollArea className="flex-1">
          <form id="player-form" onSubmit={handleSubmit} className="p-6 md:p-8 space-y-10">
            
            {/* Identity Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  IDENTITY
                </h3>
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full transition-colors ${!isUnknown ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                    Public
                  </span>
                  <Switch 
                    checked={isUnknown} 
                    onCheckedChange={setIsUnknown}
                    className="scale-75 data-[state=checked]:bg-indigo-500"
                  />
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full transition-colors ${isUnknown ? 'bg-indigo-500 text-white' : 'text-muted-foreground'}`}>
                    Hidden
                  </span>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({});
                    }}
                    placeholder="Player Name"
                    className="h-12 bg-white/5 border-white/10 text-lg font-bold focus-visible:ring-primary"
                  />
                  {errors.name && <p className="text-xs text-red-500 font-bold">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Photo</Label>
                   <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex-1 h-10 flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-md cursor-pointer hover:bg-white/10 transition-colors text-sm font-bold text-muted-foreground hover:text-foreground"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </label>
                    {image && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => setImage('')}
                        className="h-10 w-10 shrink-0 rounded-md"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                   </div>
                </div>
              </div>
            </div>

            {/* Position Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                POSITION
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPosition(position === pos ? undefined : pos)}
                    className={`
                      relative p-3 rounded-xl border-2 transition-all duration-200 group overflow-hidden
                      ${position === pos 
                        ? 'border-current bg-current/10 shadow-lg scale-[1.02]' 
                        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 opacity-70 hover:opacity-100'
                      }
                    `}
                    style={{ 
                      color: position === pos ? POSITION_COLORS[pos] : undefined,
                      borderColor: position === pos ? POSITION_COLORS[pos] : undefined
                    }}
                  >
                    <div className="relative z-10 text-center">
                      <div className="text-xl font-black">{pos}</div>
                      <div className="text-[8px] font-bold uppercase tracking-widest opacity-60">
                        {POSITION_LABELS[pos]}
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
                  <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    ATTRIBUTES
                  </h3>
                  
                  {/* Presets Toolbar */}
                  <div className="flex gap-1">
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

                <div className="grid gap-8 p-1">
                  {STAT_KEYS.map((key) => (
                    <div key={key} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: STAT_COLORS[key], backgroundColor: STAT_COLORS[key] }} />
                          {STAT_LABELS[key]}
                        </label>
                        <span className="text-lg font-black tabular-nums" style={{ color: STAT_COLORS[key] }}>
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
          </form>
        </ScrollArea>

        {/* Footer Actions (Fixed at bottom) */}
        <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md flex gap-3 z-20">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl font-bold hover:bg-white/5 text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="player-form"
            className="flex-1 h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all hover:scale-[1.02]"
          >
            {isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Player
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
