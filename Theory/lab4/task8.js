
function findStringsWithDigit(array) {
    const result = [];

    for (let i = 0; i < array.length; i++) {
        const text = array[i];

        for (let j = 0; j < text.length; j++) {
            if (text[j] >= "0" && text[j] <= "9") {
                result.push(text);
                break;
            }
        }
    }

    return result;
}

const values = [
    "Hello",
    "abc123",
    "JavaScript",
    "Room5",
    "Student20",
    "World"
];

console.log(findStringsWithDigit(values));
