import { useReducer } from 'react';
import { Prompt } from '@/features/prompts/prompt';
import { Knowledge } from '@/features/knowledge/knowledge';

export interface ChatInputState {
  message: string;
  images: string[];
  suggestions: Prompt[];
  promptIndex: number;
  selectedIndex: number;
  selectedKnowledgeIds: string[];
  knowledgeSuggestions: Knowledge[];
  knowledgeIndex: number;
  knowledgeSelectedIndex: number;
}

export const initialState: ChatInputState = {
  message: '',
  images: [],
  suggestions: [],
  promptIndex: -1,
  selectedIndex: 0,
  selectedKnowledgeIds: [],
  knowledgeSuggestions: [],
  knowledgeIndex: -1,
  knowledgeSelectedIndex: 0,
};

export type ChatInputAction =
  | { type: 'SET_MESSAGE'; payload: string }
  | { type: 'SET_IMAGES'; payload: string[] }
  | { type: 'ADD_IMAGE'; payload: string }
  | { type: 'REMOVE_IMAGE'; payload: number }
  | { type: 'SET_SUGGESTIONS'; payload: Prompt[] }
  | { type: 'SET_PROMPT_INDEX'; payload: number }
  | { type: 'SET_SELECTED_INDEX'; payload: number }
  | { type: 'SET_SELECTED_KNOWLEDGE_IDS'; payload: string[] }
  | { type: 'ADD_KNOWLEDGE_ID'; payload: string }
  | { type: 'REMOVE_KNOWLEDGE_ID'; payload: string }
  | { type: 'SET_KNOWLEDGE_SUGGESTIONS'; payload: Knowledge[] }
  | { type: 'SET_KNOWLEDGE_INDEX'; payload: number }
  | { type: 'SET_KNOWLEDGE_SELECTED_INDEX'; payload: number }
  | { type: 'RESET' };

function chatInputReducer(state: ChatInputState, action: ChatInputAction): ChatInputState {
  switch (action.type) {
    case 'SET_MESSAGE':
      return { ...state, message: action.payload };
    case 'SET_IMAGES':
      return { ...state, images: action.payload };
    case 'ADD_IMAGE':
      return { ...state, images: [...state.images, action.payload] };
    case 'REMOVE_IMAGE':
      return { ...state, images: state.images.filter((_, i) => i !== action.payload) };
    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.payload, selectedIndex: 0 };
    case 'SET_PROMPT_INDEX':
      return { ...state, promptIndex: action.payload };
    case 'SET_SELECTED_INDEX':
      return { ...state, selectedIndex: action.payload };
    case 'SET_SELECTED_KNOWLEDGE_IDS':
      return { ...state, selectedKnowledgeIds: action.payload };
    case 'ADD_KNOWLEDGE_ID':
      return {
        ...state,
        selectedKnowledgeIds: [...state.selectedKnowledgeIds, action.payload],
      };
    case 'REMOVE_KNOWLEDGE_ID':
      return {
        ...state,
        selectedKnowledgeIds: state.selectedKnowledgeIds.filter(id => id !== action.payload),
      };
    case 'SET_KNOWLEDGE_SUGGESTIONS':
      return { ...state, knowledgeSuggestions: action.payload, knowledgeSelectedIndex: 0 };
    case 'SET_KNOWLEDGE_INDEX':
      return { ...state, knowledgeIndex: action.payload };
    case 'SET_KNOWLEDGE_SELECTED_INDEX':
      return { ...state, knowledgeSelectedIndex: action.payload };
    case 'RESET':
      return {
        ...state,
        message: '',
        images: [],
        suggestions: [],
        knowledgeSuggestions: [],
      };
    default:
      return state;
  }
}

export function useChatInputState() {
  return useReducer(chatInputReducer, initialState);
} 