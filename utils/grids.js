import * as R from "ramda";

export const rangeInclusive = (min, max) => R.range(min, max + 1);
const cartesianProduct = R.xprod;

export const isOutOfGrid = R.curry((grid, coord) => {
    return coord[0] < 0 || coord[1] < 0 ||
        coord[0] >= grid.length || coord[1] >= grid[0].length;
})

export const isInGrid = R.curry((grid, cooord) => !isOutOfGrid(grid, cooord));

export const adjacentCoordinates = R.curry((grid, row, col) => {
    const zoneCoordinates = cartesianProduct(rangeInclusive(row - 1, row + 1), rangeInclusive(col - 1, col + 1));

    const sameCell = (coord) => coord[0] === row && coord[1] === col;
    const outOfGrid = isOutOfGrid(grid);
    return R.reject(R.anyPass([outOfGrid, sameCell]), zoneCoordinates);
});

export const coordinatesInLineOfSight = R.curry((grid, valuePredicate, row, col) => {
    const moveInDirection = (rowStep, colStep) => (coord) => {
        return [coord[0] + rowStep, coord[1] + colStep];
    };

    const allMoves = cartesianProduct(rangeInclusive(-1, 1), rangeInclusive(-1, 1));
    const validMoves = R.reject(R.equals([0, 0]), allMoves);
    const moves = R.map(m => moveInDirection(m[0], m[1]), validMoves)

    const coordinatesInDirection = R.curry((move, row, col) => {
        const predicate = (coord) => {

            const value = extractGridValue(grid, coord);
            return valuePredicate(value);
        };

        const firstMove = move([row, col]);
        const invalidCoordinate = R.anyPass([isOutOfGrid(grid), predicate]);
        const position = R.until(invalidCoordinate, move, firstMove)

        return R.filter(R.allPass([isInGrid(grid), predicate]), [position]);
    });

    return moves.reduce((acc, move) => {
        return [...acc, ...coordinatesInDirection(move, row, col)]
    }, []);
});

export const extractGridValue = R.curry((grid, coord) => {
    return grid[coord[0]][coord[1]];
});

export const adjacentCells = R.curry((grid, row, col) => {
    return R.map(extractGridValue(grid), adjacentCoordinates(grid, row, col));
});

export const cellsInLineOfSight = R.curry((grid, valuePredicate, row, col) => {
    const coordinatesInLineOfSight1 = coordinatesInLineOfSight(grid, valuePredicate, row, col);
    return R.map(extractGridValue(grid), coordinatesInLineOfSight1);
});
