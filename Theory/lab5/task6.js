
function find(array, callback) {
    for (let i = 0; i < array.length; i++) {
        if (callback(array[i])) {
            return array[i];
        }
    }

    return undefined;
}

console.log(find([8, 11, 4, 27], function (val) {
    return val >= 10;
}));

console.log(find([8, 11, 4, 27], function (val) {
    return val === 5;
}));
