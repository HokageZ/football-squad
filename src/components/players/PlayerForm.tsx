'use client';

import { useState, useEffect } from 'react';
import { User, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Player,
  PlayerStats,
  STAT_KEYS,
  STAT_LABELS,
  DEFAULT_STATS,
} from '@/lib/types';
import { calculateOverall } from '@/lib/team-balancer';
import { StatSlider } from './StatSlider';

interface PlayerFormProps {
  player?: Player;
  onSubmit: (data: { name: string; stats: PlayerStats; image?: string }) => void;
  onCancel: () => void;
}

export function PlayerForm({ player, onSubmit, onCancel }: PlayerFormProps) {
  const [name, setName] = useState(player?.name || '');
  const [image, setImage] = useState(player?.image || '');
  const [stats, setStats] = useState<PlayerStats>(
    player?.stats || { ...DEFAULT_STATS }
  );
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
    });
  };

  const overall = calculateOverall(stats);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-primary/30">
            <AvatarImage src={image} alt={name || 'Player'} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-2xl font-bold">
              {name ? name.substring(0, 2).toUpperCase() : <User className="h-10 w-10" />}
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

      {/* Overall Display */}
      <div className="flex items-center justify-center py-4 bg-accent/50 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Overall Rating</p>
          <span className="text-4xl font-black text-primary">{overall}</span>
        </div>
      </div>

      {/* Stats Sliders */}
      <div className="space-y-4">
        <Label className="text-base">Player Stats</Label>
        <div className="grid gap-4">
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

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {player ? 'Save Changes' : 'Add Player'}
        </Button>
      </div>
    </form>
  );
}
