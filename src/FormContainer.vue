<template>
  <form>
    <slot
      :errors="errors"
      :fields="fields"
      :isValid="isValid"
      :isLoading="isLoading"
      :validateForm="validateForm"
      :validateField="validateField"
    />
  </form>
</template>

<script>
  import { isValid, validate, validateSchema } from 'valite';
  import { defineReadOnlyProperty } from './object';
  import { isType, isEveryProperty, isNotEmptyString } from './predicates';

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

  export default {
    props: {
      name: {
        type: String,
        required: true,
        validator: isNotEmptyString
      },
      model: {
        type: Object,
        required: true,
        validator: isEveryProperty(isType('function'))
      }
    },

    data () {
      return {
        ticks: 0,
        errors: Object.create(null),
        values: Object.create(null)
      };
    },

    watch: {
      name: {
        handler: 'rename',
        immediate: true,
      }
    },

    computed: {
      fields () {
        const descriptors = {};

        Object.keys(this.model).forEach((name) => {
          descriptors[name] = {
            get: () => this.values[name],
            set: (value) => this.update(name, value)
          };
        });

        return Object.create(null, descriptors);
      },

      isLoading () {
        return this.ticks > 0;
      },

      isValid () {
        return !this.isLoading && isValid(this.errors);
      }
    },

    methods: {
      /**
       * When name is change it swiches registered form name.
       * @param {string} to
       * @param {string} [from]
       */
      rename (to, from) {
        if (isNotEmptyString(from))
          this.$form.unregister(from);
        this.$form.register(to, this.createFormAcessor());
      },

      /**
       * Updates a field and trigger its validation.
       * @param {string} field Field's name.
       * @param {*} value Field's value.
       */
      update (field, value) {
        this.$set(this.values, field, value);
        this.validateField(field);
      },

      /**
       * Validates a field and updates Form properties.
       * @param {string} field Field's name.
       * @returns {Promise.<void>}
       */
      async validateField (field) {
        const value = this.values[field];
        const validators = this.model[field];

        try {
          this.ticks += 1;
          const error = await validate(value, validators);
          this.$set(this.errors, field, error);
          this.ticks -= 1;
        } catch (error) {
          this.ticks -= 1;
          console.error(`Can't validate field "${field}".`);
        }
      },

      /**
       * Validates all fields and updates Form properties.
       * @returns {Promise.<void>}
       */
      async validateForm () {
        try {
          this.ticks += 1;
          const errors = await validateSchema(this.values, this.model);
          this.errors = errors;
          this.ticks -= 1;
        } catch (error) {
          this.ticks -= 1;
          console.error('Can\'t validate form.');
        }
      },

      /**
       * Creates the form acessor object.
       * @returns {FormAcessor}
       */
      createFormAcessor () {
        const acessor = {
          update: this.update.bind(this),
          validateForm: this.validateForm.bind(this),
          validateField: this.validateField.bind(this),
        };

        defineReadOnlyProperty(acessor, 'fields', () => this.fields);
        defineReadOnlyProperty(acessor, 'errors', () => this.errors);
        defineReadOnlyProperty(acessor, 'isValid', () => this.isValid);
        defineReadOnlyProperty(acessor, 'isLoading', () => this.isLoading);

        return acessor;
      }
    },

    beforeDestroy () {
      this.$form.unregister(this.name);
    }
  };
</script>
