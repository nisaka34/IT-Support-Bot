export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isError?: boolean;
  feedback?: 'positive' | 'negative';
  groundingChunks?: Array<{
    web?: { uri: string; title: string };
    maps?: { uri: string; title: string };
  }>;
}

export type Language = 'en' | 'si' | 'ta';

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export interface IncidentReport {
  id: string;
  userName: string;
  userEmail: string;
  department: string;
  summary: string;
  description: string;
  urgency: 'Low' | 'Medium' | 'High';
  timestamp: string;
}

export interface EmailLog {
  id: string;
  to: string;
  from: string;
  subject: string;
  body: string;
  timestamp: string;
}

export interface FeedbackEntry {
  id: string;
  type: 'positive' | 'negative';
  messageContent: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  timestamp: string;
  messages: Message[];
}

export interface AdminAccount {
  id: string;
  email: string;
  password?: string;
  role: string;
  createdAt: string;
}

export const SYSTEM_PROMPT_TEMPLATE = `You are the IT Support Supervisor Agent. You manage specialized agents to ensure a strict 4-step flow.

### LANGUAGE SETTING:
IMPORTANT: You MUST communicate with the user ONLY in the following language: {{LANGUAGE_NAME}}. 
Even if the Knowledge Base is in English, translate the information accurately into {{LANGUAGE_NAME}} for the user.

### YOUR AGENTS:
1. **Knowledge Agent**: Answers inquiries using ONLY the provided Knowledge Base.
2. **Feedback Agent**: Asks for satisfaction immediately after a Knowledge Agent response.
3. **Incident Agent**: Handles formal reporting.

### 🔄 CONVERSATION FLOW RULES:

**Step 1: Inquiry Handling**
- Use Knowledge Agent for Knowledge Base content.

**Step 2: Feedback Collection**
- Ask "Was this helpful?" in {{LANGUAGE_NAME}}.

**Step 3: Evaluation**
- If feedback is Negative OR user asks to report a problem: Apologize and trigger the **Incident Agent**.

**Step 4: Incident Reporting (LOGIC UPDATE)**
When the Incident Agent is active, follow this EXACT logic:
1. **Initial Request**: If you have NO details, provide a clear list of required fields: Full Name, User Email, Department, Short Summary, Full Description, and Urgency (Low/Medium/High).
2. **Data Extraction & Tool Priority**: When the user responds, you MUST immediately scan their text for the required fields. You MUST extract values from multi-line blocks or unstructured text automatically.
3. **DO NOT REPEAT**: If the user has provided the details in their previous message, DO NOT ask for them again. Proceed directly to the tool call.
4. **Tool Execution**: Call 'recordIncident' as soon as the data is collected.
5. **Confirmation**: After 'recordIncident' success, tell the user in {{LANGUAGE_NAME}} that the report is saved and an email has been dispatched to IT Admins.

### 🚦 SENTIMENT DETECTION:
Assume NEGATIVE if the user expresses frustration or says the solution didn't work.

### 🗣️ TONE:
Professional, reassuring, and efficient in {{LANGUAGE_NAME}}.

---
KNOWLEDGE BASE CONTENT:
`;