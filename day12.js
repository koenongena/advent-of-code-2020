import {readLinesForDay} from "./fetchFile.js";
import * as R from 'ramda';

const rotateClockwise = (facing, amount) => {
    if (amount === 0) {
        return facing;
    } else if (amount < 0) {
        rotateCounterClockwise(facing, -1 * amount);
    } else if (amount === 90) {
        switch (facing) {
            case 'N':
                return 'E';
            case 'E':
                return 'S';
            case 'S':
                return 'W';
            case 'W':
                return 'N'
        }
    }

    return rotateClockwise(rotateClockwise(facing, 90), amount - 90)
};

function rotateCounterClockwise(facing, amount) {
    if (amount < 0) {
        return rotateClockwise(-1 * amount);
    }
    return rotateClockwise(facing, 360 - amount);
}

const handleAction = (s, position) => {
    const action = [...s][0];
    const amount = parseInt(s.substring(1), 10);

    switch (action) {
        case 'N':
            return {
                ...position,
                y: position.y + amount
            }
        case 'S':
            return {
                ...position,
                y: position.y - amount
            }
        case 'E':
            return {
                ...position,
                x: position.x + amount
            }
        case 'W':
            return {
                ...position,
                x: position.x - amount
            }
        case 'L':
            return {
                ...position,
                facing: rotateCounterClockwise(position.facing, amount)
            }
        case 'R':
            return {
                ...position,
                facing: rotateClockwise(position.facing, amount)
            }

        case 'F':
            return handleAction(position.facing + amount, position);
    }
}

const manhattanDistance = (position) => {
    return Math.abs(position.x) + Math.abs(position.y);
}
(async () => {
    const lines = await readLinesForDay(12);

    const result = lines.reduce((acc, line) => {
        console.log(acc);
        return handleAction(line, acc);
    }, {facing: 'E', x: 0, y: 0})

    console.log(manhattanDistance(result));


})();
