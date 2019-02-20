<script>
  import { isValid, validate, validateObject } from 'valite';
  import { definePropertyAcessors, defineReadOnlyProperty, cloneOnlyKeys } from './object';
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
        isInitialized: false,
        errors: Object.create(null),
        values: Object.create(null)
      };
    },

    watch: {
      schema: {
        /**
         * On schema changes it update `values` state. It merges only keys in
         * schema and outdated `values`, or `initial` if FormContainer is
         * not initialized.
         * @param {object} schema
         */
        handler (schema) {
          const values = this.isInitialized ? this.values : this.initial;
          if (this.isInitialized)
            this.isInitialized = true;
          this.values = Object.assign(cloneOnlyKeys(schema), values);
        },
        immediate: true,
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

      isLoading () {
        return this.ticks > 0;
      },

      isValid () {
        return !this.isLoading && isValid(this.errors);
      }
    },

    methods: {
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
      return this.$scopedSlots.default(this);
    }
  };
</script>
