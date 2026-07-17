export type RingtoneController = {
  stop: () => void;
};

export function startRingtone(): RingtoneController {
  const AudioContextCtor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextCtor) {
    return { stop() {} };
  }

  const context = new AudioContextCtor();
  const gain = context.createGain();
  gain.gain.value = 0;
  gain.connect(context.destination);

  const oscillator = context.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = 740;
  oscillator.connect(gain);
  oscillator.start();

  let step = 0;
  const pattern = [0.18, 0, 0.18, 0, 0.18, 0, 0, 0];
  const interval = window.setInterval(() => {
    const value = pattern[step % pattern.length] ?? 0;
    gain.gain.setValueAtTime(value, context.currentTime);
    step += 1;
  }, 300);

  if (context.state === "suspended") {
    void context.resume().catch(() => undefined);
  }

  return {
    stop() {
      window.clearInterval(interval);
      gain.gain.setValueAtTime(0, context.currentTime);
      oscillator.stop();
      void context.close().catch(() => undefined);
    },
  };
}
