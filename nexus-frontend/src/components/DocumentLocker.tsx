import React, { useState } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, ShieldAlert, PenTool } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  status: 'pending_signature' | 'fully_executed';
  sender: string;
}

export const DocumentLocker: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'doc-1',
      name: 'Seed_Round_Term_Sheet_Draft.pdf',
      size: '1.4 MB',
      uploadedAt: 'June 01, 2026',
      status: 'pending_signature',
      sender: 'VC Innovate Corp',
    },
    {
      id: 'doc-2',
      name: 'Mutual_Non_Disclosure_Agreement.pdf',
      size: '412 KB',
      uploadedAt: 'May 28, 2026',
      status: 'fully_executed',
      sender: 'You',
    },
  ]);

  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);
  const [signatureText, setSignatureText] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Handle fake file upload triggers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        status: 'pending_signature',
        sender: 'You',
      };
      setDocuments([newDoc, ...documents]);
    }
  };

  // Open e-sign workspace modal
  const openSignModal = (doc: Document) => {
    setActiveDoc(doc);
    setSignatureText('');
    setIsSigning(true);
  };

  // Execute signing simulated action
  const executeSignature = () => {
    if (!signatureText.trim() || !activeDoc) return;

    setDocuments(prevDocs =>
      prevDocs.map(doc =>
        doc.id === activeDoc.id ? { ...doc, status: 'fully_executed' } : doc
      )
    );
    setIsSigning(false);
    setActiveDoc(null);
  };

  return (
    <div className="space-y-6">
      {/* Drag & Drop Simulation Panel */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); /* Handle file drops if needed */ }}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}
      >
        <input
          type="file"
          id="doc-upload-input"
          className="hidden"
          accept=".pdf,.docx"
          onChange={handleFileUpload}
        />
        <label htmlFor="doc-upload-input" className="cursor-pointer flex flex-col items-center">
          <div className="p-4 bg-blue-50 rounded-full text-blue-600 mb-3">
            <Upload size={24} />
          </div>
          <p className="text-sm font-semibold text-gray-700">Upload a new agreement or pitch asset</p>
          <p className="text-xs text-gray-400 mt-1">Supports secure PDF and DOCX documents up to 25MB</p>
        </label>
      </div>

      {/* Document Directory Ledger */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <h3 className="font-semibold text-gray-800">Secure Boardroom Document Locker</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors hover:bg-gray-50/50">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-lg shrink-0">
                  <FileText size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 break-all">{doc.name}</h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                    <span>Size: {doc.size}</span>
                    <span>•</span>
                    <span>Uploaded: {doc.uploadedAt}</span>
                    <span>•</span>
                    <span>Origin: {doc.sender}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-3 sm:pt-0">
                {doc.status === 'fully_executed' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 font-medium text-xs rounded-full border border-green-200">
                    <CheckCircle size={14} /> Fully Executed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 font-medium text-xs rounded-full border border-amber-200">
                    <AlertCircle size={14} /> Awaiting E-Sign
                  </span>
                )}

                {doc.status === 'pending_signature' && (
                  <button
                    onClick={() => openSignModal(doc)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-sm transition-all"
                  >
                    <PenTool size={14} /> Sign Doc
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* E-Sign Simulated Workspace Modal Layout */}
      {isSigning && activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gray-900 text-white flex justify-between items-center">
              <h3 className="font-semibold text-sm tracking-wide">Nexus Crypto-Sign Framework</h3>
              <button onClick={() => setIsSigning(false)} className="text-gray-400 hover:text-white text-lg">×</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-100 flex items-start gap-3">
                <ShieldAlert className="text-blue-600 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-blue-800 leading-relaxed">
                  By signing this document, you append a valid audit trail checksum mapping this specific file to your profile context identity inside the Nexus ledger pipeline.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Document to Authorize</label>
                <div className="p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-800 border border-gray-100 truncate">
                  {activeDoc.name}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Type full legal name to bind</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {signatureText && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Digital Cryptographic Representation</label>
                  <div className="p-6 bg-amber-50/40 border border-amber-200 rounded-xl text-center font-serif text-2xl italic tracking-wider text-gray-800 select-none">
                    {signatureText}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setIsSigning(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium text-xs hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={executeSignature}
                disabled={!signatureText.trim()}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-medium text-xs rounded-lg shadow-sm transition-all"
              >
                Apply Secure Signature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};