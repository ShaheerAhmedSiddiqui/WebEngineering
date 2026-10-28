
function filterLetters(letters, targetLetter) {
    return letters.filter(function (letter) {
        return letter.toLowerCase() === targetLetter.toLowerCase();
    });
}

console.log(filterLetters(["a", "B", "A", "c", "a"], "a"));
console.log(filterLetters(["x", "Y", "x", "z"], "X"));
