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
console.log(isPrime(8));
console.log(isPrime(17));
console.log(isPrime(2));
console.log(isPrime(1));