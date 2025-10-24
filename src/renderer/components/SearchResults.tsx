import React from 'react';
import { SearchResult } from '../types';

interface SearchResultsProps {
  results: SearchResult[];
  onRowClick: (result: SearchResult) => void;
  onCopy: (text: string) => void;
  hasSearched?: boolean;
  isSearchDisabled?: boolean;
  onShowPredicted?: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onRowClick,
  onCopy,
  hasSearched = false,
  isSearchDisabled = false,
  onShowPredicted,
}) => {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-figma-text-secondary gap-4">
        <div>
          {isSearchDisabled
            ? "먼저 우측 상단의 ⚙️을 통해 경로를 설정해주세요."
            : hasSearched
              ? '일치하는 String이 없습니다.'
              : '안녕하세요, 저는 UX Design팀에서 만든 프로그램입니다 : )'}
        </div>
        {hasSearched && !isSearchDisabled && onShowPredicted && (
          <button
            onClick={onShowPredicted}
            className="mt-5 px-4 py-2 bg-figma-primary text-white rounded hover:opacity-80 transition-opacity text-md font-medium"
          >
            AI 예상 번역 확인하기
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="border border-figma-border rounded overflow-hidden flex-1 flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-figma-bg border-b border-figma-border z-10">
              <tr>
                <th className="w-96 text-left p-3 font-medium">
                  String ID
                </th>
                <th className="text-left p-3 font-medium">
                  String
                </th>
                <th className="w-20 p-3 font-medium">
                  클립보드
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, idx) => (
                <tr
                  key={idx}
                  className="table-row border-b border-figma-border"
                  onDoubleClick={() => onRowClick(result)}
                >
                  <td className="p-3 text-figma-text-secondary">
                    {result.id}
                  </td>
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
  );
};
