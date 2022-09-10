<template>
  <ABC :abc="abc" />
</template>

<script>
import ABC from "./ABC.vue";

export default {
  name: "Measures",
  props: ["measures"],
  components: {
    ABC,
  },
  computed: {
    abc() {
      let lines = ["M:3/8", "L:1/8", "V:1 clef=treble", "V:2 clef=bass", "K:C"];
      let voice1 = "[V:1]|";
      let voice2 = "[V:2]|";
      for (let i = 0; i < this.measures.length; i++) {
        const ms = this.measures[i];
        const paddingLength = Math.max(ms[0].length, ms[1].length);
        voice1 += this.measures[i][0].padEnd(paddingLength, " ") + " | ";
        voice2 += this.measures[i][1].padEnd(paddingLength, " ") + " | ";
      }
      lines.push(voice1);
      lines.push(voice2);
      return lines.join("\n");
    },
  },
};
</script>
