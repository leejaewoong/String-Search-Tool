import React, { useState, useEffect } from 'react';
import { SearchResult } from '../types';
import { getTextWidth } from '../utils/textWidth';
import { getLanguageTooltip } from '../utils/languageMetadata';

interface DetailViewProps {
  result: SearchResult;
  onClose: () => void;
  onCopy: (text: string) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
  result,
  onClose,
  onCopy,
}) => {
  const [translations, setTranslations] = useState<SearchResult[]>([]);
  const [hasTrackedTranslations, setHasTrackedTranslations] = useState(false);

  // result 변경 시 번역 로드 및 플래그 초기화
  useEffect(() => {
    loadTranslations();
    setHasTrackedTranslations(false);
  }, [result]);

  const loadTranslations = async () => {
    const results = await window.electron.searchTranslations(result.id);

    // 실제 텍스트 렌더링 너비로 정렬 (내림차순)
    const sortedResults = results.sort((a, b) => {
      const widthA = getTextWidth(a.value);
      const widthB = getTextWidth(b.value);
      return widthB - widthA;
    });

    setTranslations(sortedResults);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-figma-border h-20">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="btn-icon"
            title="뒤로가기"
          >
            ←
          </button>
          <h2 className="text-base font-semibold">상세 검색 결과</h2>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 min-h-0">
        <div className="mb-4 p-3 bg-figma-surface rounded border border-figma-border flex-shrink-0">
          <div className="text-xs text-figma-text-secondary mb-1">String ID</div>
          <div className="font-mono text-sm">{result.id}</div>
        </div>

        {translations.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-figma-text-secondary gap-4">
            번역을 찾을 수 없습니다.
          </div>
        ) : (
          <div className="border border-figma-border rounded overflow-hidden flex-1 flex flex-col min-h-0">
            <div className="overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead className="sticky top-0 border-b border-figma-border bg-figma-bg z-10">
                  <tr>
                    <th className="w-20 text-left p-3 font-medium">
                      언어
                    </th>
                    <th className="text-left p-3 font-medium">
                      String (표시 너비 순)
                    </th>
                    <th className="w-20 p-3 font-medium">
                      클립보드
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {translations.map((trans, idx) => (
                    <tr
                      key={idx}
                      className="table-row border-b border-figma-border"
                    >
                      <td
                        className="p-3 text-figma-text-secondary cursor-help"
                        title={getLanguageTooltip(trans.filename)}
                      >
                        {trans.filename.toUpperCase()}
                      </td>
                      <td className="p-3  text-figma-text-secondary">{trans.value}</td>
                      <td className="pl-6">
                        <button
                          onClick={() => onCopy(trans.value)}
                          className="btn-icon text-xs"
                          title="클립보드에 복사"
                        >
                          📋
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
