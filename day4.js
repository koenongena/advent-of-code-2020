import {getFilePath, readLines} from "./fetchFile.js";
import {containsAll} from "./utils/arrays.js";

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

const isNumber = (s) => {
    const n = parseInt(s, 10);
    return !Number.isNaN(n);
}
const isBetween = (min, max) => (s) => {
    if (isNumber(s)) {
        const n = parseInt(s, 10);
        return min <= n && n <= max;
    }
    return false;
};

function day4(hgt) {

    const isValidHeightRange = (min, max) => (s) => {
        if (isNumber(s)) {
            return isBetween(min, max)(parseInt(s, 10));
        }
        return false;
    }
    const isValidHeightInCm = isValidHeightRange(150, 193);
    const isValidHeightInInch = isValidHeightRange(59, 76);

    if ((hgt || "").endsWith("cm")) {
        return isValidHeightInCm(hgt.replace("cm", ""))
    } else if ((hgt || "").endsWith("in")) {
        return isValidHeightInInch(hgt.replace("in", ""))
    }

    return false;
}

function matchesRegExp(regExp) {
    return function (s) {
        return ((s || "").trim().match(regExp) || []).length > 0;
    };
}

function isValid(passport) {
    const isValidHcl = matchesRegExp(new RegExp('^\#[0-9a-f]{6}$'));
    const isValidPid = matchesRegExp(new RegExp("^[0-9]{9}$"));

    return isBetween(1920, 2002)(passport.byr.trim()) &&
        isBetween(2010, 2020)(passport.iyr.trim()) &&
        isBetween(2020, 2030)(passport.eyr.trim()) &&
        day4(passport.hgt.trim()) &&
        isValidHcl(passport.hcl.trim()) &&
        ["amb", "blu", "brn", "gry", "grn", "hzl", "oth"].some(a => a === passport.ecl.trim()) &&
        isValidPid(passport.pid);
}

const isPresentAndValid = (passport) => {
    return containsAllRequiredFields(passport) && isValid(passport);
}

function containsAllRequiredFields(passport) {
    const fields = Object.keys(passport);
    let requiredFields = ['byr', 'iyr', 'eyr', 'hgt', 'hcl', 'ecl', 'pid'];
    return containsAll(requiredFields)(fields);
}

(async () => {
    const lines = await readLines(await getFilePath(4));
    const passports = parsePassports(lines);
    console.log(passports.filter(containsAllRequiredFields).length);
    console.log(passports.filter(isPresentAndValid).length);
})();