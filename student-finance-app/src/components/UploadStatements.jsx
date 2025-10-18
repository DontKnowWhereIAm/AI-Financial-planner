import React, { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import './UploadStatements.css';

export default function UploadStatements() {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      date: new Date().toLocaleDateString()
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  return (
    <div>
      <div className="upload-container">
        <h2 className="mb-2">Upload Bank Statements</h2>
        <p className="mb-6">
          Upload your bank statements in PDF, CSV, or Excel format. We'll automatically extract and categorize your transactions.
        </p>
        
        <div className="upload-area">
          <Upload className="upload-icon" size={48} />
          <h3 className="mb-2">Drop your files here</h3>
          <p className="mb-4">or click to browse</p>
          <input
            type="file"
            multiple
            accept=".pdf,.csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="file-input"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="upload-label">
            Select Files
          </label>
          <p style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem'}}>
            Supports PDF, CSV, and Excel files
          </p>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h3 className="mb-4">Uploaded Statements</h3>
          <div>
            {uploadedFiles.map((file) => (
              <div key={file.id} className="file-item">
                <div className="file-info-container">
                  <FileText style={{color: '#4f46e5'}} size={24} />
                  <div className="file-details">
                    <h4>{file.name}</h4>
                    <p>{file.size} • Uploaded on {file.date}</p>
                  </div>
                </div>
                <span className="file-status">Processed</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="info-box">
        <h4>📊 How Statement Processing Works</h4>
        <ul>
          <li>• We extract transaction data from your statements automatically</li>
          <li>• Transactions are categorized using smart algorithms</li>
          <li>• Your data is processed securely and never stored permanently</li>
          <li>• You can review and edit categories before finalizing</li>
        </ul>
      </div>
    </div>
  );
}