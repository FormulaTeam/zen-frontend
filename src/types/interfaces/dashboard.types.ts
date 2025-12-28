export interface IMirageUser {
  id: string;
  upn?: string | null;
  yechidaHatzava?: string | null;
  loginAt?: string | null;
}

export interface formsByMonth {
  month: number;
  count: number;
}

export interface LoginLogs {
  dailyUsers: number;
  monthlyUsers: number;
}

export interface CountResult {
  totalForms: number;
  zeroResponsesCount: number;
  activeForms: number;
  inactiveForms: number;
  formsByMonth?: formsByMonth[];
  deletedFormsByMonth?: formsByMonth[];
  dailyUsers?: number;
  monthlyUsers?: number;
  loginLogs?: LoginLogs;
  mirageUsers?: IMirageUser[];
}

export interface ChartData {
  name: string;
  value: number;
}
