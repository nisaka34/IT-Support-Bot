import { GoogleGenAI, GenerateContentResponse, Type, FunctionDeclaration } from "@google/genai";
import { SYSTEM_PROMPT_TEMPLATE, Message, Language } from '../types';
import { WELCOME_MESSAGES, LANGUAGE_NAMES } from '../constants';
import { db } from './database';

let chatSession: any = null;
let currentKnowledgeBase = "";
let currentLanguage: Language = 'en';

const tools: { functionDeclarations: FunctionDeclaration[] }[] = [{
  functionDeclarations: [
    {
      name: 'recordIncident',
      description: 'Collects and records a formal IT incident. ALWAYS call this when user provides their details (Name, Email, Dept, Summary, Desc, Urgency).',
      parameters: {
        type: Type.OBJECT,
        properties: {
          userName: { type: Type.STRING, description: 'User full name' },
          userEmail: { type: Type.STRING, description: 'User contact email' },
          department: { type: Type.STRING, description: 'User department' },
          summary: { type: Type.STRING, description: 'Short summary of issue' },
          description: { type: Type.STRING, description: 'Full problem description' },
          urgency: { type: Type.STRING, enum: ['Low', 'Medium', 'High'], description: 'Priority level' },
        },
        required: ['userName', 'userEmail', 'department', 'summary', 'description', 'urgency'],
      },
    },
    {
      name: 'recordFeedback',
      description: 'Records user feedback regarding the helpfulness of a solution.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          isHelpful: { type: Type.BOOLEAN },
          messageContent: { type: Type.STRING },
        },
        required: ['isHelpful', 'messageContent'],
      },
    }
  ]
}];

export const initializeChat = (knowledgeBaseContent: string, lang: Language = 'en') => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return;

  const ai = new GoogleGenAI({ apiKey });
  currentKnowledgeBase = knowledgeBaseContent;
  currentLanguage = lang;

  const fullSystemInstruction = SYSTEM_PROMPT_TEMPLATE
    .split('{{LANGUAGE_NAME}}').join(LANGUAGE_NAMES[lang]) + 
    `\n${knowledgeBaseContent}`;

  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: fullSystemInstruction,
      temperature: 0.1,
      tools: [...tools, { googleSearch: {} }],
    },
    history: [
      {
        role: 'model',
        parts: [{ text: WELCOME_MESSAGES[lang] }],
      },
    ],
  });
};

export const sendMessageStream = async function* (message: string) {
  if (!chatSession) initializeChat(currentKnowledgeBase, currentLanguage);

  try {
    const responseStream = await chatSession.sendMessageStream({ message });
    
    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      const parts = c.candidates?.[0]?.content?.parts || [];
      const groundingMetadata = c.candidates?.[0]?.groundingMetadata;

      if (groundingMetadata?.groundingChunks) {
        yield { type: 'grounding', data: groundingMetadata.groundingChunks };
      }

      for (const part of parts) {
        if (part.text) {
          yield { type: 'text', data: part.text };
        }

        if (part.functionCall) {
          const { name, args, id } = part.functionCall;
          let result = "ok";

          if (name === 'recordIncident') {
            const incident = args as any;
            db.saveIncident(incident);
            
            // Find the first admin to "send" the email to
            const admin = db.getAdmins()[0];
            const adminEmail = admin ? admin.email : 'admin@company.com';
            
            // Log the email in our database
            db.saveEmail({
              to: adminEmail,
              from: incident.userEmail,
              subject: `IT INCIDENT: ${incident.summary}`,
              body: `Reporter: ${incident.userName}\nDept: ${incident.department}\nUrgency: ${incident.urgency}\n\nDescription:\n${incident.description}`
            });

            result = `SUCCESS: Incident recorded and report emailed to ${adminEmail}. System ID assigned.`;
          } else if (name === 'recordFeedback') {
            db.saveFeedback({
              type: args.isHelpful ? 'positive' : 'negative',
              messageContent: args.messageContent as string,
            });
            result = `Feedback recorded.`;
          }

          const toolResponse = await chatSession.sendMessage({
            message: {
              parts: [{
                functionResponse: { name, id, response: { result } }
              }]
            }
          });
          
          const toolParts = toolResponse.candidates?.[0]?.content?.parts || [];
          for (const tPart of toolParts) {
            if (tPart.text) {
              yield { type: 'text', data: tPart.text };
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};

export const analyzeConversation = async (messages: Message[]) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });
  
  const transcript = messages.map(m => {
    const feedbackText = m.feedback ? ` [Feedback: ${m.feedback}]` : '';
    return `${m.role.toUpperCase()}: ${m.content}${feedbackText}`;
  }).join('\n\n');

  const analysisPrompt = `
    As the Admin Audit Agent, perform a deep forensic analysis of this support session.
    
    REPORT STRUCTURE:
    1. **Session Persona & Sentiment**: Analyze how the user felt and if sentiment shifted.
    2. **Resolution Efficiency**: Did the Agent solve it immediately? If not, why?
    3. **Knowledge Base Gaps**: Specify exactly what information was missing.
    4. **Agent Performance**: Evaluate flow adherence.
    5. **Action Items**: Concrete steps for IT Admin.

    TRANSCRIPT:
    ${transcript}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }],
      config: { temperature: 0.2 }
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    return parts.find(p => p.text)?.text || "Analysis failed.";
  } catch (error) {
    console.error("Analysis failed", error);
    throw error;
  }
};