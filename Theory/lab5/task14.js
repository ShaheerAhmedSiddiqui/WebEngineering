
function filterKey(array, key) {
    return array.filter(function (object) {
        return object[key];
    });
}

const people = [
    { name: "Elie", isInstructor: true, isHilarious: false },
    { name: "Tim", isInstructor: true, isHilarious: true },
    { name: "Matt", isInstructor: true }
];

console.log(filterKey(people, "isHilarious"));
