<template>
  <div class="flex w-full h-full justify-center items-center">
    <p class="text-2xl" v-if="n < maxN">{{ n + 1 }}</p>
  </div>
</template>

<script>
export default {
  name: "Counter",
  props: ["bpm"],
  data() {
    return {
      n: 0,
      maxN: 3,
      intervalId: null,
    };
  },

  mounted() {
    this.intervalId = setInterval(() => {
      this.n++;
      if (this.n >= this.maxN) {
        this.unsetInterval();
      }
    }, (1 / this.bpm) * 60 * 1000 * 3);
  },
  unmounted() {
    this.unsetInterval();
  },

  methods: {
    unsetInterval() {
      if (this.intervalId === null) {
        return;
      }
      clearInterval(this.intervalId);
      this.intervalId = null;
    },
  },
};
</script>
