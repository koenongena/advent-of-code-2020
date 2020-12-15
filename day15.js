import {readLinesForDay} from "./fetchFile.js";
import R from 'ramda';

const addNumber = (previousNumbers) => {
    const lastSpoken = R.last(previousNumbers);
    const lastSpokenIndex = previousNumbers.length - 1;
    const beforeLast = R.dropLast(1, previousNumbers);
    const previouslySpokenIndex = R.findLastIndex(v => v === lastSpoken, beforeLast);

    if (previouslySpokenIndex < 0) {
        return [...previousNumbers, 0];
    }
    return [...previousNumbers, lastSpokenIndex - previouslySpokenIndex];
}

(async () => {
    const lines = await readLinesForDay(15);

    const input = lines[0].split(',').map(v => parseInt(v, 10));

    console.log(input)
    const lessThan = R.curry((count, acc) => acc.length >= count);

    // const part1 = R.until(lessThan(2020), addNumber, [0, 3, 6]);
    // const part1 = R.until(lessThan(2020), addNumber, [1,3,2]);
    // const part1 = R.until(lessThan(2020), addNumber, [3,1,2]);
    // const part1 = R.until(lessThan(2020), addNumber, input);

    const part1 = R.until(lessThan(30000000), addNumber, [0,3,6]);
    console.log(R.last(part1));

})();