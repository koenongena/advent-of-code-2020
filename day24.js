import {readLinesForDay} from "./fetchFile.js";
import R from 'ramda';

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

(async () => {
    const lines = await readLinesForDay(24);

    const tiles = R.reduce((tiles, line) => {
        const c = getCoordinate(line);
        const key = JSON.stringify(c);
        if (!tiles.has(key)) {
            tiles.set(key, 'white');
        }

        tiles.set(key, tiles.get(key) === 'white' ? 'black' : 'white');
        return tiles;
    }, new Map(), lines);

    console.log(Array.from(tiles.values()).filter(i => i === 'black').length);

})();

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
