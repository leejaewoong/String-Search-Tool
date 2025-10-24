import React from 'react';

interface PredictedTranslation {
  language: string;
  value: string;
}

interface PredictedTranslationsProps {
  translations: PredictedTranslation[];
  onCopy: (text: string) => void;
  onClose: () => void;
}

export const PredictedTranslations: React.FC<PredictedTranslationsProps> = ({
  translations,
  onCopy,
  onClose,
}) => {
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
      </div>

      <div className="flex-1 flex flex-col p-4 min-h-0">
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800 flex-shrink-0">
          <div className="text-xs text-yellow-800 dark:text-yellow-200">
            ⚠️ AI가 예측한 번역입니다. 실제 게임 데이터가 아닙니다.
          </div>
        </div>

        {translations.length === 0 ? (
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
                  {translations.map((trans, idx) => (
                    <tr
                      key={idx}
                      className="table-row border-b border-figma-border"
                    >
                      <td className="p-3 text-figma-text-secondary">
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
      </div>
    </div>
  );
};
