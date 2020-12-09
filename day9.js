import {readLinesForDay} from "./fetchFile.js";
import {first, last, sum} from "./utils/arrays.js";

const filter2NumberCombinationWithSum = sum => (arr) => {
    return arr.reduce((acc, v, i) => {
        const tail = arr.slice(i + 1);
        return [...acc, ...tail.filter(t => t + v === sum).map(v2 => ([v, v2]))];
    }, []);
};

const dropIfMoreThan = s => (arr) => {
    if (sum(arr) > s) {
        return dropIfMoreThan(s)(arr.slice(1));
    }
    return arr;
};

const filterContinuousSetsWithSum = (s) => (arr) => {
    const cs = arr.reduce((continuousSet, v) => {
        if (sum(continuousSet) === s) {
            //ignore this value, we've found the set
            return continuousSet;
        }
        return dropIfMoreThan(s)([...continuousSet, v]);
    }, []);

    if (sum(cs) === s) {
        return cs;
    }
    return [];
};

(async () => {
    const lines = await readLinesForDay(9);

    const numbers = lines.map(l => parseInt(l, 10));
    const PREAMBLE_LENGTH = 25;

    const result = first(numbers.filter((value, index, array) => {
        if (index <= PREAMBLE_LENGTH - 1) {
            return false;
        }

        const preamble = array.slice(index - PREAMBLE_LENGTH, index);
        const combinations = filter2NumberCombinationWithSum(value)(preamble)
        return combinations.length === 0;

    }))
    console.log(result)

    const continuousSet =
        filterContinuousSetsWithSum(result)(numbers)

    console.log(continuousSet);
    console.log("Result part 2: ", Math.min(...continuousSet) + Math.max(...continuousSet));
})();