
function vowelCount(string) {
    const result = {
        a: 0,
        e: 0,
        i: 0,
        o: 0,
        u: 0
    };

    string = string.toLowerCase();

    for (let i = 0; i < string.length; i++) {
        const character = string[i];

        if (character === "a") {
            result.a++;
        } else if (character === "e") {
            result.e++;
        } else if (character === "i") {
            result.i++;
        } else if (character === "o") {
            result.o++;
        } else if (character === "u") {
            result.u++;
        }
    }

    return result;
}

console.log(vowelCount("Awesome"));
console.log(vowelCount("Education"));
