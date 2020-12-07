export const intersection = (array1, array2) => array1.filter(value => (array2 || []).includes(value));

export const containsAll = (requiredFields) => (arr) => intersection(requiredFields, arr).length === requiredFields.length;

export const containsAny = (requiredFields) => (arr) => intersection(requiredFields, arr).length > 0;

export const contains = (s) => (arr) => arr.some(a => a === s);
