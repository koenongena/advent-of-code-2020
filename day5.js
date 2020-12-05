import {getFilePath, readLines} from "./fetchFile.js";

const splitOnLowerHalfSpecification = (lowerHalfSpecification) => {
    const split = (s, range) => {
        if (!s) {
            return range.min;
        }

        const x = (range.max - range.min) / 2;
        if (s.charAt(0) === lowerHalfSpecification) {
            return split(s.slice(1), {min: range.min, max: range.min + Math.floor(x)});
        } else {
            return split(s.slice(1), {min: range.min + Math.ceil(x), max: range.max});
        }
    };
    return split;
};
const parseRow = s => splitOnLowerHalfSpecification('F')(s, {min: 0, max: 127});
const parseColumn = s => splitOnLowerHalfSpecification('L')(s, {min: 0, max: 7});

const parseSeatId = s => {
    const row = parseRow(s.slice(0, 7));
    const col = parseColumn(s.slice(7));

    return row * 8 + col;
};

const missingSeatsWithNeighbours = (acc, currentValue, index, arr) => {
    if (currentValue - arr[index - 1] === 2) {
        return [...acc, currentValue - 1];
    }
    return acc;
};

(async () => {
    const lines = await readLines(await getFilePath(5));
    const seatIds = lines.map(parseSeatId);
    console.log("Highest seat ID:", Math.max(...seatIds));

    const missingSeats = seatIds
        .sort()
        .reduce(missingSeatsWithNeighbours, []);

    console.log("Missing seat:", ...missingSeats);
})();