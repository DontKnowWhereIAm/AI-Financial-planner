import React, { useState } from 'react';
import { Upload, FileText } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Bank Statements</h2>
        <p className="text-gray-600 mb-6">Upload your bank statements in PDF, CSV, or Excel format. We'll automatically extract and categorize your transactions.</p>
        
        <div className="border-2 border-dashed border-indigo-300 rounded-xl p-12 text-center bg-indigo-50 hover:bg-indigo-100 transition-colors">
          <Upload className="mx-auto text-indigo-600 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Drop your files here</h3>
          <p className="text-gray-600 mb-4">or click to browse</p>
          <input
            type="file"
            multiple
            accept=".pdf,.csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Select Files
          </label>
          <p className="text-sm text-gray-500 mt-4">Supports PDF, CSV, and Excel files</p>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Statements</h3>
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="text-indigo-600" size={24} />
                  <div>
                    <p className="font-semibold text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-600">{file.size} • Uploaded on {file.date}</p>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                  Processed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 mb-2">📊 How Statement Processing Works</h4>
        <ul className="text-blue-800 space-y-2 text-sm">
          <li>• We extract transaction data from your statements automatically</li>
          <li>• Transactions are categorized using smart algorithms</li>
          <li>• Your data is processed securely and never stored permanently</li>
          <li>• You can review and edit categories before finalizing</li>
        </ul>
      </div>
    </div>
  );
}