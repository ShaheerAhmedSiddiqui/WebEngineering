
let users = [
    {
        username: "larry",
        email: "larry@foo.com",
        yearsExperience: 22.1,
        favoriteLanguages: ["Perl", "Java", "C++"],
        favoriteEditor: "Vim",
        hobbies: ["Fishing", "Sailing", "Hiking"],
        hometown: {
            city: "San Francisco",
            state: "CA"
        }
    },
    {
        username: "jane",
        email: "jane@test.com",
        yearsExperience: 33.9,
        favoriteLanguages: ["Haskell", "Clojure", "PHP"],
        favoriteEditor: "Emacs",
        hobbies: ["Swimming", "Biking", "Hiking"],
        hometown: {
            city: "New York",
            state: "NY"
        }
    },
    {
        username: "sam",
        email: "sam@test.com",
        yearsExperience: 8.2,
        favoriteLanguages: ["JavaScript", "Ruby", "Python", "Go"],
        favoriteEditor: "Atom",
        hobbies: ["Golf", "Cooking", "Archery"],
        hometown: {
            city: "Fargo",
            state: "SD"
        }
    },
    {
        username: "anne",
        email: "anne@test.com",
        yearsExperience: 4,
        favoriteLanguages: ["C#", "C++", "F#"],
        favoriteEditor: "Visual Studio Code",
        hobbies: ["Tennis", "Biking", "Archery"],
        hometown: {
            city: "Albany",
            state: "NY"
        }
    },
    {
        username: "david",
        email: "david@test.com",
        yearsExperience: 12.5,
        favoriteLanguages: ["JavaScript", "C#", "Swift"],
        favoriteEditor: "VS Code",
        hobbies: ["Volunteering", "Biking", "Coding"],
        hometown: {
            city: "Los Angeles",
            state: "CA"
        }
    }
];



function printEmails(users) {
    users.forEach(function (user) {
        console.log(user.email);
    });
}

printEmails(users);



function printHobbies(users) {
    users.forEach(function (user) {
        user.hobbies.forEach(function (hobby) {
            console.log(hobby);
        });
    });
}

printHobbies(users);



function findHometownByState(users, state) {
    return users.find(function (user) {
        return user.hometown.state === state;
    });
}

console.log(findHometownByState(users, "NY"));
console.log(findHometownByState(users, "CA"));





function allLanguages(users) {
    const languages = [];

    users.forEach(function (user) {
        user.favoriteLanguages.forEach(function (language) {
            if (!languages.includes(language)) {
                languages.push(language);
            }
        });
    });

    return languages;
}

console.log(allLanguages(users));



function hasFavoriteEditor(users, editor) {
    return users.some(function (user) {
        return user.favoriteEditor === editor;
    });
}

console.log(hasFavoriteEditor(users, "Vim"));
console.log(hasFavoriteEditor(users, "VS Code"));
console.log(hasFavoriteEditor(users, "Notepad"));



function findByUsername(users, username) {
    return users.find(function (user) {
        return user.username === username;
    });
}

console.log(findByUsername(users, "sam"));
console.log(findByUsername(users, "anne"));
console.log(findByUsername(users, "unknown"));
