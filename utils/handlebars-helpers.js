/**
 * Custom Handlebars helpers for logic in views.
 */
const moment = require('moment');

module.exports = {
  // Format date for display
  formatDate: (date) => {
    return date ? moment(date).format('YYYY-MM-DD') : '';
  },
  // Check equality
  eq: (v1, v2) => v1 === v2,
  // Helper to pre-select options in <select>
  select: function(value, options) {
    return options.fn(this)
      .replace(
        new RegExp(' value=\"' + value + '\"'),
        '$& selected="selected"'
      )
      .replace(
        new RegExp('>' + value + '</option>'),
        ' selected="selected">$&'
      );
  },
  // Generate list of numbers for pagination
  range: (start, end) => {
    const arr = [];
    for (let i = start; i <= end; i++) {
      arr.push(i);
    }
    return arr;
  },
  // Simple subtraction
  subtract: (a, b) => a - b,
  // Simple addition
  add: (a, b) => a + b,
  // Join list of objects by property
  joinTypes: (list) => {
    if (!list) return '';
    return list.map(item => item.name).join(' ');
  },
  json: (obj) => JSON.stringify(obj)
};
