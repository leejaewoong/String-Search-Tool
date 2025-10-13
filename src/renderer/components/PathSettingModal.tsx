import React, { useState, useEffect } from 'react';

interface PathSettingModalProps {
  isOpen: boolean;
  currentPath: string;
  onClose: () => void;
  onConfirm: (path: string) => void;
  onBrowse: () => Promise<string | null>;
}

export const PathSettingModal: React.FC<PathSettingModalProps> = ({
  isOpen,
  currentPath,
  onClose,
  onConfirm,
  onBrowse,
}) => {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    setPath(currentPath);
  }, [currentPath, isOpen]);

  if (!isOpen) return null;

  const handleBrowse = async () => {
    const selectedPath = await onBrowse();
    if (selectedPath) {
      setPath(selectedPath);
    }
  };

  const handleConfirm = () => {
    if (path.trim()) {
      onConfirm(path);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">경로 설정</h2>

        <p className="text-sm text-figma-text-secondary mb-4">
          GDD의 ui 폴더 경로를 지정해주세요.
        </p>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="C:\path\to\ui\folder"
            className="input-field flex-1"
          />
          <button onClick={handleBrowse} className="btn-secondary">
            📁 폴더 선택
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!path.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
