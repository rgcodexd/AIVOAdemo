import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from './store';
import { updateFormField, updateMultipleFields, resetForm, setExtractionState, addMessage } from './features/deviationSlice';
import { Bell, ChevronDown, CheckCircle2, RotateCcw, Save, Send, UploadCloud, Search, Zap } from 'lucide-react';
import axios from 'axios';

function App() {
  const dispatch = useDispatch();
  const { form, ai } = useSelector((state: RootState) => state.deviation);
  const [inputText, setInputText] = useState('');
  const [selectedCompany] = useState('Vasudha Pharma Chem Limited');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      const response = await axios.post('http://localhost:8000/api/extract-deviation', { text: textToProcess });
      
      clearInterval(progressInterval);
      dispatch(setExtractionState({ isExtracting: true, progress: 100 }));
      
      setTimeout(() => {
        dispatch(setExtractionState({ isExtracting: false, progress: 0 }));
        
        // Populate form
        dispatch(updateMultipleFields(response.data.extracted_data));
        
        // Add AI response message
        dispatch(addMessage({ 
          text: `I've analyzed the text and populated the form for you. \n\nSuggested Impact: **${response.data.extracted_data.initialImpact}**\nSuggested Severity: **${response.data.extracted_data.initialSeverity}**\n\n${response.data.extracted_data.aiExplanation}`,
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // In a real app we would upload the file to parse it or use OCR. 
      // For this demo, we'll simulate by processing a dummy text if it's a text file.
      const reader = new FileReader();
      reader.onload = (event) => {
         const text = event.target?.result as string;
         if (text) handleProcessText(text);
         else handleProcessText(`Processed uploaded file: ${file.name}`);
      };
      if (file.type.includes('text')) {
        reader.readAsText(file);
      } else {
        handleProcessText(`Please analyze this uploaded document: ${file.name}`);
      }
    }
  };

  const getSeverityClass = (sev: string) => {
    if (!sev) return '';
    const s = sev.toLowerCase();
    if (s.includes('high') || s.includes('critical')) return 'severity-high';
    if (s.includes('medium') || s.includes('moderate')) return 'severity-medium';
    return 'severity-low';
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="top-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div className="nav-brand">
            <div style={{ color: 'var(--primary-color)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/></svg>
            </div>
            AIVOA
            <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-muted)' }}>AI for a Safer Tomorrow</span>
          </div>
          <nav className="nav-links">
            <a href="#">QMS</a>
            <a href="#">Dashboard</a>
            <a href="#" className="active">Deviations</a>
            <a href="#">CAPAs</a>
            <a href="#">Change Control</a>
            <a href="#">Audits</a>
            <a href="#">Documents</a>
            <a href="#">Reports</a>
          </nav>
        </div>
        <div className="nav-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '13px', fontWeight: 500 }}>🏢 {selectedCompany}</span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>
          <Bell size={20} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
          <div style={{ width: '32px', height: '32px', background: '#1e293b', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
            MH
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="main-content">
        {/* Form Panel */}
        <section className="form-panel">
          <div className="form-header">
            <div>
              <h1>Log Deviation</h1>
              <p>Record any unexpected event, out-of-specification result or non-conformance.</p>
            </div>
            <span className="status-badge">Draft</span>
          </div>

          <div className="form-section">
            <div className="form-section-title">1. DEVIATION INFORMATION</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Site / Plant <span className="required">*</span></label>
                <select name="site" value={form.site} onChange={handleInputChange}>
                  <option value="">Select site</option>
                  <option value="API Manufacturing Unit">API Manufacturing Unit</option>
                  <option value="Formulation Unit">Formulation Unit</option>
                  <option value="Packaging Unit">Packaging Unit</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date of Occurrence <span className="required">*</span></label>
                <input type="date" name="dateOfOccurrence" value={form.dateOfOccurrence} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Title / Short Description <span className="required">*</span></label>
                <input type="text" name="title" value={form.title} onChange={handleInputChange} placeholder="e.g. OOS result for Assay in Batch ABC-001" />
              </div>
              <div className="form-group">
                <label>Source <span className="required">*</span></label>
                <select name="source" value={form.source} onChange={handleInputChange}>
                  <option value="">Select source</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Quality Control (QC)">Quality Control (QC)</option>
                  <option value="Engineering / Maintenance">Engineering / Maintenance</option>
                  <option value="Warehouse">Warehouse</option>
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group" style={{ position: 'relative' }}>
                <label>Related Product / Material</label>
                <input type="text" name="relatedProduct" value={form.relatedProduct} onChange={handleInputChange} placeholder="Search product or material..." />
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '32px' }} />
              </div>
              <div className="form-group">
                <label>Batch/Lot Number</label>
                <input type="text" name="batchNumber" value={form.batchNumber} onChange={handleInputChange} placeholder="Enter batch / lot no." />
              </div>
            </div>
          </div>

          <div className="form-section" style={{ marginTop: '16px' }}>
            <div className="form-section-title">2. DEVIATION DETAILS</div>
            <div className="form-group">
              <label>Detailed Description <span className="required">*</span></label>
              <textarea 
                name="description" 
                value={form.description} 
                onChange={handleInputChange} 
                placeholder="Describe what happened, where, when and how it was detected..."
                style={{ height: '140px' }}
              />
              <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>
                {form.description.length}/2000
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Initial Impact <span className="required">*</span></label>
                <select name="initialImpact" value={form.initialImpact} onChange={handleInputChange} className={getSeverityClass(form.initialImpact)}>
                  <option value="">Select impact</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="form-group">
                <label>Initial Severity <span className="required">*</span></label>
                <select name="initialSeverity" value={form.initialSeverity} onChange={handleInputChange} className={getSeverityClass(form.initialSeverity)}>
                  <option value="">Select severity</option>
                  <option value="Critical">Critical</option>
                  <option value="Major">Major</option>
                  <option value="Minor">Minor</option>
                </select>
              </div>
            </div>

            {form.aiExplanation && (
              <div className="ai-explanation">
                <Zap className="ai-explanation-icon" size={16} />
                <div>
                  <strong>AI Assessment:</strong> {form.aiExplanation}
                </div>
              </div>
            )}
          </div>

          <div className="form-footer">
            <button className="btn btn-outline" onClick={() => dispatch(resetForm())}>
              <RotateCcw size={16} /> Reset Form
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!form.title || !form.description}>
              <Save size={16} /> Save Deviation
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

          <div 
            className="ai-dropzone" 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                fileInputRef.current!.files = e.dataTransfer.files;
                handleFileUpload({ target: { files: e.dataTransfer.files } } as any);
              }
            }}
          >
            <UploadCloud size={32} className="ai-dropzone-icon" />
            <div className="ai-dropzone-text">
              Drag & drop supporting document here
            </div>
            <div className="ai-dropzone-sub">
              or click to browse
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileUpload} 
              accept=".pdf,.docx,.txt,.xls,.jpg,.png"
            />
          </div>
          
          <div className="supported-formats">
            <CheckCircle2 size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <strong>Supported formats:</strong> PDF, DOCX, TXT, XLS, JPG, PNG<br/>
              <span style={{ fontSize: '11px', opacity: 0.8 }}>Max file size: 10MB</span>
            </div>
          </div>

          <div className="divider">OR</div>

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
            <button 
              className="ai-send-btn" 
              disabled={!inputText.trim() || ai.isExtracting}
              onClick={() => handleProcessText(inputText)}
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
