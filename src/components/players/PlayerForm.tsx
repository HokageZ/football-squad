'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Plus,
  Sparkles,
  Tag as TagIcon,
  User as UserIcon,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Player,
  PlayerStats,
  PlayerPosition,
  POSITIONS,
  POSITION_COLORS,
  POSITION_LABELS,
  STAT_PRESETS,
  STAT_DESCRIPTIONS,
  STAT_LABELS,
  STAT_COLORS,
  OUTFIELD_STAT_KEYS,
  STAT_KEYS,
  StatKey,
  DEFAULT_STATS,
  SUGGESTED_TAGS,
} from '@/lib/types';
import { calculateOverall, calculatePositionOverall } from '@/lib/team-balancer';
import { StatRadar } from './StatRadar';
import { StatSlider } from './StatSlider';

// ─── Types ───────────────────────────────────────────────────────

interface PlayerFormProps {
  player?: Player;
  onSubmit: (data: {
    name: string;
    stats: PlayerStats;
    image?: string;
    isUnknown?: boolean;
    position?: PlayerPosition;
    tags?: string[];
  }) => void;
  onCancel: () => void;
}

const STEPS = [
  { id: 'identity', label: 'Identity', hint: 'Who is signing?' },
  { id: 'calibrate', label: 'Calibrate', hint: 'Rate the skills' },
  { id: 'review', label: 'Review', hint: 'Lock the contract' },
] as const;

// ─── Auto-detection of position from stat profile ────────────────

function detectPosition(stats: PlayerStats): PlayerPosition | null {
  const { goalkeeping, defending, passing, shooting, pace, dribbling } = stats;
  if (goalkeeping >= 65 && goalkeeping > defending) return 'GK';
  const score = {
    DEF: defending * 1.5 + (pace + passing) * 0.4,
    MID: passing * 1.4 + dribbling * 0.6 + defending * 0.4,
    ATT: shooting * 1.4 + pace * 0.7 + dribbling * 0.5,
  };
  const top = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
  return top[0] as PlayerPosition;
}

// ─── Component ───────────────────────────────────────────────────

