/*
 * Copyright 2012-2025 the original author or authors.
 *
 * Licensed under the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This file is a TypeScript adaptation of I18nPropertiesSyncTest.java.
// It checks for hard-coded strings in HTML/TS files and ensures i18n property files are synchronized.

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { glob } from 'glob'; // Using glob for file pattern matching, equivalent to Files.walk().filter()
import { expect } from '@jest/globals';

// --- Configuration ---
const I18N_DIR = 'src/main/resources';
const BASE_NAME = 'messages';
const PROPERTIES_EXT = '.properties';

// Regex patterns (translated from Java Pattern to JavaScript RegExp)
// Matches text literals between > and < tags, excluding those wrapped in {}
const HTML_TEXT_LITERAL = />([^<>{}\t\n\r]+)</g; // Added \t\n\r to exclude whitespace-only text
// Matches <tag> [ ] </tag> or <tag> &nbsp; </tag>
const BRACKET_ONLY = /<[^>]*>\s*\[\s*\](?:&nbsp;)?\s*<\/[^>]*>|<[^>]*>\s*\[(?:&nbsp;)?\s*\]\s*<\/[^>]*>/g;
// Matches Thymeleaf th:text or th:utext attributes
const HAS_TH_TEXT_ATTRIBUTE = /th:(u)?text\s*=\s*"[^"]+"/g;

// --- Helper Functions ---

/**
 * Recursively gets all files matching a glob pattern.
 */
async function getFiles(pattern: string[]): Promise<string[]> {
  const files = await glob(pattern, { ignore: ['**/node_modules/**', '**/dist/**'] });
  return files;
}

/**
 * Parses a Java-style .properties file content into a Map.
 * Handles basic key=value pairs, ignores comments and blank lines.
 */
function parseProperties(content: string): Map<string, string> {
  const props = new Map<string, string>();
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('#') || trimmedLine === '') {
      continue;
    }
    const eqIndex = trimmedLine.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmedLine.substring(0, eqIndex);
      const value = trimmedLine.substring(eqIndex + 1);
      props.set(key.trim(), value.trim());
    }
  }
  return props;
}

// --- Tests ---

describe('I18nPropertiesSyncTest', () => {

  it('should check for non-internationalized strings in HTML/TS files', async () => {
    const rootDir = 'src/main'; // Or adjust to your actual source directory for TS
    const files = await getFiles([
        `${rootDir}/**/*.ts`,
        `${rootDir}/**/*.tsx`,
        `${rootDir}/**/*.html`,
        `${rootDir}/**/*.js`, // Include JS if applicable
    ]);

    const report: string[] = [];

    for (const file of files) {
      const content = await fs.readFile(file, 'utf8');
      const lines = content.split(/\r?\n/);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip comments, decorators, and logging statements
        if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*') || line.startsWith('@') ||
            line.includes('console.log') || line.includes('console.warn') || line.includes('console.error')) {
          continue;
        }

        if (file.endsWith('.html')) {
          const hasLiteralText = HTML_TEXT_LITERAL.test(line);
          const hasThTextAttribute = HAS_TH_TEXT_ATTRIBUTE.test(line); // Check for Thymeleaf equivalent
          const isBracketOnly = BRACKET_ONLY.test(line);

          // Check if it has literal text AND no Thymeleaf i18n attribute AND not a bracket-only element
          if (hasLiteralText && !line.includes('{{') && !line.includes('${') && !hasThTextAttribute && !isBracketOnly) {
            // Further refinement: filter out likely harmless text like numbers, single punctuation, or very short strings
            const matches = line.match(HTML_TEXT_LITERAL);
            if (matches) {
              for (const match of matches) {
                const text = match.substring(1, match.length - 1).trim(); // Extract text inside >...<
                if (text.length > 2 && /[a-zA-Z]/.test(text) && !/^\d+$/.test(text)) { // Ignore numbers, very short strings
                  report.push(`HTML: ${file} Line ${i + 1}: ${line}`);
                  break; // Only report once per line
                }
              }
            }
          }
        }
        // Add checks for hardcoded strings in .ts/.tsx files if desired, e.g., in JSX or template literals
        // This is harder to do generically without semantic analysis.
        // For now, focusing on HTML as per Java original.
      }
    }

    if (report.length > 0) {
      fail(`Hardcoded (non-internationalized) strings found:\n${report.join('\n')}`);
    }
  }, 10000); // Increased timeout for file system operations

  it('should check that i18n property files are in sync', async () => {
    const propertyFiles = await getFiles([`${I18N_DIR}/${BASE_NAME}*${PROPERTIES_EXT}`]);

    const localeToProps = new Map<string, Map<string, string>>();

    for (const filePath of propertyFiles) {
      const content = await fs.readFile(filePath, 'utf8');
      const props = parseProperties(content);
      const fileName = path.basename(filePath);
      localeToProps.set(fileName, props);
    }

    const baseFile = BASE_NAME + PROPERTIES_EXT;
    const baseProps = localeToProps.get(baseFile);

    if (!baseProps) {
      fail(`Base properties file '${baseFile}' not found.`);
    }

    const baseKeys = new Set<string>(baseProps!.keys()); // Use non-null assertion as we've checked

    const report: string[] = [];

    for (const [fileName, props] of localeToProps.entries()) {
      // "messages_en" is skipped in the original, assuming it falls back to base.
      if (fileName === baseFile || fileName === 'messages_en.properties') {
        continue;
      }

      const missingKeys = new Set<string>();
      for (const key of baseKeys) {
        if (!props.has(key)) {
          missingKeys.add(key);
        }
      }

      if (missingKeys.size > 0) {
        report.push(`Missing keys in ${fileName}:`);
        Array.from(missingKeys).sort().forEach(k => report.push(`  ${k}`));
      }
    }

    if (report.length > 0) {
      fail(`Translation files are not in sync:\n${report.join('\n')}`);
    }
  }, 5000);
});
