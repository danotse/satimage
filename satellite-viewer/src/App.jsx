import React, { useState } from 'react';
import TerrainViewer from './TerrainViewer';
import './App.css';

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

  // UI Components helpers
  const ButtonStyle = {
    background: 'white',
    color: 'black',
    padding: '8px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    border: 'none',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      backgroundColor: '#050505',
      color: '#ffffff',
      userSelect: 'none'
    }}>

      {/* Floating Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        {/* Title Block */}
        <div style={{ pointerEvents: 'auto' }}>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.03em' }}>
            Satellite Terrain<span style={{ color: '#4dabf7' }}>.3D</span>
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
            Irrigation Monitoring System
          </p>
        </div>

        {/* Top Controls */}
        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>

          {/* Main Image Upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {imageName && (
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '4px' }}>
                {imageName}
              </span>
            )}
            <label style={ButtonStyle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Base Map
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Mask Upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {maskName && (
              <span style={{ fontSize: '0.8rem', color: '#4dabf7', background: 'rgba(0,123,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                {maskName}
              </span>
            )}
            <label style={{ ...ButtonStyle, background: '#333', color: 'white' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
              Overlay Mask
              <input type="file" accept="image/*" onChange={handleMaskUpload} style={{ display: 'none' }} />
            </label>
          </div>

        </div>
      </div>

      {/* Floating Sidebar for Overlay Controls (Only visible if mask loaded) */}
      {maskSrc && (
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '20px',
          transform: 'translateY(-50%)',
          width: '240px',
          background: 'rgba(20, 20, 20, 0.85)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.1)',
          zIndex: 20,
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          pointerEvents: 'auto'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', fontWeight: '600', color: '#ccc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Layer Options
          </h3>

          {/* Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '0.9rem' }}>Segmentation</span>
            <div
              onClick={() => setShowMask(!showMask)}
              style={{
                width: '40px',
                height: '22px',
                background: showMask ? '#4dabf7' : '#444',
                borderRadius: '20px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.3s'
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: showMask ? '20px' : '2px',
                transition: 'left 0.3s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
              }} />
            </div>
          </div>

          {/* Opacity Slider */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem', color: '#888' }}>
              <span>Opacity</span>
              <span>{Math.round(maskOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={maskOpacity}
              onChange={(e) => setMaskOpacity(parseFloat(e.target.value))}
              style={{
                width: '100%',
                cursor: 'grab',
                accentColor: '#4dabf7'
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{
        flexGrow: 1,
        position: 'relative',
        background: '#000',
        overflow: 'hidden'
      }}>
        {imageSrc ? (
          <TerrainViewer
            imageSrc={imageSrc}
            maskSrc={maskSrc}
            showMask={showMask}
            maskOpacity={maskOpacity}
          />
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.4
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '20px' }}>
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <p style={{ fontSize: '1rem', fontWeight: '400' }}>
              No Data Loaded
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

export default App;