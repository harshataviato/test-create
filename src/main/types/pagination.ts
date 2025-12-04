/*
 * Copyright 2012-2025 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This file defines conceptual pagination types in TypeScript,
// mimicking Spring Data's `Page` and `Pageable` interfaces.

/**
 * Represents pagination information for a request.
 * Mimics `org.springframework.data.domain.Pageable`.
 */
export interface Pageable {
  pageNumber: number; // 0-indexed page number
  pageSize: number;
  // You could extend this with sorting info:
  // sort?: { property: string, direction: 'ASC' | 'DESC' }[];
}

/**
 * Represents a page of data returned from a paginated query.
 * Mimics `org.springframework.data.domain.Page`.
 */
export interface Page<T> {
  content: T[]; // The actual list of items for the current page
  pageNumber: number; // The current page number (0-indexed)
  pageSize: number;
  totalElements: number; // Total number of elements across all pages
  totalPages: number; // Total number of pages
  isFirst: boolean; // True if this is the first page
  isLast: boolean; // True if this is the last page
  // You could add other properties from Spring's Page, e.g., `numberOfElements`, `size`, `sort`, `first`, `last`, `empty`
}
