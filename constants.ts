import { KB_PASSWORD } from './kb_password';
import { KB_VPN } from './kb_vpn';
import { KB_PRINTER } from './kb_printer';
import { KB_EMAIL } from './kb_email';
import { KB_MATRIX } from './kb_matrix';
import { Language } from './types';

export const DEFAULT_KNOWLEDGE_BASE = `${KB_PASSWORD}\n${KB_VPN}\n${KB_PRINTER}\n${KB_EMAIL}\n${KB_MATRIX}`;

export const WELCOME_MESSAGES: Record<Language, string> = {
  en: "Hello, I am the IT support chatbot. How can I assist you today?",
  si: "ආයුබෝවන්, මම තොරතුරු තාක්ෂණ සහාය චැට්බොට් (IT Support Bot) වෙමි. අද මම ඔබට සහාය වන්නේ කෙසේද?",
  ta: "வணக்கம், நான் தகவல் தொழில்நுட்ப ஆதரவு சாட்போட். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?"
};

export const UI_TRANSLATIONS = {
  en: {
    botName: "IT Support Bot",
    publicAssistant: "Public Assistant",
    adminPanel: "Admin Panel",
    inputPlaceholder: "Ask a technical question or report an issue...",
    logout: "Logout",
    adminAccess: "Admin Access",
    adminControl: "Admin Control Center",
    manageKB: "Manage Knowledge Base",
    analyzeSession: "Analyze Session",
    systemUpdate: "System: Knowledge Base updated and language set to English.",
    sources: "Sources & References",
    helpful: "Helpful",
    notHelpful: "Not helpful",
    outbox: "Email Outbox",
  },
  si: {
    botName: "IT සහාය බොට්",
    publicAssistant: "පොදු සහායක",
    adminPanel: "පරිපාලක පුවරුව",
    inputPlaceholder: "තාක්ෂණික ගැටළුවක් විමසන්න හෝ වාර්තා කරන්න...",
    logout: "පිටවීම",
    adminAccess: "පරිපාලක පිවිසුම",
    adminControl: "පරිපාලක පාලන මධ්‍යස්ථානය",
    manageKB: "දැනුම් පදනම කළමනාකරණය",
    analyzeSession: "සැසිය විශ්ලේෂණය කරන්න",
    systemUpdate: "පද්ධතිය: දැනුම් පදනම යාවත්කාලීන කරන ලද අතර භාෂාව සිංහලට සකසන ලදී.",
    sources: "මූලාශ්‍ර සහ යොමු",
    helpful: "ප්‍රයෝජනවත්",
    notHelpful: "ප්‍රයෝජනවත් නොවේ",
    outbox: "විද්‍යුත් තැපැල් ලොගය",
  },
  ta: {
    botName: "IT ஆதரவு பாட்",
    publicAssistant: "பொது உதவியாளர்",
    adminPanel: "நிர்வாக குழு",
    inputPlaceholder: "தொழில்நுட்ப கேள்வி கேட்க அல்லது சிக்கலைப் புகாரளிக்க...",
    logout: "வெளியேறு",
    adminAccess: "நிர்வாகி அணுகல்",
    adminControl: "நிர்வாகக் கட்டுப்பாட்டு மையம்",
    manageKB: "அறிவுத் தளத்தை நிர்வகி",
    analyzeSession: "அமர்வை பகுப்பாய்வு செய்",
    systemUpdate: "கணினி: அறிவுத் தளம் புதுப்பிக்கப்பட்டது மற்றும் மொழி தமிழுக்கு மாற்றப்பட்டது.",
    sources: "ஆதாரங்கள் மற்றும் குறிப்புகள்",
    helpful: "உதவியாக இருந்தது",
    notHelpful: "உதவவில்லை",
    outbox: "மின்னஞ்சல் வெளியேறு",
  }
};

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  si: "Sinhala (සිංහල)",
  ta: "Tamil (தமிழ்)"
};