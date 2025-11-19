export type FeatureFlag = {
  isEnabled: boolean;
};

export const on = (): FeatureFlag => ({
  isEnabled: true,
});

export const off = (): FeatureFlag => ({
  isEnabled: false,
});
