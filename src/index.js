import FormContainer from './FormContainer.vue';
import { defineReadOnlyProperty } from './object';

/**
 * Model of global form accessor object.
 * @typedef {Object} FormAcessor
 * @property {Object.<string, *>} fields
 * @property {Object.<string, string>} errors
 * @property {function(string,*):void} update
 * @property {boolean} isValid
 * @property {boolean} isLoading
 * @property {function():Promise.<void>} validateForm
 * @property {function(string):Promise.<void>} validateField
 */

/**
 * Globally register FormContainer and it's helpers on Vue application.
 * @param {Vue} Vue
 */
const install = (Vue) => {
  /**
   * State of registered forms.
   * @type {Object.<string, FormAcessor>}
   */
  const forms = Object.create(null);

  /**
   * Reaches a registered FormContainer.
   * @param {string} name
   */
  const form = (name) => {
    if (!name in forms)
      throw new Error(`Can't find form "${name}".`);
    return forms[name];
  };

  /**
   * Register a form to use it's helpers on every component.
   * @param {string} name Name used to set form and it's functions.
   * @param {FormAcessor} form
   */
  form.register = (name, form) => {
    forms[name] = form;
  };

  /**
   * Unregister form.
   * @param {string} name
   */
  form.unregister = (name) => {
    delete forms[name];
  };

  defineReadOnlyProperty(Vue.prototype, '$form', () => form);

  Vue.component('FormContainer', FormContainer);
};

export default install;
