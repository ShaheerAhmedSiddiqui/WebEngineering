
function dateDifference(date1, date2) {
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);

    const firstUTC = Date.UTC(
        firstDate.getFullYear(),
        firstDate.getMonth(),
        firstDate.getDate()
    );

    const secondUTC = Date.UTC(
        secondDate.getFullYear(),
        secondDate.getMonth(),
        secondDate.getDate()
    );

    const difference = Math.abs(secondUTC - firstUTC);

    return difference / (1000 * 60 * 60 * 24);
}

console.log(dateDifference("2026-01-01", "2026-01-10"));
console.log(dateDifference("2026-05-10", "2026-05-15"));
console.log(dateDifference("2026-01-10", "2026-01-01"));
