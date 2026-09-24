import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface DeviationFormState {
  site: string;
  dateOfOccurrence: string;
  title: string;
  source: string;
  relatedProduct: string;
  batchNumber: string;
  description: string;
  initialImpact: string;
  initialSeverity: string;
  aiExplanation: string;
}

interface AIState {
  isExtracting: boolean;
  progress: number;
  messages: Array<{ id: string; text: string; sender: 'ai' | 'user' }>;
}

interface State {
  form: DeviationFormState;
  ai: AIState;
}

const initialFormState: DeviationFormState = {
  site: '',
  dateOfOccurrence: '',
  title: '',
  source: '',
  relatedProduct: '',
  batchNumber: '',
  description: '',
  initialImpact: '',
  initialSeverity: '',
  aiExplanation: ''
};

const initialState: State = {
  form: initialFormState,
  ai: {
    isExtracting: false,
    progress: 0,
    messages: [
      {
        id: '1',
        text: 'Upload a deviation report, lab result, or paste text above. I will automatically extract the relevant details and populate the form for you.',
        sender: 'ai'
      }
    ]
  }
};

const deviationSlice = createSlice({
  name: 'deviation',
  initialState,
  reducers: {
    updateFormField: (state, action: PayloadAction<{ field: keyof DeviationFormState; value: string }>) => {
      state.form[action.payload.field] = action.payload.value;
    },
    updateMultipleFields: (state, action: PayloadAction<Partial<DeviationFormState>>) => {
      state.form = { ...state.form, ...action.payload };
    },
    resetForm: (state) => {
      state.form = initialFormState;
    },
    setExtractionState: (state, action: PayloadAction<{ isExtracting: boolean; progress?: number }>) => {
      state.ai.isExtracting = action.payload.isExtracting;
      if (action.payload.progress !== undefined) {
        state.ai.progress = action.payload.progress;
      }
    },
    addMessage: (state, action: PayloadAction<{ text: string; sender: 'ai' | 'user' }>) => {
      state.ai.messages.push({
        id: Date.now().toString(),
        ...action.payload
      });
    }
  }
});

export const { updateFormField, updateMultipleFields, resetForm, setExtractionState, addMessage } = deviationSlice.actions;
export default deviationSlice.reducer;
