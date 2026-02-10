// ── 회원가입 드롭다운 옵션 ──

export const GENDER_OPTIONS = [
  { value: '남성', label: '남성' },
  { value: '여성', label: '여성' },
  { value: '기타', label: '기타' },
  { value: '비공개', label: '비공개' },
] as const;

export const OCCUPATION_OPTIONS = [
  { value: '학생', label: '학생' },
  { value: '회사원', label: '회사원' },
  { value: '공무원', label: '공무원' },
  { value: '전문직', label: '전문직' },
  { value: 'IT/개발자', label: 'IT/개발자' },
  { value: '디자이너/크리에이터', label: '디자이너/크리에이터' },
  { value: '프리랜서', label: '프리랜서' },
  { value: '자영업', label: '자영업' },
  { value: '주부', label: '주부' },
  { value: '취준생/구직자', label: '취준생/구직자' },
  { value: '은퇴', label: '은퇴' },
  { value: '기타', label: '기타' },
] as const;

export const EDUCATION_OPTIONS = [
  { value: '고등학교', label: '고등학교' },
  { value: '전문대', label: '전문대' },
  { value: '대학교 재학', label: '대학교 재학' },
  { value: '대학교 졸업', label: '대학교 졸업' },
  { value: '대학원(석사)', label: '대학원(석사)' },
  { value: '대학원(박사)', label: '대학원(박사)' },
  { value: '기타', label: '기타' },
] as const;

export const EDUCATION_WITH_MAJOR = ['전문대', '대학교 재학', '대학교 졸업', '대학원(석사)', '대학원(박사)'];

export const RESIDENCE_OPTIONS = [
  { value: '서울', label: '서울' },
  { value: '경기', label: '경기' },
  { value: '인천', label: '인천' },
  { value: '부산', label: '부산' },
  { value: '대구', label: '대구' },
  { value: '광주', label: '광주' },
  { value: '대전', label: '대전' },
  { value: '울산', label: '울산' },
  { value: '세종', label: '세종' },
  { value: '강원', label: '강원' },
  { value: '충북', label: '충북' },
  { value: '충남', label: '충남' },
  { value: '전북', label: '전북' },
  { value: '전남', label: '전남' },
  { value: '경북', label: '경북' },
  { value: '경남', label: '경남' },
  { value: '제주', label: '제주' },
  { value: '해외', label: '해외' },
] as const;

export const RELATIONSHIP_OPTIONS = [
  { value: '미혼', label: '미혼' },
  { value: '연애중', label: '연애중' },
  { value: '기혼', label: '기혼' },
  { value: '기타', label: '기타' },
] as const;

// ── Step 1: 심리 프로파일링 ──

export interface ScenarioOption {
  value: string;
  label: string;
  description: string;
}

export interface ScenarioQuestion {
  id: string;
  question: string;
  options: ScenarioOption[];
}

export const SCENARIO_QUESTIONS: ScenarioQuestion[] = [
  {
    id: 'decision',
    question: '중요한 결정을 내릴 때, 당신은?',
    options: [
      { value: '직감형', label: '직감을 따른다', description: '느낌이 오면 바로 행동' },
      { value: '분석형', label: '분석하고 비교한다', description: '장단점을 꼼꼼히 따짐' },
      { value: '의견수렴형', label: '주변 의견을 구한다', description: '신뢰하는 사람들과 상의' },
      { value: '신중형', label: '충분히 시간을 둔다', description: '서두르지 않고 천천히' },
    ],
  },
  {
    id: 'change',
    question: '예상치 못한 변화가 생기면?',
    options: [
      { value: '설렘형', label: '설레고 기대된다', description: '새로운 기회라고 생각' },
      { value: '도전형', label: '불안하지만 도전한다', description: '걱정되지만 해본다' },
      { value: '안전형', label: '신중하게 대처한다', description: '안전한 선택을 우선' },
      { value: '관찰형', label: '상황을 먼저 파악한다', description: '충분히 관찰 후 판단' },
    ],
  },
  {
    id: 'relationship',
    question: '사람들과의 관계에서 나는?',
    options: [
      { value: '다양형', label: '다양한 사람과 어울린다', description: '새로운 만남을 즐김' },
      { value: '소수깊게', label: '소수와 깊게 사귄다', description: '친한 사람과의 관계에 집중' },
      { value: '독립형', label: '혼자만의 시간이 중요하다', description: '독립적인 시간이 필요' },
      { value: '유연형', label: '상황에 따라 다르다', description: '유연하게 조절' },
    ],
  },
  {
    id: 'failure',
    question: '실패하거나 좌절했을 때?',
    options: [
      { value: '회복형', label: '빠르게 회복하고 다시 도전', description: '넘어져도 바로 일어남' },
      { value: '분석개선', label: '원인을 분석하고 개선', description: '같은 실수를 반복하지 않음' },
      { value: '성찰형', label: '오래 고민하고 성찰', description: '깊이 생각하는 시간이 필요' },
      { value: '방향전환', label: '완전히 새로운 방향을 모색', description: '다른 길을 찾음' },
    ],
  },
];

export const MBTI_DIMENSIONS = [
  { left: 'E', right: 'I', leftLabel: '외향(E)', rightLabel: '내향(I)' },
  { left: 'S', right: 'N', leftLabel: '감각(S)', rightLabel: '직관(N)' },
  { left: 'T', right: 'F', leftLabel: '사고(T)', rightLabel: '감정(F)' },
  { left: 'J', right: 'P', leftLabel: '판단(J)', rightLabel: '인식(P)' },
] as const;

export const PERSONALITY_KEYWORDS = [
  '내향적', '외향적', '감성적', '이성적',
  '모험적', '신중한', '자유로운', '계획적인',
  '낙천적', '완벽주의', '리더형', '공감능력↑',
  '독립적', '사교적', '호기심↑', '고집↑',
] as const;

// ── Step 2: 가치관 & 삶의 방향 ──

export const CORE_VALUES = [
  '자유', '안정', '도전', '가족', '성공', '행복', '성장', '사랑',
  '정의', '독립', '창의성', '인정', '건강', '부(富)', '자아실현', '여유',
] as const;

export const LIFE_PRIORITY_OPTIONS = [
  { value: '커리어와 성취', label: '커리어와 성취' },
  { value: '가족과 사랑하는 사람들', label: '가족과 사랑하는 사람들' },
  { value: '자기성장과 배움', label: '자기성장과 배움' },
  { value: '자유와 여유로운 삶', label: '자유와 여유로운 삶' },
  { value: '재정적 안정과 풍요', label: '재정적 안정과 풍요' },
  { value: '사회에 기여하는 삶', label: '사회에 기여하는 삶' },
] as const;

// ── Step 3: 나의 이야기 ──

export const STORY_QUESTIONS = [
  {
    id: 'turning_point',
    label: '인생에서 가장 큰 전환점은?',
    placeholder: '예: 대학교 때 전공을 바꿨어요 / 3년 전 회사를 그만두고 창업했어요',
    required: true,
  },
  {
    id: 'current_concern',
    label: '요즘 가장 고민하는 것은?',
    placeholder: '예: 이직을 할지 말지 / 결혼을 앞두고 불안해요',
    required: true,
  },
  {
    id: 'if_again',
    label: '과거로 돌아가 다시 선택할 수 있다면?',
    placeholder: '예: 유학을 갔을 거예요 / 그 사람에게 고백했을 거예요',
    required: false,
  },
] as const;
