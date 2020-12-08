import {readLinesForDay} from "./fetchFile.js";

const hasBeenExecuted = (previousExecutions, execution) => {
    return previousExecutions.some(e => e.position === execution.position);
}

function parseOperation(operation) {
    if (!(operation || "")) {
        return 0;
    }
    if (operation.trim().startsWith("+")) {
        return parseOperation(operation.substring(1));
    }
    return parseInt(operation, 10);
}

const execute = (state, execution) => {
    if (execution.instruction === 'nop') {
        return {
            acc: state.acc,
            position: state.position + 1,
            previousExecutions: [...state.previousExecutions, execution]
        };
    }
    if (execution.instruction === 'acc') {
        return {
            acc: state.acc + parseOperation(execution.operation),
            position: state.position + 1,
            previousExecutions: [...state.previousExecutions, execution]
        }
    }

    if (execution.instruction === 'jmp') {
        const step = parseOperation(execution.operation);
        return {
            acc: state.acc,
            position: state.position + step,
            previousExecutions: [...state.previousExecutions, execution]
        };
    }
    throw new Error("" + execution.instruction + ' unknown')
};

const reduce = (executions) => {
    const reduceMe = (state, execution) => {
        if (hasBeenExecuted(state.previousExecutions, execution)) {
            return state;
        }

        const newState = execute(state, execution);
        if (newState.position >= executions.length) {
            return {
                finished: true,
                ...newState
            };
        } else {
            const nextExecution = executions[newState.position];
            return reduceMe(newState, nextExecution)
        }
    }
    return reduceMe({position: 0, acc: 0, previousExecutions: []}, executions[0]);
}

function replaceJump(executions, line) {
    const execution = executions[line];
    return [...executions.slice(0, line), {...execution, instruction: 'nop'}, ...executions.slice(line + 1)];
}

(async () => {
    const lines = await readLinesForDay(8);

    const executions = lines.map((l, index) => ({
        position: index,
        instruction: l.split(' ')[0],
        operation: l.split(' ')[1]
    }));
    const result = reduce(executions);
    console.log(result.acc, 'and', result.finished);

    const jumps = lines
        .map((l, index) => ({line: l, index}))
        .filter((l) => {
            return l.line.startsWith("jmp");
        }).map(l => l.index);

    const results = jumps.map((line) => {
        const fixedExecutions = replaceJump(executions, line);
        return reduce(fixedExecutions);
    })
        .filter(state => state.finished)
        .map(state => state.acc);

    console.log(results);

})();
