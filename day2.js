import {getFilePath, readLines} from "./fetchFile.js";

const createOccurrencesPolicy = (policyDefinition) => {
    const letter = policyDefinition.split(" ")[1]
    const minMax = policyDefinition.split(" ")[0].split("-")
    const min = parseInt(minMax[0], 10);
    const max = parseInt(minMax[1], 10);

    return (s) => {
        const occurrences = (s.match(new RegExp(letter, "g")) || []).length;
        return min <= occurrences && occurrences <= max;
    }
}
const createCharacterPositionPolicy = (policyDefinition) => {
    const letter = policyDefinition.split(" ")[1]
    const minMax = policyDefinition.split(" ")[0].split("-")
    const position1 = parseInt(minMax[0], 10);
    const position2 = parseInt(minMax[1], 10);
    return (s) => {
        const firstCharacter = s[position1 - 1];
        const secondCharacter = s[position2 - 1];

        return firstCharacter === letter ^ secondCharacter === letter;
    }
}
const isValid = (policy) => (password) => {
    return policy(password);
}

const countValidPasswords = (createOccurencesPolicy) => lines => {
    return lines
        .map(line => line.split(":"))
        .map(line => {
            const policy = createOccurencesPolicy(line[0].trim());
            return isValid(policy)(line[1].trim());
        })
        .filter(valid => valid);
};

(async () => {
    const filePath = await getFilePath(2);
    const lines = await readLines(filePath);

    const validPasswords = countValidPasswords(createOccurrencesPolicy)(lines);
    console.log(validPasswords.length);

    const validPasswords2 = countValidPasswords(createCharacterPositionPolicy)(lines);
    console.log(validPasswords2.length);
})();