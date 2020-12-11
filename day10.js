import {readLinesForDay} from "./fetchFile.js";
import {sum} from "./utils/arrays.js";

function createTree(arr) {
    const cache = new Map();
    const endpoint = Math.max(...arr);

    const cached = (delegate) => (value) => {
        if (!cache.has(value)) {
            const result = delegate(value);
            cache.set(value, result);
        }
        return cache.get(value);
    }

    const countLeafs = (value) => {
        if (value === endpoint) {
            return 1;
        }
        const children = arr.filter(a => value < a && a <= value + 3).sort((a, b) => a-b);
        console.log("Children of %s: %s", value, children);
        if (children.length === 0) {
            return 0;
        }
        return sum(children.map(child => cached(countLeafs)(child)));
    };
    return cached(countLeafs);
}

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

    const countLeafs = createTree(all);
    console.log(countLeafs(0));
})();