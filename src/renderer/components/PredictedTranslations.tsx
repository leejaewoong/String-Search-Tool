import React, { useState, useEffect } from 'react';
import { getTextWidth } from '../utils/textWidth';
import { getLanguageTooltip } from '../utils/languageMetadata';

interface PredictedTranslation {
  language: string;
  value: string;
}

interface PredictedTranslationsProps {
  originalEnglish: string;
  translations: PredictedTranslation[];
  onCopy: (text: string) => void;
  onClose: () => void;
}

export const PredictedTranslations: React.FC<PredictedTranslationsProps> = ({
  originalEnglish,
  translations,
  onCopy,
  onClose,
}) => {
  const [sortedTranslations, setSortedTranslations] = useState<PredictedTranslation[]>([]);
  const [abbreviatedTranslations, setAbbreviatedTranslations] = useState<PredictedTranslation[]>([]);
  const [activeTab, setActiveTab] = useState<'formal' | 'abbreviated'>('formal');
  const [isLoadingAbbreviated, setIsLoadingAbbreviated] = useState(false);

  useEffect(() => {
    // 실제 텍스트 렌더링 너비로 정렬 (내림차순)
    const sorted = [...translations].sort((a, b) => {
      const widthA = getTextWidth(a.value);
      const widthB = getTextWidth(b.value);
      return widthB - widthA;
    });
    setSortedTranslations(sorted);
  }, [translations]);
  // 축약 번역 로드 함수
  const loadAbbreviatedTranslations = async () => {
    setIsLoadingAbbreviated(true);
    try {
      // 표시 너비 기준 상위 10개 선택
      const top10 = sortedTranslations.slice(0, 10);
      const languagesToAbbreviate = top10.map(t => t.language);

      // 축약 번역 요청 (원본 영어 텍스트 포함)
      const abbreviated = await window.electron.getAbbreviatedTranslations(
        originalEnglish,
        sortedTranslations,
        languagesToAbbreviate
      );

      setAbbreviatedTranslations(abbreviated);
    } catch (error) {
      console.error('축약 번역 로드 실패:', error);
      setAbbreviatedTranslations([]);
    } finally {
      setIsLoadingAbbreviated(false);
    }
  };

  // 축약 번역 탭 선택 시 로드
  useEffect(() => {
    if (activeTab === 'abbreviated' && abbreviatedTranslations.length === 0) {
      loadAbbreviatedTranslations();
    }
  }, [activeTab]);

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
          <h2 className="text-base font-semibold">AI 예상 번역</h2>
        </div>

        <div className="flex gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="predictedTab"
              checked={activeTab === 'formal'}
              onChange={() => setActiveTab('formal')}
              className="accent-figma-primary"
            />
            <span className="text-sm">정식 번역</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="predictedTab"
              checked={activeTab === 'abbreviated'}
              onChange={() => setActiveTab('abbreviated')}
              className="accent-figma-primary"
            />
            <span className="text-sm">축약 번역</span>
          </label>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 min-h-0">
        <div className="mb-4 p-3 bg-red-900 bg-opacity-50 rounded flex-shrink-0">
          <div className="text-sm text-white dark:text-black">
            ⚠️ AI가 예측한 번역입니다. 실제 게임 데이터가 아닙니다.
          </div>
        </div>

        {activeTab === 'formal' ? (
          <>
            {sortedTranslations.length === 0 ? (
              <div className="text-figma-text-secondary text-sm">
                예상 번역을 찾을 수 없습니다.
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
                          예상 번역
                        </th>
                        <th className="w-20 p-3 font-medium">
                          클립보드
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTranslations.map((trans, idx) => (
                        <tr
                          key={idx}
                          className="table-row border-b border-figma-border"
                        >
                          <td
                            className="p-3 text-figma-text-secondary cursor-help"
                            title={getLanguageTooltip(trans.language)}
                          >
                            {trans.language.toUpperCase()}
                          </td>
                          <td className="p-3 text-figma-text-secondary">{trans.value}</td>
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
          </>
        ) : (
          <>
            {isLoadingAbbreviated ? (
              <div className="flex items-center justify-center h-32 text-figma-text-secondary">
                <div className="text-sm">축약 번역 중...</div>
              </div>
            ) : abbreviatedTranslations.length === 0 ? (
              <div className="text-figma-text-secondary text-sm">
                축약 번역을 찾을 수 없습니다.
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
                          축약 번역
                        </th>
                        <th className="w-20 p-3 font-medium">
                          클립보드
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {abbreviatedTranslations.map((trans, idx) => (
                        <tr
                          key={idx}
                          className="table-row border-b border-figma-border"
                        >
                          <td
                            className="p-3 text-figma-text-secondary cursor-help"
                            title={getLanguageTooltip(trans.language)}
                          >
                            {trans.language.toUpperCase()}
                          </td>
                          <td className="p-3 text-figma-text-secondary">{trans.value}</td>
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
          </>
        )}
      </div>
    </div>
  );
};
