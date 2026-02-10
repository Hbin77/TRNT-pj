// 위저드 데이터 ↔ DB 필드 변환

// ── Step 1 데이터 타입 ──

export interface Step1Data {
  scenarios: Record<string, string>; // { decision: '직감형', change: '도전형', ... }
  mbti: string[]; // ['E','N','F','P'] 또는 빈 배열
  mbtiUnknown: boolean;
  keywords: string[];
}

// ── Step 2 데이터 타입 ──

export interface Step2Data {
  coreValues: string[];
  lifePriority: string;
  futureVision: string;
}

// ── Step 3 데이터 타입 ──

export interface Step3Data {
  turningPoint: string;
  currentConcern: string;
  ifAgain: string;
}

// ── Serialize (위저드 → DB 필드) ──

const SCENARIO_KEY_MAP: Record<string, string> = {
  decision: '결정',
  change: '변화',
  relationship: '관계',
  failure: '실패',
};

export function serializePersonality(data: Step1Data): string {
  // 결정:직감형/변화:도전형/관계:소수깊게/실패:분석개선|ENFP|감성적,모험적,낙천적
  const parts: string[] = [];

  // 시나리오 응답
  const scenarioParts = Object.entries(data.scenarios)
    .filter(([, v]) => v)
    .map(([k, v]) => `${SCENARIO_KEY_MAP[k] || k}:${v}`);
  if (scenarioParts.length > 0) parts.push(scenarioParts.join('/'));

  // MBTI
  if (!data.mbtiUnknown && data.mbti.length === 4) {
    parts.push(data.mbti.join(''));
  } else {
    parts.push('');
  }

  // 키워드
  parts.push(data.keywords.join(','));

  return parts.join('|');
}

export function serializeValues(data: Step2Data): string {
  // 자유,성장,도전,창의성,자아실현|삶의중심:자기성장과배움|10년후:내 사업을 운영하며...
  const parts: string[] = [];
  parts.push(data.coreValues.join(','));
  parts.push(`삶의중심:${data.lifePriority}`);
  if (data.futureVision.trim()) {
    parts.push(`10년후:${data.futureVision.trim()}`);
  }
  return parts.join('|');
}

export function serializeLifeBackground(data: Step3Data): string {
  const lines: string[] = [];
  if (data.turningPoint.trim()) {
    lines.push(`[인생 전환점] ${data.turningPoint.trim()}`);
  }
  if (data.currentConcern.trim()) {
    lines.push(`[현재 고민] ${data.currentConcern.trim()}`);
  }
  if (data.ifAgain.trim()) {
    lines.push(`[다시 선택한다면] ${data.ifAgain.trim()}`);
  }
  return lines.join('\n');
}

export function serializeKeyEvents(data: Step3Data): string {
  return data.turningPoint.trim();
}

// ── Deserialize (DB 필드 → 위저드 데이터) ──

const REVERSE_SCENARIO_KEY_MAP: Record<string, string> = {
  '결정': 'decision',
  '변화': 'change',
  '관계': 'relationship',
  '실패': 'failure',
};

export function deserializePersonality(raw: string): Step1Data {
  const result: Step1Data = {
    scenarios: {},
    mbti: [],
    mbtiUnknown: false,
    keywords: [],
  };

  if (!raw) return result;

  // 구조화된 포맷인지 확인: 파이프로 구분
  const parts = raw.split('|');
  if (parts.length >= 2) {
    // 시나리오 파싱
    const scenarioStr = parts[0];
    if (scenarioStr) {
      scenarioStr.split('/').forEach((pair) => {
        const [key, val] = pair.split(':');
        if (key && val) {
          const engKey = REVERSE_SCENARIO_KEY_MAP[key] || key;
          result.scenarios[engKey] = val;
        }
      });
    }

    // MBTI 파싱
    const mbtiStr = parts[1];
    const mbtiPattern = /^[EI][SN][TF][JP]$/;
    if (mbtiStr && mbtiPattern.test(mbtiStr)) {
      result.mbti = mbtiStr.split('');
    } else if (!mbtiStr) {
      result.mbtiUnknown = true;
    }

    // 키워드 파싱
    if (parts[2]) {
      result.keywords = parts[2].split(',').filter(Boolean);
    }
  } else {
    // 자유 텍스트 → MBTI 패턴 추출, 나머지 키워드로
    const mbtiMatch = raw.match(/[EI][SN][TF][JP]/);
    if (mbtiMatch) {
      result.mbti = mbtiMatch[0].split('');
    }
  }

  return result;
}

export function deserializeValues(raw: string): Step2Data {
  const result: Step2Data = {
    coreValues: [],
    lifePriority: '',
    futureVision: '',
  };

  if (!raw) return result;

  const parts = raw.split('|');
  if (parts.length >= 2) {
    // 구조화된 포맷
    if (parts[0]) {
      result.coreValues = parts[0].split(',').filter(Boolean);
    }
    parts.slice(1).forEach((part) => {
      if (part.startsWith('삶의중심:')) {
        result.lifePriority = part.replace('삶의중심:', '');
      } else if (part.startsWith('10년후:')) {
        result.futureVision = part.replace('10년후:', '');
      }
    });
  } else {
    // 자유 텍스트 → 핵심 가치 첫 번째 항목으로
    result.coreValues = [raw.trim()];
  }

  return result;
}

export function deserializeLifeBackground(raw: string): Step3Data {
  const result: Step3Data = {
    turningPoint: '',
    currentConcern: '',
    ifAgain: '',
  };

  if (!raw || raw === '프로필을 완성해주세요.') return result;

  // 구조화된 포맷인지 확인
  if (raw.includes('[인생 전환점]') || raw.includes('[현재 고민]')) {
    const lines = raw.split('\n');
    lines.forEach((line) => {
      if (line.startsWith('[인생 전환점]')) {
        result.turningPoint = line.replace('[인생 전환점] ', '').trim();
      } else if (line.startsWith('[현재 고민]')) {
        result.currentConcern = line.replace('[현재 고민] ', '').trim();
      } else if (line.startsWith('[다시 선택한다면]')) {
        result.ifAgain = line.replace('[다시 선택한다면] ', '').trim();
      }
    });
  } else {
    // 자유 텍스트 → 전환점 필드에 전체 표시
    result.turningPoint = raw;
  }

  return result;
}
