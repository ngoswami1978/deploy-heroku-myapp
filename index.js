//dependencies required for the app
var express = require("express");
var bodyParser = require("body-parser");
const { check, validationResult } = require('express-validator')
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
//const urlencodedParser = bodyParser.urlencoded({ extended: false })

// Set Templating Enginge
app.set("view engine", "ejs");

//render css files
app.use(express.static("public"));

//placeholders for added task
var task = [
  "Time 05:00 to 06:00 AM"
, "Time 06:00 to 07:00 AM"
, "Time 07:00 to 08:00 AM"
, "Time 08:00 to 09:00 AM"
, "Time 09:00 to 10:00 AM"
, "Time 10:00 to 11:00 AM"
, "Time 11:00 to 12:00 AM"
, "Time 12:00 to 13:00 AM"
, "Time 13:00 to 14:00 AM"
, "Time 14:00 to 15:00 AM"
, "Time 15:00 to 16:00 AM"
, "Time 16:00 to 17:00 AM"
, "Time 17:00 to 18:00 AM"
, "Time 18:00 to 19:00 AM"
, "Time 19:00 to 20:00 AM"
, "Time 20:00 to 20:00 AM"
, "Time 21:00 to 22:00 AM"
, "Time 22:00 to 23:00 AM"
];
//placeholders for removed task
var complete = [""];
var errorMsg = [""];
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

app.post("/bookedtask", function(req, res) {
    const errors = validationResult(req)
    var _room = req.body.selectpicker;
    console.log('Room Selected  - Room ', _room);
    if (_room==0) {
        errorMsg.push("Please Select Room Number");
        res.redirect("/");
    }    
    else{
        while (arr.length > 0) {
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

//render the ejs and display added task, completed task
app.get("/", function(req, res) {    
    res.render("index", { task: task, complete: complete , errorMsg:errorMsg });
});

//set app to listen on port 3000
app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });