function countdown(number){
    const timer = setInterval(function(){
        if(number > 0){
            console.log(number)
            number--;
        }else{
            console.log("Completed");
            clearInterval(timer);
        }
    }, 1000);
};
countdown(5)