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


const flipPieceVertical = (piece) => {
    const newRows = piece.rows.map(R.reverse);
    return addBorders({
        ...piece,
        rows: newRows
    })
};

const flipPieceHorizontal = piece => {
    return addBorders({
        ...piece,
        rows: R.reverse(piece.rows)
    })
};

const column = R.curry((index, piece) => {
    return R.map(row => row[index], piece.rows).join('');
});
const rotatePiece90Degrees = (piece) => {
    const newRows = piece.rows.map((row, rowNr) => {
        return R.reverse(column(rowNr, piece));
    })
    return addBorders({
        ...piece,
        rows: newRows
    })
};
const rotatePieceClockwise = R.curry((rotation, piece) => {
    if (rotation === 0) {
        return piece;
    }
    if (rotation === 90) {
        return rotatePiece90Degrees(piece);
    }

    const firstTurn = rotatePieceClockwise(90, piece);
    return rotatePieceClockwise(rotation - 90, firstTurn)
})

const addBorders = piece => {
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

const allRotations = (piece) => {
    return [
        rotatePieceClockwise(0, piece),
        rotatePieceClockwise(90, piece),
        rotatePieceClockwise(180, piece),
        rotatePieceClockwise(270, piece),
    ];
};

const equalRows = (p1, p2) => {
    return JSON.stringify(p1.rows) === JSON.stringify(p2.rows);
}

const allTransformations = (piece) => {
    const rotated = allRotations(piece);
    return R.uniqWith(equalRows, [
        ...rotated,
        ...rotated.map(flipPieceHorizontal),
        ...rotated.map(flipPieceVertical),
    ]);
};

const idEquals = R.curry((id, piece) => piece.id === id);


const findMatching = R.curry((fn, remainingPieces, start) => {
    return R.filter(p => fn(p.borders, start.borders) && p.id !== start.id, remainingPieces);
});

const findMatchingUp = findMatching((b1, b2) => b1.down === b2.up);
const findMatchingDown = findMatching((b1, b2) => b1.up === b2.down);
const findMatchingLeft = findMatching((b1, b2) => b1.right === b2.left);
const findMatchingRight = findMatching((b1, b2) => b1.left === b2.right);

function pieceToString(piece) {
    return piece.rows.join("\n");
}

const reduceRow = R.curry((pieces, row) => {
    const right = findMatchingRight(pieces, R.last(row))
    const left = findMatchingLeft(pieces, R.head(row))
    if (right.length === 0 && left.length === 0) {
        return row;
    } else if (right.length > 1 || left.length > 2) {
        console.log("More than 1 option found");
    }
    return reduceRow(pieces, [...left, ...row, ...right]);
})

console.log("Huh?");

const determineRow = (dimension) => (pieces, piece) => {
    const startPiece = piece ? piece : R.head(pieces);
    const row = reduceRow(pieces, [startPiece]);
    if (row.length === dimension || pieces.length === 0) {
        return row;
    }
    return determineRow(dimension)(R.tail(pieces));
};

const solvePuzzle = pieces => {
    const dimension = Math.sqrt(pieces.length);

    const duplicatedPieces = R.flatten(R.map(allTransformations, R.map(p => ({
        ...p
    }), pieces)));

    let rows = [];
    let remainingPieces = duplicatedPieces;
    while (rows.length < dimension) {
        let row = [];
        const firstCellRowDown = R.isEmpty(rows) ? [R.head(remainingPieces)] : findMatchingDown(remainingPieces, R.head(R.last(rows)));
        const firstCellRowUp = R.isEmpty(rows) ? [R.head(remainingPieces)] : findMatchingUp(remainingPieces, R.head(R.head(rows)));
        if (R.not(R.isEmpty(firstCellRowDown))) {
            row = determineRow(dimension)(remainingPieces, R.head(firstCellRowDown));
            rows.push(row);
        } else if (R.not(R.isEmpty(firstCellRowUp))) {
            row = determineRow(dimension)(remainingPieces, R.head(firstCellRowUp));
            rows.unshift(row);
        }

        const pieceIds = row.map(R.prop("id"));
        remainingPieces = R.reject(p => R.includes(p.id, pieceIds), remainingPieces);

    }
    return rows;
};

function rowToString(row) {
    const rowHeight = R.head(row).rows.length;
    return R.range(0, rowHeight).map(tileIndex => {
        return row.map(piece => piece.rows[tileIndex]).join('');
    }).join("\n");
}

(async () => {
    const lines = await readLinesForDay(20);
    const tiles = parseInput(lines);
    const pieces = R.map(addBorders, tiles);

    const puzzle = solvePuzzle(pieces);

    //Part 1
    const firstRow = R.head(puzzle)
    const lastRow = R.last(puzzle)
    const corners = [R.head(firstRow), R.last(firstRow), R.head(lastRow), R.last(lastRow)];
    const cornerIds = R.map(R.pipe(R.prop("id"), parseInteger), corners);

    const part1 = multiply(cornerIds);
    console.log(puzzle);
    console.log(part1);

    //Part 2
    const puzzleStringRepresentations = R.map(rowToString, puzzle).join('\n');
    console.log(puzzleStringRepresentations);
})();