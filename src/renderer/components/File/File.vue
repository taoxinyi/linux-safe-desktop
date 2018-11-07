<template>
    <div @dblclick="dblclickHandler">
        {{file.name}}
    </div>
</template>

<script>
const fs = require("fs");

export default {
  name: "File",
  props: ["file"],
  methods: {
    dblclickHandler() {
      this.$emit("doubleClick",this.file)
    }
  }
};
</script>

<style>
/* CSS */
</style>
