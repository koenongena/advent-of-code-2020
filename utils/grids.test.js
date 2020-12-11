import {coordinatesInLineOfSight} from "./grids.js";

const predicate = (v, row, col) => v !== '.';

const parseGrid = (s) => {
    return s.split("\n").map(l => [...l.trim()]);;
}
it('should default to empty if predicate does not match in line of sight', function () {
    const grid = parseGrid(`...
    .L.
    ...`);
    const coordinates = coordinatesInLineOfSight(grid, predicate)(1, 1);

    expect(coordinates).toEqual([]);
});

describe('should find vertical cells', function () {
    it('should find direct vertical cell above', function () {
        const grid = parseGrid(`.#.
    .L.
    ...`);
        const coordinates = coordinatesInLineOfSight(grid, predicate)(1, 1);

        expect(coordinates).toEqual([[0, 1]]);
    });

    it('should find direct vertical cells 2 above', function () {
        const grid = parseGrid(`.#.
    .L.
    .L.`);
        const coordinates = coordinatesInLineOfSight(grid, predicate)(2, 1);

        expect(coordinates).toEqual([[1, 1]]);
    })
    it('should find direct vertical cells below', function () {
        const grid = parseGrid(`...
    .L.
    .L.`);
        const coordinates = coordinatesInLineOfSight(grid, predicate)(1, 1);

        expect(coordinates).toEqual([[2, 1]]);
    })
});

describe('should find horizontal cells', function () {
    it('should find direct horizontal cell right', function () {
        const grid = parseGrid(`...
    .L#
    ...`);
        const coordinates = coordinatesInLineOfSight(grid, predicate)(1, 1);

        expect(coordinates).toEqual([[1, 2]]);
    });

    it('should find horintal cells 2 right', function () {
        const grid = parseGrid(`...
    L.#
    ...`);
        const coordinates = coordinatesInLineOfSight(grid, predicate)(1, 0);

        expect(coordinates).toEqual([[1, 2]]);
    })
    it('should find direct horizontal cells left', function () {
        const grid = parseGrid(`...
    LL.
    ...`);
        const coordinates = coordinatesInLineOfSight(grid, predicate)(1, 1);

        expect(coordinates).toEqual([[1, 0]]);
    })
});