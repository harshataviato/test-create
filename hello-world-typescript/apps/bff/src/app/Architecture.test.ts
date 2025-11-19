import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

describe('Architecture Compliance', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should ensure all feature folders are in kebab-case', () => {
    const featuresPath = path.join(__dirname, 'features');
    const featureFolders = fs.readdirSync(featuresPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name !== 'common') // 'common' is a shared folder, not a feature
      .map(dirent => dirent.name);

    for (const folder of featureFolders) {
      expect(folder).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it('should ensure no direct dependencies between feature modules', async () => {
    const featuresPath = path.join(__dirname, 'features');
    const featureFolders = fs.readdirSync(featuresPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name !== 'common')
      .map(dirent => dirent.name);

    for (const currentFeature of featureFolders) {
      const currentFeatureModulePath = path.join(featuresPath, currentFeature);
      const filesInFeature = fs.readdirSync(currentFeatureModulePath);

      for (const file of filesInFeature) {
        if (file.endsWith('.ts')) {
          const content = fs.readFileSync(path.join(currentFeatureModulePath, file), 'utf-8');
          for (const otherFeature of featureFolders) {
            if (currentFeature !== otherFeature) {
              // Check for imports of other feature modules or components
              expect(content).not.toContain(`/${otherFeature}/`);
            }
          }
        }
      }
    }
  });

  it('should ensure no direct dependencies from features to root modules/services (except FoundationModule)', async () => {
    const featuresPath = path.join(__dirname, 'features');
    const featureFolders = fs.readdirSync(featuresPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name !== 'common')
      .map(dirent => dirent.name);

    const allowedImports = ['foundation', '@nestjs']; // Allow foundation and NestJS internal imports

    for (const currentFeature of featureFolders) {
      const currentFeatureModulePath = path.join(featuresPath, currentFeature);
      const filesInFeature = fs.readdirSync(currentFeatureModulePath, { recursive: true, withFileTypes: true })
        .filter(dirent => dirent.isFile() && dirent.name.endsWith('.ts'))
        .map(dirent => path.join(dirent.path, dirent.name));

      for (const filePath of filesInFeature) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const importRegex = /import(?:["'\s]*(?:[\w*{}\n\r\t, ]+)from\s*)?["'`](.*)["'`];/g;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
          const importedPath = match[1];
          if (importedPath.startsWith('../../')) { // Likely an import from app root or foundation
            const relativePath = path.relative(featuresPath, path.resolve(path.dirname(filePath), importedPath));
            const firstSegment = relativePath.split(path.sep)[0];
            if (firstSegment && !allowedImports.includes(firstSegment) && !featureFolders.includes(firstSegment)) {
              fail(`Feature '${currentFeature}' imports from '${firstSegment}' which violates architectural rules. Found in ${filePath}`);
            }
          }
        }
      }
    }
  });

  it('should ensure that feature modules do not import from brand-specific folders of other brands', async () => {
    const featuresPath = path.join(__dirname, 'features');
    const featureFolders = fs.readdirSync(featuresPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name !== 'common')
      .map(dirent => dirent.name);

    const brands = ['ami', 'nrma', 'state'];

    for (const currentFeature of featureFolders) {
      const currentFeatureModulePath = path.join(featuresPath, currentFeature);
      const filesInFeature = fs.readdirSync(currentFeatureModulePath, { recursive: true, withFileTypes: true })
        .filter(dirent => dirent.isFile() && dirent.name.endsWith('.ts'))
        .map(dirent => path.join(dirent.path, dirent.name));

      for (const filePath of filesInFeature) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const importRegex = /import(?:["'\s]*(?:[\w*{}\n\r\t, ]+)from\s*)?["'`](.*)["'`];/g;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
          const importedPath = match[1];
          if (importedPath.includes('/ami/') || importedPath.includes('/nrma/') || importedPath.includes('/state/')) {
            const absoluteImportPath = path.resolve(path.dirname(filePath), importedPath);
            const absoluteFeaturesPath = path.resolve(featuresPath);

            if (absoluteImportPath.startsWith(absoluteFeaturesPath)) {
              const relativeToFeatures = path.relative(absoluteFeaturesPath, absoluteImportPath);
              const [importedFeature, importedBrand] = relativeToFeatures.split(path.sep);

              if (importedFeature !== currentFeature && brands.includes(importedBrand)) {
                fail(`Feature '${currentFeature}' imports from brand-specific folder '${importedBrand}' of feature '${importedFeature}'. Found in ${filePath}`);
              }
            }
          }
        }
      }
    }
  });


  it('should ensure that brand-specific folders only import from their own brand folder or common feature files', async () => {
    const featuresPath = path.join(__dirname, 'features');
    const featureFolders = fs.readdirSync(featuresPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name !== 'common')
      .map(dirent => dirent.name);

    const brands = ['ami', 'nrma', 'state'];

    for (const currentFeature of featureFolders) {
      const currentFeaturePath = path.join(featuresPath, currentFeature);
      for (const brand of brands) {
        const brandPath = path.join(currentFeaturePath, brand);
        if (fs.existsSync(brandPath)) {
          const filesInBrand = fs.readdirSync(brandPath, { recursive: true, withFileTypes: true })
            .filter(dirent => dirent.isFile() && dirent.name.endsWith('.ts'))
            .map(dirent => path.join(dirent.path, dirent.name));

          for (const filePath of filesInBrand) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const importRegex = /import(?:["'\s]*(?:[\w*{}\n\r\t, ]+)from\s*)?["'`](.*)["'`];/g;
            let match;

            while ((match = importRegex.exec(content)) !== null) {
              const importedPath = match[1];
              const absoluteImportPath = path.resolve(path.dirname(filePath), importedPath);
              const relativeToFeatureRoot = path.relative(currentFeaturePath, absoluteImportPath);
              const importFirstSegment = relativeToFeatureRoot.split(path.sep)[0];

              // Allowed imports:
              // 1. From the same brand folder (e.g., nrma/components)
              // 2. From the feature root (e.g., ../HelloWorldContext)
              // 3. From foundation
              // 4. From node_modules (@nestjs, rxjs etc.)

              if (importedPath.startsWith('.') && importFirstSegment !== brand && importFirstSegment !== '..' && !importedPath.includes('foundation')) {
                 fail(`Brand-specific file '${filePath}' imports from '${importedPath}' which is outside its allowed scope.`);
              }
            }
          }
        }
      }
    }
  });

  // Add feature name in kebab-case to the features list
  const featuresList = [
    'hello-world'
  ];

  test.each(featuresList)('Given a feature, when it is named %s, then the folder structure must be consistent', (featureName) => {
    const featurePath = path.join(__dirname, 'features', featureName);

    expect(fs.existsSync(featurePath)).toBeTruthy();
    expect(fs.existsSync(path.join(featurePath, `${featureName.replace(/-/g, '')}Context.ts`))).toBeTruthy();
    expect(fs.existsSync(path.join(featurePath, `${featureName.replace(/-/g, '')}Controller.ts`))).toBeTruthy();
    expect(fs.existsSync(path.join(featurePath, `${featureName.replace(/-/g, '')}FeatureFlag.ts`))).toBeTruthy();
    expect(fs.existsSync(path.join(featurePath, `${featureName.replace(/-/g, '')}Module.ts`))).toBeTruthy();
    expect(fs.existsSync(path.join(featurePath, `${featureName.replace(/-/g, '')}Feature.test.ts`))).toBeTruthy();

    const brandFolders = ['nrma']; // Only NRMA for hello-world based on prompt

    for (const brand of brandFolders) {
      const brandPath = path.join(featurePath, brand);
      expect(fs.existsSync(brandPath)).toBeTruthy();
      expect(fs.existsSync(path.join(brandPath, 'components', 'builders', `AddHelloWorldComponent.ts`))).toBeTruthy(); // specific for hello-world
      expect(fs.existsSync(path.join(brandPath, 'downstreams', `SampleDownstreamIntegration.ts`))).toBeTruthy(); // specific for hello-world
      expect(fs.existsSync(path.join(brandPath, `${brand.toUpperCase()}Providers.ts`))).toBeTruthy();
      expect(fs.existsSync(path.join(brandPath, `${brand.charAt(0).toUpperCase() + brand.slice(1)}${featureName.replace(/-/g, '')}Response.ts`))).toBeTruthy();
      expect(fs.existsSync(path.join(brandPath, `${featureName.replace(/-/g, '')}For${brand.toUpperCase()}UseCase.ts`))).toBeTruthy();
    }
  });
});
