import {readLinesForDay} from "./fetchFile.js";

const filter2NumberCombinationWithSum = sum => (arr) => {
    return arr.reduce((acc, v, i) => {
        const tail = arr.slice(i + 1);
        return [...acc, ...tail.filter(t => t + v === sum).map(v2 => ([v, v2]))];
    }, []);
};

(async () => {
    const lines = await readLinesForDay(9);

    const numbers = lines.map(l => parseInt(l, 10));
    const PREAMBLE_LENGTH = 25;

    const result = numbers.filter((value, index, array) => {
        if (index <= PREAMBLE_LENGTH - 1) {
            return false;
        }

        const preamble = array.slice(index - PREAMBLE_LENGTH, index);
        const combinations = filter2NumberCombinationWithSum(value)(preamble)
        return combinations.length === 0;

    })
    console.log(result)
})();