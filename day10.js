import {readLinesForDay} from "./fetchFile.js";

(async () => {
    const lines = await readLinesForDay(10);
    const adapters = lines.map(l => parseInt(l, 10));
    const builtInAdapter = Math.max(...adapters) + 3;
    const sorted = adapters.sort((a,b) => a - b);

    const all = [0, ...sorted, builtInAdapter];
    const differences = all.reduce((diffs, value, index, all) => {
        if (index === 0) {
            return diffs;
        }

        const diff = value - all[index - 1];
        const copy = [...diffs]
        copy[diff] = diffs[diff] + 1;
        return copy;
    }, [0, 0, 0, 0]);

    console.log(differences[1] * differences[3])
})();