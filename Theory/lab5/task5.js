
function isEven(number) {
    return number % 2 === 0;
}

function isOdd(number) {
    return number % 2 !== 0;
}

function isPrime(number) {
    if (number <= 1) {
        return false;
    }

    for (let i = 2; i < number; i++) {
        if (number % i === 0) {
            return false;
        }
    }

    return true;
}

function numberFact(number, callback) {
    return callback(number);
}

console.log(numberFact(59, isEven));    // ✅ passes function reference
console.log(numberFact(59, isOdd));     // ✅
console.log(numberFact(59, isPrime));
