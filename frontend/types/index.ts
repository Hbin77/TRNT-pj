// 사용자 타입
export interface User {
  id: string;
  email?: string;
  name: string;
  birth_year: number;
  gender?: string;
  occupation: string;
  education?: string;
  major?: string;
  residence?: string;
  relationship_status?: string;
  life_background: string;
  key_events?: string;
  personality?: string;
  values?: string;
  auth_provider: string;
  is_active: boolean;
  is_verified: boolean;
}

// 인증 관련
export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  birth_year: number;
  gender?: string;
  occupation: string;
  education?: string;
  major?: string;
  residence?: string;
  relationship_status?: string;
  life_background: string;
  key_events?: string;
  personality?: string;
  values?: string;
  turnstile_token?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: string;
}

export interface ChangePasswordRequest {
  current_password?: string;
  new_password: string;
}

// 시나리오 관련
export interface BranchInput {
  occurred_at: string;
  original_choice: string;
  alternative_choice: string;
  context?: string;
}

export interface ScenarioRequest {
  branch: BranchInput;
  tone?: 'optimistic' | 'realistic' | 'pessimistic';
  genre?: 'romance' | 'success' | 'healing' | 'drama';
  detail_level?: 'summary' | 'normal' | 'novel';
  scope?: 'short' | 'medium' | 'long';
}

export interface Scenario {
  scenario_id?: string;
  user_id: string;
  branch: BranchInput;
  tone: string;
  genre: string;
  detail_level: string;
  scope: string;
  scenario_text: string;
  word_count: number;
}

export interface ScenarioListItem {
  id: string;
  user_id: string;
  branch_data: BranchInput;
  tone: string;
  genre: string;
  detail_level: string;
  scope: string;
  word_count: number;
  rating?: string | null;
  parent_scenario_id?: string | null;
  created_at: string;
}

export interface ScenarioListResponse {
  total: number;
  scenarios: ScenarioListItem[];
}

export interface ScenarioDetail extends ScenarioListItem {
  scenario_text: string;
}

// 피드백
export interface FeedbackRequest {
  rating: 'like' | 'dislike';
}

export interface FeedbackResponse {
  scenario_id: string;
  rating: string;
  message: string;
}

// 이어쓰기
export interface ContinuationRequest {
  continuation_direction: string;
}

// SSE 스트리밍 이벤트
export interface StreamChunkEvent {
  type: 'chunk';
  content: string;
}

export interface StreamDoneEvent {
  type: 'done';
  scenario_id: string;
}

export interface StreamErrorEvent {
  type: 'error';
  message: string;
}

export type StreamEvent = StreamChunkEvent | StreamDoneEvent | StreamErrorEvent;
