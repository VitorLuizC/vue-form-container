<template>
  <form>
    <slot
      :values="values"
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
  import { isType, isEveryProperty, isNotEmptyString } from './predicates';

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
        this.ticks > 0;
      },

      isValid () {
        return isValid(this.errors) && this.isLoading;
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
        this.$form.register(to, this);
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
      }
    },

    beforeDestroy () {
      this.$form.unregister(this.name);
    }
  };
</script>
