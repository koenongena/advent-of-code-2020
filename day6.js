import {getFilePath, readLines} from "./fetchFile.js";

const intersection = (array1, array2) => array1.filter(value => (array2 || []).includes(value));
const parseGroups = (acc, line) => {
    if (line === '') {
        return [...acc, {id: acc.length + 2, answers: []}]
    }

    const group = acc[acc.length - 1];
    group.answers.push(line);
    return acc;
};

const combineAnswers = g => {
    return new Set(g.answers
        .map(a => [...a]) //extract all chars
        .flat());
};

const sumOfSets = (sum, currentValue) => {
    return sum + currentValue.size
};
const sumOfArrays = (sum, currentValue) => {
    return sum + currentValue.length
};

const intersectAnswers = group => {
    return group.answers.reduce((acc, answer) => {
        return intersection(acc, [...answer]);
    }, [...'abcdefghijklmnopqrstuvwxyz']);
};


(async () => {
    const lines = await readLines(await getFilePath(6));
    const groups = lines.reduce(parseGroups, [{id: 1, answers: []}]);

    const sumOfCounts = groups.map(combineAnswers)
        .reduce(sumOfSets, 0)
    console.log(sumOfCounts);

    const part2 = groups.map(intersectAnswers)
        .reduce(sumOfArrays, 0)
    console.log(part2);

})();