import React, { useState, useEffect } from 'react';
import { SearchResult } from '../types';
import { getTextWidth } from '../utils/textWidth';

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
  const [activeTab, setActiveTab] = useState<'translations' | 'synonyms'>('translations');

  useEffect(() => {
    loadTranslations();
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
      <div className="flex items-center justify-between p-4 border-b border-figma-border">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="btn-icon"
            title="뒤로가기"
          >
            ←
          </button>
          <h2 className="text-base font-semibold">상세 검색 결과</h2>
        </div>

        <div className="flex gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="detailTab"
              checked={activeTab === 'translations'}
              onChange={() => setActiveTab('translations')}
              className="accent-figma-primary"
            />
            <span className="text-sm">번역 확인</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="detailTab"
              checked={activeTab === 'synonyms'}
              onChange={() => setActiveTab('synonyms')}
              className="accent-figma-primary"
            />
            <span className="text-sm">유의어 확인</span>
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="mb-4 p-3 bg-figma-surface rounded border border-figma-border">
          <div className="text-xs text-figma-text-secondary mb-1">String ID</div>
          <div className="font-mono text-sm">{result.id}</div>
        </div>

        {activeTab === 'translations' ? (
          <div>
            <h3 className="text-sm font-semibold mb-3">모든 언어 번역</h3>
            {translations.length === 0 ? (
              <div className="text-figma-text-secondary text-sm">
                번역을 찾을 수 없습니다.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-figma-border">
                  <tr>
                    <th className="text-left p-3 font-medium text-figma-text-secondary">
                      언어
                    </th>
                    <th className="text-left p-3 font-medium text-figma-text-secondary">
                      String
                    </th>
                    <th className="w-20 p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {translations.map((trans, idx) => (
                    <tr key={idx} className="border-b border-figma-border">
                      <td className="p-3 text-figma-text-secondary">
                        {trans.filename.toUpperCase()}
                      </td>
                      <td className="p-3">{trans.value}</td>
                      <td className="p-3">
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
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-semibold mb-3">유사한 String</h3>
            <div className="text-figma-text-secondary text-sm">
              유사한 String이 없습니다.
              <div className="mt-2 text-xs">
                (향후 한국어 의미론적 유사도 검색 기능이 추가될 예정입니다)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
