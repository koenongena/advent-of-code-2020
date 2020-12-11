import * as R from "ramda";

export const rangeInclusive = (min, max) => R.range(min, max + 1);
const cartesianProduct = R.xprod;

export const isOutOfGrid = R.curry((grid, coord) => {
    return coord[0] < 0 || coord[1] < 0 ||
        coord[0] >= grid.length || coord[1] >= grid[0].length;
})

export const adjacentCoordinates = R.curry((grid, row, col) => {
    const zoneCoordinates = cartesianProduct(rangeInclusive(row - 1, row + 1), rangeInclusive(col - 1, col + 1));

    const sameCell = (coord) => coord[0] === row && coord[1] === col;
    const outOfGrid = isOutOfGrid(grid);
    return R.reject(R.anyPass([outOfGrid, sameCell]), zoneCoordinates);
});

export const adjacentCells = R.curry((grid, row, col) => {
    const extractGridValue = (coord) => grid[coord[0]][coord[1]]
    return R.map(extractGridValue, adjacentCoordinates(grid, row, col));
});
