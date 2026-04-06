import React, { useState } from 'react';
import './App.css';

const API_BASE = import.meta.env.DEV ? "/hf-api" : "/api/hf-proxy?path=";

function App() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [textLoading, setTextLoading] = useState(false);
  const [textResult, setTextResult] = useState('');

  const queryModel = async (data) => {
    const url = `${API_BASE}/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0`;
    const response = await fetch(
      url,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }

    const result = await response.blob();
    return result;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setImage(null);
    setTextResult(''); // Clear previous text result

    try {
      const blob = await queryModel({ "inputs": prompt });
      const imgUrl = URL.createObjectURL(blob);
      setImage(imgUrl);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to generate image. Please check your API token.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateText = async () => {
    if (textLoading) return;
    
    setTextLoading(true);
    setError(null);
    setTextResult('');
    setImage(null); // Clear previous image result
    
    try {
      const url = `${API_BASE}/v1/chat/completions`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.2-1B-Instruct",
          messages: [
            {
              role: "system",
              content: "You are a knowledgeable AI assistant. Your task is to provide a concise, interesting, and informational summary about the user's topic. Focus on key facts and essential details. Keep the tone professional but engaging. Limit your response to 100 words."
            },
            {
              role: "user",
              content: `Provide some interesting information about: ${prompt || "a random interesting scientific fact"}`
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Knowledge transfer failed: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.choices[0].message.content.trim();
      setTextResult(generatedText);
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve information. Check your connection.");
    } finally {
      setTextLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="main-container">
        
        {/* Transformative Hero */}
        <section className="hero-section">
          <div className="hero-batch">
            <div className="hero-badge-dot"></div>
            <span>Powered by Stable Diffusion XL</span>
          </div>
          <h1 className="text-gradient">PixelForge AI</h1>
          <p>Bring your imagination into reality. Describe any vision, and watch our neural network craft high-fidelity masterpieces in seconds.</p>
        </section>

        {/* Core Generator Workspace */}
        <main className="workspace-card">
          <div className="input-wrapper">
            <textarea
              className="prompt-textarea"
              placeholder="Describe what you want to see... (e.g., 'A futuristic cyberpunk city at neon night, highly detailed')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows="3"
              disabled={loading}
              autoFocus
            />
          </div>
          
          <div className="action-bar">
            <button
              className="secondary-btn"
              onClick={handleGenerateText}
              disabled={textLoading || loading}
            >
              {textLoading ? (
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.813 1.912a2 2 0 00-1.272 1.272L12 21l-1.912-5.813a2 2 0 00-1.272-1.272L3 12l5.813-1.912a2 2 0 001.272-1.272L12 3z" />
                  <path d="M5 3l.637 1.863a1 1 0 00.637.637L8 6l-1.863.637a1 1 0 00-.637.637L5 9l-.637-1.863a1 1 0 00-.637-.637L2 6l1.863-.637a1 1 0 00.637-.637L5 3z" />
                  <path d="M19 16l.637 1.863a1 1 0 00.637.637L22 19l-1.863.637a1 1 0 00-.637.637L19 22l-.637-1.863a1 1 0 00-.637-.637L16 19l1.863-.637a1 1 0 00.637-.637L19 16z" />
                </svg>
              )}
              {textLoading ? 'Generating...' : 'Generate Text'}
            </button>
            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={loading || !prompt.trim() || textLoading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Rendering...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  Generate Image
                </>
              )}
            </button>
          </div>
        </main>

        {/* Live Presentation Layer */}
        <section className={`presentation-layer ${(image || textResult) && !loading && !textLoading && !error ? 'has-results' : ''}`}>
          
          {(loading || textLoading) && (
            <div className="canvas-container loading-container">
              <div className="loading-state">
                <div className="orb-loader"></div>
                <p className="loading-text">{loading ? 'Synthesizing Pixels' : 'Synthesizing Knowledge'}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="canvas-container error-container">
              <div className="error-state">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!loading && !textLoading && !error && (image || textResult) && (
            <div className="results-grid">
              {image && (
                <div className="canvas-container image-box">
                  <img src={image} alt="Generated rendering" className="generated-image" />
                </div>
              )}
              {textResult && (
                <div className="info-card">
                  <div className="info-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    <span>Knowledge Insight</span>
                  </div>
                  <div className="info-content">
                    <p>{textResult}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && !textLoading && !error && !image && !textResult && (
            <div className="canvas-container empty-container">
              <div className="empty-state">
                <svg className="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <p>Welcome to PixelForge. Generate knowledge or visuals by typing above.</p>
              </div>
            </div>
          )}

        </section>

        <footer>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          Hugging Face Inference Network
        </footer>

      </div>
    </div>
  );
}

export default App;
