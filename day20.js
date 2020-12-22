import {readLinesForDay} from "./fetchFile.js";
import R from "ramda";

const newPiece = {id: 'unknown', rows: []};

(async () => {

    const lines = await readLinesForDay(20);
    const parseInput = R.pipe(R.reduce(({completedPieces, piece}, line) => {
        if (line === '') {
            return {completedPieces: [...completedPieces, piece], piece: newPiece};
        }
        if (line.startsWith("Tile")) {
            return {completedPieces, piece: {...piece, id: R.match(/\d+/, line)[0]}}
        }
        return {completedPieces, piece: {...piece, rows: [...piece.rows, line]}}
    }, {completedPieces: [], piece: newPiece}), R.prop("completedPieces"));

    console.log(parseInput(lines))
})();