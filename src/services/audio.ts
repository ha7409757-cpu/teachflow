/**
 * TeachFlow Audio and Haptic Feedback System
 * Provides immediate physical and auditory feedback for class start,
 * QR verification, timers, and notifications. Works 100% offline via Web Audio API.
 */

class AudioService {
  private audioCtx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Play synthesized melodic chime for class operations
   */
  playFeedback(type: 'class_start' | 'class_end' | 'qr_success' | 'reminder' | 'click' | 'error') {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'class_start') {
        // High, joyful dual chime (E5 -> G5 -> C6)
        const notes = [659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.2, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.35);
        });
      } else if (type === 'qr_success') {
        // Quick high double pip (880Hz -> 1320Hz)
        [880, 1320].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.18, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.2);
        });
      } else if (type === 'class_end') {
        // Gentle descent (C5 -> G4)
        [523.25, 392.0].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.15, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.4);
        });
      } else if (type === 'reminder') {
        // School bell-like reminder tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'error') {
        // Low double buzz
        [220, 196].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.12, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.25);
        });
      }
    } catch {
      // Audio context disabled or unavailable in background
    }
  }

  /**
   * Device vibration feedback where supported (e.g. Android mobile browser)
   */
  vibrate(pattern: number | number[] = 70) {
    try {
      if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore vibration unsupported errors
    }
  }

  /**
   * Combined haptic and auditory feedback for class start
   */
  triggerClassStart() {
    this.vibrate([100, 50, 150]);
    this.playFeedback('class_start');
  }

  /**
   * Combined feedback for QR detection
   */
  triggerQrSuccess() {
    this.vibrate([80, 40, 80]);
    this.playFeedback('qr_success');
  }

  /**
   * Combined feedback for reminder
   */
  triggerReminder() {
    this.vibrate([200, 100, 200]);
    this.playFeedback('reminder');
  }

  /**
   * Automatic Class-End Alarm & Vibration
   * Plays a professional school bell / chime sequence that sounds clear and stops cleanly after 2.5 seconds.
   */
  playClassEndAlarm() {
    this.vibrate([300, 150, 300, 150, 450]);

    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Westminster / School Bell progression: E4 (329.63), G4 (392.00), A4 (440.00), B4 (493.88)
      const notes = [
        { freq: 440.0, time: 0.0, dur: 0.45 },
        { freq: 554.37, time: 0.35, dur: 0.45 },
        { freq: 659.25, time: 0.70, dur: 0.55 },
        { freq: 880.0, time: 1.15, dur: 0.85 }
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);
        
        // Bell envelope: sharp strike, smooth decay
        gain.gain.setValueAtTime(0.25, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + dur);
      });
    } catch {
      // AudioContext unavailable or background
    }
  }
}

export const audioService = new AudioService();
