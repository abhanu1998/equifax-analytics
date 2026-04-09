export type DatePreset =
  | "overall"
  | "today"
  | "yesterday"
  | "last_7_days"
  | "this_month"
  | "custom";

export type SessionPayload = {
  sub: string;
  username: string;
  role: "admin";
  scope: "dashboard";
};

export type ChartDatum = {
  label: string;
  value: number;
  transferred?: number;
  classified?: number;
};

export type AnalyticsResponse = {
  total_calls?: number;
  calls_transferred?: number;
  avg_handle_time_secs?: number;
  total_call_duration_secs?: number;
  intent_recognition_rate?: number;
  avg_calls_per_hour?: number;
  intent_category_distribution?: unknown[];
  serviceable_intent_distribution?: unknown[];
  transfers_by_queue?: unknown[];
  transfers_by_intent?: unknown[];
  hourly_volume?: unknown[];
  call_end_reasons?: unknown[];
};

export type CallRecord = {
  id: string;
  session_id: string;
  phone_number: string;
  bot_identifier: string;
  start_time: string;
  end_time: string;
  call_duration_secs: number;
  status: "received" | "active" | "closed";
  closed_reason: string;
  transcript_path?: string;
  recording_audio_path?: string;
  intent?: string;
  end_reason?: string;
  was_transferred: boolean;
  transfer_queue?: string;
};

export type ToolCallRecord = {
  name?: string;
  params?: unknown;
  output?: unknown;
  timestamp?: string;
  success?: boolean;
};

export type TimelineMessage = {
  type: "message";
  role: "user" | "assistant";
  timestamp: string;
  content: string;
};

export type TimelineToolCall = {
  type: "tool_call";
  role?: null;
  timestamp: string;
  tool_name: string;
  tool_input?: unknown;
  tool_output?: unknown;
  tool_success?: boolean;
  tool_error?: string;
};

export type TimelineEntry = TimelineMessage | TimelineToolCall;

export type CallDetailResponse = {
  call: CallRecord;
  transcript_exchanges?: number;
  tool_calls?: ToolCallRecord[];
  timeline?: TimelineEntry[];
  transfer_time_secs?: number;
  call_summary?: {
    intent?: string;
    end_reason?: string;
    was_transferred?: boolean;
    transfer_queue?: string;
  };
};

export type TranscriptResponse = {
  messages: {
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }[];
};
