<template>
  <form>
    <slot />
  </form>
</template>

<script>
  import { isType, isEvery } from './predicates';

  export default {
    props: {
      entries: {
        type: Array,
        required: true,
        validator: isEvery(isType('string'))
      },
      validators: {
        type: Array,
        default: () => [],
        validator: isEvery(isType('function'))
      }
    }
  };
</script>
