import R from 'ramda';
import {parseInteger} from "./utils/numbers.js";
import {readLinesForDay} from "./fetchFile.js";
import {multiply, sum} from "./utils/math.js";

const findFirstBrackets = (s) => {
    const begin = s.indexOf('(');
    if (begin < 0) {
        return undefined;
    }

    const r = (index, depth) => {
        if (s[index] === ')') {
            return depth === 1 ? index : r(index + 1, depth - 1);
        } else if (s[index] === '(') {
            return r(index + 1, depth + 1);
        }
        return r(index + 1, depth);
    };


    return {begin: begin, end: r(begin + 1, 1)};
};

const evaluateExpressionWith = (solveParenthesesFreeExpression) => s => {
    // console.log("Evaluating ", s)
    const bracketIndexes = findFirstBrackets(s);
    if (bracketIndexes) {
        const bracketSolution = evaluateExpressionWith(solveParenthesesFreeExpression)(s.substring(bracketIndexes.begin + 1, bracketIndexes.end));
        return evaluateExpressionWith(solveParenthesesFreeExpression)(s.substring(0, bracketIndexes.begin) + bracketSolution + s.substring(bracketIndexes.end + 1));
    }

    return solveParenthesesFreeExpression(s);
};

const solveParenthesesFreeExpression = (s) => {
    const multiply = (a, b) => a * b;
    const add = (a, b) => a + b;

    const solve = (operators) => {
        if (operators.length === 1) {
            return R.head(operators);
        }
        const operation = operators[1] === '+' ? add : multiply;
        const operationResult = operation(parseInteger(operators[0]), parseInteger(operators[2]));
        return solve([operationResult, ...R.drop(3, operators)]);
    }

    return solve(s.split(' '))
};


(async () => {
    const lines = await readLinesForDay(18);

    const normal = solveParenthesesFreeExpression;
    const advanced = (s) => {
        return multiply(R.map(solveParenthesesFreeExpression, s.split(' * ')));
    };

    console.log(sum(R.map(evaluateExpressionWith(normal), lines)));
    console.log(sum(R.map(evaluateExpressionWith(advanced), lines)));

})();