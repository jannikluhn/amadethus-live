const TTD = BigInt("58750000000000000000000");

function isPoWBlock(block) {
  return BigInt(block.difficulty) != 0;
}

function isLastPoWBlock(block) {
  return isPoWBlock(block) && BigInt(block.totalDifficulty) >= TTD;
}

function isPoSBlock(block) {
  return !isPoWBlock(block);
}

export { TTD, isPoWBlock, isLastPoWBlock, isPoSBlock };
