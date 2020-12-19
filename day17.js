import {readLinesForDay} from "./fetchFile.js";
import R from 'ramda';

function printGrid(grid) {
    const ascendingOn = (propName) => R.ascend(R.pipe(R.prop("coordinate"), R.prop(propName)));
    const descendingOn = (propName) => R.descend(R.pipe(R.prop("coordinate"), R.prop(propName)));
    const sorted = R.sortWith([
            ascendingOn("z"),
            descendingOn("y"),
            ascendingOn("x"),
        ]
    )(grid);

    sorted.reduce((previous, current) => {
        if (previous.coordinate.z !== current.coordinate.z) {
            process.stdout.write("\n\nz=" + current.coordinate.z + "\n");
        }
        if (previous.coordinate.y !== current.coordinate.y) {
            process.stdout.write("\n");
        }

        process.stdout.write(current.active ? "#" : '.');
        return current;

    }, sorted[0]);
    process.stdout.write('\n')
}

const parseLine = (coordinates, line, y) => {
    const cells = [...line];
    const lineCoordinates = cells.reduce(((acc, cell, x) => {
        return [...acc, {
            coordinate: {x, y: -y, z: 0},
            active: (cell === '#')
        }]
    }), []);
    return [...coordinates, ...lineCoordinates];
};

const executeCycle = grid => undefined;

(async () => {
    const lines = await readLinesForDay(17);
    const grid = lines.reduce(parseLine, [])
    printGrid(grid);

    const result = R.range(0, 1).reduce((previousGrid, grid, cycle) => {
        return executeCycle(grid);
    }, grid);

    const countActive = R.length(R.filter(R.prop("active"), grid));
    console.log(countActive)
})();