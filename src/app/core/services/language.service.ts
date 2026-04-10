import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'es' | 'en';

export const SUPPORTED_LANGUAGES: Record<Language, string> = {
  es: 'Español',
  en: 'English',
};

/**
 * Service for managing application language
 */
export const LanguageService = () => {
  const translate = inject(TranslateService);

  const currentLanguage = signal<Language>('es');

  /**
   * Initialize language from localStorage or browser
   */
  const initializeLanguage = (): void => {
    // Try localStorage first
    const savedLang = localStorage.getItem('foodie_language') as Language | null;

    if (savedLang && (savedLang === 'es' || savedLang === 'en')) {
      setLanguage(savedLang);
      return;
    }

    // Fallback to browser language
    const browserLang = translate.getBrowserLang() as Language | null;
    const defaultLang = browserLang === 'es' || browserLang === 'en' ? browserLang : 'es';

    setLanguage(defaultLang);
  };

  /**
   * Set application language
   */
  const setLanguage = (lang: Language): void => {
    translate.use(lang);
    currentLanguage.set(lang);
    localStorage.setItem('foodie_language', lang);
  };

  /**
   * Get current language
   */
  const getCurrentLanguage = (): Language => {
    return currentLanguage();
  };

  /**
   * Toggle between languages
   */
  const toggleLanguage = (): void => {
    const newLang: Language = currentLanguage() === 'es' ? 'en' : 'es';
    setLanguage(newLang);
  };

  return {
    currentLanguage,
    initializeLanguage,
    setLanguage,
    getCurrentLanguage,
    toggleLanguage,
  };
};

// Import signal at the end to avoid circular dependency
import { signal } from '@angular/core';
