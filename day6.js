import {getFilePath, readLines} from "./fetchFile.js";

const intersection = (array1, array2) => array1.filter(value => (array2 || []).includes(value));


(async () => {
    const lines = await readLines(await getFilePath(6));

    const groups = lines.reduce((acc, line) => {
        if (line === '') {
            return [...acc, {id: acc.length + 2, answers: []}]
        }

        const group = acc[acc.length - 1];
        group.answers.push(line);
        return acc;
    }, [{id: 1, answers: []}]);

    const charSetPerGroup = groups.map(g => {
        return new Set(g.answers
            .map(a => [...a]) //extract all chars
            .flat());
    });

    const sumOfCounts = charSetPerGroup.reduce((sum, currentValue) => {
        return sum + currentValue.size
    }, 0)

    console.log(sumOfCounts);

    const part2 = groups.map(group => {
        return group.answers.reduce((acc, answer) => {
            return intersection(acc, [...answer]);
        }, [...'abcdefghijklmnopqrstuvwxyz']);
    }).reduce((sum, answers) => {
        return sum + answers.length;
    }, 0)
    console.log(part2);

})();