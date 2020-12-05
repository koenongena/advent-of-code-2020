import {getFilePath, readLines} from "./fetchFile.js";

const atLocation = (x, y) => ({x: x, y: y});

const moveOnBoard = getSquare => (right, down, currentLocation) => {
    return getSquare(currentLocation.x + 3, currentLocation.y - 1);
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

const inFixedHeightForest = (forest) => (location) =>{
    return !outsideOfForest(forest)(location);
};
const outsideOfForest = (forest) => location => {
    return location.y * -1 >= forest.length;
};

(async () => {
    const forest = await readLines(await getFilePath(3));

    const getSquare = getSquareOnBiomeStableForest(forest);
    const move = moveOnBoard(getSquare);
    const inForest = inFixedHeightForest(forest);

    let location = getSquare(0, 0);
    let count = 0;
    do {
        count += isTree(location);
        console.log(JSON.stringify(location));
        location = move(3, 1, location);
    } while (inForest(location))

    console.log(count)

})();