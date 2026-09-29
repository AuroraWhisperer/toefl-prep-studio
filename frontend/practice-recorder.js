(() => {
  'use strict';

  window.createPracticeRecorder = ({
    isCurrent,
    onRecording,
    onTranscript,
    onStatus,
    onMessage,
    onManual,
  }) => {
    let mediaRecorder = null,
      mediaStream = null,
      recognition = null;
    let requestId = 0,
      timer = null,
      recognitionTimer = null,
      recognitionEnd = null,
      recognitionStopping = false;
    const pending = new Set();

    function startRecognition(target) {
      recognitionEnd?.();
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Recognition) {
        onMessage('录音可回放；此浏览器不支持自动转写，请手动填写回答。');
        return;
      }
      const active = new Recognition();
      recognition = active;
      recognitionStopping = false;
      let resolveEnd;
      const ended = new Promise((resolve) => {
        resolveEnd = resolve;
      });
      pending.add(ended);
      const finish = () => {
        pending.delete(ended);
        if (recognition === active) {
          window.clearTimeout(recognitionTimer);
          recognition = null;
          recognitionEnd = null;
        }
        resolveEnd();
      };
      recognitionEnd = finish;
      active.lang = 'en-US';
      active.continuous = true;
      active.interimResults = true;
      active.onresult = (event) => {
        if (recognition !== active || !isCurrent(target)) return;
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join(' ');
        onTranscript({ ...target, transcript });
      };
      active.onerror = () => {
        if (recognition === active && isCurrent(target))
          onMessage('自动转写未完成，请回放录音并手动填写文字。');
        finish();
      };
      active.onend = finish;
      try {
        active.start();
      } catch (_) {
        onMessage('自动转写不可用，请手动填写回答。');
        finish();
      }
    }

    async function start({ questionId, practiceId, maxSeconds }) {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        onMessage('当前浏览器不支持录音，请直接输入转写文字。');
        onManual();
        return;
      }
      const request = ++requestId;
      const target = { questionId, practiceId };
      onStatus('requesting');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (request !== requestId || !isCurrent(target)) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        mediaStream = stream;
        const recorder = (mediaRecorder = new MediaRecorder(stream));
        const chunks = [];
        let takeTimer;
        recorder.ondataavailable = (event) => {
          if (event.data.size) chunks.push(event.data);
        };
        recorder.onstop = () => {
          window.clearTimeout(takeTimer);
          if (mediaRecorder === recorder) stop();
          if (chunks.length)
            onRecording({ ...target, blob: new Blob(chunks, { type: recorder.mimeType }) });
        };
        recorder.start();
        // Keep stop events awaitable even after navigation or a manual stop clears the active handle.
        const stopped = new Promise((resolve) =>
          recorder.addEventListener(
            'stop',
            () => {
              pending.delete(stopped);
              resolve();
            },
            { once: true },
          ),
        );
        pending.add(stopped);
        onStatus('recording');
        startRecognition(target);
        timer = takeTimer = window.setTimeout(
          () => {
            if (mediaRecorder === recorder) stop();
          },
          (maxSeconds || 45) * 1000,
        );
      } catch (error) {
        if (request !== requestId) return;
        const message =
          error.name === 'NotAllowedError'
            ? '请允许麦克风权限，或手动填写回答。'
            : error.name === 'NotSupportedError'
              ? '此浏览器无法录音，请手动填写回答。'
              : `无法打开麦克风：${error.message}。你也可以手动填写回答。`;
        onMessage(message);
        stop();
        onManual();
      }
    }

    function stop({ cancelTranscript = false } = {}) {
      requestId += 1;
      window.clearTimeout(timer);
      if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      if (mediaStream) mediaStream.getTracks().forEach((track) => track.stop());
      if (recognition && !recognitionStopping) {
        recognitionStopping = true;
        // Some engines never emit end after stop; do not block submission indefinitely.
        recognitionTimer = window.setTimeout(() => {
          onMessage('转写收尾超时，已保留现有文字；请回放录音核对。');
          recognitionEnd?.();
        }, 1500);
        try {
          recognition.stop();
        } catch (_) {
          recognitionEnd?.();
        }
      }
      if (cancelTranscript) recognitionEnd?.();
      mediaRecorder = null;
      mediaStream = null;
      onStatus('idle');
      return Promise.all(pending);
    }

    return {
      start,
      stop,
      isRecording: () => mediaRecorder?.state === 'recording',
      isPending: () => pending.size > 0,
    };
  };
})();
