import {readLinesForDay} from "./fetchFile.js";
import R from 'ramda';
import {parseInteger} from "./utils/numbers.js";

const mapRule = (s) => {
    const [id, specification] = R.split(": ")(s);
    return {id: parseInteger(id), specification: R.replace(/"/g, '', specification)}
}

const findRuleWithId = R.curry((id, rules) => {
    return rules.get(id);
});


function containsOtherRules(specification) {
    return R.match(/[0-9]/, specification).length;
}

function isNaN(char) {
    return Number.isNaN(parseInt(char, 10));
}

export const matchesRule = (rules, spec) => {
    return (s) => {
        // console.log("Evaluating ", spec);
        if (s.length === 0 || spec.length === 0) {
            return s.length === spec.length;
        }

        if (R.contains('|', spec)) {
            const individualSpecs = spec.split('|');
            return individualSpecs.some(spec => {
                return matchesRule(rules, spec)(s);
            });
        }

        const char = R.split(' ', spec)[0];
        const dropChar = R.drop(char.length + 1)
        if (isNaN(char)) {
            const nextSpec = dropChar(spec);
            const nextString = R.drop(1, s);
            return R.head(s) === char && matchesRule(rules, nextSpec)(nextString)
        } else {
            const ruleToInline = findRuleWithId(parseInteger(char), rules);
            const specs = ruleToInline.split(' | ').map(ss => {
                return R.replace(/ +/g, ' ', ss + " " + dropChar(spec));
            })
            return specs.some(spec2 => matchesRule(rules, spec2)(s));
        }
    };
};

(async () => {
    const lines = await readLinesForDay(19);

    const splitOnNewLines = R.splitWhen(R.equals(''));
    const [ruleSpecifications, input] = splitOnNewLines(lines);
    const rules = R.reduce((m, rule) => {
        const {id, specification } = mapRule(rule)
        return m.set(id, specification);
    }, new Map(), ruleSpecifications);

    const part1 = R.filter(matchesRule(rules, rules.get(0)), input);
    console.log(part1.length);

    const adaptedRules = new Map(rules);
    adaptedRules.set(8, "42 | 42 8");
    adaptedRules.set(11, "42 31 | 42 11 31");

    const part2 = R.filter(matchesRule(adaptedRules, adaptedRules.get(0)), input);
    console.log(part2.length);
})();