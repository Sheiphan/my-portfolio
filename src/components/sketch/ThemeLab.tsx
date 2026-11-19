"use client";

import { useEffect, useState } from 'react';

/**
 * Development-only "Paper & ink" panel for trying paper shades and flock
 * styles live. It sets CSS custom properties on <html> and tells the flock to
 * re-read them. Never rendered in production builds.
 */

type Paper = { id: string; name: string; paper: string; deep: string; header: string };
type Ink = { id: string; name: string; ink: string; alpha: string; glow: string; blur: string; swatch: string };

const PAPERS: Paper[] = [
  { id: 'cream', name: 'Cream', paper: '#f6f0e1', deep: '#ece3cc', header: 'rgb(246 240 225 / 0.92)' },
  { id: 'newsprint', name: 'Newsprint', paper: '#eeede8', deep: '#e2e0d8', header: 'rgb(238 237 232 / 0.92)' },
  { id: 'kraft', name: 'Kraft', paper: '#e9dcc3', deep: '#dccbaa', header: 'rgb(233 220 195 / 0.92)' },
  { id: 'ledger', name: 'Ledger mint', paper: '#e6f0e8', deep: '#d5e5da', header: 'rgb(230 240 232 / 0.92)' },
  { id: 'blush', name: 'Blush', paper: '#f7e9e6', deep: '#edd9d4', header: 'rgb(247 233 230 / 0.92)' },
];

const INKS: Ink[] = [
  { id: 'ink', name: 'Ink', ink: '17, 17, 17', alpha: '0.7', glow: 'rgba(0, 0, 0, 0)', blur: '0', swatch: '#111111' },
  { id: 'graphite', name: 'Soft graphite', ink: '72, 68, 60', alpha: '0.42', glow: 'rgba(0, 0, 0, 0)', blur: '0', swatch: '#48443c' },
  { id: 'yellow-glow', name: 'Highlighter glow', ink: '17, 17, 17', alpha: '0.72', glow: 'rgba(255, 220, 0, 0.9)', blur: '9', swatch: '#ffe600' },
  { id: 'teal-glow', name: 'Teal glow', ink: '12, 84, 78', alpha: '0.7', glow: 'rgba(46, 196, 182, 0.6)', blur: '10', swatch: '#2ec4b6' },
  { id: 'pink-glow', name: 'Pink glow', ink: '122, 22, 72', alpha: '0.66', glow: 'rgba(255, 111, 181, 0.6)', blur: '10', swatch: '#ff6fb5' },
];

const KEY = 'theme-lab';

const PROPS = ['--color-paper', '--color-paper-deep', '--header-paper', '--flock-ink', '--flock-alpha', '--flock-glow', '--flock-glow-blur'];

function apply(paper: Paper, ink: Ink, dark: boolean) {
  const root = document.documentElement.style;
  // Dark mode brings its own paper and glowing birds: drop the light-mode overrides.
  if (dark) {
    PROPS.forEach((p) => root.removeProperty(p));
    window.dispatchEvent(new Event('flock:theme'));
    return;
  }
  root.setProperty('--color-paper', paper.paper);
  root.setProperty('--color-paper-deep', paper.deep);
  root.setProperty('--header-paper', paper.header);
  root.setProperty('--flock-ink', ink.ink);
  root.setProperty('--flock-alpha', ink.alpha);
  root.setProperty('--flock-glow', ink.glow);
  root.setProperty('--flock-glow-blur', ink.blur);
  window.dispatchEvent(new Event('flock:theme'));
}

export default function ThemeLab() {
  const [open, setOpen] = useState(false);
  const [paperId, setPaperId] = useState('cream');
  const [inkId, setInkId] = useState('ink');
  const [dark, setDark] = useState(false);

  // Follow the light / dark toggle in the nav bar.
  useEffect(() => {
    const el = document.documentElement;
    const read = () => setDark(el.dataset.theme === 'dark');
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);

  // Restore the last choice for this browser.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
      if (saved?.paper) setPaperId(saved.paper);
      if (saved?.ink) setInkId(saved.ink);
    } catch {
      /* storage unavailable: keep defaults */
    }
  }, []);

  useEffect(() => {
    const paper = PAPERS.find((p) => p.id === paperId) ?? PAPERS[0];
    const ink = INKS.find((k) => k.id === inkId) ?? INKS[0];
    apply(paper, ink, dark);
    try {
      localStorage.setItem(KEY, JSON.stringify({ paper: paperId, ink: inkId }));
    } catch {
      /* storage unavailable: the choice lasts for this page view */
    }
  }, [paperId, inkId, dark]);

  if (dark) return null;

  return (
    <div className="theme-lab" data-open={open}>
      <button type="button" className="theme-lab-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Paper &amp; ink
      </button>
      {open && (
        <div className="theme-lab-panel" role="group" aria-label="Try paper and flock styles (development only)">
          <p className="theme-lab-heading">Paper</p>
          <div className="theme-lab-row">
            {PAPERS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={p.id === paperId}
                onClick={() => setPaperId(p.id)}
                className="theme-lab-chip"
              >
                <span className="theme-lab-swatch" style={{ background: p.paper }} aria-hidden="true" />
                {p.name}
              </button>
            ))}
          </div>
          <p className="theme-lab-heading">Birds</p>
          <div className="theme-lab-row">
            {INKS.map((k) => (
              <button
                key={k.id}
                type="button"
                aria-pressed={k.id === inkId}
                onClick={() => setInkId(k.id)}
                className="theme-lab-chip"
              >
                <span className="theme-lab-swatch" style={{ background: k.swatch }} aria-hidden="true" />
                {k.name}
              </button>
            ))}
          </div>
          <p className="theme-lab-note">Development only. Your pick is saved in this browser.</p>
        </div>
      )}
    </div>
  );
}
