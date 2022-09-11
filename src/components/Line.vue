<template>
  <div class="">
    <h1 class="text-2xl font-bold">Block #{{ blockNumber }}</h1>
    <div class="flex flex-row">
      <div class="w-20">
        <Counter :bpm="bpm" />
      </div>
      <div class="">
        <Measures :measures="measures" />
      </div>
      <div class="flex flex-col justify-center items-center">
        <p>Type: {{ typeLabel }}</p>
        <p>Difficulty to go: {{ difficultyToGo }}</p>
        <p>Blocks to go (estimate): {{ blocksToGo }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { isPoSBlock, isLastPoWBlock, TTD } from "../blocks.js";
import Measures from "./Measures.vue";
import Counter from "./Counter.vue";

const BIG0 = BigInt(0);

function formatNumber(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default {
  name: "Line",
  props: ["block", "measures", "bpm"],
  components: { Measures, Counter },

  computed: {
    blockNumber() {
      return formatNumber(BigInt(this.block.number));
    },
    typeLabel() {
      if (isPoSBlock(this.block)) {
        return "PoS";
      }
      let l = "PoW";
      if (isLastPoWBlock(this.block)) {
        l += " (final)";
      }
      return l;
    },
    difficultyToGo() {
      const d = (TTD - BigInt(this.block.totalDifficulty)) / BigInt(1e15);
      if (d > BIG0) {
        return formatNumber(d) + "e15";
      } else {
        return "0";
      }
    },
    blocksToGo() {
      if (BigInt(this.block.totalDifficulty) >= TTD) {
        return formatNumber(0);
      }
      const s =
        (TTD - BigInt(this.block.totalDifficulty)) /
        BigInt(this.block.difficulty);
      return formatNumber(s);
    },
  },
};
</script>
