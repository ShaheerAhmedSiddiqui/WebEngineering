
function displayObject(object) {
    const keys = Object.keys(object);

    if (keys.length === 0) {
        console.log("Object is empty");
        return;
    }

    function displayValues(currentObject, prefix) {
        for (let key in currentObject) {
            const value = currentObject[key];
            const fullKey = prefix ? prefix + "." + key : key;

            if (
                value !== null &&
                typeof value === "object" &&
                !Array.isArray(value)
            ) {
                displayValues(value, fullKey);
            } else {
                console.log(fullKey + ": " + value);
            }
        }
    }

    displayValues(object, "");
}

const student = {
    ID: 1,
    Name: "ABC",
    Department: "Software Engineering",
    Address: {
        City: "Hyderabad",
        Country: "Pakistan"
    },
    Marks: {
        JavaScript: 85,
        Database: 90
    }
};

const emptyObject = {};

displayObject(student);
console.log("--- Empty object test ---");
displayObject(emptyObject);
