import React, { useState, useEffect } from 'react';

interface StatusBarProps {
  lastUpdateTime: string | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({ lastUpdateTime }) => {
  const [version, setVersion] = useState('');

  useEffect(() => {
    // 앱 버전 가져오기
    window.electron.getAppVersion().then(setVersion);
  }, []);

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-figma-border text-xs text-figma-text-secondary">
      <div>
        {lastUpdateTime ? (
          <span>마지막 업데이트: {lastUpdateTime}</span>
        ) : (
          <span>경로를 설정해주세요</span>
        )}
      </div>
      <div>{version ? `v${version}` : 'v1.0.0'}</div>
    </div>
  );
};
