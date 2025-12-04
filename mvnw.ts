// This script attempts to replicate the functionality of the original mvnw.cmd (PowerShell part)
// in a cross-platform Node.js (TypeScript) environment.
// It is intended as a conceptual translation. In a full TypeScript migration,
// the Maven wrapper itself would likely be replaced by native Node.js build tools
// (e.g., managing dependencies via package.json, build scripts via npm/yarn).

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
// You'll need to install these external dependencies:
// npm install node-fetch@2 adm-zip @types/adm-zip
// (node-fetch@2 for CJS compatibility, or configure ESM for node-fetch@3+)
import fetch from 'node-fetch';
import AdmZip from 'adm-zip';

// Assume script is run from project root, similar to %~dp0
const scriptDir = process.cwd();
const scriptName = path.basename(process.argv[1] || 'mvnw'); // Get script name (e.g., mvnw.ts)

let verbose = process.env.MVNW_VERBOSE === 'true';

function logVerbose(...args: any[]) {
  if (verbose) {
    console.log('[VERBOSE]', ...args);
  }
}

function logError(...args: any[]): never {
  console.error('[ERROR]', ...args);
  process.exit(1);
}

function parseProperties(content: string): Record<string, string> {
  const lines = content.split(/\r?\n/);
  const data: Record<string, string> = {};
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('#') || trimmedLine === '') {
      continue;
    }
    const eqIndex = trimmedLine.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmedLine.substring(0, eqIndex);
      const value = trimmedLine.substring(eqIndex + 1);
      data[key] = value;
    }
  }
  return data;
}

