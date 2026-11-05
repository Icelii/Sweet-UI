import { app } from './app';
import { auth } from './auth';
import { components } from './components';
import { dashboard } from './dashboard';
import { chat } from './chat';
import { demos } from './demos';

/** Spanish. Its keys define every valid TranslationKey. */
export const es = { ...app, ...auth, ...components, ...dashboard, ...chat, ...demos };
