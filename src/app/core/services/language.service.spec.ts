import { TestBed } from '@angular/core/testing';
import { TranslateService, TranslateFakeLoader, TranslateLoader } from '@ngx-translate/core';
import { LanguageService, Language, SUPPORTED_LANGUAGES } from './language.service';

/**
 * LanguageService Unit Tests
 *
 * Tests for language management service with factory pattern
 */
describe('LanguageService', () => {
  let translateService: TranslateService;
  let languageService: ReturnType<typeof LanguageService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TranslateService,
          useFactory: () => ({
            use: jasmine.createSpy(),
            getBrowserLang: jasmine.createSpy(),
            setDefaultLang: jasmine.createSpy(),
          }),
        },
      ],
    });

    translateService = TestBed.inject(TranslateService);
    languageService = LanguageService();

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create service', () => {
    expect(languageService).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have currentLanguage signal', () => {
      expect(languageService.currentLanguage()).toBeDefined();
      expect(typeof languageService.currentLanguage()).toBe('string');
    });

    it('should default to Spanish', () => {
      expect(languageService.getCurrentLanguage()).toBe('es');
    });

    it('should have SUPPORTED_LANGUAGES constant', () => {
      expect(SUPPORTED_LANGUAGES).toEqual({
        es: 'Español',
        en: 'English',
      });
    });
  });

  describe('setLanguage() method', () => {
    it('should set language to Spanish', () => {
      languageService.setLanguage('es');

      expect(languageService.getCurrentLanguage()).toBe('es');
      expect(translateService.use).toHaveBeenCalledWith('es');
      expect(localStorage.getItem('foodie_language')).toBe('es');
    });

    it('should set language to English', () => {
      languageService.setLanguage('en');

      expect(languageService.getCurrentLanguage()).toBe('en');
      expect(translateService.use).toHaveBeenCalledWith('en');
      expect(localStorage.getItem('foodie_language')).toBe('en');
    });

    it('should update currentLanguage signal', () => {
      languageService.setLanguage('en');

      expect(languageService.currentLanguage()).toBe('en');
    });

    it('should save to localStorage', () => {
      languageService.setLanguage('es');

      expect(localStorage.getItem('foodie_language')).toBe('es');
    });

    it('should call translate.use with correct language', () => {
      languageService.setLanguage('en');

      expect(translateService.use).toHaveBeenCalledTimes(1);
      expect(translateService.use).toHaveBeenCalledWith('en');
    });
  });

  describe('getCurrentLanguage() method', () => {
    it('should return current language', () => {
      languageService.setLanguage('es');

      expect(languageService.getCurrentLanguage()).toBe('es');
    });

    it('should return updated language after change', () => {
      languageService.setLanguage('en');

      expect(languageService.getCurrentLanguage()).toBe('en');
    });
  });

  describe('toggleLanguage() method', () => {
    it('should toggle from Spanish to English', () => {
      languageService.setLanguage('es');
      languageService.toggleLanguage();

      expect(languageService.getCurrentLanguage()).toBe('en');
    });

    it('should toggle from English to Spanish', () => {
      languageService.setLanguage('en');
      languageService.toggleLanguage();

      expect(languageService.getCurrentLanguage()).toBe('es');
    });

    it('should call translate.use with new language', () => {
      languageService.setLanguage('es');
      languageService.toggleLanguage();

      expect(translateService.use).toHaveBeenCalledWith('en');
    });

    it('should save to localStorage after toggle', () => {
      languageService.setLanguage('es');
      languageService.toggleLanguage();

      expect(localStorage.getItem('foodie_language')).toBe('en');
    });
  });

  describe('initializeLanguage() method', () => {
    it('should use saved language from localStorage', () => {
      localStorage.setItem('foodie_language', 'en');

      languageService.initializeLanguage();

      expect(languageService.getCurrentLanguage()).toBe('en');
      expect(translateService.use).toHaveBeenCalledWith('en');
    });

    it('should use browser language if no saved language', () => {
      (translateService.getBrowserLang as any).and.returnValue('en');

      languageService.initializeLanguage();

      expect(languageService.getCurrentLanguage()).toBe('en');
    });

    it('should default to Spanish if browser language not supported', () => {
      (translateService.getBrowserLang as any).and.returnValue('fr');

      languageService.initializeLanguage();

      expect(languageService.getCurrentLanguage()).toBe('es');
    });

    it('should prioritize localStorage over browser language', () => {
      localStorage.setItem('foodie_language', 'es');
      (translateService.getBrowserLang as any).and.returnValue('en');

      languageService.initializeLanguage();

      expect(languageService.getCurrentLanguage()).toBe('es');
    });

    it('should handle invalid localStorage value', () => {
      localStorage.setItem('foodie_language', 'invalid');

      (translateService.getBrowserLang as any).and.returnValue('en');

      languageService.initializeLanguage();

      expect(languageService.getCurrentLanguage()).toBe('en');
    });

    it('should default to Spanish if no localStorage and no browser language', () => {
      (translateService.getBrowserLang as any).and.returnValue(null);

      languageService.initializeLanguage();

      expect(languageService.getCurrentLanguage()).toBe('es');
    });
  });

  describe('currentLanguage signal', () => {
    it('should be reactive', () => {
      const values: Language[] = [];

      // Simulate signal subscription
      values.push(languageService.currentLanguage());
      languageService.setLanguage('en');
      values.push(languageService.currentLanguage());
      languageService.setLanguage('es');
      values.push(languageService.currentLanguage());

      expect(values).toEqual(['es', 'en', 'es']);
    });

    it('should update when setLanguage is called', () => {
      expect(languageService.currentLanguage()).toBe('es');

      languageService.setLanguage('en');

      expect(languageService.currentLanguage()).toBe('en');
    });

    it('should update when toggleLanguage is called', () => {
      languageService.setLanguage('es');

      languageService.toggleLanguage();

      expect(languageService.currentLanguage()).toBe('en');
    });
  });

  describe('language persistence', () => {
    it('should persist language across service instances', () => {
      const service1 = LanguageService();
      service1.setLanguage('en');

      const service2 = LanguageService();
      service2.initializeLanguage();

      expect(service2.getCurrentLanguage()).toBe('en');
    });

    it('should handle missing localStorage gracefully', () => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jasmine.createSpy();

      (translateService.getBrowserLang as any).and.returnValue('es');

      expect(() => {
        languageService.initializeLanguage();
      }).not.toThrow();

      localStorage.getItem = originalGetItem;
    });
  });

  describe('edge cases', () => {
    it('should handle rapid language changes', () => {
      languageService.setLanguage('es');
      languageService.setLanguage('en');
      languageService.setLanguage('es');
      languageService.setLanguage('en');

      expect(languageService.getCurrentLanguage()).toBe('en');
    });

    it('should handle toggle when already on a language', () => {
      languageService.setLanguage('es');

      languageService.toggleLanguage();
      expect(languageService.getCurrentLanguage()).toBe('en');

      languageService.toggleLanguage();
      expect(languageService.getCurrentLanguage()).toBe('es');
    });

    it('should handle same language set multiple times', () => {
      languageService.setLanguage('es');
      languageService.setLanguage('es');
      languageService.setLanguage('es');

      expect(languageService.getCurrentLanguage()).toBe('es');
      expect(localStorage.getItem('foodie_language')).toBe('es');
    });
  });

  describe('SUPPORTED_LANGUAGES', () => {
    it('should contain only Spanish and English', () => {
      const keys = Object.keys(SUPPORTED_LANGUAGES);
      expect(keys).toEqual(['es', 'en']);
    });

    it('should have correct display names', () => {
      expect(SUPPORTED_LANGUAGES.es).toBe('Español');
      expect(SUPPORTED_LANGUAGES.en).toBe('English');
    });
  });

  describe('TypeScript types', () => {
    it('should only accept valid languages', () => {
      const lang1: Language = 'es';
      const lang2: Language = 'en';

      expect(lang1).toBe('es');
      expect(lang2).toBe('en');
    });

    it('should type check getCurrentLanguage return', () => {
      const lang: Language = languageService.getCurrentLanguage();

      expect(['es', 'en']).toContain(lang);
    });
  });
});
