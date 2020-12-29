import R from 'ramda';
import {readLinesForDay} from "./fetchFile.js";

const sampleLines = `sesenwnenenewseeswwswswwnenewsewsw
neeenesenwnwwswnenewnwwsewnenwseswesw
seswneswswsenwwnwse
nwnwneseeswswnenewneswwnewseswneseene
swweswneswnenwsewnwneneseenw
eesenwseswswnenwswnwnwsewwnwsene
sewnenenenesenwsewnenwwwse
wenwwweseeeweswwwnwwe
wsweesenenewnwwnwsenewsenwwsesesenwne
neeswseenwwswnwswswnw
nenwswwsewswnenenewsenwsenwnesesenew
enewnwewneswsewnwswenweswnenwsenwsw
sweneswneswneneenwnewenewwneswswnese
swwesenesewenwneswnwwneseswwne
enesenwswwswneneswsenwnewswseenwsese
wnwnesenesenenwwnenwsewesewsesesew
nenewswnwewswnenesenwnesewesw
eneswnwswnwsenenwnwnwwseeswneewsenese
neswnwewnwnwseenwseesewsenwsweewe
wseweeenwnesenwwwswnew`.split('\n');


const getNextInstruction = (instructions) => {
    if (['se', 'sw', 'nw', 'ne'].some(s => instructions.startsWith(s))) {
        return R.take(2, instructions);
    }

    return R.head(instructions);
}
const moveCoordinate = ({position, instructions}) => {
    const instruction = getNextInstruction(instructions);
    const displacement = R.cond([
        [R.equals("e"), R.always({w: 1})],
        [R.equals("se"), R.always({w: 0.5, h: -0.75})],
        [R.equals("sw"), R.always({w: -0.5, h: -0.75})],
        [R.equals("w"), R.always({w: -1})],
        [R.equals("nw"), R.always({w: -0.5, h: 0.75})],
        [R.equals("ne"), R.always({w: 0.5, h: 0.75})],
    ])(instruction);

    return {
        position: {w: position.w + (displacement.w || 0), h: position.h + (displacement.h || 0)},
        instructions: instructions.substring(instruction.length)
    }

}
const getCoordinate = (instructions) => {
    const endResult = R.until(({instructions}) => R.isEmpty(instructions), moveCoordinate, {
        position: {w: 0, h: 0},
        instructions
    });
    return endResult.position;
};

function getAdjacentCoordinates(coordinate) {
    return [
        {w: coordinate.w - 0.5, h: coordinate.h - 0.75},
        {w: coordinate.w + 0.5, h: coordinate.h - 0.75},
        {w: coordinate.w - 1, h: coordinate.h},
        {w: coordinate.w + 1, h: coordinate.h},
        {w: coordinate.w - 0.5, h: coordinate.h + 0.75},
        {w: coordinate.w + 0.5, h: coordinate.h + 0.75},
    ];
}

const getAdjacentTiles = R.curry((floor, tile) => {
    const adjacentCoordinates = getAdjacentCoordinates(tile.coordinate);
    return R.map((coordinate) => {
        const knowTile = floor.get(JSON.stringify(coordinate));
        return (knowTile ? knowTile : ({coordinate, color: 'white'}));
    }, adjacentCoordinates)
});

const buildFloor = tilesMap => {
    return R.map(s => ({
        coordinate: JSON.parse(s),
        color: tilesMap.get(s),
    }), Array.from(tilesMap.keys()));
};

const determineNextColor = (floor) => tile => {
    const adjacentTiles = getAdjacentTiles(floor, tile);
    const adjacentBlackTiles = adjacentTiles.filter(tile => tile.color === 'black').length;
    if (tile.color === 'black' && (adjacentBlackTiles === 0 || adjacentBlackTiles > 2)) {
        tile.nextColor = 'white';
    } else if (tile.color === 'white' && adjacentBlackTiles === 2) {
        tile.nextColor = 'black';
    } else {
        tile.nextColor = tile.color;
    }
};

(async () => {
    const lines = await readLinesForDay(24);
    // const lines = sampleLines;

    const tiles = R.reduce((tiles, line) => {
        const c = getCoordinate(line);
        const key = JSON.stringify(c);
        if (!tiles.has(key)) {
            tiles.set(key, 'white');
        }

        tiles.set(key, tiles.get(key) === 'white' ? 'black' : 'white');
        return tiles;
    }, new Map(), lines);

    const floor = buildFloor(tiles);
    const isBlackTile = i => i.color === 'black';
    console.log(R.filter(isBlackTile, floor).length);
    // console.log(tiles)
    //part 2


    const flipAllTiles = (tiles) => {
        const blackTiles = R.filter(isBlackTile, tiles);
        const tilesMap = R.reduce((map, tile) => {
            map.set(JSON.stringify(tile.coordinate), tile);
            return map;
        }, new Map(), tiles);
        const blackAdjacentTiles = R.flatten(R.map(getAdjacentTiles(tilesMap), blackTiles));
        const tilesToVerify = Array.from([...blackTiles, ...blackAdjacentTiles].reduce((map, tile) => {
            map.set(JSON.stringify(tile.coordinate), tile);
            return map;
        }, new Map()).values());
        
        R.forEach(determineNextColor(tilesMap), tilesToVerify);
        R.forEach(tile => tile.color = tile.nextColor, tilesToVerify);
        return tilesToVerify;
    }

    const untilIndex = R.addIndex(R.until);
    const bla = untilIndex((_, index) => {
        console.log("Running ", index);
        return index === 100;
    }, flipAllTiles, floor);
    console.log(R.filter(isBlackTile, bla).length);
})();