(() => {
  "use strict";

  const accents = {
    "en-US": { label: "美式英语", voices: {
      female: { voice: "en-US-AriaNeural", name: "Aria" },
      male: { voice: "en-US-GuyNeural", name: "Guy" },
    } },
    "en-GB": { label: "英国英语", voices: {
      female: { voice: "en-GB-SoniaNeural", name: "Sonia" },
      male: { voice: "en-GB-RyanNeural", name: "Ryan" },
    } },
    "en-AU": { label: "澳大利亚英语", voices: {
      female: { voice: "en-AU-NatashaNeural", name: "Natasha" },
      male: { voice: "en-AU-WilliamMultilingualNeural", name: "William" },
    } },
  };
  const infoHtml = () => '<p class="prompt-accent-info">提示音随机混合：北美（美式）约 80% · 英国约 10% · 澳大利亚约 10%；男女声约各半。按材料独立随机，同题重播保持同一音色；少量题目不保证凑齐比例。保持自然语速，保留口音和音色区别。此为训练配置，非 ETS 官方比例或原声。</p>';

  function parseTurns(text) {
    const original = text.trim();
    // Imported ETS scripts also use accent tags instead of, or after, role labels.
    const source = original.replace(/(^|\n|(?<=[.!?])\s+)(?:(?:Man|Woman):\s*)?\(([MW])-[A-Za-z]+\)\s*/g,
      (_, boundary, gender) => `${boundary}${gender === "M" ? "Man" : "Woman"}: `);
    const labels = [...source.matchAll(/(?:^|\n|(?<=[.!?])\s+)([A-Z][a-z]+(?:[ -](?:[A-Z][a-z]+|[A-Z]|\d+))?):\s*/g)];
    const speakers = new Set(labels.map(match => match[1]));
    const singleNarrator = speakers.size === 1 && /^(Man|Woman)$/.test(labels[0][1]);
    if (labels[0]?.index !== 0 || (speakers.size !== 2 && !singleNarrator)) {
      return [{ speaker: "", text: original }];
    }
    return labels.map((match, index) => ({
      speaker: match[1],
      text: source.slice(match.index + match[0].length, labels[index + 1]?.index).trim(),
    }));
  }

  async function createPromptUtterance(text, assignment = { accent: "en-US", gender: "female" }, signal) {
    if (signal?.aborted) return null;
    const selectedAccent = assignment.accent;
    const profile = accents[selectedAccent];
    const selectedVoice = profile.voices[assignment.gender];
    const synthesis = window.speechSynthesis;
    if (!synthesis) throw new Error(`浏览器语音不可用，请联网后重新开始本轮，使用${profile.label}提示音。`);
    const chooseVoice = () => {
      const voices = synthesis.getVoices().filter((voice) => voice.lang.replaceAll("_", "-").toLowerCase() === selectedAccent.toLowerCase());
      // Browser voices have no standard gender field; match the known speaker, not an arbitrary locale default.
      return voices.find((voice) => voice.name.toLowerCase().includes(selectedVoice.name.toLowerCase()));
    };
    let voice = chooseVoice();
    if (!voice) {
      await new Promise((resolve) => {
        const finish = () => {
          clearTimeout(timer);
          synthesis.removeEventListener("voiceschanged", check);
          signal?.removeEventListener("abort", finish);
          resolve();
        };
        const check = () => { if (signal?.aborted || chooseVoice()) finish(); };
        const timer = setTimeout(finish, 1500);
        synthesis.addEventListener("voiceschanged", check);
        signal?.addEventListener("abort", finish, { once: true });
        check();
      });
      voice = chooseVoice();
    }
    if (signal?.aborted) return null;
    if (!voice) throw new Error(`未找到${profile.label}音色（${assignment.gender === "male" ? "男声" : "女声"} ${selectedVoice.name}），请启用对应语音，或联网后重新开始本轮；不会改用其他口音或性别。`);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = selectedAccent;
    utterance.rate = 1;
    return utterance;
  }

  class PromptAudioCache {
    constructor(texts = [], assignments = new Map()) {
      this.assignments = assignments;
      this.entries = new Map();
      this.queue = [];
      this.active = 0;
      this.controller = new AbortController();
      for (const text of texts) {
        if (text) this.entry(text);
      }
      this.pump();
    }

    voiceFor(text) {
      if (!this.assignments.has(text)) {
        const draw = Math.random();
        const accent = draw < 0.8 ? "en-US" : draw < 0.9 ? "en-GB" : "en-AU";
        const gender = Math.random() < 0.5 ? "male" : "female";
        this.assignments.set(text, { accent, gender, voice: accents[accent].voices[gender].voice });
      }
      return this.assignments.get(text);
    }

    accentFor(text) {
      return this.voiceFor(text).accent;
    }

    entry(text) {
      if (!this.entries.has(text)) {
        const base = this.voiceFor(text);
        const turns = parseTurns(text);
        const speakers = [...new Set(turns.map(turn => turn.speaker))];
        const explicitGender = speaker => /^(Woman|Female\b)/.test(speaker) ? "female" : /^(Man|Male\b)/.test(speaker) ? "male" : null;
        const opposite = gender => gender === "male" ? "female" : "male";
        const firstGender = explicitGender(speakers[0]) ?? (explicitGender(speakers[1] || "") ? opposite(explicitGender(speakers[1])) : base.gender);
        const parts = turns.map(turn => {
          const gender = turn.speaker ? explicitGender(turn.speaker) ?? (speakers.indexOf(turn.speaker) % 2 ? opposite(firstGender) : firstGender) : base.gender;
          const part = { ...turn, profile: { accent: base.accent, gender, voice: accents[base.accent].voices[gender].voice }, url: null };
          part.promise = new Promise(resolve => { part.resolve = resolve; });
          return part;
        });
        const entry = { parts, promise: Promise.all(parts.map(part => part.promise)) };
        this.entries.set(text, entry);
        this.queue.push(...parts);
      }
      return this.entries.get(text);
    }

    prioritize(text) {
      if (!text || this.controller.signal.aborted) return;
      const entry = this.entry(text);
      const pending = new Set(entry.parts);
      this.queue = [...this.queue.filter(part => pending.has(part)), ...this.queue.filter(part => !pending.has(part))];
      this.pump();
    }

    get(text) {
      if (this.controller.signal.aborted) return Promise.resolve(null);
      this.prioritize(text);
      return this.entries.get(text).promise;
    }

    pump() {
      while (!this.controller.signal.aborted && this.active < 2 && this.queue.length) {
        this.load(this.queue.shift());
      }
    }

    async load(entry) {
      this.active += 1;
      try {
        const response = await fetch("/api/v1/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: entry.text, voice: entry.profile.voice }),
          signal: this.controller.signal,
          cache: "no-store",
        });
        if (response.ok && response.headers.get("Content-Type")?.startsWith("audio/")) {
          const blob = await response.blob();
          if (!this.controller.signal.aborted && blob.size) entry.url = URL.createObjectURL(blob);
        }
      } catch {
        // Unavailable prompts use browser speech when the user presses play.
      } finally {
        entry.resolve(entry);
        this.active -= 1;
        this.pump();
      }
    }

    dispose() {
      this.controller.abort();
      for (const entry of this.entries.values()) {
        for (const part of entry.parts) {
          if (part.url) URL.revokeObjectURL(part.url);
          part.resolve(part);
        }
      }
      this.entries.clear();
      this.queue.length = 0;
    }
  }

  function pauseBetweenTurns(text, signal) {
    const milliseconds = /(?:\.{3}|…)["']?$/.test(text) ? 800 : /\?["']?$/.test(text) ? 600 : 400;
    return new Promise(resolve => {
      const finish = () => {
        clearTimeout(timer);
        signal.removeEventListener("abort", finish);
        resolve();
      };
      const timer = setTimeout(finish, milliseconds);
      signal.addEventListener("abort", finish, { once: true });
      if (signal.aborted) finish();
    });
  }

  // Each clip owns its handlers; cancellation also settles the waiting playback loop.
  function playClip(source, signal) {
    return new Promise((resolve, reject) => {
      const audio = typeof source === "string" ? new Audio(source) : null;
      const finish = (error, completed = true) => {
        signal.removeEventListener("abort", abort);
        if (audio) {
          audio.onended = null; audio.onerror = null;
          audio.pause(); audio.removeAttribute("src"); audio.load();
        } else {
          source.onend = null; source.onerror = null;
        }
        if (error) reject(error); else resolve(completed);
      };
      const abort = () => {
        finish(null, false);
        if (!audio) window.speechSynthesis.cancel();
      };
      signal.addEventListener("abort", abort, { once: true });
      if (signal.aborted) return abort();
      if (audio) {
        audio.onended = () => finish();
        audio.onerror = () => finish(new Error("音频播放失败，请重试。"));
        audio.play().catch(error => finish(error));
      } else {
        source.onend = () => finish();
        source.onerror = () => finish(new Error("语音播放未完成，请重试或展开练习脚本。"));
        window.speechSynthesis.speak(source);
      }
    });
  }

  async function playPrompt(cache, texts, { signal = cache.controller.signal, onStart = () => {} } = {}) {
    const groups = await Promise.all([texts].flat().filter(Boolean).map(text => cache.get(text)));
    if (signal.aborted || cache.controller.signal.aborted) return false;
    const parts = groups.flat();
    // Resolve missing voices before speaking so a dialogue never silently loses a role.
    const utterances = await Promise.all(parts.map(part => part.url ? null : createPromptUtterance(part.text, part.profile, signal)));
    for (let index = 0; index < parts.length; index += 1) {
      if (index) await pauseBetweenTurns(parts[index - 1].text, signal);
      if (signal.aborted) return false;
      const part = parts[index];
      onStart();
      if (part.url) {
        try {
          if (!await playClip(part.url, signal)) return false;
          continue;
        } catch {
          if (signal.aborted) return false;
        }
      }
      const utterance = utterances[index] ?? await createPromptUtterance(part.text, part.profile, signal);
      if (!utterance || !await playClip(utterance, signal)) return false;
    }
    return !signal.aborted;
  }

  window.PromptAudioCache = PromptAudioCache;
  window.PromptSpeech = { infoHtml, parseTurns, play: playPrompt, createUtterance: createPromptUtterance };
})();
