
const reverseString = function (text) {
    let reversed = "";

    for (let i = text.length - 1; i >= 0; i--) {
        reversed = reversed + text[i];
    }

    return reversed;
};

console.log(reverseString("JavaScript"));
console.log(reverseString("Hello"));
console.log(reverseString("ABC"));
