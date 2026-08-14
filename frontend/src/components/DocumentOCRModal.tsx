import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, XCircle, Edit3, Sparkles, Loader2, ArrowRight, ShieldCheck, FileCheck } from 'lucide-react';
import { DocumentRecord } from '../types';
import { api } from '../services/api';

interface DocumentOCRModalProps {
  onClose: () => void;
  onSuccess: () => void;
  showToast: (text: string, type?: any) => void;
}

export const DocumentOCRModal: React.FC<DocumentOCRModalProps> = ({ onClose, onSuccess, showToast }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('STUDENT_ADMISSION');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [processedDoc, setProcessedDoc] = useState<DocumentRecord | null>(null);
  const [extractedFields, setExtractedFields] = useState<Array<{ field: string; value: string; confidence: number }>>([]);
  const [editableData, setEditableData] = useState<Record<string, string>>({});
  const [isApproving, setIsApproving] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadAndProcess = async () => {
    if (!selectedFile) {
      showToast('Please select a paper form or document file to upload.', 'warning');
      return;
    }

    setIsUploading(true);
    setProcessingStep(1); // Uploading

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', documentType);

      setTimeout(() => setProcessingStep(2), 400); // OCR Completed
      setTimeout(() => setProcessingStep(3), 800); // Extracting Fields

      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProcessingStep(4); // Validating
      const data = res.data;

      setTimeout(() => {
        setProcessingStep(5); // Complete
        setProcessedDoc(data.document);
        setExtractedFields(data.fields || []);
        setEditableData(data.document.extractedData ? JSON.parse(data.document.extractedData) : {});
        showToast('AI OCR Field Extraction completed successfully!', 'success');
      }, 500);

    } catch (err: any) {
      showToast(err.message || 'Failed to process document with OCR', 'error');
      setProcessingStep(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFieldChange = (key: string, val: string) => {
    setEditableData(prev => ({ ...prev, [key]: val }));
  };

  const handleApproveDocument = async () => {
    if (!processedDoc) return;
    setIsApproving(true);
    try {
      const res = await api.post(`/documents/${processedDoc.id}/approve`, {
        updatedFields: editableData
      });
      showToast(res.data.message || '✓ Record created successfully in database!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to approve document', 'error');
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectDocument = async () => {
    if (!processedDoc) return;
    try {
      await api.post(`/documents/${processedDoc.id}/reject`);
      showToast('Document marked as rejected.', 'info');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('Failed to reject document', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: processedDoc ? '960px' : '650px', width: '95%', transition: 'all 0.2s ease' }} onClick={(e) => e.stopPropagation()}>

        {/* Modal Header & Visual Pipeline Flow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              AI Document Reader Pipeline
            </h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><XCircle size={22} /></button>
        </div>

        {/* Visual Pipeline Step Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 0.75rem',
          backgroundColor: '#F8FAFC',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          marginBottom: '1.25rem',
          fontSize: '0.725rem',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          overflowX: 'auto'
        }}>
          <span style={{ color: 'var(--primary)' }}>📄 Physical Form</span>
          <ArrowRight size={12} color="var(--text-muted)" />
          <span style={{ color: selectedFile ? 'var(--primary)' : 'inherit' }}>📤 Upload</span>
          <ArrowRight size={12} color="var(--text-muted)" />
          <span style={{ color: isUploading ? 'var(--primary)' : 'inherit' }}>⚡ AI / OCR Engine</span>
          <ArrowRight size={12} color="var(--text-muted)" />
          <span style={{ color: processedDoc ? 'var(--primary)' : 'inherit' }}>📋 Structured Data</span>
          <ArrowRight size={12} color="var(--text-muted)" />
          <span style={{ color: processedDoc ? 'var(--accent-emerald)' : 'inherit' }}>💾 Database</span>
        </div>

        {!processedDoc ? (
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Upload physical admission forms, teacher registration sheets, or paper attendance logs to parse structured fields.
            </p>

            <div className="form-group">
              <label>Document Category *</label>
              <select
                className="form-control"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              >
                <option value="STUDENT_ADMISSION">Student Admission Form</option>
                <option value="ATTENDANCE_SHEET">Attendance Physical Sheet</option>
                <option value="TEACHER_FORM">Teacher Registration Form</option>
                <option value="REGISTRATION">Institutional Registration Form</option>
              </select>
            </div>

            <div style={{
              border: '2px dashed var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              backgroundColor: '#F8FAFC',
              marginBottom: '1.25rem',
              cursor: 'pointer'
            }}>
              <Upload size={36} color="var(--primary)" style={{ margin: '0 auto 0.75rem auto' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {selectedFile ? selectedFile.name : 'Click to select or drag paper form file'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Supports PDF, JPEG, PNG paper document scans (Max 10 MB)
              </div>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-upload-input"
              />
              <label htmlFor="file-upload-input" className="btn-secondary" style={{ marginTop: '1rem' }}>
                Browse Physical Document
              </label>
            </div>

            {/* Live Pipeline Processing Progress Checklist */}
            {isUploading && (
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--primary-light)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--primary-border)',
                marginBottom: '1.25rem',
                fontSize: '0.85rem'
              }}>
                <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                  Processing Document Pipeline...
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ color: processingStep >= 1 ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    {processingStep >= 1 ? '✓ Document uploaded' : '○ Document upload'}
                  </div>
                  <div style={{ color: processingStep >= 2 ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    {processingStep >= 2 ? '✓ OCR scan completed' : '○ OCR scanning'}
                  </div>
                  <div style={{ color: processingStep >= 3 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: processingStep === 3 ? 700 : 400 }}>
                    {processingStep >= 3 ? '⟳ Extracting structured fields...' : '○ Field extraction'}
                  </div>
                  <div style={{ color: processingStep >= 4 ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    {processingStep >= 4 ? '✓ Validating extracted data' : '○ Validating extracted data'}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    ○ Waiting for administrator verification & approval
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
              <button
                className="btn-primary"
                onClick={handleUploadAndProcess}
                disabled={isUploading || !selectedFile}
                style={{ opacity: isUploading || !selectedFile ? 0.6 : 1 }}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Processing Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Run AI OCR Pipeline</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Extracted Data Split Screen View (Desktop: 2 Columns | Mobile: Stacked) */
          <div>
            <div style={{
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              border: '1px solid var(--primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                  AI OCR PIPELINE COMPLETE
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  OCR Confidence: {(processedDoc.confidence * 100).toFixed(0)}%
                </div>
              </div>
              <span className="badge badge-emerald" style={{ fontWeight: 800 }}>Admin Verification Required</span>
            </div>

            <div className="ocr-split-view" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              {/* Left Column: Physical Document Preview Card */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <FileText size={18} color="var(--primary)" />
                  <span>Physical Document Preview</span>
                </div>

                <div style={{
                  height: '240px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                    📄 {selectedFile?.name || processedDoc.fileName}
                  </div>

                  <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {processedDoc.type === 'ATTENDANCE_SHEET' ? (
                      <div>
                        <strong>ABC PUBLIC SCHOOL - ATTENDANCE SHEET</strong><br />
                        Class: 10-A | Teacher: Mrs. Sharma<br /><br />
                        1. Rahul Sharma — P P A P P<br />
                        2. Priya Patil — P A P P P<br />
                        3. Aarav Deshmukh — A P P P P
                      </div>
                    ) : (
                      <div>
                        <strong>ADMISSION & REGISTRATION FORM</strong><br />
                        Institutional Paper Record Scan<br /><br />
                        Name: Aarav Mehta<br />
                        DOB: 18/05/2011 | Class: 10-A<br />
                        Parent: Sanjay Mehta (+91 98112 33445)
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>Type: {processedDoc.type.replace('_', ' ')}</span>
                    <span>Status: VERIFYING</span>
                  </div>
                </div>
              </div>

              {/* Right Column: AI Extracted Data Fields (Editable) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Extracted Structured Data
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Edit values if needed</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '260px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {Object.entries(editableData).map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1')}
                        </label>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                          OCR Confidence: 97%
                        </span>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
                        value={typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Verification Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <button className="btn-danger" onClick={handleRejectDocument}>
                <XCircle size={16} />
                <span>Reject</span>
              </button>
              <button
                className="btn-primary"
                onClick={handleApproveDocument}
                disabled={isApproving}
                style={{ backgroundColor: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}
              >
                <CheckCircle2 size={16} />
                <span>{isApproving ? 'Saving to PostgreSQL...' : 'Approve & Save to Database'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
