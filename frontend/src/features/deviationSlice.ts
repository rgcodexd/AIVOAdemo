import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface DynamicField {
  id: string;
  label: string;
  value: string;
  type: string;
  section: string;
  placeholder?: string;
}

export interface DeviationFormState {
  formTitle: string;
  formDescription: string;
  fields: DynamicField[];
  severity: string;
  suggestedNextAction: string;
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
  formTitle: 'Log Customer Complaint',
  formDescription: 'API & FDF Quality Assurance Module',
  fields: [
    {
      id: 'defaultProductName',
      label: 'Product Name (API/FDF)',
      value: '',
      type: 'text',
      section: '1. PRODUCT & BATCH IDENTIFICATION',
      placeholder: 'Awaiting AI extraction...'
    },
    {
      id: 'defaultBatchNumber',
      label: 'Batch / Lot Number',
      value: '',
      type: 'text',
      section: '1. PRODUCT & BATCH IDENTIFICATION',
      placeholder: 'Awaiting AI extraction...'
    },
    {
      id: 'defaultOriginatingSite',
      label: 'Originating Site Block',
      value: '',
      type: 'select',
      section: '2. FACILITY & MATERIAL IMPACT',
      placeholder: 'Awaiting AI classification...'
    },
    {
      id: 'defaultNPM',
      label: 'Impacted Non-Product Materials (NPM)',
      value: '',
      type: 'text',
      section: '2. FACILITY & MATERIAL IMPACT',
      placeholder: 'e.g., Primary packaging...'
    },
    {
      id: 'defaultDefectSummary',
      label: 'Structured Defect Summary',
      value: '',
      type: 'textarea',
      section: '3. DEFECT ANALYSIS',
      placeholder: 'AI will synthesize the complaint into a formal QMS description...'
    }
  ],
  severity: '',
  suggestedNextAction: '',
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
        text: 'Ready to process new complaints. You can paste the raw email from the customer, or upload a PDF of the complaint report. I will extract the data and run the initial risk assessment.',
        sender: 'ai'
      }
    ]
  }
};

const deviationSlice = createSlice({
  name: 'deviation',
  initialState,
  reducers: {
    updateFormField: (state, action: PayloadAction<{ field: keyof DeviationFormState | string; value: string }>) => {
      if (['formTitle', 'formDescription', 'severity', 'suggestedNextAction', 'aiExplanation'].includes(action.payload.field as string)) {
        (state.form as any)[action.payload.field] = action.payload.value;
      }
    },
    updateDynamicField: (state, action: PayloadAction<{ id: string; value: string }>) => {
      const field = state.form.fields.find(f => f.id === action.payload.id);
      if (field) {
        field.value = action.payload.value;
      }
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

export const { updateFormField, updateDynamicField, updateMultipleFields, resetForm, setExtractionState, addMessage } = deviationSlice.actions;
export default deviationSlice.reducer;
