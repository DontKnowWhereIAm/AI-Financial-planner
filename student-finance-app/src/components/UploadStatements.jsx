import React, { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import './UploadStatements.css';

export default function UploadStatements() {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    // optimistic add
    const toAdd = files.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      date: new Date().toLocaleDateString(),
      status: 'Uploading…'
    }));
    setUploadedFiles(prev => [...toAdd, ...prev]);

    // upload sequentially (simpler error handling)
    for (const f of files) {
      const id = toAdd.find(x => x.name === f.name)?.id;
      try {
        const form = new FormData();
        form.append('file', f);
        form.append('mode', 'all');      // or 'expenses'
        // form.append('assume', 'negative'); // optional
        // form.append('api_key', '...');     // normally not needed; use env on server

        // Use Vite proxy: '/api' goes to FastAPI
        const res = await fetch('/api/upload/statement', {
          method: 'POST',
          body: form
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        setUploadedFiles(prev => prev.map(item => item.id === id ? ({
          ...item,
          status: data.ok ? 'Processed' : 'Failed',
          output_csv: data.output_csv,
          rows: data.rows
        }) : item));
      } catch (err) {
        setUploadedFiles(prev => prev.map(item => item.id === id ? ({
          ...item,
          status: `Error: ${String(err).replace(/^Error:\s*/,'')}`
        }) : item));
      }
    }
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
                    {file.output_csv && (
                      <p style={{fontSize:'0.85rem', color:'#6b7280'}}>Rows: {file.rows} • Output: {file.output_csv}</p>
                    )}
                  </div>
                </div>
                <span className="file-status">{file.status}</span>
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
          <li>• Your CSV is saved to <code>student-finance-app/Test_documents</code></li>
          <li>• Overview updates from the latest CSV automatically</li>
        </ul>
      </div>
    </div>
  );
}
