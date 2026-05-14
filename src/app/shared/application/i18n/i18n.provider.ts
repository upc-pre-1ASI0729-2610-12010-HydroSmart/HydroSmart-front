import { APP_INITIALIZER } from '@angular/core';
import { TranslationService } from './translation.service';
import esTranslations from '../../infrastructure/i18n/es.json';
import enTranslations from '../../infrastructure/i18n/en.json';

export function provideI18n() {
  return [
    {
      provide: APP_INITIALIZER,
      useFactory: (i18n: TranslationService) => () => {
        i18n.loadTranslations('es', esTranslations);
        i18n.loadTranslations('en', enTranslations);
      },
      deps: [TranslationService],
      multi: true,
    },
  ];
}
