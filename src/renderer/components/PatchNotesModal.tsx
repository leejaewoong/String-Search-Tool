import React, { useEffect, useState } from 'react';
import { marked } from 'marked';
import '../styles/PatchNotesModal.css';

interface PatchNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PatchNotesModal: React.FC<PatchNotesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [appVersion, setAppVersion] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadPatchNotes();
      loadAppVersion();
    }
  }, [isOpen]);

  const loadPatchNotes = async () => {
    try {
      const markdownContent = await window.electron.getPatchNotes();
      const html = await marked(markdownContent);
      setHtmlContent(html);
    } catch (error) {
      console.error('Failed to load patch notes:', error);
      setHtmlContent('<p>패치 노트를 불러오는데 실패했습니다.</p>');
    }
  };

  const loadAppVersion = async () => {
    try {
      const version = await window.electron.getAppVersion();
      setAppVersion(version);
    } catch (error) {
      console.error('Failed to load app version:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content patch-notes-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>패치 노트</h2>
          {appVersion && <span className="app-version">현재 버전: v{appVersion}</span>}
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div
          className="modal-body patch-notes-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
};
