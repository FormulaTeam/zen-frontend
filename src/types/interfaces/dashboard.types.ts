export interface formsByMonth {
  month: number;
  count: number;
}

export interface LoginLogs {
  dailyUsers: number;
  monthlyUsers: number;
}
export interface CountResult {
  totalCount?: number;
  zeroCommentsCount?: number;
  activeCount?: number;
  inactiveCount?: number;
  formsByMonth?: formsByMonth[];
  deletedFormsByMonth?: formsByMonth[];
  loginLogs?: LoginLogs;
  mirageUsers?: any[];
}