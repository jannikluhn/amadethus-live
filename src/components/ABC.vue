<template>
  <div ref="target"></div>
</template>

<script>
import abcjs from "abcjs";

export default {
  name: "ABC",
  props: ["abc"],
  mounted() {
    this.render();
  },
  watch: {
    abc() {
      this.render();
    },
  },
  methods: {
    render() {
      abcjs.renderAbc(this.$refs.target, this.abc || "");
    },
  },
};
</script>
