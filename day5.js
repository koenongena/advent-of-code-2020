import {getFilePath, readLines} from "./fetchFile.js";

const lowerHalf = (possibleRows) => {
    return possibleRows.slice(0, Math.ceil(possibleRows.length / 2));
}
const upperHalf = (possibleRows) => {
    return possibleRows.slice(-Math.ceil(possibleRows.length / 2));
}

const isInLowerHalfWhenStartingWith = lowerHalfSpecification => (s) => s.charAt(0) === lowerHalfSpecification;

const splitOnLowerHalfSpecification = (indicatedLowerHalf) => {
    const split = (s, possibleRows) => {
        if (possibleRows.length === 1) {
            return possibleRows[0];
        }

        if (indicatedLowerHalf(s)) {
            return split(s.slice(1), lowerHalf(possibleRows));
        } else {
            return split(s.slice(1), upperHalf(possibleRows));
        }
    };
    return (s, amount) => {
        return split(s, Array.from(Array(amount).keys()))
    };
};
const parseRow = s => splitOnLowerHalfSpecification(isInLowerHalfWhenStartingWith(('F')))(s, 128);
const parseColumn = s => splitOnLowerHalfSpecification(isInLowerHalfWhenStartingWith('L'))(s, 8);

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