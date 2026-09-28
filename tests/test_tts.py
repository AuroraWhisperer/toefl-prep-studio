import asyncio
import importlib
import sys
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from backend.models import TTSRequest


app_module = importlib.import_module('backend.app')


def install_voice(monkeypatch, stream):
    class Voice:
        def __init__(self, text, voice):
            self.text = text
            self.voice = voice

    Voice.stream = stream
    monkeypatch.setitem(sys.modules, 'edge_tts', SimpleNamespace(Communicate=Voice))


@pytest.mark.parametrize(
    ('requested', 'expected'),
    [
        ('en-US-AriaNeural', 'en-US-AriaNeural'),
        ('en-US-GuyNeural', 'en-US-GuyNeural'),
        ('en-GB-SoniaNeural', 'en-GB-SoniaNeural'),
        ('en-GB-RyanNeural', 'en-GB-RyanNeural'),
        ('en-AU-NatashaNeural', 'en-AU-NatashaNeural'),
        ('en-AU-WilliamMultilingualNeural', 'en-AU-WilliamMultilingualNeural'),
        ('en-NZ-MollyNeural', 'en-US-AriaNeural'),
        ('en-US-UnknownVoice', 'en-US-AriaNeural'),
    ],
)
def test_only_supported_prompt_voices_reach_synthesis(monkeypatch, requested, expected):
    async def stream(self):
        assert self.voice == expected
        yield {'type': 'audio', 'data': b'supported-prompt'}

    install_voice(monkeypatch, stream)
    with TestClient(app_module.app) as client:
        response = client.post('/api/v1/tts', json={'text': 'A test prompt.', 'voice': requested})
    assert response.headers['content-type'] == 'audio/mpeg'
    assert response.content == b'supported-prompt'


def test_audio_bytes_are_returned_without_persistent_storage(monkeypatch, tmp_path):
    async def stream(self):
        assert self.text == 'A test prompt.'
        assert self.voice == 'en-US-AriaNeural'
        yield {'type': 'WordBoundary', 'text': 'ignored metadata'}
        yield {'type': 'audio', 'data': b'first'}
        yield {'type': 'audio', 'data': b'second'}

    install_voice(monkeypatch, stream)
    monkeypatch.setattr(app_module, 'AUDIO_DIR', tmp_path, raising=False)
    with TestClient(app_module.app) as client:
        response = client.post('/api/v1/tts', json={'text': 'A test prompt.'})
    assert response.status_code == 200
    assert response.headers['content-type'] == 'audio/mpeg'
    assert response.headers['cache-control'] == 'no-store'
    assert response.content == b'firstsecond'
    assert list(tmp_path.iterdir()) == []


@pytest.mark.parametrize('empty', [False, True])
def test_failed_or_empty_synthesis_returns_browser_fallback(monkeypatch, empty):
    async def stream(self):
        if not empty:
            yield {'type': 'audio', 'data': b'partial audio'}
            raise OSError('offline')

    install_voice(monkeypatch, stream)
    with TestClient(app_module.app) as client:
        response = client.post('/api/v1/tts', json={'text': 'A test prompt.'})
    assert response.status_code == 200
    assert response.json() == {'url': None, 'text': 'A test prompt.', 'fallback': True}


@pytest.mark.parametrize('exit_reason', ['disconnect', 'timeout', 'cancel'])
def test_synthesis_is_cancelled_when_request_ends(monkeypatch, exit_reason):
    async def scenario():
        started = asyncio.Event()
        stopped = asyncio.Event()

        async def stream(self):
            try:
                started.set()
                await asyncio.Event().wait()
                yield {'type': 'audio', 'data': b'unreachable'}
            finally:
                stopped.set()

        async def receive():
            await started.wait()
            if exit_reason != 'disconnect':
                await asyncio.Event().wait()
            return {'type': 'http.disconnect'}

        install_voice(monkeypatch, stream)
        monkeypatch.setattr(
            app_module,
            'TTS_TIMEOUT_SECONDS',
            0.05 if exit_reason == 'timeout' else 20,
            raising=False,
        )
        request = SimpleNamespace(receive=receive)
        task = asyncio.create_task(app_module.tts(TTSRequest(text='Pending prompt.'), request))
        await asyncio.wait_for(started.wait(), timeout=1)
        if exit_reason == 'cancel':
            task.cancel()
            with pytest.raises(asyncio.CancelledError):
                await task
        else:
            response = await asyncio.wait_for(task, timeout=1)
            assert response.status_code == (499 if exit_reason == 'disconnect' else 200)
            if exit_reason == 'timeout':
                assert b'"fallback":true' in response.body
        assert stopped.is_set()

    asyncio.run(scenario())
