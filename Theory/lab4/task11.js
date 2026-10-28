
function replaceMinimum(numbers) {
    if (numbers.length === 0) {
        console.log("The list is empty");
        return;
    }

    let minimum = numbers[0];

    // Find the minimum value
    for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] < minimum) {
            minimum = numbers[i];
        }
    }

    // Count occurrences of the minimum
    let count = 0;

    for (let i = 0; i < numbers.length; i++) {
        if (numbers[i] === minimum) {
            count++;
        }
    }

    // Replace every occurrence with -1
    for (let i = 0; i < numbers.length; i++) {
        if (numbers[i] === minimum) {
            numbers[i] = -1;
        }
    }

    console.log("Minimum value:", minimum);
    console.log("Occurrences:", count);
    console.log("Updated list:", numbers);
}

const numbers = [4, 2, 7, 2, 9, 2, 5];

replaceMinimum(numbers);
