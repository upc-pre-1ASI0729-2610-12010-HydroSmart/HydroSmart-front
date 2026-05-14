import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Language = 'es' | 'en';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private currentLang = signal<Language>('es');
  private translations: Record<Language, Record<string, string>> = {
    es: {},
    en: {}
  };

  readonly lang = this.currentLang;
  readonly isEnglish = computed(() => this.currentLang() === 'en');

  loadTranslations(lang: Language, data: Record<string, string>): void {
    this.translations[lang] = data;
  }

  toggleLanguage(): void {
    this.currentLang.set(this.currentLang() === 'es' ? 'en' : 'es');
  }

  translate(key: string): string {
    return this.translations[this.currentLang()]?.[key] ?? key;
  }

  t(key: string): string {
    return this.translate(key);
  }
}
