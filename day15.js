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

function findIndexOfValueBefore(turn, value) {
    // console.log("Finding value %s before turn %s", value, turn);
    if (turn < 1) {
        return 0;
    }
    if (valueAtTurn(turn - 1) === value) {
        return turn - 1;
    }
    return findIndexOfValueBefore(turn - 1, value);
}

const turns = new Array(2021);
console.log(turns);
const valueAtTurn = (turn) => {
    // console.log("Requesting value at turn %s", turn);
    if (turns[turn] !== undefined) {
        // console.log(turns)
        return turns[turn];
    }
    if (turn < 1) {
        return undefined;
    }
    if (turn <= 3) {
        return [0, 3, 6][turn - 1];
    }
    const previousValue = valueAtTurn(turn - 1);
    const previousTurn = findIndexOfValueBefore(turn - 1, previousValue);
    if (previousTurn < 1) {
        turns[turn] = 0;
        return 0;
    } else {
        turns[turn] = (turn - 1) - previousTurn;
        return (turn - 1) - previousTurn;
    }
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

    const part1 = R.until(lessThan(2020), addNumber, [0,3,6]);
    console.log(R.last(part1));

    //number at 2000 = distance between number at 1999 and previous number at ?
    //number at x = distance between number at (x - 1) and findNumber where index < x

    console.log(valueAtTurn(2020))
})();