/**
 * Canvas를 이용해 텍스트의 실제 렌더링 너비를 측정합니다.
 *
 * @param text - 측정할 텍스트
 * @param font - CSS font 속성 (예: "14px Arial")
 * @returns 픽셀 단위의 너비
 */
export function getTextWidth(text: string, font: string = '14px system-ui, -apple-system, sans-serif'): number {
  // 캔버스 캐싱 (성능 최적화)
  const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
  const context = canvas.getContext('2d');

  if (!context) {
    // Canvas를 사용할 수 없으면 대략적인 글자수 기반 계산
    return text.length * 8;
  }

  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
}

// Canvas 인스턴스를 캐싱하기 위한 정적 프로퍼티
getTextWidth.canvas = null as HTMLCanvasElement | null;
