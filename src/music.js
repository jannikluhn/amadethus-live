import measureTable from "./k516f.csv";

// first index: bar number, second index: dice result
const measureIndices = [
  [96, 32, 69, 40, 148, 104, 152, 119, 98, 3, 54],
  [22, 6, 95, 17, 74, 157, 60, 84, 142, 87, 130],
  [141, 128, 158, 113, 169, 27, 171, 114, 42, 165, 10],
  [41, 69, 19, 85, 45, 167, 58, 50, 156, 61, 103],
  [105, 146, 153, 161, 80, 154, 99, 140, 75, 135, 28],
  [122, 46, 55, 2, 97, 68, 133, 86, 129, 47, 37],
  [11, 134, 110, 159, 36, 118, 21, 169, 62, 147, 106],
  [30, 81, 24, 100, 107, 91, 127, 94, 123, 33, 5],
  [70, 117, 66, 90, 25, 138, 16, 120, 65, 102, 35],
  [121, 39, 139, 176, 143, 71, 155, 88, 77, 4, 20],
  [26, 126, 15, 7, 64, 150, 57, 48, 19, 31, 108],
  [9, 56, 132, 34, 125, 29, 175, 166, 82, 164, 92],
  [112, 174, 73, 67, 76, 101, 43, 51, 137, 144, 12],
  [49, 18, 58, 160, 136, 162, 168, 115, 38, 59, 124],
  [109, 116, 145, 52, 1, 23, 89, 72, 149, 173, 44],
  [14, 83, 79, 170, 93, 151, 172, 111, 8, 78, 131],
];

function getRawMeasurePair(index) {
  const rightIndex = (index - 1) * 2;
  const leftIndex = (index - 1) * 2 + 1;
  const rightRow = measureTable[rightIndex];
  const leftRow = measureTable[leftIndex];
  console.assert(rightRow.part == "G");
  console.assert(leftRow.part == "F");
  console.assert(parseInt(rightRow.index) == index);
  console.assert(parseInt(leftRow.index) == index);
  return [rightRow.notes, leftRow.notes];
}

function diceToIndex(n) {
  return n - 2;
}

function throwDie(rng) {
  return Math.floor(rng() * 6) + 1;
}

function throwDice(rng) {
  return throwDie(rng) + throwDie(rng);
}

function randomMeasure(rng, measureIndex) {
  let dice = throwDice(rng);
  let index = measureIndices[measureIndex][diceToIndex(dice)];
  let measurePair = getRawMeasurePair(index);
  return measurePair;
}

function getNextMeasure(rng, measures) {
  // each waltz consists of 3 * 8 = 24 bars
  const nextMeasureIndex = measures.length % (3 * 8);
  if (nextMeasureIndex < 8) {
    // first part
    return randomMeasure(rng, nextMeasureIndex);
  } else if (nextMeasureIndex < 15) {
    // repetition
    return measures[measures.length - 8];
  } else if (nextMeasureIndex === 15) {
    // second bracket
    return randomMeasure(rng, 7);
  } else {
    // second part
    return randomMeasure(rng, nextMeasureIndex - 8);
  }
}

export { getNextMeasure };
