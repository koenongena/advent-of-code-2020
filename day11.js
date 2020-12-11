import * as R from "ramda";
import {readLinesForDay} from "./fetchFile.js";
import {adjacentCells, cellsInLineOfSight, coordinatesInLineOfSight} from "./utils/grids.js";

const isOccupied = (seat) => {
    return seat === '#'
};

const isSeat = (seat) => {
    return seat !== '.';
}

const occupiedSeats = (row) => R.length(R.filter(isOccupied, row));

const adjacentSeatCoordinates = R.curry((grid, row, col) => {
    return coordinatesInLineOfSight(grid, isSeat)(row, col);
});

const changeSeat = R.curry((grid, row, col, seat) => {
    const occupiedAdjacentSeats = cellsInLineOfSight(grid, isSeat, row, col).filter(isOccupied);
    if (seat === 'L' && occupiedAdjacentSeats.length === 0) {
        return '#';
    } else if (seat === '#' && occupiedAdjacentSeats.length >= 5) {
        return "L";
    }
    return seat;
});

const runRound = (grid) => {
    const changeRowAndColumn = changeSeat(grid);
    return grid.reduce((newRows, row, rowNumber) => {
        const changeRow = changeRowAndColumn(rowNumber);
        const newRow = row.reduce((newSeats, seat, column) => {
            const changeSeat = changeRow(column);
            return [...newSeats, changeSeat(seat)];
        }, []);
        return [...newRows, newRow]
    }, []);
}

function printGrid(grid) {
    grid.forEach(r => {
        console.log(r.join(''));
    })
}

(async () => {
    const lines = await readLinesForDay(11);

    const grid = lines.map(l => [...l]);
    // console.log(grid);

    const isSameLayout = ({previousGrid, grid}) => {
        return JSON.stringify(previousGrid) === JSON.stringify(grid);
    }
    const reducer = (input) => ({previousGrid: input.grid, grid: runRound(input.grid)});
    const result = R.until(isSameLayout, reducer)(({previousGrid: null, grid}));

    const count = result.grid.reduce((sum, row) => {
        return sum + occupiedSeats(row);
    }, 0)
    console.log(count);

})();