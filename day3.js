import {getFilePath, readLines} from "./fetchFile.js";

const atLocation = (x, y) => ({x: x, y: y});

const moveOnBoard = getSquare => (right, down, currentLocation) => {
    return getSquare(currentLocation.x + right, currentLocation.y - down);
};

function getSquareOnBiomeStableForest(lines) {
    const width = lines[0].length;

    return (x, y) => {
        const line = lines[y * -1];
        return {
            x: x,
            y: y,
            mark: (line || "").charAt(x % width)
        }
    };
}

const isTree = (square) => {
    return square.mark === '#';
}

const inFixedHeightForest = (forest) => (location) => {
    return !outsideOfForest(forest)(location);
};
const outsideOfForest = (forest) => location => {
    return location.y * -1 >= forest.length;
};

const countTreeCollisionsInForest = (forest) => {
    const getSquare = getSquareOnBiomeStableForest(forest);
    const move = moveOnBoard(getSquare);
    const inForest = inFixedHeightForest(forest);

    return (slope) => {
        let location = getSquare(0, 0);
        let count = 0;
        do {
            count += isTree(location);
            location = move(slope.right, slope.down, location);
        } while (inForest(location))
        console.log("Landed on", count, ' trees with slope', slope);
        return count;
    };
};

(async () => {
    const forest = await readLines(await getFilePath(3));

    const countTreeCollisions = countTreeCollisionsInForest(forest);
    const count = countTreeCollisions({right: 3, down: 1});
    console.log(count)

    console.log(
        countTreeCollisions({right: 1, down: 1}) *
        countTreeCollisions({right: 3, down: 1}) *
        countTreeCollisions({right: 5, down: 1}) *
        countTreeCollisions({right: 7, down: 1}) *
        countTreeCollisions({right: 1, down: 2})
    )
})();