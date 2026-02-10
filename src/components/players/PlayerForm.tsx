'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Upload, X, EyeOff, Eye, Zap, AlertTriangle, Sparkles, Target, Save, UserPlus } from 'lucide-react';
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
  const [warnings, setWarnings] = useState<string[]>([]);
  const [detectedPosition, setDetectedPosition] = useState<PlayerPosition | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'basics' | 'stats'>('basics');

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
      setCurrentStep('basics');
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
  const positionOverall = position ? calculatePositionOverall(stats, position) : null;

  // Get the importance weight for a stat in the selected position
  const getStatWeight = (key: StatKey): number | null => {
    if (!position) return null;
    return POSITION_STAT_WEIGHTS[position]?.[key] ?? null;
  };

  const getStatImportance = (weight: number | null): string => {
    if (weight === null) return '';
    if (weight >= 0.25) return 'Key';
    if (weight >= 0.15) return 'Important';
    return '';
  };

  const getStatImportanceColor = (weight: number | null): string => {
    if (weight === null) return '';
    if (weight >= 0.25) return 'text-primary';
    if (weight >= 0.15) return 'text-blue-400';
    return '';
  };

  return (
    <TooltipProvider delayDuration={200}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setCurrentStep('basics')}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              currentStep === 'basics' 
                ? 'bg-primary text-primary-foreground shadow-lg' 
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            1. Basics
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep('stats')}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              currentStep === 'stats' 
                ? 'bg-primary text-primary-foreground shadow-lg' 
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            2. Stats
          </button>
        </div>

        {/* STEP 1: BASICS */}
        {currentStep === 'basics' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className={`absolute inset-0 rounded-2xl blur-xl bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity`} />
                <Avatar className={`relative h-24 w-24 border-2 shadow-xl transition-all duration-300 rounded-2xl ${isUnknown ? 'border-white/10 opacity-50' : 'border-primary/30 group-hover:border-primary/50'}`}>
                  <AvatarImage src={image} alt={name || 'Player'} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-white/10 to-black/20 text-3xl font-black rounded-2xl">
                    {isUnknown ? '?' : (name ? name.substring(0, 2).toUpperCase() : <User className="h-10 w-10" />)}
                  </AvatarFallback>
                </Avatar>
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="absolute -top-2 -right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-all shadow-lg hover:scale-110 z-10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              <div className="flex-1">
                <Label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-105 font-bold text-xs uppercase tracking-wider"
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
                <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                  Optional • JPEG, PNG, WebP
                </p>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Player Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({});
                }}
                placeholder="e.g., Cristiano Ronaldo"
                className={`bg-white/5 border-white/10 h-14 text-lg font-bold placeholder:text-muted-foreground/40 ${errors.name ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
              />
              {errors.name && (
                <p className="text-xs font-bold text-destructive mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.name}
                </p>
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
              <div className="grid grid-cols-4 gap-3">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPosition(position === pos ? undefined : pos)}
                    className={`
                      relative overflow-hidden p-4 rounded-xl border-2 transition-all duration-200 group
                      ${position === pos 
                        ? 'border-current bg-current/10 shadow-[0_0_20px_-5px_currentColor] scale-105' 
                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-105'
                      }
                      ${!position && detectedPosition === pos ? 'ring-2 ring-primary/40 ring-offset-2 ring-offset-black' : ''}
                    `}
                    style={{ 
                      color: position === pos ? POSITION_COLORS[pos] : undefined,
                      borderColor: position === pos ? POSITION_COLORS[pos] : undefined
                    }}
                  >
                    <div className="relative z-10 text-center">
                      <span className="block text-xl font-black tracking-tight">{pos}</span>
                      <span className="block text-[8px] font-bold uppercase tracking-wider opacity-60 mt-1">
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
                <Label className="text-sm font-bold flex items-center gap-2 cursor-pointer">
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

            {/* Next Button */}
            {!isUnknown && (
              <Button
                type="button"
                onClick={() => setCurrentStep('stats')}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Next: Set Attributes
                <Zap className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* STEP 2: STATS */}
        {currentStep === 'stats' && !isUnknown && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Overall Display */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-black to-black border-2 border-primary/20 p-6 text-center">
              <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5 mix-blend-overlay" />
              <div className="relative z-10 space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Overall Rating</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className={`text-7xl font-black tracking-tighter transition-all duration-300 ${
                    overall >= 90 ? 'text-yellow-400' :
                    overall >= 80 ? 'text-emerald-400' :
                    overall >= 70 ? 'text-blue-400' :
                    'text-foreground'
                  }`}>
                    {overall}
                  </span>
                  {positionOverall !== null && positionOverall !== overall && (
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-muted-foreground block">{position}</span>
                      <span className={`text-2xl font-black ${
                        positionOverall >= 80 ? 'text-emerald-400' :
                        positionOverall >= 70 ? 'text-blue-400' :
                        'text-muted-foreground'
                      }`}>
                        {positionOverall}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Quick Presets
                </Label>
                <span className="text-[10px] text-muted-foreground font-medium ml-auto">
                  {position ? `${position} tuned` : 'General'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_LEVELS.map(({ key, label, emoji, description }) => (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(key)}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 text-center hover:scale-105 ${
                          activePreset === key 
                            ? 'border-primary bg-primary/10 shadow-[0_0_15px_-5px] shadow-primary/50' 
                            : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="text-2xl block">{emoji}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider block mt-1">{label}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-black/90 border-white/10 backdrop-blur-xl">
                      <p className="text-xs font-bold">{description}</p>
                      {position && <p className="text-[10px] text-muted-foreground mt-0.5">Optimized for {POSITION_LABELS[position]}</p>}
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

            {/* Stats Sliders */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Attributes</Label>
                <Badge variant="outline" className="text-[10px] font-bold bg-white/5 border-white/10">1-99</Badge>
              </div>
              <div className="space-y-5 bg-white/5 p-5 rounded-2xl border border-white/10">
                {STAT_KEYS.map((key) => {
                  const weight = getStatWeight(key);
                  const importance = getStatImportance(weight);
                  const importanceColor = getStatImportanceColor(weight);
                  return (
                    <div key={key} className="relative">
                      {importance && (
                        <Badge variant="outline" className={`absolute -top-1 right-0 text-[9px] font-bold px-1.5 py-0 h-4 ${importanceColor} bg-black/40 border-current/20 z-10`}>
                          {importance}
                        </Badge>
                      )}
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

            {/* Back Button */}
            <Button
              type="button"
              onClick={() => setCurrentStep('basics')}
              variant="outline"
              className="w-full h-11 font-bold rounded-xl border-white/10 hover:bg-white/5"
            >
              Back to Basics
            </Button>
          </div>
        )}

        {/* Form Actions */}
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
            className="flex-1 h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
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
