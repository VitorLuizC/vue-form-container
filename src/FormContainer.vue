<script>
  import { isValid, validate, validateObject } from 'valite';
  import { definePropertyAcessors, defineReadOnlyProperty } from './object';
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
       * When schema is changed it updates values with it.
       * @param {object} schema
       */
      schema (schema) {
        this.setupValuesWith(schema, this.values);
      }
    },

    computed: {
      fields () {
        const fields = Object.create(null);

        Object.keys(this.values).forEach(
          (field) => definePropertyAcessors(fields, field, {
            get: () => this.values[field],
            set: (value) => this.update(field, value)
          })
        );

        return fields;
      },

      scope () {
        const scope = {
          update: this.update,
          validateForm: this.validateForm,
          validateField: this.validateField,
        };

        defineReadOnlyProperty(scope, 'fields', () => this.fields);
        defineReadOnlyProperty(scope, 'errors', () => this.errors);
        defineReadOnlyProperty(scope, 'isValid', () => this.isValid);
        defineReadOnlyProperty(scope, 'isLoading', () => this.isLoading);

        return scope;
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
      validateField (field) {
        this.ticks += 1;
        return (
          validate(this.values[field], this.schema[field])
            .then((error) => {
              this.$set(this.errors, field, error);
              this.ticks -= 1;
            })
            .catch((_) => {
              console.error(`Can't validate field "${field}".`);
              this.ticks -= 1;
            })
        );
      },

      /**
       * Validates all fields and updates Form properties.
       * @returns {Promise.<void>}
       */
      validateForm () {
        this.ticks += 1;
        return (
          validateObject(this.values, this.schema)
            .then((errors) => {
              this.errors = errors;
              this.ticks -= 1;
            })
            .catch((_) => {
              console.error('Can\'t validate form.');
              this.ticks -= 1;
            })
        );
      }
    },

    render () {
      return this.$scopedSlots.default(this.scope);
    },

    mounted () {
      this.setupValuesWith(this.schema, this.initial);
    }
  };
</script>
