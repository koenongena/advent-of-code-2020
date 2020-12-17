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
        // console.log("Checking ", value, ' between ', min, 'and', max)
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

const isValid = R.curry((rules, field) => {
    return R.all(rule => rule.isValid(field), rules);
});

const isInvalid = R.complement(isValid);

const notValidForAnyField = (rules) => (fields) => {
    console.log("Checking ", fields);
    return R.any(isInvalid(rules), fields);
};

const filterInvalidFields = (rules) => (fields) => {
    return R.filter(isInvalid(rules), fields);
};

const allRulesInvalidFor = (rules) => (field) => {
    const isInvalid = (rule) => {
        return !rule.isValid(field)
    }
    return R.all(isInvalid, rules)
};

const isInvalidTicket = (rules) => (fields) => {
    return R.any(allRulesInvalidFor(rules), fields);
}

const isValidTicket = (rules) => fields => {
    return R.all(isValid(rules), fields);
}

const filterRulesValidForFields = (fields) => (rules) => {
    const isValidForAllFields = (rule) => R.all(rule.isValid, fields);
    return R.filter(isValidForAllFields, rules);
};


function removeRule(overview, rule) {
    const withoutRules = overview.map(o => {
        return {index: o.index, rules: R.reject(R.equals(rule), o.rules)}
    });

    const emptyRules = (o) => o.rules.length === 0;
    const notEmptyRules = R.complement(emptyRules);
    return R.filter(notEmptyRules, withoutRules);
}

function deduceFields(overview, fields = []) {
    if (!overview.length) {
        return fields;
    }
    const certain = overview
        .filter(o => o.rules.length === 1);

    const certainRuleNames = certain.map(o => o.rules[0]);
    const remainingOverview = R.reduce(removeRule, overview, certainRuleNames);
    return deduceFields(remainingOverview, [...fields, ...certain]);
}

(async () => {

    const lines = await readLinesForDay(16);
    const chunks = splitOn('', lines);
    const rules = R.map(parseRule, chunks[0]);
    const myTickets = splitAndParse(R.last(chunks[1]));

    const nearbyTickets = R.map(splitAndParse, R.tail(chunks[2]));

    const invalidFields = R.map(filterInvalidFields(rules), nearbyTickets);
    const notEmpty = R.complement(R.isEmpty);
    console.log(R.sum(R.flatten(R.filter(notEmpty, invalidFields))));

    const validTickets = R.reject(isInvalidTicket(rules), nearbyTickets);

    const numberOfFields = validTickets[0].length;
    const rulesOverview = R.map((fieldIndex) => {
        const fields = validTickets.map(ticket => ticket[fieldIndex]);
        const applicableRules = filterRulesValidForFields(fields)(rules);
        return {index: fieldIndex, rules: R.map(R.prop("name"), applicableRules)};
    }, R.range(0, numberOfFields));

    console.log(rulesOverview)
    const mapSingleRule = s => ({index: s.index, rule: s.rules[0]});
    const fields = R.map(mapSingleRule, deduceFields(rulesOverview));

    const filterOnRuleNamePrefix = (prefix) => (s) => s.rule.startsWith(prefix);
    const solution = R.filter(filterOnRuleNamePrefix("departure"), fields)
    console.log(solution);
    console.log(myTickets)
    console.log(R.reduce((acc, {index}) => acc * myTickets[index], 1, solution));

})();