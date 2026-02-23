'use client';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

/**
 * Play a ringtone-style notification sound using Web Audio API.
 * Plays 3 short ascending tones that repeat twice — like a phone ringing.
 */
export function playNotificationRing(): void {
  try {
    const ctx = getAudioContext();

    // Resume audio context if suspended (required by autoplay policies)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const volume = 0.3;

    // Ring pattern: three ascending tones, pause, repeat
    const pattern = [
      // First ring
      { freq: 587, start: 0, dur: 0.15 },    // D5
      { freq: 659, start: 0.2, dur: 0.15 },   // E5
      { freq: 784, start: 0.4, dur: 0.2 },    // G5
      // Pause 0.4s
      // Second ring
      { freq: 587, start: 0.8, dur: 0.15 },
      { freq: 659, start: 1.0, dur: 0.15 },
      { freq: 784, start: 1.2, dur: 0.2 },
      // Pause 0.4s
      // Third ring (higher)
      { freq: 659, start: 1.6, dur: 0.15 },
      { freq: 784, start: 1.8, dur: 0.15 },
      { freq: 880, start: 2.0, dur: 0.3 },    // A5
    ];

    pattern.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      // Smooth attack and release to avoid clicks
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(volume, now + start + 0.02);
      gain.gain.setValueAtTime(volume, now + start + dur - 0.03);
      gain.gain.linearRampToValueAtTime(0, now + start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + dur);
    });

    // Vibrate on mobile (if supported)
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200, 300, 200, 100, 200, 100, 200]);
    }
  } catch {
    // Silent fail — audio not critical
  }
}
