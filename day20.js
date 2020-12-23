import {readLinesForDay} from "./fetchFile.js";
import R from "ramda";

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
const flipPieceVertical = (piece) => {
    const newRows = piece.rows.map(R.reverse);
    return addBorders({
        ...piece,
        rows: newRows
    })
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
const flipPieceHorizontal = piece => {
    return addBorders({
        ...piece,
        rows: R.reverse(piece.rows)
    })
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

const allTransformations = (piece) => [
    piece,
    rotatePieceClockwise(90, piece),
    rotatePieceClockwise(180, piece),
    rotatePieceClockwise(270, piece),
    flipPieceHorizontal(piece),
    flipPieceVertical(piece),
];

const matchesPiece = R.curry((p1, p2) => {

    const allP1Transformations = allTransformations(p1);
    const allP2Transformations = allTransformations(p2);
    const mapBorder = (propName) => R.pipe(R.prop("borders"), R.prop(propName));
    const mapDown = R.map(mapBorder("down"));
    const mapUp = R.map(mapBorder("up"));
    const mapLeft = R.map(mapBorder("left"));
    const mapRight = R.map(mapBorder("right"));
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

const isCornerPiece = (piece) => piece.matches.length === 2;

function puzzleIsSolved({remainingPieces}) {
    return remainingPieces.length === 0;
}

const findMatching = R.curry((fn, remainingPieces, start) => {
    return R.find(p => fn(p.borders, start.borders) && p.id !== start.id, remainingPieces);
});

const findMatchingUp = findMatching((b1, b2) => b1.down === b2.up);
const findMatchingDown = findMatching((b1, b2) => b1.up === b2.down);
const findMatchingLeft = findMatching((b1, b2) => b1.right === b2.left);
const findMatchingRight = findMatching((b1, b2) => b1.left === b2.right);


const isFullyResolvedPiece = (p) => {
    const {up, down, left, right} = p.matches || {};
    return up !== undefined && down !== undefined && left !== undefined && right !== undefined;
};
const isNotFullyResolvedPiece = R.and((p) => p.id !== 'void', R.complement(isFullyResolvedPiece));

const isNotVoid = (p) => p.id !== 'void';
function addPieceOfPuzzle({puzzle, remainingPieces}) {
    if (puzzle.length === 0) {
        let match = false;
        let index = -1;
        while (!match) {
            index++;
            const piece = remainingPieces[index];
            match = findMatchingUp(remainingPieces, piece) !== undefined
                && findMatchingDown(remainingPieces, piece) !== undefined
                && findMatchingLeft(remainingPieces, piece) !== undefined
                && findMatchingRight(remainingPieces, piece) !== undefined;
        }

        const start = remainingPieces[index];
        return {
            puzzle: [start], remainingPieces: R.reject(idEquals(start.id), remainingPieces)
        }

    }

    const emptySpace = {id: 'void', matches: {up: undefined, right: undefined, left: undefined, down: undefined}};

    //this piece is a valid start piece
    const pieceUnderInvestigation = R.find((p) => p.id !== 'void' && !isFullyResolvedPiece(p), puzzle);
    pieceUnderInvestigation.matches = pieceUnderInvestigation.matches || {};
    const matches = pieceUnderInvestigation.matches;
    let attachedPiece = emptySpace;
    if (!matches.up) {
        attachedPiece = R.or(findMatchingUp(remainingPieces, pieceUnderInvestigation), emptySpace);
        matches.up = attachedPiece;
        attachedPiece.matches.down = pieceUnderInvestigation;       
    } else if (!matches.down) {
        attachedPiece = R.or(findMatchingDown(remainingPieces, pieceUnderInvestigation), emptySpace);
        matches.down = attachedPiece;
        attachedPiece.matches.up = pieceUnderInvestigation;
    } else if (!matches.left) {
        attachedPiece = R.or(findMatchingLeft(remainingPieces, pieceUnderInvestigation), emptySpace);
        matches.left = attachedPiece;
        attachedPiece.matches.right = pieceUnderInvestigation;
    } else if (!matches.right) {
        attachedPiece = R.or(findMatchingRight(remainingPieces, pieceUnderInvestigation), emptySpace);
        matches.right = attachedPiece;
        attachedPiece.matches.left = pieceUnderInvestigation;
    }

    return {
        puzzle: R.filter(isNotVoid, [...puzzle, attachedPiece]),
        remainingPieces: R.reject(idEquals(attachedPiece.id), remainingPieces)
    };
}

const addMatchingPieces = (pieces) => piece => ({
    ...piece,
    matches: findMatchingPieces(R.map(addBorders, pieces), piece)
});


function pieceToString(piece) {
    return piece.rows.join("\n");
}

const findTopLeftCorners = puzzle => R.find((p) => p.matches.up.id === 'void' && p.matches.left.id === 'void', puzzle);

(async () => {

    const lines = await readLinesForDay(20);
    const withoutBorders = parseInput(lines);
    const withBorders = R.map(addBorders, withoutBorders);
    const withMatches = R.map(addMatchingPieces(withBorders), withBorders);
    const pieces = R.map(p => ({
        ...p,
        matches: {up: undefined, down: undefined, left: undefined, right: undefined}
    }), withBorders);
    // console.log(pieces.map(m => ({id: m.id, rows: JSON.stringify(m.rows), matches: m.matches.map(R.prop("id"))})));

    // const corners = R.filter(isCornerPiece, pieces);
    // console.log(multiply(corners
    //     .map(R.prop("id"))
    //     .map(parseInteger))
    // );

    // const isInnerPiece = (piece) => piece.matches.length === 4;
    // const innerPieces = R.filter(isInnerPiece, pieces);
    // console.log(innerPieces);

    //only take into account the inner pieces
    //determine the corners, build the puzzle
    // const innerPiecesCorners = R.filter(isCornerPiece, R.map(addMatchingPieces(innerPieces), innerPieces));
    const {puzzle} = R.until(puzzleIsSolved, addPieceOfPuzzle, {
        puzzle: [],
        remainingPieces: R.flatten(R.map(allTransformations, pieces))
    });

    const topLeftCorner = findTopLeftCorners(puzzle);

    console.log(topLeftCorner);
    console.log(pieceToString(topLeftCorner));
    // console.log(innerPiecesCorners)

})();