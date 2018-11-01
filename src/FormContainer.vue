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
  import { isValid, validate, validateObject } from 'valite';
  import { defineReadOnlyProperty } from './object';
  import { isType, isEveryProperty, isNotEmptyString, isObject } from './predicates';

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
      schema: {
        type: Object,
        required: true,
        validator: isEveryProperty(isType('function'))
      },
      initial: {
        type: Object,
        default: () => Object.create(null),
        validator: isObject
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
      /**
       * When name is changed it swiches registered form name.
       * @param {string} newName
       * @param {string} [oldName]
       */
      name (newName, oldName) {
        this.$form.unregister(from);
        this.$form.register(newName, this.createFormAcessor());
      },

      /**
       * When schema is changed it updates values with it.
       * @param {object} schema
       */
      schema (schema) {
        this.setupValuesWith(schema, this.values);
      }
    },

    computed: {
      fields () {
        const descriptors = {};

        Object.keys(this.values).forEach((key) => {
          descriptors[key] = {
            get: () => this.values[key],
            set: (value) => this.update(key, value),
            enumerable: true,
            configurable: false
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
       * Setups state using an schema and value objects.
       * @param {object} schema
       * @param {object} values
       */
      setupValuesWith (schema, values) {
        const keys = Object.keys(Object.assign({}, schema, values));
        this.values = keys.reduce((state, key) => {
          state[key] = values[key] || undefined;
          return state;
        }, Object.create(null));
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
        const validators = this.schema[field];

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
          const errors = await validateObject(this.values, this.schema);
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

    mounted () {
      this.$form.register(this.name, this.createFormAcessor());
      this.setupValuesWith(this.schema, this.initial);
    },

    beforeDestroy () {
      this.$form.unregister(this.name);
    }
  };
</script>
