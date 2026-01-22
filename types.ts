
export interface ComparisonResult {
  missing: string[];
  extra: string[];
  matched: string[];
}

export interface SmartSuggestion {
  original: string;
  suggestedMatch: string;
  confidence: number;
  reason: string;
}

export interface ComparisonSummary {
  masterCount: number;
  checkCount: number;
  missingCount: number;
  extraCount: number;
  matchedCount: number;
}
