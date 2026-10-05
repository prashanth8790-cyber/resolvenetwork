export interface PriorityInput {
  severity: string;
  supportCount: number;
  createdAt: Date | string;
  status: string;
}

export interface PriorityResult {
  score: number;
  band: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isOverdue: boolean;
  daysOpen: number;
}

const SEVERITY_WEIGHTS: Record<string, number> = {
  LOW: 10,
  MEDIUM: 20,
  HIGH: 30,
  CRITICAL: 40,
};

const OVERDUE_DAYS_THRESHOLD: Record<string, number> = {
  CRITICAL: 2,
  HIGH: 5,
  MEDIUM: 10,
  LOW: 14,
};

export function calculateIssuePriority(input: PriorityInput): PriorityResult {
  const { severity, supportCount, createdAt, status } = input;

  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - created.getTime());
  const daysOpen = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const maxOverdueDays = OVERDUE_DAYS_THRESHOLD[severity.toUpperCase()] || 10;
  const isOverdue = status !== 'CLOSED' && status !== 'RESOLVED' && status !== 'REJECTED' && daysOpen > maxOverdueDays;

  const severityWeight = SEVERITY_WEIGHTS[severity.toUpperCase()] || 10;
  const supportWeight = Math.min(supportCount, 30);
  const ageWeight = Math.min(daysOpen * 2, 20);
  const overdueWeight = isOverdue ? 10 : 0;

  const rawScore = severityWeight + supportWeight + ageWeight + overdueWeight;
  const score = Math.min(Math.max(rawScore, 0), 100);

  let band: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (score >= 76) {
    band = 'CRITICAL';
  } else if (score >= 51) {
    band = 'HIGH';
  } else if (score >= 26) {
    band = 'MEDIUM';
  } else {
    band = 'LOW';
  }

  return {
    score,
    band,
    isOverdue,
    daysOpen,
  };
}
