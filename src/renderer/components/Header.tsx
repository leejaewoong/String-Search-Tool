import React, { useState } from 'react';
import { PatchNotesModal } from './PatchNotesModal';

interface HeaderProps {
  selectedLanguage: string;
  languages: string[];
  onLanguageChange: (lang: string) => void;
  searchHistory: string[];
  onHistorySelect: (query: string) => void;
  onPathSetting: () => void;
  onGitPull: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedLanguage,
  languages,
  onLanguageChange,
  searchHistory,
  onHistorySelect,
  onPathSetting,
  onGitPull,
}) => {
  const [isPatchNotesOpen, setIsPatchNotesOpen] = useState(false);
  return (
    <div className="flex items-center justify-between p-4 border-b border-figma-border">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">String-Search</h1>              
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onPathSetting}
          className="btn-icon"
          title="경로 설정"
        >
          ⚙️
        </button>
        <button
          onClick={onGitPull}
          className="btn-icon"
          title="Git Pull"
        >
          🔄
        </button>        
        <button
          onClick={() => {
            window.electron.trackPatchNotesButtonClick();
            setIsPatchNotesOpen(true);
          }}
          className="btn-icon"
          title="패치 노트"
        >
          🗒️
        </button>
        <button
          onClick={() => {
            window.electron.trackGuideButtonClick();
            window.electron.openExternal('https://krafton.atlassian.net/wiki/spaces/~jaewoong/blog/2025/10/27/781238267/string-search-tool');
          }}
          className="btn-icon"
          title="사용 가이드"
        >
          ❓
        </button>
      </div>
      <PatchNotesModal
        isOpen={isPatchNotesOpen}
        onClose={() => setIsPatchNotesOpen(false)}
      />
    </div>
  );
};
