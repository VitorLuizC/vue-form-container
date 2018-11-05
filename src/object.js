/**
 * Defines a read-only property on target object.
 * @param {Object.<*, *>} target
 * @param {string} key
 * @param {function():any} get
 */
export const defineReadOnlyProperty = (target, key, get) => (
  Object.defineProperty(target, key, {
    get,
    set: () => { throw new Error(`Cannot assign to readonly property "${key}".`); },
    enumerable: true,
    configurable: false
  })
);
