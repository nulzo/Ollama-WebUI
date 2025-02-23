import { OpenAIModelData, OllamaModel, ProviderModels, GoogleModel, AnthropicModel } from '../types/models';

interface FormattedModel {
  value: string;
  label: string;
  provider: 'ollama' | 'openai' | 'anthropic' | 'google';
  details: {
    size?: string;
    format?: string;
    quantization?: string;
    owner?: string;
  };
}

export const parseOpenAIModel = (modelData: OpenAIModelData) => {
  const modelObj: Record<string, string | number> = {};
  modelData.forEach(([key, value]) => {
    modelObj[key] = value;
  });
  return modelObj;
};

export const formatOllamaModel = (model: OllamaModel): FormattedModel => ({
  value: model.name,
  label: model.name,
  provider: 'ollama',
  details: {
    size: model.details.parameter_size,
    format: model.details.format,
    quantization: model.details.quantization_level,
  },
});

export const formatOpenAIModel = (modelData: OpenAIModelData): FormattedModel => {
  const model = parseOpenAIModel(modelData);
  return {
    value: model.id as string,
    label: model.id as string,
    provider: 'openai',
    details: {
      owner: model.owned_by as string,
    },
  };
};

export const formatAnthropicModel = (modelData: AnthropicModel): FormattedModel => {
  return {
    value: modelData.id,
    label: modelData.id,
    provider: 'anthropic',
    details: {},
  };
};

export const formatGoogleModel = (modelData: GoogleModel): FormattedModel => {
  return {
    value: modelData.id,
    label: modelData.id,
    provider: 'google',
    details: {},
  };
};


export const formatModels = (modelsData?: ProviderModels): FormattedModel[] => {
  if (!modelsData) return [];
   const formattedModels: FormattedModel[] = [];
   if (modelsData.ollama?.models) {
    formattedModels.push(...modelsData.ollama.models.map(formatOllamaModel));
  }
  if (modelsData.openai) {
    formattedModels.push(...modelsData.openai.map(formatOpenAIModel));
  }
  if (modelsData.anthropic) {
    formattedModels.push(...modelsData.anthropic.map(formatAnthropicModel));
  }
  if (modelsData.google) {
    formattedModels.push(...modelsData.google.map(formatGoogleModel));
  }
  return formattedModels;
};
