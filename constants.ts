import { KB_PASSWORD } from './kb_password';
import { KB_VPN } from './kb_vpn';
import { KB_PRINTER } from './kb_printer';
import { KB_EMAIL } from './kb_email';
import { KB_MATRIX } from './kb_matrix';

export const DEFAULT_KNOWLEDGE_BASE = `${KB_PASSWORD}\n${KB_VPN}\n${KB_PRINTER}\n${KB_EMAIL}\n${KB_MATRIX}`;
export const WELCOME_MESSAGE = "Hello, I am the IT support chatbot. How can I assist you today?";