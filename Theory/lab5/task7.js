
function findIndex(array, callback) {
    for (let i = 0; i < array.length; i++) {
        if (callback(array[i])) {
            return i;
        }
    }

    return undefined;
}

console.log(findIndex([8, 11, 4, 27], function (val) {
    return val >= 10;
}));

console.log(findIndex([8, 11, 4, 27], function (val) {
    return val === 7;
}));
