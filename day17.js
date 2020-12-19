import {readLinesForDay} from "./fetchFile.js";
import R from 'ramda';

const ascendingOn = (propName) => R.ascend(R.pipe(R.prop("coordinate"), R.prop(propName)));
const descendingOn = (propName) => R.descend(R.pipe(R.prop("coordinate"), R.prop(propName)));

function printGrid(grid) {
    const sorted = R.sortWith([
            ascendingOn("z"),
            descendingOn("y"),
            ascendingOn("x"),
        ]
    )(grid);

    process.stdout.write("\n\nz=" + sorted[0].coordinate.z + "\n");

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
            coordinate: {x, y: y === 0 ? 0 : -y, z: 0},
            active: (cell === '#')
        }]
    }), []);
    return [...coordinates, ...lineCoordinates];
};

const getNeighboursCoordinates = ({x, y, z}) => {
    const xy = R.xprod(R.range(x - 1, x + 2), R.range(y - 1, y + 2));
    const xyz = R.map(R.flatten, (R.xprod(xy, R.range(z - 1, z + 2))));

    const center = (xyz => xyz[0] === x && xyz[1] === y && xyz[2] === z);
    const toCoordinate = (arr) => ({x: arr[0], y: arr[1], z: arr[2]})
    return R.map(toCoordinate, R.reject(center, xyz));
}

const formatCoordinate = (coord) => {
    const {x, y, z} = coord;
    return `(${x},${y},${z})`
};

const nextState = R.curry((grid, cube) => {
    const neighbourCellsCoordinates = getNeighboursCoordinates(cube.coordinate);
    const neighbours = neighbourCellsCoordinates.reduce((neighbours, coord) => {
        if (grid.has(formatCoordinate(coord))) {
            return [...neighbours, grid.get(formatCoordinate(coord))];
        }
        return neighbours;
    }, []);

    const activeNeighbours = countActive(neighbours);
    if (cube.active) {
        return {
            ...cube,
            active: (activeNeighbours === 2 || activeNeighbours === 3)
        }
    } else {
        return {
            ...cube,
            active: activeNeighbours === 3
        }
    }
});

function isActive(grid, coord) {
    if (grid.has(formatCoordinate(coord))) {
        return grid.get(formatCoordinate(coord)).active;
    }
    return false;
}

const minXYZ = R.curry((prop, grid) => {
    const bla = Array.from(grid.values()).map(R.pipe(R.prop("coordinate"), R.prop(prop)));
    return Math.min(...bla);
});

const maxXYZ = R.curry((prop, grid) => {
    const bla = Array.from(grid.values()).map(R.pipe(R.prop("coordinate"), R.prop(prop)));
    return Math.max(...bla);
});
const executeCycle = (grid) => {

    const newGrid = new Map();
    const maxZ = maxXYZ("z", grid) + 1;
    const maxY = maxXYZ("y", grid) + 1;
    const maxX = maxXYZ("x", grid) + 1;

    for (let z = minXYZ("z", grid) - 1; z <= maxZ; z++) {
        for (let y = minXYZ("y", grid) - 1; y <= maxY; y++) {
            for (let x = minXYZ("x", grid) - 1; x <= maxX; x++) {
                const cube = {
                    coordinate: {x, y, z},
                    active: isActive(grid, {x, y, z})
                }
                newGrid.set(formatCoordinate({x, y, z}), nextState(grid, cube));
            }
        }
    }
    return newGrid;
};

const countActive = grid => {
    const from = Array.from(grid.values());
    return R.length(R.filter(R.prop("active"), from));
};

(async () => {
    const lines = await readLinesForDay(17);
    const grid = lines.reduce(parseLine, [])
        .reduce((m, cube) => {
            m.set(formatCoordinate(cube.coordinate), cube);
            return m;
        }, new Map());

    let newGrid = grid;
    R.range(1, 7).forEach((cycle) => {
        newGrid = executeCycle(newGrid, cycle)
        console.log("After cycle " + cycle);
        // printGrid(newGrid)
    })

    // printGrid(newGrid);

    console.log(countActive(newGrid));


})();