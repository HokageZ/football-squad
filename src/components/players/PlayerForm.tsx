'use client';

import { useState, useEffect } from 'react';
import { User, Upload, X, EyeOff, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  Player,
  PlayerStats,
  PlayerPosition,
  STAT_KEYS,
  STAT_LABELS,
  DEFAULT_STATS,
  POSITIONS,
  POSITION_LABELS,
  POSITION_COLORS,
} from '@/lib/types';
import { calculateOverall } from '@/lib/team-balancer';
import { StatSlider } from './StatSlider';

interface PlayerFormProps {
  player?: Player;
  onSubmit: (data: { name: string; stats: PlayerStats; image?: string; isUnknown?: boolean; position?: PlayerPosition }) => void;
  onCancel: () => void;
}

export function PlayerForm({ player, onSubmit, onCancel }: PlayerFormProps) {
  const [name, setName] = useState(player?.name || '');
  const [image, setImage] = useState(player?.image || '');
  const [stats, setStats] = useState<PlayerStats>(
    player?.stats || { ...DEFAULT_STATS }
  );
  const [isUnknown, setIsUnknown] = useState(player?.isUnknown || false);
  const [position, setPosition] = useState<PlayerPosition | undefined>(player?.position);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const handleStatChange = (key: keyof PlayerStats, value: number) => {
    setStats((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
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

  const overall = calculateOverall(stats);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative group">
          <div className={`absolute inset-0 rounded-full blur-xl bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity`} />
          <Avatar className={`h-32 w-32 border-4 shadow-2xl transition-all duration-300 ${isUnknown ? 'border-white/10 opacity-50' : 'border-primary/30 group-hover:border-primary/50'}`}>
            <AvatarImage src={image} alt={name || 'Player'} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-white/10 to-black/20 text-4xl font-black">
              {isUnknown ? '?' : (name ? name.substring(0, 2).toUpperCase() : <User className="h-12 w-12" />)}
            </AvatarFallback>
          </Avatar>
          {image && (
            <button
              type="button"
              onClick={() => setImage('')}
              className="absolute top-0 right-0 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-all shadow-lg hover:scale-110"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div>
          <Label
            htmlFor="image-upload"
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-105 font-bold text-xs uppercase tracking-wider"
          >
            <Upload className="h-3.5 w-3.5" />
            {image ? 'Change Photo' : 'Upload Photo'}
          </Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
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
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Position</Label>
          <div className="grid grid-cols-4 gap-2">
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => setPosition(position === pos ? undefined : pos)}
                className={`
                  relative overflow-hidden p-3 rounded-xl border-2 transition-all duration-200 group
                  ${position === pos 
                    ? 'border-current bg-current/10 shadow-[0_0_15px_-5px_currentColor]' 
                    : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10'
                  }
                `}
                style={{ 
                  color: position === pos ? POSITION_COLORS[pos] : undefined,
                  borderColor: position === pos ? POSITION_COLORS[pos] : undefined
                }}
              >
                <div className="relative z-10 text-center">
                  <span className="block text-lg font-black tracking-tight">{pos}</span>
                  <span className="block text-[9px] font-bold uppercase tracking-wider opacity-60 mt-0.5">
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
              <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5 mix-blend-overlay" />
              <div className="relative z-10">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Overall Rating</p>
                <span className={`text-6xl font-black tracking-tighter transition-all duration-300 ${
                  overall >= 90 ? 'text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]' :
                  overall >= 80 ? 'text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' :
                  overall >= 70 ? 'text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]' :
                  'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                }`}>
                  {overall}
                </span>
              </div>
            </div>

            {/* Stats Sliders */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Attributes</Label>
                <span className="text-[10px] font-bold text-muted-foreground bg-white/5 px-2 py-1 rounded">1-99</span>
              </div>
              <div className="grid gap-8 bg-white/5 p-6 rounded-2xl border border-white/10">
                {STAT_KEYS.map((key) => (
                  <StatSlider
                    key={key}
                    statKey={key}
                    label={STAT_LABELS[key]}
                    value={stats[key]}
                    onChange={(value) => handleStatChange(key, value)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 sticky bottom-0 bg-black/80 backdrop-blur-xl p-4 -mx-6 -mb-6 border-t border-white/10">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 h-12 font-bold hover:bg-white/10">
          Cancel
        </Button>
        <Button type="submit" className="flex-1 h-12 font-bold text-base shadow-lg shadow-primary/20">
          {player ? 'Save Changes' : 'Add Player'}
        </Button>
      </div>
    </form>
  );
}
