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

function overlayMemoryAddress(mask, binaryRepresentation) {
    if (mask.length < binaryRepresentation.length) {
        return overlayMemoryAddress(fill('0', binaryRepresentation.length)(mask), binaryRepresentation);
    } else if (mask.length > binaryRepresentation.length) {
        return overlayMemoryAddress(mask, fill('0', mask.length)(binaryRepresentation));
    }

    return [...binaryRepresentation].reduce((result, e, index) => {
        const maskBit = [...mask][index];
        if (maskBit === 'X') {
            return result + 'X';
        } else if (maskBit === '1') {
            return result + '1'
        }

        return result + e;
    }, "");
}

const expandMaskedAddress = maskedAddress => {
    if (maskedAddress === '') {
        return [''];
    }
    const char = [...maskedAddress][0];
    const tail = maskedAddress.substring(1);

    if (char === 'X') {
        return [...expandMaskedAddress(tail).map(next => '0' + next),
            ...expandMaskedAddress(tail).map(next => '1' + next)];
    } else {
        return [...expandMaskedAddress(tail).map(next => char + next)]
    }
};

const addresses = (mask, originalAddress) => {
    const binaryAddress = toBinary(originalAddress);
    const maskedAddress = overlayMemoryAddress(mask,binaryAddress);
    return expandMaskedAddress(maskedAddress);
}

function part1(lines) {
    const {memory} = lines.reduce((acc, line) => {
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
    }, {memory: new Map()})

    const asBinary = Array.from(memory.values()).map(binaryToInt);
    return sum(asBinary);
}

(async () => {
    const lines = await readLinesForDay(14);
    const result1 = part1(lines);
    console.log(result1);


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
        const data = addresses(acc.mask, mem);
        data.forEach(m => acc.memory.set(m, value));
        return acc;
    }, { memory: new Map()})


    console.log(sum(Array.from(memory.values())))

})();