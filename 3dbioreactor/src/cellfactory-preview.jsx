import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import CellFactory from './components/cellfactory/CellFactory';

// Preview harness only — shows the component on both a light and a dark
// ground so you can check it against whatever IDEA Bio's real page uses.
const THEMES = {
  light: { bg: '#f4f7f6', text: '#0f2a24' },
  dark: { bg: '#07130f', text: '#dff3ea' },
};

function Preview() {
  const [theme, setTheme] = useState('light');
  const t = THEMES[theme];

  return (
    <div style={{ background: t.bg, color: t.text, height: '100%', position: 'relative' }}>
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          padding: '8px 14px',
          borderRadius: 999,
          border: '1px solid currentColor',
          background: 'transparent',
          color: 'inherit',
          cursor: 'pointer',
          font: 'inherit',
          fontSize: 13,
        }}
      >
        {theme === 'light' ? 'Dark' : 'Light'} background
      </button>

      <CellFactory />
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Preview />
  </StrictMode>
);
