'use client';

import React, { useState, useEffect } from 'react';

interface Model {
  model_id: string;
  name: string;
  can_do_text_to_speech: boolean;
}

export default function DramaNarrator() {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('eleven_v4');
  const [apiKey, setApiKey] = useState<string>('');
  const [voiceId, setVoiceId] = useState<string>('');
  const [text, setText] = useState<string>(
    '[sighs] I never thought it would come to this... [pause] [whispers] But we have no choice.'
  );
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadModels() {
      try {
        const res = await fetch('/api/models');
        const data = await res.json();
        if (Array.isArray(data)) {
          const ttsModels = data.filter((m: Model) => m.can_do_text_to_speech);
          setModels(ttsModels);
          if (ttsModels.some((m: Model) => m.model_id === 'eleven_v4')) {
            setSelectedModel('eleven_v4');
          } else if (ttsModels.length > 0) {
            setSelectedModel(ttsModels[0].model_id);
          }
        }
      } catch (err) {
        console.error('Error fetching models:', err);
      }
    }
    loadModels();
  }, []);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          model_id: selectedModel,
          voice_id: voiceId,
          apiKey: apiKey,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate audio');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '650px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif', direction: 'ltr' }}>
      <h2>ElevenLabs Drama Speech Studio</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>API Key:</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk_..."
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Voice ID:</label>
          <input
            type="text"
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            placeholder="e.g. JBFqnCBsd6RMkjVDRZzb"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label htmlFor="model-select" style={{ display: 'block', marginBottom: '5px' }}>
            Select Model:
          </label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          >
            {models.map((model) => (
              <option key={model.model_id} value={model.model_id}>
                {model.name} ({model.model_id})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="script-text" style={{ display: 'block', marginBottom: '5px' }}>
          Script with Audio Tags (e.g. <code>[sighs]</code>, <code>[breathes]</code>, <code>[pause]</code>):
        </label>
        <textarea
          id="script-text"
          rows={7}
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px' }}
      >
        {loading ? 'Generating Audio...' : 'Generate Audio'}
      </button>

      {audioUrl && (
        <div style={{ marginTop: '20px' }}>
          <h3>Preview Output:</h3>
          <audio controls src={audioUrl} style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
}
