import { I18nOptions, QueryResolver, HeaderResolver, CookieResolver, I18nJsonLoader } from 'nestjs-i18n';
import * as path from 'path';

export const i18nConfig: I18nOptions = {
  fallbackLanguage: 'vi',
  loaderOptions: {
    path: path.join(__dirname, '../i18n/'),
    watch: true,
  },
  loader: I18nJsonLoader,
  resolvers: [
    {
      use: QueryResolver,
      options: ['lang']
    },
    {
      use: HeaderResolver,
      options: ['accept-language']
    },
    {
      use: CookieResolver,
      options: ['lang']
    }
  ],
}; 