async function main() {
  const mavenWrapperPropsPath = path.join(scriptDir, '.mvn', 'wrapper', 'maven-wrapper.properties');
  if (!fs.existsSync(mavenWrapperPropsPath)) {
    logError(`Cannot find maven-wrapper.properties at ${mavenWrapperPropsPath}`);
  }

  const propsContent = fs.readFileSync(mavenWrapperPropsPath, 'utf8');
  const properties = parseProperties(propsContent);

  let distributionUrl = properties.distributionUrl;
  if (!distributionUrl) {
    logError(`Cannot read distributionUrl property in ${mavenWrapperPropsPath}`);
  }

  let useMvnd = false;
  let mvnExecutableName: string; // The actual executable name (e.g., mvn.cmd, mvn, mvnd.cmd, mvnd)

  const distributionFileName = distributionUrl.split('/').pop() || '';

  if (distributionFileName.startsWith('maven-mvnd-')) {
    useMvnd = true;
    // Adjust URL for mvnd, assuming Windows AMD64 for consistency with original script's hint
    distributionUrl = distributionUrl.replace(/-bin\.[^.]*$/, "-windows-amd64.zip");
    mvnExecutableName = os.platform() === 'win32' ? 'mvnd.cmd' : 'mvnd';
  } else {
    // For regular maven
    mvnExecutableName = os.platform() === 'win32' ? 'mvn.cmd' : 'mvn';
  }

  // Apply MVNW_REPOURL
  if (process.env.MVNW_REPOURL) {
    const mvnwRepoPattern = useMvnd ? '/maven/mvnd/' : '/org/apache/maven/';
    const urlStartIndex = distributionUrl.indexOf(mvnwRepoPattern);
    if (urlStartIndex !== -1) {
      const urlSuffix = distributionUrl.substring(urlStartIndex);
      distributionUrl = `${process.env.MVNW_REPOURL}${urlSuffix}`;
    }
  }

  const distributionUrlName = distributionUrl.split('/').pop() || '';
  const distributionUrlNameMain = distributionUrlName.replace(/\.[^.]*$/, '').replace(/-bin$/, '');

  let mavenM2Path = process.env.MAVEN_USER_HOME || path.join(os.homedir(), '.m2');

  if (!fs.existsSync(mavenM2Path)) {
    fs.mkdirSync(mavenM2Path, { recursive: true });
  }

  // Simplified: Assuming .m2 is a direct directory. Original PowerShell handled symlinks
  // for MAVEN_WRAPPER_DISTS if .m2 was a symlink. This complexity is omitted for a basic translation.
  const mavenWrapperDists = path.join(mavenM2Path, 'wrapper', 'dists');

  const mavenHomeParent = path.join(mavenWrapperDists, distributionUrlNameMain);
  const sha256hash = createHash('sha256').update(distributionUrl).digest('hex');
  const mavenHome = path.join(mavenHomeParent, sha256hash);

  const actualMvnCmdPath = path.join(mavenHome, 'bin', mvnExecutableName);

  if (fs.existsSync(mavenHome) && fs.existsSync(actualMvnCmdPath)) {
    logVerbose(`Found existing MAVEN_HOME at ${mavenHome}`);
    console.log(`MVN_CMD=${actualMvnCmdPath}`);
    // Execute maven and pass along arguments
    const result = spawnSync(actualMvnCmdPath, process.argv.slice(2), { stdio: 'inherit' });
    process.exit(result.status ?? 0);
  }

  if (!distributionUrlNameMain || distributionUrlName === distributionUrlNameMain) {
    logError(`distributionUrl is not valid, must end with *-bin.zip, but found ${distributionUrl}`);
  }

  // Prepare temporary directory
  const tmpDownloadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mvnw-download-'));
  logVerbose(`Temporary download directory: ${tmpDownloadDir}`);

  // Cleanup trap equivalent
  process.on('exit', () => {
    if (fs.existsSync(tmpDownloadDir)) {
      try {
        fs.rmSync(tmpDownloadDir, { recursive: true, force: true });
        logVerbose(`Cleaned up temporary directory: ${tmpDownloadDir}`);
      } catch (e) {
        console.warn(`[WARNING] Cannot remove ${tmpDownloadDir}:`, e);
      }
    }
  });
  process.on('SIGINT', () => process.exit(1));
  process.on('SIGTERM', () => process.exit(1));

  fs.mkdirSync(mavenHomeParent, { recursive: true });

  // Download Apache Maven
  logVerbose("Couldn't find MAVEN_HOME, downloading and installing it ...");
  logVerbose(`Downloading from: ${distributionUrl}`);
  const downloadPath = path.join(tmpDownloadDir, distributionUrlName);
  logVerbose(`Downloading to: ${downloadPath}`);

  try {
    const fetchOptions: RequestInit = {};
    if (process.env.MVNW_USERNAME && process.env.MVNW_PASSWORD) {
      const credentials = Buffer.from(`${process.env.MVNW_USERNAME}:${process.env.MVNW_PASSWORD}`).toString('base64');
      fetchOptions.headers = { 'Authorization': `Basic ${credentials}` };
    }

    // Set TLS1.2 equivalent - node-fetch typically handles modern TLS versions by default.
    // [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 is mostly for older .NET
    const response = await fetch(distributionUrl, fetchOptions);

    if (!response.ok) {
      logError(`Failed to download ${distributionUrl}: ${response.statusText}`);
    }

    const fileStream = fs.createWriteStream(downloadPath);
    await new Promise<void>((resolve, reject) => {
      if (response.body) {
        response.body.pipe(fileStream);
        response.body.on('error', reject);
        fileStream.on('finish', resolve);
      } else {
        reject(new Error("Response body is null"));
      }
    });
    logVerbose(`Successfully downloaded ${distributionUrlName}`);
  } catch (e) {
    logError(`Error during download: ${e}`);
  }

  // Validate SHA-256 sum
  const distributionSha256Sum = properties.distributionSha256Sum;
  if (distributionSha256Sum) {
    if (useMvnd) {
      logError("Checksum validation is not supported for maven-mvnd. Please disable validation by removing 'distributionSha256Sum' from your maven-wrapper.properties.");
    }
    const fileBuffer = fs.readFileSync(downloadPath);
    const fileHash = createHash('sha256').update(fileBuffer).digest('hex').toLowerCase();
    if (fileHash !== distributionSha256Sum) {
      logError("Error: Failed to validate Maven distribution SHA-256, your Maven distribution might be compromised. If you updated your Maven version, you need to update the specified distributionSha256Sum property.");
    }
    logVerbose(`SHA-256 sum validated successfully.`);
  }

  // Unzip and move
  logVerbose(`Extracting archive: ${downloadPath}`);
  try {
    const zip = new AdmZip(downloadPath);
    zip.extractAllTo(tmpDownloadDir, /*overwrite*/ true);
    logVerbose(`Extracted to ${tmpDownloadDir}`);
  } catch (e) {
    logError(`Error extracting archive: ${e}`);
  }

  let actualDistributionDir = '';

  // Find the actual extracted directory name
  const expectedPath = path.join(tmpDownloadDir, distributionUrlNameMain);
  const expectedMvnPath = path.join(expectedPath, 'bin', mvnExecutableName);

  if (fs.existsSync(expectedPath) && fs.existsSync(expectedMvnPath)) {
    actualDistributionDir = distributionUrlNameMain;
  }

  if (!actualDistributionDir) {
    const children = fs.readdirSync(tmpDownloadDir, { withFileTypes: true });
    for (const child of children) {
      if (child.isDirectory()) {
        const testPath = path.join(tmpDownloadDir, child.name, 'bin', mvnExecutableName);
        if (fs.existsSync(testPath)) {
          actualDistributionDir = child.name;
          break;
        }
      }
    }
  }

  if (!actualDistributionDir) {
    logError("Could not find Maven distribution directory in extracted archive");
  }

  logVerbose(`Found extracted Maven distribution directory: ${actualDistributionDir}`);

  const sourcePath = path.join(tmpDownloadDir, actualDistributionDir);
  const targetPathTemp = path.join(tmpDownloadDir, sha256hash); // Rename within tmp dir first
  const finalMavenHome = path.join(mavenHomeParent, sha256hash);

  try {
    fs.renameSync(sourcePath, targetPathTemp);
    logVerbose(`Renamed ${sourcePath} to ${targetPathTemp}`);
    fs.renameSync(targetPathTemp, finalMavenHome);
    logVerbose(`Moved ${targetPathTemp} to ${finalMavenHome}`);
  } catch (e) {
    if (!fs.existsSync(finalMavenHome)) {
      logError(`Failed to move MAVEN_HOME: ${e}`);
    } else {
      logVerbose(`Maven home already exists at ${finalMavenHome}, likely due to race condition or previous failed attempt. Proceeding.`);
    }
  } finally {
    // Cleanup handled by process.on('exit')
  }

  const finalMvnCmdPath = path.join(finalMavenHome, 'bin', mvnExecutableName);
  console.log(`MVN_CMD=${finalMvnCmdPath}`);

  // Execute maven and pass along arguments
  logVerbose(`Executing ${finalMvnCmdPath} with arguments: ${process.argv.slice(2).join(' ')}`);
  const result = spawnSync(finalMvnCmdPath, process.argv.slice(2), { stdio: 'inherit' });
  process.exit(result.status ?? 0);
}

main().catch(e => {
  console.error('[FATAL ERROR]', e);
  process.exit(1);
});
