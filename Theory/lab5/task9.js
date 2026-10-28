
function printFirstAndLast(array) {
    array.forEach(function (word) {
        const first = word[0];
        const last = word[word.length - 1];

        console.log(first + last);
    });
}

printFirstAndLast(["awesome", "example", "of", "forEach"]);
