import FormContainer from './FormContainer.vue';

/**
 * Globally register FormContainer and it's helpers on Vue application.
 * @param {Vue} Vue
 */
const install = (Vue) => {
  const forms = Object.create(null);

  /**
   * Reaches a registered FormContainer.
   * @param {string} name
   */
  Vue.prototype.$form = (name) => {
    if (!name in forms)
      throw new Error(`Can't find form "${name}".`);
    return forms[name];
  };

  /**
   * Register a form to use it's helpers on every component.
   * @param {string} name Name used to set form and it's functions.
   * @param {FormContainer} form
   */
  Vue.prototype.$form.register = (name, form) => {
    forms[name] = form;
  };

  /**
   * Unregister form.
   * @param {string} name
   */
  Vue.prototype.$form.unregister = (name) => {
    delete forms[name];
  };

  Vue.component('FormContainer', FormContainer);
};

export default install;
