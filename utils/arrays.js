export const intersection = (array1, array2) => array1.filter(value => (array2 || []).includes(value));

export const containsAll = (requiredFields) => (arr) => intersection(requiredFields, arr).length === requiredFields.length;
