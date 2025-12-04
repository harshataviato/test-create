// This script attempts to replicate the functionality of the original gradlew (POSIX shell script)
// in a cross-platform Node.js (TypeScript) environment.
// It is intended as a conceptual translation. In a full TypeScript migration,
// Gradle would likely be replaced by native Node.js build tools (e.g., npm/yarn scripts).

import * as path from 'node:path';
import * as fs from 'node:fs';
import { spawnSync, execSync } from 'node:child_process';

// Ensure __dirname is recognized (for CJS context)
declare const __dirname: string;

function die(...args: any[]): never {
  console.error('\nERROR:', ...args, '\n');
  process.exit(1);
}

function warn(...args: any[]) {
  console.warn('[WARNING]', ...args);
}

function logVerbose(...args: any[]) {
  // Add verbose logging if needed, similar to mvnw.ts.
  // The original gradlew script does not have a verbose flag like mvnw.cmd.
  // For consistency, one could be added based on an env variable if desired.
}

// Resolve APP_HOME: Directory where gradlew.ts resides
// In Node.js, process.argv[1] is the script path.
// This assumes gradlew.ts will be run directly via `node gradlew.ts`.
const appPath = process.argv[1];
const appHome = path.dirname(appPath);

// This script expects the gradle-wrapper.jar to be relative to APP_HOME.
// The standard location for the wrapper JAR is `APP_HOME/gradle/wrapper/gradle-wrapper.jar`.
const gradleWrapperJarPath = path.join(appHome, 'gradle', 'wrapper', 'gradle-wrapper.jar');
if (!fs.existsSync(gradleWrapperJarPath)) {
  die(`Could not find Gradle wrapper JAR at: ${gradleWrapperJarPath}`);
}

// Determine the Java command to use
let javaCmd: string | undefined;

if (process.env.JAVA_HOME) {
  // Check for IBM's JDK on AIX (less common for cross-platform Node.js, but keeping the spirit)
  // On most systems, 'bin/java' is the standard.
  const ibmJavaPath = path.join(process.env.JAVA_HOME, 'jre', 'sh', 'java');
  if (fs.existsSync(ibmJavaPath) && fs.statSync(ibmJavaPath).isFile()) {
    try { fs.accessSync(ibmJavaPath, fs.constants.X_OK); javaCmd = ibmJavaPath; } catch { /* not executable */ }
  }

  if (!javaCmd) {
    javaCmd = path.join(process.env.JAVA_HOME, 'bin', 'java');
  }

  if (!fs.existsSync(javaCmd) || !fs.statSync(javaCmd).isFile()) {
    die(`JAVA_HOME is set to an invalid directory: ${process.env.JAVA_HOME}\nPlease set the JAVA_HOME variable in your environment to match the location of your Java installation.`);
  }
  try { fs.accessSync(javaCmd, fs.constants.X_OK); } catch { die(`Java executable at ${javaCmd} is not executable.`); }

} else {
  // Try to find 'java' in PATH
  try {
    // Check if 'java' command exists by trying to execute 'java -version'.
    // Redirecting stdio to ignore output unless there's an error.
    execSync('java -version', { stdio: ['ignore', 'ignore', 'pipe'] });
    javaCmd = 'java';
  } catch (e) {
    die(`JAVA_HOME is not set and no 'java' command could be found in your PATH.\nPlease set the JAVA_HOME variable in your environment to match the location of your Java installation.`);
  }
}

// Increase max file descriptors:
// The original shell script attempts to set ulimit -n. In a Node.js context,
// this is less straightforward and often delegated to the environment running Node.js or the child process.
// Node.js does not provide a direct cross-platform API for `ulimit`.
// For a pragmatic translation, this step is omitted, assuming system defaults or environment configuration.

// Collect JVM options and Gradle arguments
// The original script uses `xargs -n1` and `sed` to parse space-separated, potentially quoted arguments.
// A simple `split(/\s+/)` might not handle all quoting scenarios robustly.
// For simplicity, we'll use a basic split and expect well-formed inputs or rely on shell parsing
// if the environment variables themselves are shell-parsed before Node.js starts.
const parseJvmOpts = (envVar: string | undefined): string[] => {
  if (!envVar) return [];
  // A robust parser for shell-like arguments might be needed for full fidelity,
  // but for common cases, splitting by whitespace and filtering empty strings works.
  // If arguments like "-Dfoo='bar baz'" are expected, this would need a more complex parser.
  return envVar.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
};

const defaultJvmOpts = parseJvmOpts('"-Xmx64m" "-Xms64m"'); // Hardcoded from original script
const javaOpts = parseJvmOpts(process.env.JAVA_OPTS);
const gradleOpts = parseJvmOpts(process.env.GRADLE_OPTS);

const appBaseName = path.basename(appPath);

const jvmArgs: string[] = [
  ...defaultJvmOpts,
  ...javaOpts,
  ...gradleOpts,
  `-Dorg.gradle.appname=${appBaseName}`,
];

const gradleArgs = process.argv.slice(2); // Arguments passed to gradlew.ts

const commandArgs = [
  ...jvmArgs,
  '-jar',
  gradleWrapperJarPath,
  ...gradleArgs,
];

// Execute Java command
logVerbose(`Executing Java command: ${javaCmd} ${commandArgs.join(' ')}`);

const result = spawnSync(javaCmd, commandArgs, {
  stdio: 'inherit', // Connects child process stdio to parent process stdio
});

if (result.error) {
  die(`Failed to execute Java command: ${result.error.message}`);
}

process.exit(result.status ?? 0);
