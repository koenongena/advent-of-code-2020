import {inlineSpecification} from "./day19.js";

const rules = [
    {id: 1, specification: '"a"'},
    {id: 2, specification: '"b"'},
    {id: 3, specification: '1 2'},
    {id: 4, specification: '1 | 2'}
]

const sampleRules = [
    {id: 0, specification: '4 1 5'},
    {id: 1, specification: '2 3 | 3 2'},
    {id: 2, specification: '4 4 | 5 5'},
    {id: 3, specification: '4 5 | 5 4'},
    {id: 4, specification: '"a"'},
    {id: 5, specification: '"b"'}
]

it('should inline a single rule easily', function () {
    expect(inlineSpecification(rules, "1")).toEqual(["a"]);
});

it('should inline 2 rules', function () {
    expect(inlineSpecification(rules, "1 2")).toEqual(["ab"])
});

it('should inline recursively', function () {
    expect(inlineSpecification(rules, "1 2 4")).toEqual(["aba", "abb"])
});

it('should inline the sampleRules', function () {
    expect(inlineSpecification(sampleRules, "3")).toEqual(["ab", "ba"])
});
