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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar className={`h-24 w-24 border-4 ${isUnknown ? 'border-white/10 opacity-50' : 'border-primary/30'}`}>
            <AvatarImage src={image} alt={name || 'Player'} />
            <AvatarFallback className="bg-gradient-to-br from-white/10 to-black/20 text-2xl font-bold">
              {isUnknown ? '?' : (name ? name.substring(0, 2).toUpperCase() : <User className="h-10 w-10" />)}
            </AvatarFallback>
          </Avatar>
          {image && (
            <button
              type="button"
              onClick={() => setImage('')}
              className="absolute -top-1 -right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <div>
          <Label
            htmlFor="image-upload"
            className="cursor-pointer inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Upload className="h-4 w-4" />
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

      {/* Name Input */}
      <div className="space-y-2">
        <Label htmlFor="name">Player Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({});
          }}
          placeholder="Enter player name"
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      {/* Position Selection */}
      <div className="space-y-2">
        <Label>Position</Label>
        <div className="grid grid-cols-4 gap-2">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => setPosition(position === pos ? undefined : pos)}
              className={`
                p-3 rounded-lg border-2 font-bold text-sm transition-all
                ${position === pos 
                  ? 'border-current bg-current/10' 
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
                }
              `}
              style={{ 
                color: position === pos ? POSITION_COLORS[pos] : undefined,
                borderColor: position === pos ? POSITION_COLORS[pos] : undefined
              }}
            >
              <div className="text-center">
                <span className="block text-lg">{pos}</span>
                <span className="block text-[10px] text-muted-foreground mt-0.5">
                  {POSITION_LABELS[pos]}
                </span>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Optional - helps with team balancing</p>
      </div>

      {/* Unknown Stats Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
        <div className="space-y-0.5">
          <Label className="text-base font-medium">Scouting In Progress</Label>
          <p className="text-xs text-muted-foreground">
            Mark stats as unknown/hidden
          </p>
        </div>
        <Switch
          checked={isUnknown}
          onCheckedChange={setIsUnknown}
        />
      </div>

      {!isUnknown && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Overall Display */}
          <div className="flex items-center justify-center py-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1 font-bold uppercase tracking-wider">Overall Rating</p>
              <span className="text-5xl font-black text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]">
                {overall}
              </span>
            </div>
          </div>

          {/* Stats Sliders */}
          <div className="space-y-6">
            <Label className="text-base font-bold uppercase tracking-wide text-muted-foreground">Player Stats (1-99)</Label>
            <div className="grid gap-6">
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

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1 font-bold">
          {player ? 'Save Changes' : 'Add Player'}
        </Button>
      </div>
    </form>
  );
}
