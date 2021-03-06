import {getFilePath, readLines} from "./fetchFile.js";

const findTuplesWithSum = (sum = 2020) => numbers => {
    const reducer = ((tuples, current, index) => {
        const tail = numbers.slice(index + 1);
        const equalsSum = tail.filter(t => t + current === sum);
        return [...tuples, equalsSum.map(match => ([current, match]))]

    });
    return numbers
        .sort()
        .reduce(reducer, [])
        .flat()
        .filter(t => t);
};

const findTripletsWithSum = (sum) => numbers => numbers.sort()
    .reduce((acc, currentValue, currentIndex, array) => {
        const tuples = findTuplesWithSum(sum - currentValue)(numbers.slice(currentIndex + 1));
        const triplets = tuples.map(t => [currentValue, ...t]);
        return [...acc, triplets];
    }, [])
    .flat()
    .filter(t => t);

(async () => {
    const filePath = await getFilePath(1);
    const lines = await readLines(filePath);
    const numbers = lines.map(l => parseInt(l, 10));

    const tuples = findTuplesWithSum(2020)(numbers);
    console.log(tuples.map(t => t[0] * t[1]));

    const triplets = findTripletsWithSum(2020)(numbers);
    console.log(triplets.map(t => t[0] * t[1] * t[2]));
})()



