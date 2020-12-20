import R from 'ramda';
import {parseInteger} from "./utils/numbers.js";
import {readLinesForDay} from "./fetchFile.js";

const splitOnPlus = R.split('+')
const splitOnMultiply = R.split('*')

function findEndBracketBracketIndex(s) {
    let index = 0;
    let depth = 1;
    while (depth > 0 && index < s.length) {
        if (s[index] === ')') {
            depth--;
        } else if (s[index] === '(') {
            depth++;
        }
        index++;
    }
    return index;
}
function takeNumber(s) {
    if (R.head(s) === '(') {
        const endIndex = findEndBracketBracketIndex(s.substring(1));
        const resultInBetweenBrackets = evaluateExpression(s.substring(1, endIndex));
        return {number: resultInBetweenBrackets, remaining: s.substring(endIndex + 1)};
    }
    const n = R.head(R.flatten(R.map(splitOnMultiply, splitOnPlus(s))));
    return {number: parseInteger(n.trim()), remaining: s.substring(n.length)};
}

function takeOperation(s) {
    const sum = R.curry((a, b) => a+b)
    const multiply = R.curry((a, b) => a*b)
    const operator = R.head(s);
    return operator === '+' ? sum : multiply;
}

function evaluateExpression(s) {
    console.log("Evaluating " + s);
    const { number: firstOperand, remaining } = takeNumber(s.trim());
    if (remaining === '') {
        return firstOperand;
    }
    const operation = takeOperation(remaining);
    const {number: secondOperand, remaining: followup} = takeNumber(remaining.substring(1));

    return evaluateExpression("" + operation(firstOperand, secondOperand) + followup);
}

const removeSpaces = R.replace(/ /g, '');

(async () => {
    const lines = await readLinesForDay(18);

    const test = "1 + 2 * 3 + 4 * 5 + 6";
    // console.log(takeNumber(removeSpaces(test)));
    // console.log(evaluateExpression(removeSpaces(test)));
    const test2 = "((2 + 4 * 9) * (6 + 9 * 8 + 6) + 6) + 2 + 4 * 2";
    console.log(evaluateExpression(removeSpaces(test2)));

    const part1 = lines.reduce((sum, expression) => {
        return sum + evaluateExpression(removeSpaces(expression));
    }, 0)
    console.log(part1);
})();