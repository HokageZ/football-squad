'use client';

import { useState, useEffect } from 'react';
import { User, Upload, X, Eye, EyeOff, Save, UserPlus, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
  { key: 'Beginner', label: 'Rookie', color: 'from-slate-600 to-slate-700', range: '40-50' },
  { key: 'Average', label: 'Amateur', color: 'from-blue-600 to-blue-700', range: '55-65' },
  { key: 'Good', label: 'Pro', color: 'from-emerald-600 to-emerald-700', range: '70-80' },
  { key: 'Elite', label: 'Elite', color: 'from-yellow-500 to-yellow-600', range: '85-95' },
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
  const [activePreset, setActivePreset] = useState<string | null>(null);
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
    setActivePreset(null);
  };

  const applyPreset = (presetKey: string) => {
    const posKey = position || 'ANY';
    const preset = STAT_PRESETS[presetKey]?.[posKey];
    if (preset) {
      setStats({ ...preset });
      setActivePreset(presetKey);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
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

  const getOverallColorClass = (rating: number) => {
    if (rating >= 90) return 'text-yellow-400';
    if (rating >= 80) return 'text-emerald-400';
    if (rating >= 70) return 'text-blue-400';
    if (rating >= 60) return 'text-slate-300';
    return 'text-slate-400';
  };

  const getStatColorClass = (value: number) => {
    if (value >= 80) return 'text-emerald-400';
    if (value >= 70) return 'text-blue-400';
    if (value >= 60) return 'text-yellow-400';
    if (value >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header with Avatar */}
      <div className="flex items-start gap-6 pb-6 border-b border-white/10">
        <div className="relative group">
          <Avatar className="h-28 w-28 border-2 border-white/10 group-hover:border-primary/50 transition-all duration-300 rounded-2xl">
            <AvatarImage src={image} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-3xl font-black rounded-2xl">
              {isUnknown ? '?' : name ? name.substring(0, 2).toUpperCase() : <User className="h-10 w-10" />}
            </AvatarFallback>
          </Avatar>
          {image && (
            <button
              type="button"
              onClick={() => setImage('')}
              className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors z-10"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <Label
            htmlFor="avatar-upload"
            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl"
          >
            <div className="text-center">
              <Upload className="h-6 w-6 mx-auto mb-1 text-white" />
              <span className="text-[10px] font-bold text-white uppercase">Upload</span>
            </div>
          </Label>
          <Input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        <div className="flex-1 space-y-4">
          {/* Name Input */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Player Name *
            </Label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({});
              }}
              placeholder="Enter player name"
              className={`h-12 text-lg font-bold bg-white/5 border-white/10 ${
                errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-400 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Scouting Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2">
              {isUnknown ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-primary" />
              )}
              <div>
                <p className="text-sm font-bold">Scouting Mode</p>
                <p className="text-[10px] text-muted-foreground">Hide stats until scouted</p>
              </div>
            </div>
            <Switch checked={isUnknown} onCheckedChange={setIsUnknown} />
          </div>
        </div>
      </div>

      {/* Position Selection */}
      <div className="space-y-3">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Position
        </Label>
        <div className="grid grid-cols-4 gap-3">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => setPosition(position === pos ? undefined : pos)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 
                ${
                  position === pos
                    ? 'border-current scale-105 shadow-lg'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                }
              `}
              style={{
                color: position === pos ? POSITION_COLORS[pos] : undefined,
                borderColor: position === pos ? POSITION_COLORS[pos] : undefined,
                backgroundColor: position === pos ? `${POSITION_COLORS[pos]}15` : undefined,
              }}
            >
              <div className="text-center">
                <div className="text-2xl font-black mb-1">{pos}</div>
                <div className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                  {POSITION_LABELS[pos]}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      {!isUnknown && (
        <div className="space-y-6 pt-4 border-t border-white/10">
          {/* Overall Rating */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-black to-black border border-primary/20 p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),transparent)]" />
            <div className="relative text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Overall Rating
              </p>
              <div className="flex items-center justify-center gap-6">
                <div>
                  <div className={`text-7xl font-black ${getOverallColorClass(overall)}`}>
                    {overall}
                  </div>
                  <p className="text-xs text-muted-foreground font-bold mt-1">Average</p>
                </div>
                {position && positionOverall !== null && positionOverall !== overall && (
                  <div className="text-left pl-6 border-l-2 border-white/10">
                    <div className={`text-4xl font-black ${getOverallColorClass(positionOverall)}`}>
                      {positionOverall}
                    </div>
                    <p className="text-xs text-muted-foreground font-bold mt-1">
                      {position} Rating
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Quick Presets
              </Label>
              {position && (
                <Badge variant="outline" className="text-[9px] ml-auto bg-white/5 border-white/10">
                  Optimized for {position}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_CONFIGS.map(({ key, label, color, range }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyPreset(key)}
                  className={`
                    relative overflow-hidden p-4 rounded-xl border-2 transition-all 
                    ${
                      activePreset === key
                        ? 'border-white/30 scale-105'
                        : 'border-white/10 hover:border-white/20'
                    }
                  `}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${color} opacity-${
                      activePreset === key ? '20' : '10'
                    } transition-opacity`}
                  />
                  <div className="relative text-center">
                    <div className="text-sm font-black mb-0.5">{label}</div>
                    <div className="text-[9px] text-muted-foreground font-bold">{range}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Attributes
            </Label>
            <div className="grid gap-5 p-6 rounded-2xl bg-white/5 border border-white/10">
              {STAT_KEYS.map((key) => {
                const value = stats[key];
                const color = STAT_COLORS[key];
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                        {STAT_LABELS[key]}
                      </label>
                      <span
                        className={`text-xl font-black tabular-nums ${getStatColorClass(value)}`}
                      >
                        {value}
                      </span>
                    </div>
                    <div className="relative">
                      {/* Background gradient zones */}
                      <div className="absolute inset-y-0 left-0 right-0 h-2 rounded-full overflow-hidden opacity-20 pointer-events-none">
                        <div className="flex h-full">
                          <div className="w-[40%] bg-gradient-to-r from-red-500 to-orange-500" />
                          <div className="w-[20%] bg-gradient-to-r from-orange-500 to-yellow-500" />
                          <div className="w-[20%] bg-gradient-to-r from-yellow-500 to-emerald-500" />
                          <div className="w-[20%] bg-gradient-to-r from-emerald-500 to-primary" />
                        </div>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={([v]) => handleStatChange(key, v)}
                        min={1}
                        max={99}
                        step={1}
                        className="relative z-10"
                        style={
                          {
                            '--slider-color': color,
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 pt-6 border-t border-white/10">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1 h-12 font-bold border-white/10 hover:bg-white/5"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-bold shadow-lg"
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
