
function extractKey(array, key) {
    return array.map(function (object) {
        return object[key];
    });
}

const people = [
    { name: "Elie", isInstructor: true },
    { name: "Tim", isInstructor: true },
    { name: "Matt", isInstructor: true }
];

console.log(extractKey(people, "name"));
console.log(extractKey(people, "isInstructor"));
