export const enum EFundType {
  MutualFund = 'mf',
  Index = 'index',
}

export interface TFund {
  type: EFundType;
  value: string;
  title: string;
}
