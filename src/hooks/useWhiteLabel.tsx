"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface WhiteLabelConfig {
  systemName: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  logoUrl: string;
  faviconUrl: string;
}

const defaultConfig: WhiteLabelConfig = {
  systemName: 'GRAMMAR',
  tagline: 'Governed Action Runtime',
  primaryColor: '#00A3FF',
  accentColor: '#A855F7',
  logoUrl: '',
  faviconUrl: '',
};

const WhiteLabelContext = createContext<{
  config: WhiteLabelConfig;
  updateConfig: (newConfig: Partial<WhiteLabelConfig>) => Promise<void>;
  isLoading: boolean;
}>({
  config: defaultConfig,
  updateConfig: async () => {},
  isLoading: true,
});

export function WhiteLabelProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<WhiteLabelConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  // Load from InsForge or localStorage cache
  useEffect(() => {
    async function loadConfig() {
      // 1. Try localStorage for fast first-paint
      const cached = localStorage.getItem('grammar_white_label');
      if (cached) {
        try {
          setConfig(prev => ({ ...prev, ...JSON.parse(cached) }));
        } catch {}
      }

      // 2. Fetch from backend API (InsForge source of truth)
      try {
        const response = await fetch('/api/admin/branding', { cache: 'no-store' });
        const payload = await response.json();

        if (response.ok && payload?.data) {
          const dbConfig: WhiteLabelConfig = {
            systemName: payload.data.system_name,
            tagline: payload.data.tagline,
            primaryColor: payload.data.primary_color,
            accentColor: payload.data.accent_color,
            logoUrl: payload.data.logo_url || '',
            faviconUrl: payload.data.favicon_url || '',
          };
          setConfig(dbConfig);
          localStorage.setItem('grammar_white_label', JSON.stringify(dbConfig));
          applyStyles(dbConfig);
        }
      } catch (e) {
        console.error('Failed to fetch white-label from backend', e);
      }
      setIsLoading(false);
    }

    loadConfig();
  }, []);

  const applyStyles = (cfg: WhiteLabelConfig) => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--accent', cfg.primaryColor);
      // Update Title & Favicon
      document.title = cfg.systemName + (cfg.tagline ? ` | ${cfg.tagline}` : '');
      if (cfg.faviconUrl) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = cfg.faviconUrl;
      }
    }
  };

  const updateConfig = async (newConfig: Partial<WhiteLabelConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    localStorage.setItem('grammar_white_label', JSON.stringify(updated));
    applyStyles(updated);
    
    // Persist through backend API (InsForge)
    try {
      const response = await fetch('/api/admin/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Failed to save branding config');
      }
    } catch (e) {
      console.error('Failed to save white-label config via backend', e);
    }
  };

  return (
    <WhiteLabelContext.Provider value={{ config, updateConfig, isLoading }}>
      {children}
    </WhiteLabelContext.Provider>
  );
}

export const useWhiteLabel = () => useContext(WhiteLabelContext);
