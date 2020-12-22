import {readLinesForDay} from "./fetchFile.js";
import R from "ramda";
import {parseInteger} from "./utils/numbers.js";
import {multiply} from "./utils/math.js";

const newPiece = {id: 'unknown', rows: []};

const parseInput = (lines) => {
    const acc = R.reduce(({completedPieces, piece}, line) => {
        if (line === '') {
            return {completedPieces: [...completedPieces, piece], piece: newPiece};
        }
        if (line.startsWith("Tile")) {
            return {completedPieces, piece: {...piece, id: R.match(/\d+/, line)[0]}}
        }
        return {completedPieces, piece: {...piece, rows: [...piece.rows, line]}}
    }, {completedPieces: [], piece: newPiece}, lines);

    return acc.completedPieces.concat(acc.piece);
};


const flipVertical = borders => {
    const {up, right, down, left} = borders;
    return {
        up: R.reverse(up),
        down: R.reverse(down),
        right: left,
        left: right
    }
};
const flipHorizontal = borders => {
    const {up, right, down, left} = borders;
    return {
        up: down,
        down: up,
        right: R.reverse(right),
        left: R.reverse(left)
    }
};

const rotateClockwiseBorders = R.curry((rotation, borders) => {
    if (rotation === 0) {
        return borders;
    }
    if (rotation === 90) {
        const {up, right, down, left} = borders;
        return {
            up: R.reverse(left),
            right: up,
            down: R.reverse(right),
            left: down
        };
    }

    const firstTurn = rotateClockwiseBorders(90, borders);
    return rotateClockwiseBorders(rotation - 90, firstTurn)
});

const calculateBorders = piece => {
    const up = R.head(piece.rows);
    const left = R.map(R.head, piece.rows).join('');
    const right = R.map(R.last, piece.rows).join('');
    const down = R.last(piece.rows);

    const borders = {up, right, down, left};

    return {
        ...piece,
        borders
    };
};

const allTransformations = (b) => [
    b,
    rotateClockwiseBorders(90, b),
    rotateClockwiseBorders(180, b),
    rotateClockwiseBorders(270, b),
    flipVertical(b),
    flipHorizontal(b),
];

const matchesPiece = R.curry((p1, p2) => {

    const allP1Transformations = allTransformations(p1.borders);
    const allP2Transformations = allTransformations(p2.borders);
    const mapDown = R.map(R.prop("down"));
    const mapUp = R.map(R.prop("up"));
    const mapLeft = R.map(R.prop("left"));
    const mapRight = R.map(R.prop("right"));
    return R.intersection(mapUp(allP2Transformations), mapDown(allP1Transformations)).length > 0 ||
        R.intersection(mapLeft(allP2Transformations), mapRight(allP1Transformations)).length > 0 ||
        R.intersection(mapRight(allP2Transformations), mapLeft(allP1Transformations)).length > 0 ||
        R.intersection(mapDown(allP2Transformations), mapUp(allP1Transformations)).length > 0;

});

const findMatchingPieces = R.curry((pieces, piece) => {
    const otherPieces = R.reject(p => p.id === piece.id, pieces);

    return otherPieces.filter(matchesPiece(piece));
});

const idEquals = R.curry((id, piece) => piece.id === id);

(async () => {

    const lines = await readLinesForDay(20);
    const pieces = R.map(calculateBorders, parseInput(lines));

    const addMatchingPieces = piece => ({...piece, matches: findMatchingPieces(pieces, piece)});
    const matches = R.map(addMatchingPieces, pieces);
    console.log(matches.map(m => ({id: m.id, matches: m.matches.map(R.prop("id"))})));

    const corners = matches.filter(m => m.matches.length === 2);
    console.log(multiply(corners
        .map(R.prop("id"))
        .map(parseInteger))
    );
})();