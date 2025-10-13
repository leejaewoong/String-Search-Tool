import React from 'react';

interface StatusBarProps {
  lastUpdateTime: string | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({ lastUpdateTime }) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-figma-border text-xs text-figma-text-secondary">
      <div>
        {lastUpdateTime ? (
          <span>마지막 업데이트: {lastUpdateTime}</span>
        ) : (
          <span>경로를 설정해주세요</span>
        )}
      </div>
      <div>v1.0.0</div>
    </div>
  );
};
