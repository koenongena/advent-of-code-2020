import {getFilePath, readLines} from "./fetchFile.js";

(async () => {
    const lines = await readLines(await getFilePath(6));

    const groups = lines.reduce((acc, line) => {
        if (!acc.length || line === '') {
            acc.push({id: acc.length + 1, answers: []});
        }

        const group = acc[acc.length - 1];
        group.answers.push(line);
        return acc;
    }, []);

    const charSetPerGroup = groups.map(g => {
        return new Set(g.answers
            .map(a => [...a]) //extract all chars
            .flat());
    });

    const sumOfCounts = charSetPerGroup.reduce((sum, currentValue) => {
        return sum + currentValue.size
    }, 0)

    console.log(sumOfCounts);
})();