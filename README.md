# vue-form-container

[![min size](https://img.shields.io/bundlephobia/min/vue-form-container.svg)](https://bundlephobia.com/result?p=vue-form-container)
[![min + zip size](https://img.shields.io/bundlephobia/minzip/vue-form-container.svg)](https://bundlephobia.com/result?p=vue-form-container)
[![License](https://img.shields.io/npm/l/vue-form-container.svg)](https://github.com/VitorLuizC/vue-form-container/blob/master/LICENSE)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FVitorLuizC%2Fvue-form-container.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FVitorLuizC%2Fvue-form-container?ref=badge_shield)

A _Provider Component_ that encapsulate your forms and handle their states and validations. Under the hood it uses [`valite`](https://VitorLuizC/valite), a light and concise validator engine that works on asynchrony. The idea of having a component handling the states and validations of the forms I took from [`formik`](https://github.com/jaredpalmer/formik) and [`vue-final-form`](https://github.com/egoist/vue-final-form).

## Installation

This library is published in the NPM registry and can be installed using any compatible package manager.

```sh
npm install --save vue-form-container

# Use the command below if you're using Yarn.
yarn add vue-form-container
```

## Getting Started

Wrap your form, or wrapper element, with the `FormContainer` component passing the initial state of the fields and a scheme with the validations. Use `slot-scope` to receive the `FormContainer` scope with fields, errors, and so on.

```vue
<template>
  <form-container :initial="{ name: '' }" :schema="{
    name: [
      (name) => name.length > 0 || 'Name is required.'
    ]
  }">
    <div slot-scope="{ fields, errors }">
      <label>Name</label>
      <input v-model="fields.name" type="text" />
      <span>{{ errors.name }}</span>
    </div>
```

> `FormContainer` is a renderless component, so it can receive just a single element as slot.

You can change the form field states and perform their validations using `update` functions or by changing the state of the` fields` object, which is a Proxy.

> Due to platform limitations, fields (properties) need to be defined in **`schema`** or **`initial`**. If you don't want to initialize the value of a field, use `undefined` for it in **`initial`** or an empty list of validations in **`schema`**.
>
> **It is extremely important that the field exists on at least one of the objects.**
>
> ```vue
> <template>
>   <form-container :initial="{ empty: undefined }">
>   <!-- OR -->
>   <form-container :schema="{ empty: [] }">
> ```

To use the `FormContainer` validations, fields and errors outside the template you should use a `ref` as in the example:

```vue
<template>
  <form-container ref="form" ... >
    <form ... @submit.prevent="onSubmit()">
      ...
      <button type="submit">Sign In</button>
    </form>
  </form-container>
</template>

<script>
  export default {
    methods: {
      async onSubmit () {
        // A FormContainer instance to handle fields, validate methods and other stuff.
        const form = this.$refs.form;

        await form.validateForm();
        if (!form.isValid)
          return;

        console.log('fields', form.fields);
      }
    }
  };
</script>
```

## API

### `FormContainer` props

Name    | Type              | Description
--------|-------------------|-------------
schema  | `ValidatorSchema` | Schema of validators for form fields.
initial | `Object`          | Initial state of form fields.

> #### About `ValidatorSchema` type
>
> `ValidatorSchema` is an object whose key is the name of the field and the value is a collection of validations. Validations are just functions that receive the value of the field and return` true` if it is valid and a `string` with the error message if it is invalid, these functions can also be asynchronous by returning a Promise that returns the same values (`true` or `string` with the error message).
>
> ```typescript
> type Validator = (value: any) => true | string | Promise<true | string>;
>
> type ValidatorSchema = { [field: string]: Validator[]; };
>
> ...
>
> const schema: ValidatorSchema = {
>   name: [
>     (name) => !!name.trim() || 'Name is required.',
>
>     async (name) => {
>       const isRepeated = await services.isRepeatedName(name);
>       return !isRepeated || 'Name is repeated.';
>     }
>   ]
> };
> ```

### `FormContainer` properties and methods (also received by slot-scope)

Name          | Type                                  | Description
--------------|---------------------------------------|:------------
isValid       | `boolean`                             | Indicates if form fields are valid.
isLoading     | `boolean`                             | Indicates if there's a validation running.
errors        | `MessageSchema`                       | Error scheme of form fields.
fields        | `Proxy<{ [field: string]: any }>`     | Proxy with form fields. It uses getters to get the state of the field and setters to update it.
update        | `(field: string, value: any) => void` | Updates the state of the `field` using the `value`.
validateField | `(field: string) => Promise<void>`    | Executes the schema validations for the `field` field.
validateForm  | `() => Promise<void>`                 | Executes the validations on all fields specified in the schema.

> #### About `MessageSchema` type
>
> `MessageSchema` is a reflection of the scheme used to define the validations and contains the error messages (or `null`) for the fields.
>
> ```typescript
> type Message = string | null;
>
> type MessageSchema = { [field: string]: Message; };
>
> ...
>
> const errors: MessageSchema = {
>   name: 'Use first and last name.',
>   email: 'E-Mail is required.',
>   phone: null, // No error message, because validators have returned true.
> };
> ```

## Example

```vue
<template>
  <form-container ref="form" :schema="schema" :initial="initial">
    <form slot-scope="{ fields, errors, submit }" @submit.prevent="onSubmit()">
      <fieldset>
        <label>Name</label>
        <input type="text" v-model="fields.name" />
        <span v-if="errors.name">{{ errors.name }}</span>
      </fieldset>

      <fieldset>
        <label>E-Mail</label>
        <input type="email" v-model="fields.email" />
        <span v-if="errors.name">{{ errors.email }}</span>
      </fieldset>

      <button type="submit">Sign Up</button>
    </form>
  </form-container>
</template>

<script>
  import FormContainer from 'vue-form-container';
  import * as services from './services';

  // FormContainer schema to validate fields.
  const schema = {
    name: [
      (name) => !!name.trim() || 'Name is required.'
    ],
    email: [
      (email) => !!email.trim() || 'E-Mail is required.',
      (email) => /^.+@.+\..+$/.test(email) || 'E-Mail is invalid.',
      async (email) => {
        const isRepeated = await services.isRepeatedEMail(email);
        return isRepeated || 'E-Mail is already registered.'
      }
    ]
  };

  export default {
    components: { FormContainer },
    data () {
      return {
        schema,

        // FormContainer fields initial state.
        initial: { name: '', email: '' }
      };
    },
    methods: {
      async onSubmit () {
        await this.$refs.form.validateForm();

        if (!this.$refs.form.isValid)
          return;

        console.log('submit fields', this.$refs.form.fields);
      }
    }
  };
</script>
```

## License

Released under [MIT License](./LICENSE).


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FVitorLuizC%2Fvue-form-container.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FVitorLuizC%2Fvue-form-container?ref=badge_large)