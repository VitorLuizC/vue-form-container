/**
 * Creates a clone of object only with keys, without values.
 * @param {object} object
 * @returns {object}
 */
export const cloneOnlyKeys = (object) => {
  const clone = Object.create(null);
  Object.keys(object).forEach((key) => clone[key] = undefined);
  return clone;
};

/**
 * Defines acessors (get and set) to key on object.
 * @param {object} object
 * @param {string} key
 * @param {{ get: () => any, set: (value: any) => void }} acessors
 */
export const definePropertyAcessors = (object, key, { get, set }) => (
  Object.defineProperty(object, key, {
    get,
    set,
    enumerable: true,
    configurable: false
  })
);

/**
 * Defines a read-only property on target object.
 * @param {Object.<*, *>} target
 * @param {string} key
 * @param {function():any} get
 */
export const defineReadOnlyProperty = (target, key, get) => (
  definePropertyAcessors(target, key, {
    get,
    set: () => { throw new Error(`Cannot assign to readonly property "${key}".`); }
  })
);
