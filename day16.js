import {readLinesForDay} from "./fetchFile.js";
import R from 'ramda';
import {parseInteger} from "./utils/numbers.js";

const splitOn = (char, arr) => {
    const pair = R.splitWhen(R.equals(char), arr);
    if (pair[1].length) {
        return [pair[0], ...splitOn(char, R.tail(pair[1]))]
    }
    return [pair[0]];
}

const splitAndParse = R.pipe(R.split(','), R.map(parseInteger));

(async () => {

    const lines = await readLinesForDay(16);
    const chunks = splitOn('', lines);
    const rules = chunks[0];
    const myTickets = splitAndParse(R.last(chunks[1]));
    const nearbyTickets = R.map(splitAndParse, R.tail(chunks[2]));
})();