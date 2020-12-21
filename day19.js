import {readLinesForDay} from "./fetchFile.js";
import R from 'ramda';
import {parseInteger} from "./utils/numbers.js";

const mapRule = (s) => {
    const [id, specification] = R.split(": ")(s);
    return {id: parseInteger(id), specification}
}

const findRuleWithId = R.curry((id, rules) => {
    return R.head(R.filter(R.pipe(R.prop("id"), R.equals(id)), rules));
});


function containsOtherRules(specification) {
    return R.match(/[0-9]/, specification).length;
}

function isNaN(char) {
    return Number.isNaN(parseInt(char, 10));
}

export const inlineSpecification2 = R.curry((rules, specification) => {
    console.log("Inlining ", specification)
    if (specification.indexOf('|') >= 0) {
        return specification.split('|').map(inlineSpecification(rules));
    }
    return specification.split(' ').reduce((possibilities, char) => {
        const id = parseInt(char, 10)
        if (isNaN(char)) {
            const replace = R.replace(/"/g, '', char);
            if (possibilities.length === 0) {
                return [replace];
            }
            return R.xprod(possibilities, [replace]);
        } else {
            const inliningSSpecification = findRuleWithId(parseInteger(id))(rules).specification;
            const inlineSpecification1 = inlineSpecification(rules, inliningSSpecification);
            if (possibilities.length === 0) {
                return inlineSpecification1;
            }
            return R.xprod(possibilities, inlineSpecification1);
        }
    }, []).map(R.join(''));
});

export const inlineSpecification = R.curry((rules, specification) => {
    if (R.contains("|", specification)) {
        return R.flatten(R.map(inlineSpecification(rules), R.split('|', specification)));
    }

    if (R.contains(' ', specification)) {
        const individual = specification.split(' ').map(a => inlineSpecification(rules, a));
        return R.reduce((result, s) => {
            return R.xprod(result, s).map(arr => arr.join(''));
        }, [""], individual);
    }
    if (isNaN(specification)) {
        return [R.replace(/"/g, '', specification)];
    }

    const ruleId = parseInteger(specification);
    const ruleSpecification = findRuleWithId(ruleId, rules).specification;
    return inlineSpecification(rules, ruleSpecification);
});


function splitToMatchesString(specification) {
    const removeDoubleQuotes = R.replace(/"/g, '');
    const removeSpaces = R.replace(/ /g, '');
    const s = removeSpaces(removeDoubleQuotes(specification));
    return R.split('|', s);
}

const inList = (matches) => (s) => {
    return matches.indexOf(s) > -1;
}

(async () => {
    const lines = await readLinesForDay(19);

    const splitOnNewLines = R.splitWhen(R.equals(''));
    const [ruleSpecifications, input] = splitOnNewLines(lines);
    const rules = R.map(mapRule, ruleSpecifications);

    const rule0Specification = findRuleWithId(0, rules).specification;
    const validRule0Possibilities = inlineSpecification(rules, rule0Specification);
    const bla = R.filter(inList(validRule0Possibilities), input)
    console.log(bla.length)
})();