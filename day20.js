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


const flipVertical = (arr) => {
    return arr.map(R.reverse);
};

const flipHorizontal = arr => {
    return R.reverse(arr);
};

const getColumn = R.curry((index, arr) => {
    return R.map(row => row[index], arr).join('');
});

const rotateClockwise = R.curry((rotation, arr) => {
    if (rotation === 0) {
        return arr;
    }
    if (rotation === 90) {
        return arr.map((row, rowNr) => {
            return R.reverse(getColumn(rowNr, arr));
        });
    }

    const firstTurn = rotateClockwise(90, arr);
    return rotateClockwise(rotation - 90, firstTurn)
})

const calculateBorders = (arr) => {
    const up = R.head(arr);
    const left = R.map(R.head, arr).join('');
    const right = R.map(R.last, arr).join('');
    const down = R.last(arr);

    return {up, right, down, left};
}

const addBorders = piece => {
    return {
        ...piece,
        borders: calculateBorders(piece.rows)
    };
};

const allRotations = (arr) => {
    return [
        rotateClockwise(0, arr),
        rotateClockwise(90, arr),
        rotateClockwise(180, arr),
        rotateClockwise(270, arr),
    ];
};

const equalRows = (p1, p2) => {
    return JSON.stringify(p1.rows) === JSON.stringify(p2.rows);
}

const allPieceTransformations = (piece) => {
    const rotatedRows = allRotations(piece.rows);
    const possibilities = [
        ...rotatedRows,
        ...rotatedRows.map(flipHorizontal),
        ...rotatedRows.map(flipVertical),
    ].map((rows) => ({...piece, rows, borders: calculateBorders(rows)}))
    return R.uniqWith(equalRows, possibilities.map(addBorders));
};

const findMatching = R.curry((fn, remainingPieces, start) => {
    return R.filter(p => fn(p.borders, start.borders) && p.id !== start.id, remainingPieces);
});

const findMatchingUp = findMatching((b1, b2) => b1.down === b2.up);
const findMatchingDown = findMatching((b1, b2) => b1.up === b2.down);
const findMatchingLeft = findMatching((b1, b2) => b1.right === b2.left);
const findMatchingRight = findMatching((b1, b2) => b1.left === b2.right);

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

    const duplicatedPieces = R.flatten(R.map(allPieceTransformations, R.map(p => ({
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

const rowToString = row => {
    const rowHeight = R.head(row).rows.length;
    return R.range(0, rowHeight).map(tileIndex => {
        return row.map(piece => piece.rows[tileIndex]).join('');
    }).join("\n");
};

const puzzleToString = innerTiles => R.map(rowToString, innerTiles)
    .join('\n');

const findAllMatches = R.curry((regexp, s) => {
    const r = new RegExp(regexp, 'y');
    const matches = [];
    for (let i = 0; i < s.length; i++) {
        r.lastIndex = i;
        matches.push(r.exec(s));
    }
    return R.filter(s => s, matches);
});

const countSeaMonsters = puzzle => {
    return puzzle.reduce((count, lastRow, rowNr) => {
        if (rowNr < 2) {
            return count;
        }
        const allPossibleMatches = findAllMatches(/.#..#..#..#..#..#.../, lastRow);

        return count + allPossibleMatches.filter(match => {
            const index = match.index;
            return R.test(/#....##....##....###/, puzzle[rowNr - 1].substring(index, index + 20 + 1)) &&
                R.test(/..................#./, puzzle[rowNr - 2].substring(index, index + 20 + 1))
        }).length;
    }, 0);
};

const countCrosses = puzzle => puzzle.join('\n').match(/#/g).length;

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
    console.log("Part 1");
    console.log(part1);

    //Part 2
    const removeBorders = (piece) => ({...piece, rows: R.map(R.slice(1, -1), R.slice(1, -1, piece.rows))});
    const innerTiles = R.map(rowTiles => rowTiles.map(removeBorders), puzzle);
    const puzzleRotations = allRotations(puzzleToString(innerTiles).split('\n'));
    const allPossiblePuzzles = [
        ...puzzleRotations,
        ...puzzleRotations.map(flipHorizontal),
        ...puzzleRotations.map(flipVertical),
    ];

    const puzzleWithSeaMonsters = R.head(allPossiblePuzzles.map(possibility => {
        return {puzzle: possibility, count: countSeaMonsters(possibility)};
    }).filter(({count}) => count > 0));

    const NUMBER_OF_CROSSES_IN_SEA_MONSTER = 15;
    console.log("Part 2");
    console.log(countCrosses(puzzleWithSeaMonsters.puzzle) - puzzleWithSeaMonsters.count * NUMBER_OF_CROSSES_IN_SEA_MONSTER);
})();