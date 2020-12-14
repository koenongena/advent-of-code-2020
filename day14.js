import {readLinesForDay} from "./fetchFile.js";
import {sum} from "./utils/arrays.js";

const fill = (filler, length) => (s) => {
    const a = Math.abs(s.length - length);
    return filler.repeat(a) + s;
};

function compare(x, mask) {
    if (mask === 'X') {
        return x;
    }

    return mask;
}

function overlay(mask, binaryRepresentation) {
    if (mask.length < binaryRepresentation.length) {
        return overlay(fill('0', binaryRepresentation.length)(mask), binaryRepresentation);
    } else if (mask.length > binaryRepresentation.length) {
        return overlay(mask, fill('0', mask.length)(binaryRepresentation));
    }

    return [...binaryRepresentation].reduce((result, e, index) => {
        return result + compare(e, [...mask][index]);
    }, "");
}

function toBinary(value) {
    return (value >>> 0).toString(2);
}

function binaryToInt(value) {
    return parseInt( value, 2 )
}

(async () => {
    const lines = await readLinesForDay(14);

    const { memory } = lines.reduce((acc, line) => {
        if (line.startsWith("mask")) {
            const mask = line.split("=")[1].trim();
            return {
                ...acc,
                mask
            }
        }

        const mem = line.split("=")[0].replace("mem[", "").replace("]", "").trim();
        const value = parseInt(line.split("=")[1].trim());
        const result = overlay(acc.mask, toBinary(value));
        acc.memory.set(mem, result);
        return acc;
    }, { memory: new Map()})

    const asBinary = Array.from(memory.values()).map(binaryToInt);
    console.log(sum(asBinary));

})();