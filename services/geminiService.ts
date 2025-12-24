import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT_TEMPLATE, Message } from '../types';
import { WELCOME_MESSAGE } from '../constants';

let chatSession: any = null;
let currentKnowledgeBase = "";

export const initializeChat = (knowledgeBaseContent: string) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Construct the full instruction with KB content
  const fullSystemInstruction = `${SYSTEM_PROMPT_TEMPLATE}\n${knowledgeBaseContent}`;
  currentKnowledgeBase = knowledgeBaseContent;

  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: fullSystemInstruction,
      temperature: 0.1, // Low temperature for high adherence to persona and KB
      topP: 0.95,
      topK: 40,
    },
    history: [
      {
        role: 'model',
        parts: [{ text: WELCOME_MESSAGE }],
      },
    ],
  });
};

export const sendMessageStream = async function* (message: string) {
  if (!chatSession) {
    initializeChat(currentKnowledgeBase);
  }

  if (!chatSession) {
    throw new Error("Failed to initialize chat session.");
  }

  try {
    const responseStream = await chatSession.sendMessageStream({ message });
    
    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && (error.message.includes("404") || error.message.includes("Expired"))) {
       initializeChat(currentKnowledgeBase);
    }
    throw error;
  }
};

/**
 * Analyzes the conversation history for administrative insights.
 * This function serves the "Admin Agent" requirements.
 */
export const analyzeConversation = async (messages: Message[]) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });
  
  const transcript = messages.map(m => {
    const feedbackText = m.feedback ? ` [Feedback: ${m.feedback}]` : '';
    return `${m.role.toUpperCase()}: ${m.content}${feedbackText}`;
  }).join('\n\n');

  const analysisPrompt = `
    As the Admin Agent, provide a detailed session-based administrative report.
    
    Structure your response with:
    1. **Frequent Issues**: Identify recurring themes or problems mentioned in this session.
    2. **Unresolved Incidents**: List any issues or reports that did not reach a successful conclusion.
    3. **Session Summary**: A high-level overview of the user interaction.
    4. **Knowledge Gaps**: Note any questions where the Knowledge Agent reported NOT FOUND.
    5. **Performance Metrics**: Brief evaluation of resolution effectiveness based on user feedback.

    CHAT TRANSCRIPT:
    ${transcript}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: analysisPrompt,
      config: {
        temperature: 0.2,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Analysis failed", error);
    throw error;
  }
};