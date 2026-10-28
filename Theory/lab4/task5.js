function checkSpeed(speed) {

    let speedLimit = 70;

    if (speed <= speedLimit) {

        console.log("Good Safe Driving");

    } else {

        let points = Math.ceil((speed - speedLimit) / 5);

        if (points > 10) {
            console.log("License Suspended");
        } else {
            console.log("Speed Limit Crossed by Penalty Point " + points);
        }

    }
}

checkSpeed(76);
