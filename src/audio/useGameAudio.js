import { useCallback, useEffect, useState } from 'react';

const AUDIO_SOURCES = {
  bgm: '/assets/audio/BGM.mpeg',
  click: '/assets/audio/ClickButton.mpeg',
  narrative: '/assets/audio/NarrativePopUp.mpeg',
};

const DEFAULT_VOLUMES = {
  bgm: 0.25,
  sfx: 0.5,
};

const STORAGE_KEY = 'koperasi_audio_settings';

let audioElements = null;
let unlockCleanup = null;

function clampVolume(value, fallback) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  return Math.min(1, Math.max(0, numberValue));
}

function loadAudioSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      bgm: clampVolume(saved.bgm, DEFAULT_VOLUMES.bgm),
      sfx: clampVolume(saved.sfx, DEFAULT_VOLUMES.sfx),
    };
  } catch {
    return DEFAULT_VOLUMES;
  }
}

function safePlay(audio) {
  if (!audio) return Promise.resolve(false);

  let playResult;
  try {
    playResult = audio.play();
  } catch {
    return Promise.resolve(false);
  }

  if (!playResult?.catch) return Promise.resolve(true);
  return playResult
    .then(() => true)
    .catch(() => false);
}

function getAudioElements() {
  if (audioElements) return audioElements;

  const bgm = new Audio(AUDIO_SOURCES.bgm);
  bgm.loop = true;
  bgm.preload = 'auto';

  const click = new Audio(AUDIO_SOURCES.click);
  click.preload = 'auto';

  const narrative = new Audio(AUDIO_SOURCES.narrative);
  narrative.preload = 'auto';

  audioElements = { bgm, click, narrative };
  return audioElements;
}

function applyVolumes(volumes) {
  const audio = getAudioElements();
  audio.bgm.volume = volumes.bgm;
  audio.click.volume = volumes.sfx;
  audio.narrative.volume = volumes.sfx;
}

function playOneShot(audio) {
  if (!audio) return;

  try {
    audio.pause();
    audio.currentTime = 0;
  } catch {
    // Some browsers can reject seeking before metadata is ready.
  }

  safePlay(audio);
}

export function useGameAudio() {
  const [volumes, setVolumes] = useState(loadAudioSettings);

  useEffect(() => {
    const audio = getAudioElements();
    applyVolumes(volumes);

    const startBgm = async () => {
      if (!audio.bgm.paused) return true;

      const didPlay = await safePlay(audio.bgm);
      if (didPlay && unlockCleanup) {
        unlockCleanup();
        unlockCleanup = null;
      }
      return didPlay;
    };

    const registerUnlock = () => {
      if (unlockCleanup) return;

      const unlock = () => {
        startBgm();
      };

      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
      unlockCleanup = () => {
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
      };
    };

    startBgm().then((didPlay) => {
      if (!didPlay) registerUnlock();
    });

    return () => {
      if (unlockCleanup) {
        unlockCleanup();
        unlockCleanup = null;
      }
    };
  }, []);

  useEffect(() => {
    applyVolumes(volumes);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(volumes));
    } catch {
      // Volume persistence is optional; audio should keep working without it.
    }
  }, [volumes]);

  const setBgmVolume = useCallback((value) => {
    setVolumes((current) => ({
      ...current,
      bgm: clampVolume(value, current.bgm),
    }));
  }, []);

  const setSfxVolume = useCallback((value) => {
    setVolumes((current) => ({
      ...current,
      sfx: clampVolume(value, current.sfx),
    }));
  }, []);

  const playClick = useCallback(() => {
    playOneShot(getAudioElements().click);
  }, []);

  const playNarrativePopup = useCallback(() => {
    playOneShot(getAudioElements().narrative);
  }, []);

  return {
    volumes,
    setBgmVolume,
    setSfxVolume,
    playClick,
    playNarrativePopup,
  };
}
