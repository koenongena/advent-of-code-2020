import {getFilePath, readLines} from "./fetchFile.js";

const intersection = (array1, array2) => array1.filter(value => array2.includes(value));

const containsAll = (requiredFields) => (arr) => intersection(requiredFields, arr).length === requiredFields.length;

function parsePassports(lines) {
    return lines.reduce((acc, line) => {
        if (line.trim() === '') {
            return [...acc, {}];
        } else {
            const currentPassport = acc[acc.length - 1];
            line.split(" ").map(e => e.split(":")).forEach(value => {
                currentPassport[value[0]] = value[1];
            });
            return acc;
        }
    }, [{}]);
}

function isValid(passport) {
    const fields = Object.keys(passport);
    let requiredFields = ['byr', 'iyr', 'eyr', 'hgt', 'hcl', 'ecl', 'pid'];
    return containsAll(requiredFields)(fields);
}

(async () => {
    const lines = await readLines(await getFilePath(4));
    const passports = parsePassports(lines);
    const validPassports = passports.filter(isValid)
        .length;
    console.log(validPassports);
})();