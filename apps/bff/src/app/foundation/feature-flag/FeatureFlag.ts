export type FeatureFlag = {
  isEnabled: boolean;
};

export function on(): FeatureFlag {
  return {
    isEnabled: true,
  };
}

export function off(): FeatureFlag {
  return {
    isEnabled: false,
  };
}
