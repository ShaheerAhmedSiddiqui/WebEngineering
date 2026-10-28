function valTimesIndex(array) {
    return array.map(function (value, index) {
        return value * index;
    });
}

console.log(valTimesIndex([1, 2, 3]));
console.log(valTimesIndex([5, 10, 15]));
