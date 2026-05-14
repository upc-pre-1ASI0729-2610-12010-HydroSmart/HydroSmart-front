import { Provider } from '@angular/core';
import { TranslationService } from './translation.service';
import esTranslations from '../../infrastructure/i18n/es.json';
import enTranslations from '../../infrastructure/i18n/en.json';

export function provideI18n(): Provider[] {
  return [
    {
      provide: 'I18N_INITIALIZER',
      useFactory: (i18n: TranslationService) => {
        i18n.loadTranslations('es', esTranslations);
        i18n.loadTranslations('en', enTranslations);
        return i18n;
      },
      deps: [TranslationService],
    },
  ];
}
