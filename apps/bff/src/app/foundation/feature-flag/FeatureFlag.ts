export type FeatureFlag = {
  isOn: boolean;
};

export const on = (): FeatureFlag => ({ isOn: true });
export const off = (): FeatureFlag => ({ isOn: false });
