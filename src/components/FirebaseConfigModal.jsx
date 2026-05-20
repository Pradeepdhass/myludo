// Firebase Configuration Settings Modal
import React, { useState, useEffect } from 'react';
import { firebaseService } from '../services/firebase';
import { X, Check, RefreshCw, Trash2, Key } from 'lucide-react';

export const FirebaseConfigModal = ({ isOpen, onClose, onSave }) => {
  const [configText, setConfigText] = useState('');
  const [manualFields, setManualFields] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });
  const [useJson, setUseJson] = useState(true);
  const [status, setStatus] = useState('unconfigured'); // 'unconfigured', 'valid', 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const config = firebaseService.getFirebaseConfig();
    if (config) {
      setManualFields(config);
      setConfigText(JSON.stringify(config, null, 2));
      setStatus(firebaseService.isAvailable() ? 'valid' : 'error');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleJsonSave = () => {
    try {
      setErrorMsg('');
      // Find JSON block in pasted text (in case they pasted the whole snippet)
      let jsonStr = configText.trim();
      if (jsonStr.includes('{')) {
        const start = jsonStr.indexOf('{');
        const end = jsonStr.lastIndexOf('}') + 1;
        jsonStr = jsonStr.substring(start, end);
      }
      
      // Clean up javascript objects to valid JSON (replace unquoted keys or single quotes)
      // A simple fallback parser for common web snippets
      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (e) {
        // Simple regex fallback to parse JS object format
        const cleaned = jsonStr
          .replace(/'/g, '"') // single quotes to double quotes
          .replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":') // quote keys
          .replace(/,\s*([}\]])/g, '$1'); // remove trailing commas
        parsed = JSON.parse(cleaned);
      }

      if (!parsed.apiKey || !parsed.projectId) {
        throw new Error("Missing critical keys: apiKey, projectId");
      }

      const success = firebaseService.saveConfig(parsed);
      if (success) {
        setStatus('valid');
        if (onSave) onSave();
        onClose();
      } else {
        setStatus('error');
        setErrorMsg("Failed to initialize Firebase with these credentials. Check console.");
      }
    } catch (e) {
      setStatus('error');
      setErrorMsg("Invalid config format: " + e.message);
    }
  };

  const handleManualSave = () => {
    setErrorMsg('');
    const fields = { ...manualFields };
    Object.keys(fields).forEach(key => fields[key] = fields[key].trim());

    if (!fields.apiKey || !fields.projectId) {
      setStatus('error');
      setErrorMsg("apiKey and projectId are required.");
      return;
    }

    const success = firebaseService.saveConfig(fields);
    if (success) {
      setStatus('valid');
      if (onSave) onSave();
      onClose();
    } else {
      setStatus('error');
      setErrorMsg("Failed to initialize Firebase with these credentials.");
    }
  };

  const handleClear = () => {
    firebaseService.saveConfig(null);
    setConfigText('');
    setManualFields({
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    });
    setStatus('unconfigured');
    setErrorMsg('');
    if (onSave) onSave();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ textAlign: 'left', maxWidth: '550px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '22px' }}>
            <Key size={22} style={{ color: 'var(--color-yellow)' }} /> Firebase Credentials
          </h2>
          <button className="glass-button" style={{ padding: '6px', borderRadius: '50%' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Provide your Firebase config to play Online with Friends. Get this from Firebase Console → Project Settings → General → Web App config snippet.
        </p>

        {status === 'valid' && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px dashed var(--color-green)', color: 'var(--color-green)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={16} /> Firebase Connected Successfully! Online mode is enabled.
          </div>
        )}

        {status === 'error' && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px dashed var(--color-red)', color: 'var(--color-red)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '10px' }}>
          <button 
            className={`glass-button`} 
            style={{ padding: '6px 12px', fontSize: '12px', background: useJson ? 'rgba(255,255,255,0.1)' : 'transparent' }}
            onClick={() => setUseJson(true)}
          >
            Paste JSON Snippet
          </button>
          <button 
            className={`glass-button`} 
            style={{ padding: '6px 12px', fontSize: '12px', background: !useJson ? 'rgba(255,255,255,0.1)' : 'transparent' }}
            onClick={() => setUseJson(false)}
          >
            Manual Fields
          </button>
        </div>

        {useJson ? (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Pasted config object:</label>
            <textarea
              className="glass-input"
              rows={7}
              placeholder={`const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "ludo-game.firebaseapp.com",
  projectId: "ludo-game",
  ...
};`}
              style={{ fontFamily: 'monospace', fontSize: '12px', resize: 'vertical' }}
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
            />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            {Object.keys(manualFields).map(key => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'capitalize', marginBottom: '4px' }}>
                  {key.replace(/([A-Z])/g, ' $1')}:
                </label>
                <input
                  type="text"
                  className="glass-input"
                  style={{ padding: '8px 12px', fontSize: '13px' }}
                  value={manualFields[key] || ''}
                  onChange={(e) => setManualFields({ ...manualFields, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <button className="glass-button" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-red)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={handleClear}>
            <Trash2 size={16} /> Reset
          </button>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="glass-button" onClick={onClose}>Cancel</button>
            <button 
              className="glass-button" 
              style={{ background: 'var(--color-green)', color: '#ffffff', borderColor: 'transparent' }}
              onClick={useJson ? handleJsonSave : handleManualSave}
            >
              Save & Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FirebaseConfigModal;
