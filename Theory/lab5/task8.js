
function specialMultiply(number1, number2) {
    if (arguments.length === 2) {
        return number1 * number2;
    } else {
        return function (secondNumber) {
            return number1 * secondNumber;
        };
    }
}

console.log(specialMultiply(3, 4));
console.log(specialMultiply(3)(4));

console.log(specialMultiply(3));
