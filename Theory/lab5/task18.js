
function removeVowels(string) {
    const vowels = ["a", "e", "i", "o", "u"];

    return string
        .split("")
        .filter(function (character) {
            return !vowels.includes(character.toLowerCase());
        });
}

console.log(removeVowels("Hello World"));
console.log(removeVowels("Education"));
console.log(removeVowels("JavaScript"));
