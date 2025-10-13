import React from 'react';
import { SearchResult } from '../types';

interface SearchResultsProps {
  results: SearchResult[];
  onRowClick: (result: SearchResult) => void;
  onCopy: (text: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onRowClick,
  onCopy,
}) => {
  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-figma-text-secondary">
        일치하는 String이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-figma-bg border-b border-figma-border z-10">
          <tr>
            <th className="text-left p-3 font-medium text-figma-text-secondary">
              String ID
            </th>
            <th className="text-left p-3 font-medium text-figma-text-secondary">
              String
            </th>
            <th className="w-20 p-3"></th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, idx) => (
            <tr
              key={idx}
              className="table-row border-b border-figma-border"
              onDoubleClick={() => onRowClick(result)}
            >
              <td className="p-3 font-mono text-figma-text-secondary text-xs">
                {result.id}
              </td>
              <td className="p-3">{result.value}</td>
              <td className="p-3">
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
  );
};
