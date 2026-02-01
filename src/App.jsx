import React, { useState } from 'react';
import TerrainViewer from './TerrainViewer';
import './App.css';

// Import sample assets
import sampleTerrainPath from './assets/sample_terrain.png';
import sampleMaskPath from './assets/sample_mask.png';

function App() {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageName, setImageName] = useState("");

  const [maskSrc, setMaskSrc] = useState(null);
  const [maskName, setMaskName] = useState("");
  const [showMask, setShowMask] = useState(true);
  const [maskOpacity, setMaskOpacity] = useState(0.5);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setImageName(file.name);
      // Reset mask when new terrain is loaded
      setMaskSrc(null);
      setMaskName("");
    }
  };

  const handleMaskUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMaskSrc(url);
      setMaskName(file.name);
      setShowMask(true);
    }
  };

  const handleLoadSample = () => {
    setImageSrc(sampleTerrainPath);
    setImageName("Sample Terrain");
    setMaskSrc(sampleMaskPath);
    setMaskName("Sample Irrigation");
    setShowMask(true);
    setMaskOpacity(0.6);
  };

  return (
    <div className="app-container">

      {/* Floating Header */}
      <div className="header-overlay">
        {/* Title Block */}
        <div className="title-block">
          <h1 className="app-title">
            Satellite Terrain<span style={{ color: 'var(--accent-color)' }}>.3D</span>
          </h1>
          <p className="app-subtitle">
            Irrigation Monitoring System
          </p>
        </div>

        {/* Top Controls */}
        <div className="controls-group">

          {/* Main Image Upload */}
          <div className="file-control">
            {imageName && (
              <span className="file-name">
                {imageName}
              </span>
            )}
            <label className="btn-upload">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Satellite Image
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Mask Upload */}
          <div className="file-control">
            {maskName && (
              <span className="file-name highlight">
                {maskName}
              </span>
            )}
            <label className="btn-upload dark">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
              Irrigation Data
              <input type="file" accept="image/*" onChange={handleMaskUpload} style={{ display: 'none' }} />
            </label>
          </div>

        </div>
      </div>

      {/* Floating Sidebar for Overlay Controls (Only visible if mask loaded) */}
      {maskSrc && (
        <div className="sidebar">
          <h3 className="sidebar-title">
            Layer Options
          </h3>

          {/* Toggle */}
          <div className="sidebar-row">
            <span style={{ fontSize: '0.9rem' }}>Highlight Fields</span>
            <div
              className={`toggle-switch ${showMask ? 'active' : ''}`}
              onClick={() => setShowMask(!showMask)}
            >
              <div className="toggle-knob" />
            </div>
          </div>

          {/* Opacity Slider */}
          <div className="slider-group">
            <div className="slider-header">
              <span>Visibility</span>
              <span>{Math.round(maskOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={maskOpacity}
              onChange={(e) => setMaskOpacity(parseFloat(e.target.value))}
              className="opacity-slider"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="viewer-container">
        {imageSrc ? (
          <TerrainViewer
            imageSrc={imageSrc}
            maskSrc={maskSrc}
            showMask={showMask}
            maskOpacity={maskOpacity}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <p className="empty-text">
              Ready to Visualize
            </p>
            <p style={{ fontSize: '0.9rem', color: '#888', maxWidth: '300px', margin: '0 0 20px 0' }}>
              Upload your own satellite imagery or load a sample to see how it works.
            </p>
            
            <button className="btn-sample" onClick={handleLoadSample}>
              Load Sample Data
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default App;