import React from 'react';
import { SearchResult } from '../types';
import { SearchMode } from './SearchBar';

interface SearchResultsProps {
  results: SearchResult[];
  synonymsList?: string[];
  onRowClick: (result: SearchResult) => void;
  onCopy: (text: string) => void;
  hasSearched?: boolean;
  isSearchDisabled?: boolean;
  searchMode: SearchMode;
  currentQuery?: string;
  onSearchWithMode?: (mode: SearchMode) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  synonymsList,
  onRowClick,
  onCopy,
  hasSearched = false,
  isSearchDisabled = false,
  searchMode,
  currentQuery = '',
  onSearchWithMode,
}) => {
  
  return (
    <div className="h-full flex flex-col">
      {hasSearched && (
        <div className="flex items-center justify-between p-4 border-b border-figma-border h-20">
          <h2 className="text-base font-semibold px-1">검색 결과 ({results.length}개)</h2>
        </div>
      )}

      {searchMode === 'synonym' && synonymsList && synonymsList.length > 0 && (
        <div className="p-4">
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

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-figma-text-secondary gap-4">
          <div>
            {isSearchDisabled
              ? "먼저 우측 상단의 ⚙️을 통해 경로를 설정해주세요."
              : hasSearched
                ? (searchMode === 'synonym'
                    ? (synonymsList && synonymsList.length > 0
                        ? '유의어 검색 결과가 없습니다.'
                        : '유의어를 찾을 수 없습니다.')
                    : '일치하는 String이 없습니다.')
                : 
                <div className="flex flex-row items-center gap-4 text-figma-text-secondary whitespace-pre-line" >
                  <p className="text-3xl">🐻🗝️</p>
                  <p>{`안녕하세요 : )
                  저는 UX Design팀에서 만든 프로그램입니다 ♫`}</p>
                </div>
              }
          </div>
          {hasSearched && !isSearchDisabled && searchMode === 'gdd' && onSearchWithMode && currentQuery && (
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => onSearchWithMode('ai')}
                className="px-4 py-2 bg-figma-bg-tertiary text-figma-text border border-figma-border rounded hover:bg-figma-hover transition-all"
                title="검색어의 예상 번역 결과를 확인합니다"
              >
                AI 번역
              </button>
              <button
                onClick={() => onSearchWithMode('synonym')}
                className="px-4 py-2 bg-figma-bg-tertiary text-figma-text border border-figma-border rounded hover:bg-figma-hover transition-all"
                title="GDD에 유의어가 등록되어 있는지 확인합니다"
              >
                유의어 검색
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 p-4 flex flex-col min-h-0">
          <div className="border border-figma-border rounded overflow-hidden flex-1 flex flex-col">
            <div className="overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead className="sticky top-0 border-b border-figma-border bg-figma-bg z-10">
                  <tr>
                    <th className="w-96 text-left p-3 font-medium">String ID</th>
                    <th className="text-left p-3 font-medium">String</th>
                    <th className="w-20 p-3 font-medium">클립보드</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => (
                    <tr
                      key={idx}
                      onClick={() => onRowClick(result)}
                      className="table-row cursor-pointer border-b border-figma-border"
                    >
                      <td className="p-3 text-figma-text-secondary">{result.id}</td>
                      <td className="p-3 text-figma-text-secondary">{result.value}</td>
                      <td className="pl-6">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCopy(result.value);
                          }}
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
        </div>
      )}
    </div>
  );
};
