import {getFilePath, readLines} from "./fetchFile.js";

const createPolicy = (policyDefinition) => {
    const letter = policyDefinition.split(" ")[1]
    const minMax = policyDefinition.split(" ")[0].split("-")
    const min = parseInt(minMax[0], 10);
    const max = parseInt(minMax[1], 10);
    return (s) => {
        const occurrences = (s.match(new RegExp(letter, "g")) || []).length;
        return min <= occurrences && occurrences <= max;
    }
}
const isValid = (policy) => (password) => {
    return policy(password);
}
(async () => {
    const filePath = await getFilePath(2);
    const lines = await readLines(filePath);

    const validPasswords = lines
        .map(line => line.split(":"))
        .map(line => {
            const policy = createPolicy(line[0].trim());
            return isValid(policy)(line[1].trim());
        })
        .filter(valid => valid);

    console.log(validPasswords.length);
})();