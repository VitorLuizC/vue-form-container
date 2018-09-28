<template>
  <form>
    <slot />
  </form>
</template>

<script>
  export default {
    props: {
      entries: {
        type: Array,
        required: true,
        validator: (entries) => Array.isArray(entries) && entries.every((name) => typeof value === 'string')
      },
      validators: {
        type: Array,
        default: () => [],
        validator: (validators) => Array.isArray(validators) && validators.every((validator) => typeof validator === 'function')
      }
    }
  };
</script>
