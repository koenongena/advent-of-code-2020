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

    const firstBracket = s.indexOf('(');
    if (firstBracket >= 0) {
        const endBracket = firstBracket + findEndBracketBracketIndex(s.substring(firstBracket + 1));
        const firstParentheses = evaluateExpression(s.substring(firstBracket + 1, endBracket));
        return evaluateExpression(s.substring(0, firstBracket) + firstParentheses + s.substring(endBracket + 1));
    }
    let addedParentheses = s;
    if (s.indexOf('*')>=0) {
        addedParentheses = R.replace(/(?!\()(([0-9]+\+)+[0-9]+)(?!\))/g, '(\$1)', s);
    }
    console.log("Evaluating " + addedParentheses);
    const {number: firstOperand, remaining} = takeNumber(addedParentheses);
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
    const test2 = "5 + (8 * 3 + 9 + 3 * 4 * 3)";
    // console.log(evaluateExpression(removeSpaces(test)));
    // console.log(evaluateExpression(removeSpaces(test2)));
    console.log(evaluateExpression(removeSpaces("1 + (2 * 3) + (4 * (5 + 6))")));
    console.log(evaluateExpression(removeSpaces("2 * 3 + (4 * 5)")));
    console.log(evaluateExpression(removeSpaces("5 + (8 * 3 + 9 + 3 * 4 * 3)")));
    console.log(evaluateExpression(removeSpaces("5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))")));

    const part1 = lines.reduce((sum, expression) => {
        return sum + evaluateExpression(removeSpaces(expression));
    }, 0)
    console.log(part1);
})();