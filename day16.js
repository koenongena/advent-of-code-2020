import {readLinesForDay} from "./fetchFile.js";
import R from 'ramda';
import {parseInteger} from "./utils/numbers.js";

const splitOn = (char, arr) => {
    const pair = R.splitWhen(R.equals(char), arr);
    if (pair[1].length) {
        return [pair[0], ...splitOn(char, R.tail(pair[1]))]
    }
    return [pair[0]];
}

const splitAndParse = R.pipe(R.split(','), R.map(parseInteger));

function parseRange(s) {
    const [min, max] = R.split('-', s);
    return (value) => {
        console.log("Checking ", value, ' between ', min, 'and', max)
        return value >= min && value <= max;
    }
}

function parseRule(s) {
    const ruleName = R.split(':', s)[0];
    const rules = R.split(':', s)[1];
    const rangeValidations = rules.split(' or ').map(parseRange);
    const fullValue = R.anyPass(rangeValidations);
    return {
        name: ruleName,
        isValid: fullValue
    }
}

const isInvalid = R.curry((rules, field) => {
    return R.none(rule => rule.isValid(field), rules);
});

const notValidForAnyField = (rules) => (fields) => {
    console.log("Checking ", fields);
    return R.any(isInvalid(rules), fields);
};
const filterInvalidFields = (rules) => (fields) => {
    return R.filter(isInvalid(rules), fields);
};

(async () => {

    const lines = await readLinesForDay(16);
    const chunks = splitOn('', lines);
    const rules = R.map(parseRule, chunks[0]);
    const myTickets = splitAndParse(R.last(chunks[1]));

    const nearbyTickets = R.map(splitAndParse, R.tail(chunks[2]));

    const invalidFields = R.map(filterInvalidFields(rules), nearbyTickets);
    const notEmpty = R.complement(R.isEmpty);
    console.log(R.sum(R.flatten(R.filter(notEmpty, invalidFields))));
})();