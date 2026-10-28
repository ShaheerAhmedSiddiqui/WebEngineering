let obj = {id: 1, Name:"Shaheer", City:"Hyderabad", Cgpa:3.5};
function checkStringProp(obj){
    for (key in obj){
        if(typeof obj[key] === "string"){
             console.log(key + ": " + obj[key])
        }
    }
}

checkStringProp(obj);