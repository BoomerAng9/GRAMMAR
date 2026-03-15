"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { insforge } from '@/lib/insforge';

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

      // 2. Fetch from InsForge for "source of truth"
      if (insforge) {
        try {
          const { data, error } = await insforge.database
            .from('system_config')
            .select('*')
            .eq('id', 'global')
            .single();

          if (data && !error) {
            const dbConfig: WhiteLabelConfig = {
              systemName: data.system_name,
              tagline: data.tagline,
              primaryColor: data.primary_color,
              accentColor: data.accent_color,
              logoUrl: data.logo_url || '',
              faviconUrl: data.favicon_url || '',
            };
            setConfig(dbConfig);
            localStorage.setItem('grammar_white_label', JSON.stringify(dbConfig));
            applyStyles(dbConfig);
          }
        } catch (e) {
          console.error("Failed to fetch white-label from InsForge", e);
        }
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
    
    // Persist to InsForge
    if (insforge) {
      try {
        await insforge.database
          .from('system_config')
          .update({
            system_name: updated.systemName,
            tagline: updated.tagline,
            primary_color: updated.primaryColor,
            accent_color: updated.accentColor,
            logo_url: updated.logoUrl,
            favicon_url: updated.faviconUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', 'global');
      } catch (e) {
        console.error("Failed to save white-label to InsForge", e);
      }
    }
  };

  return (
    <WhiteLabelContext.Provider value={{ config, updateConfig, isLoading }}>
      {children}
    </WhiteLabelContext.Provider>
  );
}

export const useWhiteLabel = () => useContext(WhiteLabelContext);
