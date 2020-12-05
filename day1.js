import {getFilePath, readLines} from "./fetchFile.js";
import * as fs from "fs";
import readline from 'readline';

const  filterPossibilities = (sum) => (value, arr) => {
    return arr.filter(a => a + value === sum);
}

(async () => {
    const filePath = await getFilePath(1);
    const lines = await readLines(filePath);

    const reducer = ((tuples, current, index, lines) => {
        const matches = filterPossibilities(2020)(current, lines.slice(index + 1));

        return  [...tuples, matches.map(match => ([current, match]))]
    });

    const tuples = lines.map(l => parseInt(l, 10))
        .sort()
        .reduce(reducer, [])
        .flat()
        .filter(t => t)

    const multiplications = tuples.map(t => t[0] * t[1]);
    console.log(multiplications);
})()



