
//dependencies required for the app
var express = require("express");
var bodyParser = require("body-parser");
const { check, validationResult } = require('express-validator')
const fs = require("fs");
const washingScheduledtimejson = "public/data/definetimesWashing.json";
const logPath = "public/data/log.json";

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
//const urlencodedParser = bodyParser.urlencoded({ extended: false })

// Set Templating Enginge
app.set("view engine", "ejs");

//render css files
app.use(express.static("public"));

//placeholders for added task
var task = [
  " 05:00 AM  to 06:00 AM"
, " 06:00 AM  to 07:00 AM"
, " 07:00 AM  to 08:00 AM"
, " 08:00 AM  to 09:00 AM"
, " 09:00 AM  to 10:00 AM"
, " 10:00 AM  to 11:00 AM"
, " 11:00 AM  to 12:00 PM"
, " 12:00 PM  to 13:00 PM"
, " 13:00 PM  to 14:00 PM"
, " 14:00 PM  to 15:00 PM"
, " 15:00 PM  to 16:00 PM"
, " 16:00 PM  to 17:00 PM"
, " 17:00 PM  to 18:00 PM"
, " 18:00 PM  to 19:00 PM"
, " 19:00 PM  to 20:00 PM"
, " 20:00 PM  to 20:00 PM"
, " 21:00 PM  to 22:00 PM"
, " 22:00 PM  to 23:00 PM"
];

const data_mywash = {
    "date": "27-Aug-2023",
    "room": "4",
    "time": [
        { "timeid": "3", "timeformat": "07:00 AM to 08:00 AM" },
        { "timeid": "4", "timeformat": "08:00 AM to 09:00 AM" }
    ]        
  }      



let scheduletime_list='';
fs.readFile(washingScheduledtimejson, "utf8", (err, jsonString) => {
    if (err) {
        console.log("Error reading the JSON file:", err);
        return;
    }
    try {
        scheduletime_list = JSON.parse(jsonString);
        console.log(scheduletime_list);
    } catch (err) {
        console.log("Error parsing JSON string:", err);
    }
});

let objwash = {
    washing: []
};

fs.readFile(logPath, "utf8", function readFileCallback(err, data){
    if (err){
        console.log(err);
    } else {
    try {
        objwash  = JSON.parse(data);
        objwash.washing.push(data_mywash);
        var json = JSON.stringify(objwash); //convert it back to json

        fs.writeFile(logPath,json, function(err){
            if(err) return console.log(err);
            console.log('washing schedule added');
        });     
    } catch (err) {
        console.log("Error parsing JSON string:", err);
    }
}});


// const customer = {
//     name: "Newbie Co.",
//     order_count: 0,
//     address: "Po Box City",
// }
// const jsonString = JSON.stringify(customer) 
// fs.writeFile('./newCustomer.json', jsonString, err => {
//     if (err) {
//         console.log('Error writing file', err)
//     } else {
//         console.log('Successfully wrote file')
//     }
// })

//placeholders for removed task
var complete = [""];
var errorMsg = [""];
var dt_datePicker=Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: '2-digit'}).format(new Date());
complete.pop();
errorMsg.pop();
var datetime = new Date();

//post route for adding new task 
app.post("/addtask", function(req, res) {    
    var newTask = req.body.newtask;
    //add the new task from the post route
    task.push(newTask);
    res.redirect("/");    
});

// app.post('/addtask', urlencodedParser, [
//     check('username', 'This username must me 3+ characters long')
//         .exists()
//         .isLength({ min: 3 }),
//     check('email', 'Email is not valid')
//         .isEmail()
//         .normalizeEmail()
// ], (req, res)=> {    
//     const errors = validationResult(req)
//     if(!errors.isEmpty()) {
//         // return res.status(422).jsonp(errors.array())
//         const alert = errors.array()
//         res.render('addtask', {
//             alert
//         })
//     } 
//     else{
//     var newTask = req.body.newtask;
//     //add the new task from the post route
//     task.push(newTask);
//     res.redirect("/"); 
//     }      
// })

app.post("/bookingtask", function(req, res) {
    const errors = validationResult(req)
    var _room = req.body.selectpicker;
    console.log('Room Selected  - Room ', _room);
    if (_room==0) {
        while (errorMsg.length > 0) {
            errorMsg.pop();
          }    
        errorMsg.push("Please select room");
        res.redirect("/");
    }    
    else{
        while (errorMsg.length > 0) {
            errorMsg.pop();
          }    
        var completeTask = req.body.check;
        //check for the "typeof" the different completed task, then add into the complete task
        if (typeof completeTask === "string") {
        var _room = req.body.selectpicker;        
            complete.push(completeTask + "--> Room" + _room);
            //check if the completed task already exits in the task when checked, then remove it
            task.splice(task.indexOf(completeTask), 1);
        } else if (typeof completeTask === "object") {        
            for (var i = 0; i < completeTask.length; i++) {
                complete.push(completeTask[i]+ "--> Room " + _room);
                task.splice(task.indexOf(completeTask[i]), 1);
            }
        }
        res.redirect("/");
    }
});

app.post("/selectNextdate", function(req, res) {    
    console.log(scheduletime_list);
    dt_datePicker = addDays(1);
    res.render("index", { task: task, complete: complete , errorMsg:errorMsg ,dt_datePickerValue: dt_datePicker});    
});

app.post("/selectPreviousdate", function(req, res) {    
    console.log(scheduletime_list);
    dt_datePicker = subtractDays(1);
    res.render("index", { task: task, complete: complete , errorMsg:errorMsg ,dt_datePickerValue: dt_datePicker});        
});

//render the ejs and display added task, completed task
app.get("/", function(req, res) {    
    res.render("index", { task: task, complete: complete , errorMsg:errorMsg ,dt_datePickerValue: dt_datePicker});
});

function addDays (days, date = new Date(dt_datePicker)) {      
    date.setDate(date.getDate() + days)
    return  Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: '2-digit'}).format(date);
}
function subtractDays (days, date = new Date(dt_datePicker)) {      
    date.setDate(date.getDate() - days)
    return  Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: '2-digit'}).format(date);
}

//set app to listen on port 3000
app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });