import { GoogleGenAI, GenerateContentResponse, Chat, Part, Content } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// --- API KEY MANAGEMENT ---

/**
 * Recupera a API Key de múltiplas fontes possíveis para garantir funcionamento
 * em ambientes locais (Vite) e produção (Vercel/Node).
 */
const getApiKey = (): string | undefined => {
    // 1. Tenta process.env (Padrão do Google/Node)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        return process.env.API_KEY;
    }
    
    // 2. Tenta import.meta.env (Padrão Vite)
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
             // @ts-ignore
             return import.meta.env.VITE_API_KEY;
        }
    } catch (e) {
        console.warn("Aviso: Não foi possível acessar import.meta.env");
    }
    
    return undefined;
};

const API_KEY = getApiKey();
const TEXT_MODEL = "gemini-3-flash-preview"; // Modelo rápido e eficiente para chat

// --- STATE MANAGEMENT ---

let currentChatSession: Chat | null = null;

// --- SESSION HANDLING ---

const initSession = (apiKey: string, history: Content[] = []): Chat => {
  const ai = new GoogleGenAI({ apiKey });
  return ai.chats.create({
    model: TEXT_MODEL,
    history: history,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7, // Criatividade controlada para planos de ação
      maxOutputTokens: 2000,
    },
  });
};

const getSession = (): Chat => {
  if (!API_KEY) {
    throw new Error("API_KEY_MISSING");
  }
  
  if (!currentChatSession) {
    currentChatSession = initSession(API_KEY);
  }
  return currentChatSession;
};

// --- PUBLIC METHODS ---

export const sendMessageToGemini = async (
  message: string,
  imagePart?: { mimeType: string; data: string }
): Promise<string> => {
  
  if (!API_KEY) {
      return "⚠️ SISTEMA DESCONECTADO: Chave de API não encontrada.\n\nConfigure a variável 'VITE_API_KEY' (Vite) ou 'API_KEY' (Node) nas configurações do seu ambiente.";
  }

  // Prepara o conteúdo (Texto + Imagem Opcional)
  const parts: Part[] = [];
  if (imagePart) {
    parts.push({ inlineData: imagePart });
  }
  parts.push({ text: message });

  try {
    const session = getSession();
    const response: GenerateContentResponse = await session.sendMessage({ message: parts });
    
    return response.text || "⚠️ O Mentor recebeu a mensagem, mas a resposta veio vazia.";

  } catch (error: any) {
    console.error(`[Mentor System Error]:`, error);
    
    const errStr = error ? error.toString().toLowerCase() : "";

    if (errStr.includes("404") || errStr.includes("not found")) {
        // Tenta resetar a sessão em caso de erro de modelo/sessão
        currentChatSession = null;
        return "⚠️ ERRO DE MODELO: O modelo 'gemini-3-flash-preview' não está acessível com sua chave atual ou foi descontinuado.";
    }
    
    if (errStr.includes("429")) {
        return "⏳ SOBRECARGA: Muitos pedidos consecutivos. Respire fundo e tente novamente em 1 minuto.";
    }

    // Erro genérico
    return "❌ FALHA NO SISTEMA: Verifique sua conexão. Se persistir, reinicie a página.";
  }
};

export const generateMindMapText = async (topic: string): Promise<string | null> => {
  if (!API_KEY) return null;

  const prompt = `
    ATUE COMO O ARQUITETO DO CÓDIGO DA EVOLUÇÃO.
    OBJETIVO: Criar um MAPA MENTAL ASCII estritamente hierárquico sobre: "${topic}".
    
    ESTRUTURA OBRIGATÓRIA:
    - Use conectores de árvore (│, ├, └, ─).
    - SEM Markdown de bloco de código (\`\`\`).
    - SEM texto introdutório ou conclusões.
    - Foco em AÇÃO e CLAREZA.
    
    EXEMPLO:
    TEMA CENTRAL
    │
    ├── FASE 1: DIAGNÓSTICO
    │   ├── Sintoma
    │   └── Causa Raiz
    │
    └── FASE 2: CURA
        ├── Hábito Angular
        └── Rotina Blindada
  `;

  try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: { parts: [{ text: prompt }] },
        config: { temperature: 0.4 } // Menor temperatura para estrutura rígida
      });
      return response.text || null;
      
    } catch (error) {
      console.warn(`[MindMap Failed]:`, error);
      return null;
    }
};

/**
 * Reseta a sessão atual (útil para o botão "Nova Conversa")
 */
export const resetSession = () => {
    currentChatSession = null;
};