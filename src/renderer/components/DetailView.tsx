import React, { useState, useEffect } from 'react';
import { SearchResult } from '../types';
import { getTextWidth } from '../utils/textWidth';
import { getLanguageTooltip } from '../utils/languageMetadata';

interface DetailViewProps {
  result: SearchResult;
  onClose: () => void;
  onCopy: (text: string) => void;
  selectedLanguage: string;
}

export const DetailView: React.FC<DetailViewProps> = ({
  result,
  onClose,
  onCopy,
  selectedLanguage,
}) => {
  const [translations, setTranslations] = useState<SearchResult[]>([]);
  const [synonyms, setSynonyms] = useState<SearchResult[]>([]);
  const [synonymsList, setSynonymsList] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'translations' | 'synonyms'>('translations');
  const [isLoadingSynonyms, setIsLoadingSynonyms] = useState(false);
  const [hasTrackedTranslations, setHasTrackedTranslations] = useState(false);
  const [hasTrackedSynonyms, setHasTrackedSynonyms] = useState(false);

  // result 변경 시 번역 로드 및 플래그 초기화
  useEffect(() => {
    loadTranslations();
    setHasTrackedTranslations(false);
    setHasTrackedSynonyms(false);
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

  const loadSynonyms = async () => {
    setIsLoadingSynonyms(true);
    try {
      // 현재 선택된 언어의 검색어로 유의어 검색
      const data = await window.electron.searchSynonyms(result.value, selectedLanguage);
      setSynonyms(data.results);
      setSynonymsList(data.synonymsList);
    } catch (error) {
      console.error('유의어 검색 오류:', error);
      setSynonyms([]);
      setSynonymsList([]);
    } finally {
      setIsLoadingSynonyms(false);
    }
  };

  // 번역 탭 선택 시 최초 1회만 로깅
  useEffect(() => {
    if (activeTab === 'translations' && !hasTrackedTranslations) {
      // Analytics: 번역 조회 이벤트 추적
      window.electron.trackTranslationsView();
      setHasTrackedTranslations(true);
    }
  }, [activeTab, hasTrackedTranslations]);

  // 유의어 탭 선택 시 로드 및 최초 1회만 로깅
  useEffect(() => {
    if (activeTab === 'synonyms' && !hasTrackedSynonyms) {
      loadSynonyms();
      // Analytics: 유의어 조회 이벤트 추적
      window.electron.trackSynonymsView();
      setHasTrackedSynonyms(true);
    }
  }, [activeTab, selectedLanguage, hasTrackedSynonyms]);

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

      <div className="flex-1 flex flex-col p-4 min-h-0">
        <div className="mb-4 p-3 bg-figma-surface rounded border border-figma-border flex-shrink-0">
          <div className="text-xs text-figma-text-secondary mb-1">String ID</div>
          <div className="font-mono text-sm">{result.id}</div>
        </div>

        {activeTab === 'translations' ? (
          <>
            {translations.length === 0 ? (
              <div className="text-figma-text-secondary text-sm">
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
          </>
        ) : (
          <>
            {isLoadingSynonyms ? (
              <div className="flex items-center justify-center h-32 text-figma-text-secondary">
                <div className="text-sm">유의어 검색 중...</div>
              </div>
            ) : (
              <>
                {/* WordNet 유의어 목록 표시 */}
                {synonymsList.length > 0 && (
                  <div className="mb-4 flex-shrink-0">
                    <div className="text-xs text-figma-text-secondary mb-2">
                      유의어 ({synonymsList.length}개)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {synonymsList.map((syn, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-figma-bg text-xs rounded border border-figma-border text-figma-text-secondary"
                        >
                          {syn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 검색 결과 표시 */}
                {synonyms.length === 0 ? (
                  <div className="text-figma-text-secondary text-sm">
                    {synonymsList.length > 0
                      ? '유의어 검색 결과가 없습니다.'
                      : '유의어를 찾을 수 없습니다.'}
                  </div>
                ) : (
                  <div className="border border-figma-border rounded overflow-hidden flex-1 flex flex-col min-h-0">
                    <div className="overflow-auto flex-1">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 border-b border-figma-border bg-figma-bg z-10">
                          <tr>
                            <th className="w-96 text-left p-3 font-medium">
                              String ID
                            </th>
                            <th className="text-left p-3 font-medium">
                              String (유의어 매칭)
                            </th>
                            <th className="w-20 p-3 font-medium">
                              클립보드
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {synonyms.map((syn, idx) => (
                            <tr
                              key={idx}
                              className="table-row border-b border-figma-border"
                            >
                              <td className="p-3 text-figma-text-secondary">
                                {syn.id}
                              </td>
                              <td className="p-3 text-figma-text-secondary">{syn.value}</td>
                              <td className="pl-6">
                                <button
                                  onClick={() => onCopy(syn.value)}
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
          </>
        )}
      </div>
    </div>
  );
};
