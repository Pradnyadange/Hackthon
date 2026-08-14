import React, { useState, useEffect } from 'react';
import { DocumentRecord } from '../types';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { DocumentOCRModal } from '../components/DocumentOCRModal';
import { FileSearch, Upload, Sparkles, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';

export const AIDocumentReader: React.FC = () => {
  const { showToast } = useApp();

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [selectedDocToReview, setSelectedDocToReview] = useState<DocumentRecord | null>(null);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data || []);
    } catch (err: any) {
      showToast('Failed to load documents list', 'error');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileSearch size={26} color="var(--primary)" />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              AI Document Digitization & OCR Verification Queue
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Automatically convert physical admission forms, teacher registrations, and paper files to PostgreSQL database records
            </p>
          </div>
        </div>

        <button onClick={() => setShowUploadModal(true)} className="btn-primary">
          <Upload size={16} />
          <span>Upload & Process Paper Form</span>
        </button>
      </div>

      {/* Documents Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Document Type</th>
              <th>Uploaded By</th>
              <th>Upload Date</th>
              <th>Confidence Score</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No uploaded document files found in queue.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{doc.fileName}</td>
                  <td>
                    <span className="badge badge-sky">
                      {doc.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{doc.uploadedBy?.name || 'Administrator'}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(doc.uploadDate).toLocaleDateString()}
                  </td>
                  <td>
                    <span className="badge badge-emerald" style={{ fontWeight: 800 }}>
                      {(doc.confidence * 100).toFixed(0)}% Match
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      doc.verificationStatus === 'APPROVED' ? 'badge-emerald' :
                      doc.verificationStatus === 'REJECTED' ? 'badge-rose' : 'badge-amber'
                    }`}>
                      {doc.verificationStatus}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        <Eye size={14} />
                        <span>Review Fields</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showUploadModal && (
        <DocumentOCRModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={fetchDocuments}
          showToast={showToast}
        />
      )}
    </div>
  );
};
