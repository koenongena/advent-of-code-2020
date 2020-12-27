import {readLinesForDay} from "./fetchFile.js";
import R from 'ramda';

const findAllFoodWithAllergen = R.curry((input, fish) => {
    return input.filter(i => R.includes(fish, i.allergens));
});

const findAllergenOverlap = (input) => allergen => {
    const food = findAllFoodWithAllergen(input, allergen);
    const intersection = R.reduce((inters, food) => {
        return R.intersection(inters, food.ingredients);
    }, food[0].ingredients, food);

    return {allergen, ingredients: intersection}
};

function linkAllergensToIngredients(input) {
    const allergens = R.uniq(R.flatten(R.map(R.prop("allergens"), input)));
    const allergenPossibilities = R.map(findAllergenOverlap(input), allergens)
    const reduceAllergenIngredients = (possibilities) => {
        const solvedIngredients = R.uniq(R.flatten(possibilities.filter(p => p.ingredients.length === 1).map(p => p.ingredients)));
        return possibilities.map(p => {
            if (p.ingredients.length > 1) {
                return {
                    allergen: p.allergen,
                    ingredients: R.reject(ingredient => R.includes(ingredient, solvedIngredients), p.ingredients)
                }
            }
            return p;

        });
    }
    const onlyOneIngredientPerAllergen = i => i.every(p => p.ingredients.length === 1);
    const mapToAllergenIngredientLink = i => ({allergen: i.allergen, ingredient: i.ingredients[0]});
    const solution = R.until(onlyOneIngredientPerAllergen, reduceAllergenIngredients, [...allergenPossibilities]);
    return R.map(mapToAllergenIngredientLink, solution);
}

(async () => {
    const lines = await readLinesForDay(21);
    const input = R.map(line => {
        const result = line.match(new RegExp(/(.*)\((.*)\)/));
        const ingredients = result[1].split(' ').map(R.trim).filter(s => s);
        const allergens = result[2].replace('contains ', '').split(',').map(R.trim);

        return {ingredients, allergens}
    }, lines);

    const allAllergens = R.uniq(R.flatten(R.map(R.prop("allergens"), input)));
    const allIngredients = R.uniq(R.flatten(R.map(R.prop("ingredients"), input)));

    const allergensToIngredients = linkAllergensToIngredients(input);
    const allergicIngredients = allergensToIngredients.map(R.prop('ingredient'));
    console.log(allergicIngredients);
    const nonAllergicIngredients = R.reject(s => R.includes(s, allergicIngredients), allIngredients);
    console.log(nonAllergicIngredients);
    const part1 = R.reduce((count, { ingredients }) => {
        return count + R.intersection(nonAllergicIngredients, ingredients).length;
    }, 0, input);
    console.log(part1);



})();