export function PlayerForm({ player, onSubmit, onCancel }: PlayerFormProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(player?.name || '');
  const [image, setImage] = useState<string | undefined>(player?.image);
  const [position, setPosition] = useState<PlayerPosition | undefined>(player?.position);
  const [stats, setStats] = useState<PlayerStats>(player?.stats || DEFAULT_STATS);
  const [isUnknown, setIsUnknown] = useState<boolean>(player?.isUnknown ?? false);
  const [tags, setTags] = useState<string[]>(player?.tags ?? []);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string>('');

  const overall = useMemo(() => calculateOverall(stats), [stats]);
  const positionOverall = useMemo(
    () => (position ? calculatePositionOverall(stats, position) : null),
    [stats, position]
  );
  const detectedPosition = useMemo(() => detectPosition(stats), [stats]);
  const showDetectionHint =
    !position && !isUnknown && detectedPosition !== null;

  const visibleStatKeys = position === 'GK' ? STAT_KEYS : OUTFIELD_STAT_KEYS;

  // ─── Handlers ──────────────────────────────────────────────────

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    },
    []
  );

  const updateStat = useCallback((key: StatKey, value: number) => {
    setStats((prev) => ({ ...prev, [key]: value }));
    setActivePreset(null);
  }, []);

  const applyPreset = useCallback(
    (presetName: string) => {
      const preset = STAT_PRESETS[presetName];
      if (!preset) return;
      const target = position && preset[position] ? preset[position] : preset.ANY;
      setStats(target);
      setActivePreset(presetName);
    },
    [position]
  );

  const goNext = useCallback(() => {
    if (step === 0) {
      if (!name.trim()) {
        setNameError('Please enter a player name');
        return;
      }
      setNameError('');
    }
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  }, [step, name]);

  const goBack = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }, [step]);

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      setNameError('Please enter a player name');
      setStep(0);
      return;
    }
    onSubmit({
      name: name.trim(),
      stats,
      image,
      isUnknown,
      position,
      tags: tags.length > 0 ? tags : undefined,
    });
  }, [name, stats, image, isUnknown, position, tags, onSubmit]);

  const addTag = useCallback((raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    setTags((prev) => {
      const exists = prev.some((t) => t.toLowerCase() === tag.toLowerCase());
      if (exists) return prev;
      if (prev.length >= 8) return prev;
      return [...prev, tag];
    });
  }, []);

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  // ─── Render ────────────────────────────────────────────────────

  return (
    <div className="flex flex-col">
      {/* Stepper */}
      <Stepper currentStep={step} />

      {/* Step content with directional slide */}
      <div className="relative min-h-[420px] mt-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          >
            {step === 0 && (
              <IdentityStep
                name={name}
                setName={(v) => {
                  setName(v);
                  if (nameError) setNameError('');
                }}
                nameError={nameError}
                image={image}
                setImage={setImage}
                position={position}
                setPosition={setPosition}
                detectedPosition={detectedPosition}
                showDetectionHint={showDetectionHint && !player}
                fileInputRef={fileInputRef}
                onImageUpload={handleImageUpload}
                tags={tags}
                addTag={addTag}
                removeTag={removeTag}
              />
            )}
            {step === 1 && (
              <CalibrateStep
                stats={stats}
                updateStat={updateStat}
                isUnknown={isUnknown}
                setIsUnknown={setIsUnknown}
                applyPreset={applyPreset}
                activePreset={activePreset}
                position={position}
                overall={overall}
                positionOverall={positionOverall}
                visibleStatKeys={visibleStatKeys}
              />
            )}
            {step === 2 && (
              <ReviewStep
                name={name}
                image={image}
                position={position}
                stats={stats}
                isUnknown={isUnknown}
                overall={overall}
                positionOverall={positionOverall}
                tags={tags}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between gap-3 mt-8 pt-5 border-t border-white/10">
        <button
          type="button"
          onClick={step === 0 ? onCancel : goBack}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors py-2 px-3 -ml-3 rounded-lg"
        >
          {step === 0 ? (
            <>
              <X className="h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Back
            </>
          )}
        </button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={goNext}
            size="lg"
            className="group rounded-full font-bold pl-6 pr-2 py-1 h-12 shadow-lg shadow-primary/20"
          >
            Continue
            <span className="ml-3 inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/20 transition-transform group-hover:translate-x-0.5">
              <ChevronRight className="h-4 w-4" />
            </span>
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            size="lg"
            className="group rounded-full font-bold pl-6 pr-2 py-1 h-12 shadow-lg shadow-primary/20"
          >
            {player ? 'Save changes' : 'Sign player'}
            <span className="ml-3 inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/20 transition-transform group-hover:scale-110">
              <Check className="h-4 w-4" />
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Stepper ─────────────────────────────────────────────────────

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between gap-2">
      {STEPS.map((s, i) => {
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        return (
          <div key={s.id} className="flex-1 flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <motion.div
                animate={{
                  scale: isActive ? 1 : 0.85,
                  backgroundColor: isActive
                    ? 'rgb(16 185 129)'
                    : isDone
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)',
                }}
                transition={{ duration: 0.3 }}
                className="w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-sm border border-white/10"
                style={{
                  color: isActive ? '#000' : isDone ? '#10b981' : '#71717a',
                }}
              >
                {isDone ? <Check className="h-4 w-4" /> : i + 1}
              </motion.div>
              {isActive && (
                <motion.div
                  layoutId="step-ring"
                  className="absolute inset-[-4px] rounded-full ring-2 ring-primary/40"
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                />
              )}
            </div>
            <div className="hidden sm:block min-w-0">
              <div
                className={`text-[11px] font-bold uppercase tracking-[0.15em] truncate transition-colors ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {s.label}
              </div>
              <div className="text-[10px] text-muted-foreground/70 font-medium truncate">
                {s.hint}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px bg-white/10 relative overflow-hidden mx-1">
                <motion.div
                  initial={false}
                  animate={{ scaleX: isDone ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  style={{ originX: 0 }}
                  className="absolute inset-0 bg-primary"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1 — Identity ───────────────────────────────────────────

interface IdentityStepProps {
  name: string;
  setName: (v: string) => void;
  nameError: string;
  image: string | undefined;
  setImage: (v: string | undefined) => void;
  position: PlayerPosition | undefined;
  setPosition: (v: PlayerPosition | undefined) => void;
  detectedPosition: PlayerPosition | null;
  showDetectionHint: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tags: string[];
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
}

function IdentityStep({
  name,
  setName,
  nameError,
  image,
  setImage,
  position,
  setPosition,
  detectedPosition,
  showDetectionHint,
  fileInputRef,
  onImageUpload,
  tags,
  addTag,
  removeTag,
}: IdentityStepProps) {
  const [tagInput, setTagInput] = useState('');
  const tagsLower = useMemo(() => new Set(tags.map((t) => t.toLowerCase())), [tags]);
  const availableSuggestions = useMemo(
    () => SUGGESTED_TAGS.filter((s) => !tagsLower.has(s.toLowerCase())),
    [tagsLower]
  );
  const handleTagSubmit = () => {
    if (!tagInput.trim()) return;
    addTag(tagInput);
    setTagInput('');
  };
  return (
    <div className="space-y-7">
      {/* Avatar + Name pair */}
      <div className="flex items-start gap-5">
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative block"
          >
            <Avatar className="h-20 w-20 border border-white/10 ring-1 ring-inset ring-white/5 shadow-xl">
              <AvatarImage src={image} alt={name} className="object-cover" />
              <AvatarFallback className="bg-zinc-900 text-2xl font-black text-muted-foreground">
                {name ? name.substring(0, 2).toUpperCase() : <UserIcon className="h-7 w-7" />}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-5 w-5 text-white" />
            </div>
            {image && (
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImage(undefined);
                }}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/40 transition-colors"
                aria-label="Remove photo"
              >
                <X className="h-3 w-3" />
              </span>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
          />
        </div>

        <div className="flex-1 min-w-0">
          <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">
            Player name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Marco Reus"
            className="h-12 text-lg font-bold bg-transparent border-0 border-b border-white/15 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary placeholder:font-normal placeholder:text-muted-foreground/40"
            autoFocus
          />
          {nameError ? (
            <p className="text-xs text-red-400 font-medium mt-2">{nameError}</p>
          ) : (
            <p className="text-xs text-muted-foreground/70 mt-2">
              Photo is optional — initials look fine too.
            </p>
          )}
        </div>
      </div>

      {/* Position picker */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Position
          </label>
          <AnimatePresence>
            {showDetectionHint && detectedPosition && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                onClick={() => setPosition(detectedPosition)}
                className="group inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary/80 hover:text-primary transition-colors"
              >
                <Sparkles className="h-3 w-3" />
                Suggest {detectedPosition}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {POSITIONS.map((pos) => {
            const isActive = position === pos;
            const color = POSITION_COLORS[pos];
            return (
              <button
                key={pos}
                type="button"
                onClick={() => setPosition(isActive ? undefined : pos)}
                className="relative group h-16 rounded-xl border transition-all duration-200 active:scale-[0.97] overflow-hidden"
                style={{
                  borderColor: isActive ? color : 'rgba(255,255,255,0.08)',
                  backgroundColor: isActive ? `${color}14` : 'rgba(255,255,255,0.02)',
                }}
              >
                <div className="relative h-full flex flex-col items-center justify-center gap-0.5">
                  <span
                    className="font-black text-base tracking-tight"
                    style={{ color: isActive ? color : 'rgb(244 244 245)' }}
                  >
                    {pos}
                  </span>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider transition-colors"
                    style={{
                      color: isActive ? color : 'rgb(113 113 122)',
                      opacity: isActive ? 0.85 : 1,
                    }}
                  >
                    {POSITION_LABELS[pos].split('')[0] +
                      POSITION_LABELS[pos]
                        .substring(1, 4)
                        .toLowerCase()}
                  </span>
                </div>
                {isActive && (
                  <motion.span
                    layoutId="position-marker"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full"
                    style={{ backgroundColor: color }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground/70 mt-2 font-medium">
          Affects position-weighted overall rating. Optional.
        </p>
      </div>

      {/* Tags */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Tags
          </label>
          <span className="text-[10px] font-mono font-bold text-muted-foreground/60">
            {tags.length}/8
          </span>
        </div>

        {/* Active tag chips */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            <AnimatePresence initial={false}>
              {tags.map((tag) => (
                <motion.span
                  key={tag}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                  className="group inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-primary/12 border border-primary/30 text-primary text-[11px] font-bold uppercase tracking-wider"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    aria-label={`Remove ${tag}`}
                    className="w-4 h-4 rounded-full inline-flex items-center justify-center hover:bg-primary/25 transition-colors"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Input */}
        <div className="relative">
          <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none" />
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                handleTagSubmit();
              } else if (
                e.key === 'Backspace' &&
                !tagInput &&
                tags.length > 0
              ) {
                removeTag(tags[tags.length - 1]);
              }
            }}
            placeholder={tags.length >= 8 ? 'Tag limit reached' : 'Add a tag (e.g. Captain) — press Enter'}
            disabled={tags.length >= 8}
            className="h-10 pl-9 pr-20 bg-white/[0.03] border-white/10 focus-visible:border-primary/40 rounded-lg text-sm font-medium placeholder:text-muted-foreground/40 disabled:opacity-50"
          />
          {tagInput.trim() && (
            <button
              type="button"
              onClick={handleTagSubmit}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2.5 h-7 rounded-md bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          )}
        </div>

        {/* Suggestions */}
        {availableSuggestions.length > 0 && tags.length < 8 && (
          <div className="mt-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1.5">
              Suggested
            </p>
            <div className="flex flex-wrap gap-1.5">
              {availableSuggestions.slice(0, 8).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addTag(s)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/[0.03] border border-white/8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-white/[0.07] hover:border-white/15 transition-colors"
                >
                  <Plus className="h-2.5 w-2.5" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 2 — Calibrate ──────────────────────────────────────────

interface CalibrateStepProps {
  stats: PlayerStats;
  updateStat: (key: StatKey, value: number) => void;
  isUnknown: boolean;
  setIsUnknown: (v: boolean) => void;
  applyPreset: (name: string) => void;
  activePreset: string | null;
  position: PlayerPosition | undefined;
  overall: number;
  positionOverall: number | null;
  visibleStatKeys: StatKey[];
}

function CalibrateStep({
  stats,
  updateStat,
  isUnknown,
  setIsUnknown,
  applyPreset,
  activePreset,
  position,
  overall,
  positionOverall,
  visibleStatKeys,
}: CalibrateStepProps) {
  const ovrColor =
    overall >= 85
      ? 'text-yellow-400'
      : overall >= 75
      ? 'text-emerald-400'
      : overall >= 65
      ? 'text-blue-400'
      : 'text-zinc-300';

  return (
    <div className="space-y-6">
      {/* Scouting toggle */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsUnknown(!isUnknown)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsUnknown(!isUnknown);
          }
        }}
        className="w-full flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] p-3.5 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              isUnknown ? 'bg-amber-500/15 text-amber-400' : 'bg-white/5 text-muted-foreground'
            }`}
          >
            <EyeOff className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm">Scouting mode</div>
            <div className="text-[11px] text-muted-foreground/80 truncate">
              Hide stats — auto-balance during team draft
            </div>
          </div>
        </div>
        <span onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={isUnknown}
            onCheckedChange={setIsUnknown}
            className="data-[state=checked]:bg-amber-500"
          />
        </span>
      </div>

      {!isUnknown && (
        <>
          {/* HEXAGON HERO with floating OVR */}
          <div className="relative -mx-2">
            <div className="relative aspect-square max-w-[320px] mx-auto">
              <StatRadar
                stats={stats}
                height={320}
                position={position}
                showLabels
              />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  key={overall}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                  className={`font-mono font-black text-5xl leading-none tracking-tighter ${ovrColor}`}
                >
                  {overall}
                </motion.div>
                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground mt-1">
                  Overall
                </span>
                {positionOverall !== null && positionOverall !== overall && (
                  <span className="text-[10px] font-bold mt-2 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                    {position}{' '}
                    <span className="font-mono text-foreground">{positionOverall}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Preset chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Quick preset
              </span>
              {activePreset && (
                <span className="text-[10px] font-bold text-primary/80 uppercase tracking-wider">
                  {activePreset} {position ? `· ${position}` : ''}
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {Object.keys(STAT_PRESETS).map((preset) => {
                const isActive = activePreset === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`h-9 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.97] ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                        : 'bg-white/[0.03] text-muted-foreground hover:text-foreground hover:bg-white/[0.06] border border-white/5'
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stat sliders */}
          <div className="space-y-5 pt-2">
            {visibleStatKeys.map((key) => (
              <StatSlider
                key={key}
                statKey={key}
                label={STAT_LABELS[key]}
                value={stats[key]}
                onChange={(v) => updateStat(key, v)}
                description={STAT_DESCRIPTIONS[key]}
              />
            ))}
          </div>
        </>
      )}

      {isUnknown && (
        <div className="relative rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
            <EyeOff className="h-6 w-6 text-amber-400" />
          </div>
          <h4 className="font-black text-base tracking-tight mb-1">
            Stats hidden until first match
          </h4>
          <p className="text-xs text-muted-foreground/80 max-w-xs mx-auto leading-relaxed">
            The team balancer will distribute scouted players evenly across both sides.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Step 3 — Review ─────────────────────────────────────────────

interface ReviewStepProps {
  name: string;
  image: string | undefined;
  position: PlayerPosition | undefined;
  stats: PlayerStats;
  isUnknown: boolean;
  overall: number;
  positionOverall: number | null;
  tags: string[];
}

function ReviewStep({
  name,
  image,
  position,
  stats,
  isUnknown,
  overall,
  positionOverall,
  tags,
}: ReviewStepProps) {
  const displayOverall = positionOverall ?? overall;
  const ovrColor = isUnknown
    ? 'text-zinc-400'
    : displayOverall >= 85
    ? 'text-yellow-400'
    : displayOverall >= 75
    ? 'text-emerald-400'
    : displayOverall >= 65
    ? 'text-blue-400'
    : 'text-zinc-300';

  const visibleKeys = position === 'GK' ? STAT_KEYS : OUTFIELD_STAT_KEYS;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          Final review
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1 font-medium">
          One more look before they hit the pitch
        </p>
      </div>

      {/* Player Card preview — Doppelrand outer shell */}
      <div className="relative p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/8 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)]">
        <div className="relative rounded-[calc(2rem-0.375rem)] bg-gradient-to-br from-zinc-950 to-black border border-white/5 p-6 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          {/* Subtle pitch pattern background */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 0%, rgba(16,185,129,0.6), transparent 50%)',
            }}
          />

          {/* Top row: OVR + Avatar + Position */}
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex flex-col items-start">
              <span
                className={`font-mono font-black text-[3.5rem] leading-none tracking-tighter italic ${ovrColor}`}
              >
                {isUnknown ? '??' : displayOverall}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground mt-1">
                {position && positionOverall !== null && positionOverall !== overall
                  ? `${position} OVR`
                  : 'Overall'}
              </span>
              {position && positionOverall !== null && positionOverall !== overall && !isUnknown && (
                <span className="text-[10px] font-mono font-bold text-muted-foreground/70 mt-1">
                  Base {overall}
                </span>
              )}
            </div>

            <Avatar className="h-20 w-20 border border-white/10 ring-1 ring-inset ring-white/5 shadow-xl shrink-0">
              <AvatarImage src={image} alt={name} className="object-cover" />
              <AvatarFallback className="bg-zinc-900 text-2xl font-black text-muted-foreground">
                {name ? name.substring(0, 2).toUpperCase() : '?'}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-end">
              {position ? (
                <span
                  className="text-xs font-black px-2 py-0.5 rounded-md tracking-wider"
                  style={{
                    color: POSITION_COLORS[position],
                    backgroundColor: `${POSITION_COLORS[position]}1f`,
                  }}
                >
                  {position}
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-2 py-0.5">
                  No pos
                </span>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="relative mt-4 mb-2">
            <h3 className="text-2xl font-black tracking-tight uppercase truncate">
              {name || <span className="text-muted-foreground/50">Unnamed</span>}
            </h3>
            <div className="h-px w-12 bg-gradient-to-r from-primary/60 to-transparent mt-2" />
          </div>

          {/* Tag chips */}
          {tags.length > 0 && (
            <div className="relative flex flex-wrap gap-1.5 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[10px] font-bold uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Hexagon + numeric stats split */}
          {isUnknown ? (
            <div className="relative h-[180px] flex flex-col items-center justify-center text-center">
              <EyeOff className="h-8 w-8 text-amber-400/70 mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Stats hidden
              </p>
            </div>
          ) : (
            <div className="relative grid grid-cols-5 gap-3 items-center mt-3">
              <div className="col-span-3 -ml-3">
                <StatRadar stats={stats} height={180} position={position} showLabels />
              </div>
              <div className="col-span-2 grid grid-cols-1 gap-1.5">
                {visibleKeys.map((key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-2 border-b border-white/5 pb-1"
                  >
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: STAT_COLORS[key] }}
                    >
                      {STAT_LABELS[key]}
                    </span>
                    <span className="font-mono font-bold text-sm tabular-nums">
                      {stats[key]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
