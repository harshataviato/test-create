import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Architecture', () => {
  const rootPath = resolve(__dirname, './');
  const featuresPath = resolve(rootPath, './features');

  const getDirectories = (source: string) =>
    readdirSync(source, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

  // Helper to get module contents (simplified for basic check)
  const getModuleContents = (path: string) => {
    try {
      return readFileSync(path, 'utf-8');
    } catch (error) {
      return '';
    }
  };

  const allowedFeatures = [
    'hello-world',
    // Add other feature names in kebab-case here as they are created
  ];

  it('All feature folders must be listed in allowedFeatures for architecture tests', () => {
    const actualFeatures = getDirectories(featuresPath);
    const missingFeatures = actualFeatures.filter(feature => !allowedFeatures.includes(feature));
    expect(missingFeatures).toEqual([]);
    const extraFeatures = allowedFeatures.filter(feature => !actualFeatures.includes(feature));
    expect(extraFeatures).toEqual([]);
  });

  it('features.module.ts must import all allowed features', () => {
    const featuresModulePath = resolve(featuresPath, 'features.module.ts');
    const featuresModuleContent = getModuleContents(featuresModulePath);

    for (const featureName of allowedFeatures) {
      const pascalCaseFeatureName = featureName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
      expect(featuresModuleContent).toContain(`import { ${pascalCaseFeatureName}Module } from './${featureName}/${pascalCaseFeatureName}Module';`);
      expect(featuresModuleContent).toContain(`${pascalCaseFeatureName}Module,`);
    }
  });

  it('Feature modules must not import other feature modules directly', () => {
    const featureModules = allowedFeatures.map(feature => {
      const pascalCaseFeatureName = feature.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
      return {
        name: feature,
        path: resolve(featuresPath, `./${feature}/${pascalCaseFeatureName}Module.ts`),
        pascalCaseName: pascalCaseFeatureName
      };
    });

    for (const currentFeature of featureModules) {
      const moduleContent = getModuleContents(currentFeature.path);
      for (const otherFeature of featureModules) {
        if (currentFeature.name !== otherFeature.name) {
          // Check for import statements like: import { OtherFeatureModule } from '../other-feature/OtherFeatureModule';
          expect(moduleContent).not.toContain(`import { ${otherFeature.pascalCaseName}Module } from '../${otherFeature.name}/${otherFeature.pascalCaseName}Module';`);
        }
      }
    }
  });

  // Mock readdirSync for testing purposes if not running in a real Node environment
  const readdirSync = require('fs').readdirSync;
});
