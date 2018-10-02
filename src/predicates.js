/**
 * A function to check if value attends to predicate.
 * @callback Predicate
 * @param {*} value Any value could be checked.
 * @returns {boolean} `true` if value attends to predicate.
 */

/**
 * Value returned by `typeof` to determine what is value's type.
 * @typedef {('number' | 'object' | 'string' | 'symbol' | 'boolean' | 'function' | 'undefined')} Type
 */

/**
 * Check if value is of type.
 * @param {Type} type
 * @returns {Predicate}
 */
export const isType = (type) => (value) => typeof value === type;

/**
 * Check if value is an object.
 * @param {*} value
 * @returns {boolean}
 */
export const isObject = (value) => !!value && isType('object')(value);

/**
 * Check if value is not an empty string.
 * @param {*} value
 * @returns {boolean}
 */
export const isNotEmptyString = (value) => isType('string')(value) && !!value.trim();

/**
 * Check if value is an Array and every element attends the predicate.
 * @param {Predicate} predicate
 * @returns {Predicate}
 */
export const isEvery = (predicate) => (value) => Array.isArray(value) && value.every(predicate);

/**
 * Check if every object properties attends the predicate.
 * @param {Predicate} predicate
 * @returns {Predicate}
 */
export const isEveryProperty = (predicate) => (value) => {
  if (!isObject(value))
    return false;
  const properties = Object.keys(value).map((key) => value[key]);
  return properties.every(isEvery(predicate));
};
