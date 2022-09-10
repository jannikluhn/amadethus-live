<template>
  <div class="container mx-auto pt-10">
    <h1 class="text-center text-4xl font-bold mb-10">
      Amadethus LIVE: The Merge
    </h1>
    <div class="space-y-20">
      <TransitionGroup name="lines" tag="Line">
        <Line
          v-for="line in lines.slice().reverse()"
          :key="line.block.hash"
          :block="line.block"
          :measures="line.measures"
          :bpm="bpm"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script>
import seed from "seed-random";
import { getNextMeasure } from "./music.js";
import Line from "./components/Line.vue";

const WSS_JSON_RPC_URL =
  "wss://mainnet.infura.io/ws/v3/a8bd718c8f3c4190aee14fe884f36d59";
const HTTPS_JSON_RPC_URL =
  "https://mainnet.infura.io/v3/a8bd718c8f3c4190aee14fe884f36d59";

const MEASURES_PER_BLOCK = 4;

function getLineFromBlock(block, previousMeasures) {
  const hash = block.hash;
  const rng = seed(hash);

  let measures = [];
  for (let i = 0; i < MEASURES_PER_BLOCK; i++) {
    const nextMeasure = getNextMeasure(rng, [...previousMeasures, ...measures]);
    measures.push(nextMeasure);
  }

  return {
    measures: measures,
    block: block,
  };
}

export default {
  name: "App",
  components: {
    Line,
  },
  data() {
    return {
      ethereumWS: null,
      lines: [],
      bpm: 180,
    };
  },

  computed: {
    measures() {
      let measures = [];
      for (let i = 0; i < this.lines.length; i++) {
        measures.push(...this.lines[i].measures);
      }
      return measures;
    },
  },

  mounted() {
    this.ethereumWS = new WebSocket(WSS_JSON_RPC_URL);
    this.ethereumWS.addEventListener("open", () => {
      console.log("listening for blocks...");
      this.ethereumWS.send(
        '{"jsonrpc":"2.0","method":"eth_subscribe","params":["newHeads"], "id":1}'
      );
    });
    this.ethereumWS.addEventListener("message", (data) => {
      const obj = JSON.parse(data.data);
      if (obj.params === undefined) {
        return;
      }
      const block = obj.params.result;
      this.onNewBlock(block);
    });
  },

  unmounted() {
    if (this.ethereumWS) {
      this.ethereumWS.close();
    }
  },

  methods: {
    async onNewBlock(header) {
      const block = await this.fetchFullBlock(header.hash);
      const line = getLineFromBlock(block, this.measures);
      this.lines.push(line);
      this.lines.sort((l1, l2) =>
        Number(BigInt(l1.block.number) - BigInt(l2.block.number))
      );
      this.lines = this.lines.slice(-10);
    },

    async fetchFullBlock(hash) {
      const response = await fetch(HTTPS_JSON_RPC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getBlockByHash",
          params: [hash, false],
          id: 1,
        }),
      });
      const { result, error } = await response.json();
      if (error !== undefined) {
        throw error;
      }
      return result;
    },
  },
};
</script>

<style>
.lines-move,
.lines-enter-active,
.lines-leave-active {
  transition: all 0.2s ease;
}

.lines-enter-from,
.lines-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.lines-leave-active {
  position: absolute;
}
</style>
