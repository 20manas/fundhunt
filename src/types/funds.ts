export const enum EFundType {
  MutualFund = 'm',
  Index = 'i',
}

export interface TFund {
  type: EFundType;
  value: string;
  title: string;
}
