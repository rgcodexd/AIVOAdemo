import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from './store';
import { updateFormField, updateDynamicField, updateMultipleFields, resetForm, setExtractionState, addMessage } from './features/deviationSlice';
import { Bell, ChevronDown, CheckCircle2, RotateCcw, Save, Send, UploadCloud, Search, Zap, Paperclip, X, FileText } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';

function App() {
  const dispatch = useDispatch();
  const { form, ai } = useSelector((state: RootState) => state.deviation);
  const [inputText, setInputText] = useState('');
  const [selectedCompany] = useState('Vasudha Pharma Chem Limited');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const previousFormRef = useRef(form);
  const [updatedFields, setUpdatedFields] = useState<string[]>([]);

  useEffect(() => {
    const changed = Object.keys(form).filter(
      k => form[k as keyof typeof form] !== previousFormRef.current[k as keyof typeof form]
    );
    if (changed.length > 0) {
      setUpdatedFields(changed);
      const timer = setTimeout(() => setUpdatedFields([]), 1500);
      previousFormRef.current = form;
      return () => clearTimeout(timer);
    }
  }, [form]);

  const getFieldClass = (fieldName: string, extraClass: string = '') => {
    return `${extraClass} ${updatedFields.includes(fieldName) ? 'highlight-field' : ''}`.trim();
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    dispatch(updateFormField({ field: e.target.name as any, value: e.target.value }));
  };

  const handleProcessText = async (textToProcess: string) => {
    if (!textToProcess.trim()) return;
    
    // Optimistic UI update
    dispatch(setExtractionState({ isExtracting: true, progress: 10 }));
    dispatch(addMessage({ text: textToProcess, sender: 'user' }));
    setInputText('');
    
    // Fake progress animation
    let currentProgress = 10;
    const progressInterval = setInterval(() => {
      currentProgress += 15;
      if (currentProgress > 85) clearInterval(progressInterval);
      dispatch(setExtractionState({ isExtracting: true, progress: Math.min(currentProgress, 85) }));
    }, 400);

    try {
      // Call Backend API
      const response = await axios.post('http://localhost:8000/api/extract-deviation', { text: textToProcess, current_state: form });
      
      clearInterval(progressInterval);
      dispatch(setExtractionState({ isExtracting: true, progress: 100 }));
      
      setTimeout(() => {
        dispatch(setExtractionState({ isExtracting: false, progress: 0 }));
        
        // Populate form
        dispatch(updateMultipleFields(response.data.extracted_data));
        
        // Add AI response message
        dispatch(addMessage({ 
          text: `I've analyzed the text and updated the form for you. \n\nSuggested Impact: **${response.data.extracted_data.initialImpact}**\nSuggested Severity: **${response.data.extracted_data.initialSeverity}**\n\n${response.data.extracted_data.aiExplanation}`,
          sender: 'ai'
        }));
      }, 500);

    } catch (error) {
      console.error('Extraction failed:', error);
      clearInterval(progressInterval);
      dispatch(setExtractionState({ isExtracting: false, progress: 0 }));
      dispatch(addMessage({ text: 'Sorry, I encountered an error while processing that request. Please ensure the backend is running.', sender: 'ai' }));
    }
  };

  const handleSave = async () => {
    try {
      await axios.post('http://localhost:8000/api/save-deviation', form);
      alert('Deviation saved successfully!');
      dispatch(resetForm());
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save deviation. Is the backend running?');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (fileInputRef.current) fileInputRef.current.value = '';

      dispatch(setExtractionState({ isExtracting: true, progress: 10 }));
      dispatch(addMessage({ text: `Uploaded document: ${file.name}`, sender: 'user' }));
      
      const formData = new FormData();
      formData.append("file", file);

      let currentProgress = 10;
      const progressInterval = setInterval(() => {
        currentProgress += 15;
        if (currentProgress > 85) clearInterval(progressInterval);
        dispatch(setExtractionState({ isExtracting: true, progress: Math.min(currentProgress, 85) }));
      }, 400);

      try {
        const response = await axios.post('http://localhost:8000/api/upload-document', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        clearInterval(progressInterval);
        dispatch(setExtractionState({ isExtracting: true, progress: 100 }));
        
        setTimeout(() => {
          dispatch(setExtractionState({ isExtracting: false, progress: 0 }));
          dispatch(updateMultipleFields(response.data.extracted_data));
          dispatch(addMessage({ 
            text: `Complaint parsed successfully. I've extracted the product details, mapped the batch information, and generated an initial risk assessment for the issue.`,
            sender: 'ai'
          }));
        }, 500);
      } catch (error) {
        console.error('Upload failed:', error);
        clearInterval(progressInterval);
        dispatch(setExtractionState({ isExtracting: false, progress: 0 }));
        dispatch(addMessage({ text: 'Sorry, I could not extract details from that document.', sender: 'ai' }));
      }
    }
  };

  const handleSend = async () => {
    if (inputText.trim()) {
      handleProcessText(inputText);
    }
  };

  const getSeverityClass = (sev: string) => {
    if (!sev) return '';
    const s = sev.toLowerCase();
    if (s.includes('high') || s.includes('critical') || s.includes('major')) return 'severity-high';
    if (s.includes('medium') || s.includes('moderate')) return 'severity-medium';
    return 'severity-low';
  };

  // Group fields by section
  const sections = form.fields.reduce((acc, field) => {
    if (!acc[field.section]) acc[field.section] = [];
    acc[field.section].push(field);
    return acc;
  }, {} as Record<string, typeof form.fields>);

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="top-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div className="nav-brand">
            <div style={{ color: 'var(--primary-color)' }}>
              <Zap size={28} />
            </div>
            AIVOA
            <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-muted)' }}>Next-Gen AI Workspace</span>
          </div>
          <nav className="nav-links">
            <a href="#" className="active">Deviations Module</a>
          </nav>
        </div>
      </header>

      {/* Main Body */}
      <main className="main-content">
        {/* Form Panel */}
        <section className="form-panel">
          <div className="form-header">
            <div>
              <h1>{form.formTitle}</h1>
              <p>{form.formDescription}</p>
            </div>
            <span className="status-badge">Draft</span>
          </div>

          <div className="form-section">
            {form.fields.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No fields generated yet. Upload a document or chat to build the form.
              </div>
            ) : (
              Object.keys(sections).map((sectionName) => (
                <div key={sectionName} style={{ marginBottom: '32px' }}>
                  <div className="form-section-title-plain">{sectionName}</div>
                  <div className="form-grid">
                    {sections[sectionName].map((field) => (
                      <div className="form-group" key={field.id} style={{ gridColumn: field.type === 'textarea' ? 'span 2' : 'span 1' }}>
                        <label>{field.label}</label>
                        {field.type === 'textarea' ? (
                          <textarea
                            value={field.value}
                            onChange={(e) => dispatch(updateDynamicField({ id: field.id, value: e.target.value }))}
                            className={`input-bordered ${getFieldClass(field.id)}`}
                            placeholder={field.placeholder || ''}
                            style={{ height: '80px' }}
                          />
                        ) : field.type === 'select' ? (
                          <select
                            value={field.value}
                            onChange={(e) => dispatch(updateDynamicField({ id: field.id, value: e.target.value }))}
                            className={`input-bordered ${getFieldClass(field.id)}`}
                          >
                            {field.placeholder && <option value="">{field.placeholder}</option>}
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Quality Control (QC)">Quality Control (QC)</option>
                            <option value="Warehouse">Warehouse</option>
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            value={field.value}
                            onChange={(e) => dispatch(updateDynamicField({ id: field.id, value: e.target.value }))}
                            className={`input-bordered ${getFieldClass(field.id)}`}
                            placeholder={field.placeholder || ''}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {form.aiExplanation && (
            <div className="ai-risk-assessment-card">
              <div className="ai-risk-header">
                <Zap size={16} />
                <span>AI copilot risk assessment</span>
              </div>
              <div className="form-grid" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label style={{ color: 'var(--primary-color)' }}>Severity (Suggested)</label>
                  <input type="text" readOnly value={form.severity} className={`input-bordered ${getFieldClass('severity', getSeverityClass(form.severity))}`} />
                </div>
                <div className="form-group">
                  <label style={{ color: 'var(--primary-color)' }}>Suggested Next Action</label>
                  <input type="text" readOnly value={form.suggestedNextAction} className={`input-bordered ${getFieldClass('suggestedNextAction')}`} />
                </div>
              </div>
              <div className="form-group">
                <label style={{ color: 'var(--primary-color)' }}>Initial Risk Assessment</label>
                <textarea readOnly value={form.aiExplanation} className={`input-bordered ${getFieldClass('aiExplanation')}`} style={{ height: '60px' }} />
              </div>
            </div>
          )}

          <div className="form-footer">
            <button className="btn btn-outline" onClick={() => dispatch(resetForm())}>
              <RotateCcw size={16} /> Reset Form
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={form.fields.length === 0}>
              <Save size={16} /> Save Record
            </button>
          </div>
        </section>

        {/* AI Assistant Panel */}
        <section className="ai-panel">
          <div className="ai-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} />
              <span style={{ fontSize: '16px' }}>AI Deviation Assistant</span>
            </div>
            <span className="beta-badge">BETA</span>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileUpload} 
            accept=".pdf,.docx,.txt,.xls,.jpg,.png"
          />

          {ai.isExtracting && (
            <div className="progress-container">
              <div className="progress-header">
                <span>Extraction Progress</span>
                <span>{ai.progress}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${ai.progress}%` }}></div>
              </div>
              <div className="progress-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg className="spinner" viewBox="0 0 50 50">
                    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle>
                  </svg>
                  Analyzing document content and extracting key details...
                  Please wait, this may take a few moments.
                </div>
              </div>
            </div>
          )}

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '4px' }}>
            <div className="form-section-title" style={{ marginBottom: 0 }}>AI ASSISTANT</div>
            {ai.messages.map(msg => (
              <div key={msg.id} className="ai-message" style={{ 
                background: msg.sender === 'user' ? 'var(--surface-color)' : 'var(--accent-blue)',
                border: msg.sender === 'user' ? '1px solid var(--border-color)' : '1px solid #bfdbfe',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '90%'
              }}>
                {msg.sender === 'ai' && <div style={{ color: 'var(--primary-color)', flexShrink: 0 }}><Zap size={18}/></div>}
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
              </div>
            ))}
          </div>

          <div className="ai-textarea-container">
            <textarea 
              className="ai-textarea" 
              placeholder="Paste deviation details / notes or ask me anything..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleProcessText(inputText);
                }
              }}
            />
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', gap: '8px' }}>
              <button 
                className="ai-attach-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Attach Document"
              >
                <Paperclip size={18} />
              </button>
            </div>
            <button 
              className="ai-send-btn" 
              disabled={!inputText.trim() || ai.isExtracting}
              onClick={handleSend}
            >
              <Send size={14} />
            </button>
          </div>
          <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
            AI responses may contain errors. Please verify information.
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
