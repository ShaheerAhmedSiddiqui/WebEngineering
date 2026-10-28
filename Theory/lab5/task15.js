
function addKeyAndValue(array, key, value) {
    return array.reduce(function (result, object) {
        const newObject = {
            ...object,
            [key]: value
        };

        result.push(newObject);

        return result;
    }, []);
}

const instructors = [
    { name: "Elie" },
    { name: "Tim" },
    { name: "Elie" }
];

console.log(
    addKeyAndValue(instructors, "isInstructor", true)
);

console.log(instructors);
