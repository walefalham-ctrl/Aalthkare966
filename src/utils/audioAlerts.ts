import { MuezzinKey, ReminderSoundType } from '../types/prayer';

// Audio URLs for different muezzins (reliable open Islamic CDNs)
export const AZAN_AUDIO_URLS: Record<MuezzinKey, string> = {
  makkah: 'https://cdn.aladhan.com/audio/adhans/a1.mp3',
  madinah: 'https://cdn.aladhan.com/audio/adhans/a2.mp3',
  alaqsa: 'https://cdn.aladhan.com/audio/adhans/a3.mp3',
  abdulbasit: 'https://cdn.aladhan.com/audio/adhans/a4.mp3',
  alafasy: 'https://cdn.aladhan.com/audio/adhans/a5.mp3',
  synth: '', // Web Audio API synthetic
};

export const MUEZZIN_NAMES: Record<MuezzinKey, string> = {
  makkah: 'أذان الحرم المكي الشريف',
  madinah: 'أذان المسجد النبوي الشريف',
  alaqsa: 'أذان المسجد الأقصى المبارك',
  abdulbasit: 'الشيخ عبد الباسط عبد الصمد',
  alafasy: 'الشيخ مشاري راشد العفاسي',
  synth: 'نغمة تنبيه روحانية إلكترونية',
};

let currentAudioElement: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext || audioContext.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

/**
 * Plays a calm spiritual chime using Web Audio API (for "استعد للصلاة")
 */
export function playPreAzanChime(volume: number = 0.8) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Harmonic bell sequence: C5, E5, G5, C6 (523Hz, 659Hz, 784Hz, 1046Hz)
    const notes = [
      { freq: 523.25, time: 0.0, dur: 1.8 },
      { freq: 659.25, time: 0.35, dur: 2.0 },
      { freq: 783.99, time: 0.70, dur: 2.2 },
      { freq: 1046.5, time: 1.05, dur: 2.8 },
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0, now + note.time);
      gain.gain.linearRampToValueAtTime(0.25 * volume, now + note.time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur + 0.1);
    });
  } catch (err) {
    console.warn('Web Audio chime could not play:', err);
  }
}

/**
 * Arabic Voice Announcement for Pre-Azan or Azan
 */
export function speakArabicAnnouncement(text: string) {
  if (!('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    // Find Arabic voice if available
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find((v) => v.lang.startsWith('ar'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

/**
 * Triggers the pre-azan alert based on settings
 */
export function triggerPreAzanAlert(
  prayerName: string,
  minutesLeft: number,
  soundType: ReminderSoundType,
  volume: number = 0.8
) {
  if (soundType === 'silent') return;

  if (soundType === 'chime' || soundType === 'both') {
    playPreAzanChime(volume);
  }

  if (soundType === 'voice' || soundType === 'both') {
    setTimeout(() => {
      speakArabicAnnouncement(
        `استعد لصلاة ${prayerName}. يتبقى ${minutesLeft} دقائق على موعد الأذان.`
      );
    }, soundType === 'both' ? 1400 : 100);
  }
}

/**
 * Triggers the late night Witr prayer reminder alert
 */
export function triggerWitrAlert(
  soundType: ReminderSoundType,
  volume: number = 0.8
) {
  if (soundType === 'silent') return;

  if (soundType === 'chime' || soundType === 'both') {
    playPreAzanChime(volume);
  }

  if (soundType === 'voice' || soundType === 'both') {
    setTimeout(() => {
      speakArabicAnnouncement(
        'تذكير بصلاة الوتر وقيام الليل. أوتِروا يا أهل القرآن.'
      );
    }, soundType === 'both' ? 1400 : 100);
  }
}

/**
 * Plays full Azan audio
 */
export function playAzan(
  muezzin: MuezzinKey = 'makkah',
  volume: number = 1.0,
  onEnded?: () => void,
  onError?: () => void
): () => void {
  stopAzan();

  const url = AZAN_AUDIO_URLS[muezzin];

  if (!url || muezzin === 'synth') {
    playSynthesizedAzan(volume, onEnded);
    return () => stopAzan();
  }

  try {
    const audio = new Audio(url);
    currentAudioElement = audio;
    audio.volume = Math.min(1, Math.max(0, volume));

    audio.onended = () => {
      currentAudioElement = null;
      if (onEnded) onEnded();
    };

    audio.onerror = () => {
      console.warn('Network Azan audio failed, falling back to synthesizer...');
      currentAudioElement = null;
      playSynthesizedAzan(volume, onEnded);
      if (onError) onError();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((e) => {
        console.warn('Audio play auto-policy prevented or failed:', e);
        // Fallback to web audio synth
        playSynthesizedAzan(volume, onEnded);
      });
    }
  } catch (err) {
    console.warn('Audio play error, falling back to synth:', err);
    playSynthesizedAzan(volume, onEnded);
  }

  return () => stopAzan();
}

/**
 * Stop currently playing Azan audio
 */
export function stopAzan() {
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudioElement = null;
  }
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

/**
 * Fallback Web Audio API synthesized dignified Adhan melody
 */
export function playSynthesizedAzan(volume: number = 0.8, onEnded?: () => void) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Dignified Bayati-mode melodic prayer call intervals
    // Allaahu Akbar melody simulation
    const notes = [
      { freq: 293.66, time: 0.0, dur: 1.2 }, // D4 (Al-)
      { freq: 329.63, time: 1.0, dur: 1.5 }, // E4 (-laa-)
      { freq: 349.23, time: 2.2, dur: 2.0 }, // F4 (-hu)
      { freq: 392.00, time: 3.8, dur: 1.5 }, // G4 (Ak-)
      { freq: 349.23, time: 5.0, dur: 2.5 }, // F4 (-bar)

      // Repeat second phrase
      { freq: 293.66, time: 7.2, dur: 1.2 },
      { freq: 329.63, time: 8.2, dur: 1.5 },
      { freq: 349.23, time: 9.4, dur: 2.0 },
      { freq: 392.00, time: 11.0, dur: 1.5 },
      { freq: 349.23, time: 12.2, dur: 3.0 },
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, now + n.time);

      gain.gain.setValueAtTime(0, now + n.time);
      gain.gain.linearRampToValueAtTime(0.3 * volume, now + n.time + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur + 0.1);
    });

    const totalDuration = 15.5 * 1000;
    setTimeout(() => {
      if (onEnded) onEnded();
    }, totalDuration);
  } catch (err) {
    console.warn('Synthesized Azan error:', err);
  }
}
