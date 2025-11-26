/**
 * @module utils/formatter
 * @description Provides utility functions for formatting data, particularly dates,
 * for consistent display throughout the application.
 */

/**
 * @function formatDateToYYYYMMDD
 * @description Formats a Date object into a 'YYYY-MM-DD' string.
 * This is useful for displaying dates in HTML input fields of type 'date'.
 * @param {Date | string | undefined} dateInput - The date to format. Can be a Date object,
 *                                                 a string (which will be converted to Date),
 *                                                 or undefined/null.
 * @returns {string | undefined} The formatted date string, or `undefined` if the input is invalid or null.
 */
export function formatDateToYYYYMMDD(dateInput: Date | string | undefined): string | undefined {
  if (!dateInput) {
    return undefined;
  }

  let date: Date;
  if (typeof dateInput === 'string') {
    date = new Date(dateInput);
  } else {
    date = dateInput;
  }

  if (isNaN(date.getTime())) {
    return undefined; // Invalid date
  }

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}
