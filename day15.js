import {readLinesForDay} from "./fetchFile.js";
import R from 'ramda';

const addNumber = ({indexes, lastSpoken, turn}) => {
    let newNumber = 0;

    if (indexes.has(lastSpoken)) {
        const lastSpokenIndex = indexes.get(lastSpoken);
        newNumber = (turn - 1) - lastSpokenIndex;
    }
    indexes.set(lastSpoken, turn - 1);
    return {indexes, lastSpoken: newNumber, turn: turn + 1};
}

const createPreviousSpokenMap = input => R.dropLast(1, input).reduce((m, currentValue, currentIndex) => {
    m.set(currentValue, currentIndex + 1)
    return m;
}, new Map());

(async () => {
    const lines = await readLinesForDay(15);

    const input = lines[0].split(',').map(v => parseInt(v, 10));

    console.log(input)
    const moreThan = count => ({turn}) => turn > count;

    const lastSpoken = R.last(input);

    const part1 = R.until(moreThan(2020), addNumber, {
        indexes: createPreviousSpokenMap(input),
        lastSpoken,
        turn: input.length + 1
    });
    console.log(part1.lastSpoken);

    const part2 = R.until(moreThan(30000000), addNumber, {
        indexes: createPreviousSpokenMap(input),
        lastSpoken,
        turn: input.length + 1
    });
    console.log(part2.lastSpoken);
})();