<template>
  <div class="container mx-auto pt-10">
    <h1 class="text-center text-4xl font-bold mb-10">
      Amadethus LIVE: The Merge
    </h1>
    <button
      v-if="!simulatingMerge"
      @click="simulatingMerge = true"
      class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
    >
      Simulate Merge
    </button>
    <p v-else>Simulating merge</p>
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
    <p v-if="lines.length === 0">Waiting for block...</p>
  </div>
</template>

<script>
import seed from "seed-random";
import { getNextMeasure } from "./music.js";
import Line from "./components/Line.vue";
import { isPoWBlock, isLastPoWBlock, TTD } from "./blocks.js";

const WSS_JSON_RPC_URL =
  "wss://mainnet.infura.io/ws/v3/a8bd718c8f3c4190aee14fe884f36d59";
const HTTPS_JSON_RPC_URL =
  "https://mainnet.infura.io/v3/a8bd718c8f3c4190aee14fe884f36d59";

const MEASURES_PER_BLOCK = 4;

const BIG1 = BigInt(1);

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
      bpm: 120,
      simulatingMerge: false,
      previousBlock: null,
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
      let block;
      if (this.simulatingMerge && this.previousBlock !== null) {
        if (
          isPoWBlock(this.previousBlock) &&
          !isLastPoWBlock(this.previousBlock)
        ) {
          block = {
            ...header,
            ...{
              totalDifficulty: "0x" + TTD.toString(16),
            },
          };
        } else if (isLastPoWBlock(this.previousBlock)) {
          block = {
            ...header,
            ...{
              totalDifficulty: "0x" + TTD.toString(16),
              difficulty: "0x0",
            },
          };
          this.ethereumWS.close();
          setInterval(() => {
            this.onNewBlock({
              ...this.previousBlock,
              ...{
                number:
                  "0x" +
                  (BigInt(this.previousBlock.number) + BIG1).toString(16),
                hash:
                  "0x" + (BigInt(this.previousBlock.hash) + BIG1).toString(16),
              },
            });
          }, 12000);
        } else {
          block = {
            ...header,
            ...{
              totalDifficulty: "0x" + TTD.toString(16),
              difficulty: "0x0",
            },
          };
        }
      } else {
        block = await this.fetchFullBlock(header.hash);
      }
      this.previousBlock = block;
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
