import type { Dictionary } from '../../translations';
import { app } from './app';
import { auth } from './auth';
import { components } from './components';
import { dashboard } from './dashboard';
import { chat } from './chat';
import { demos } from './demos';

export const en: Dictionary = { ...app, ...auth, ...components, ...dashboard, ...chat, ...demos };
