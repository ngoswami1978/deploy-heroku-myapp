
//dependencies required for the app
var express = require("express");
var bodyParser = require("body-parser");
const { check, validationResult } = require('express-validator')
const fs = require("fs");
const axios = require("axios");
const cron = require("node-cron");

const washingScheduledtimejson = "public/data/definetimesWashing.json";
const logPath = "public/data/log.json";
const roomSubscription ="public/data/roomSubscription.json";
const seatbookjson ="public/data/seat.json";
const url = "https://server.vizmo.in/vms/classes/DeskBooking";

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

function convertday(todate) {
    var now = new Date();
    var secondDate = todate;
    const date = new Date(now);
    const date1 = new Date(secondDate);
    let differentDays =0;
    if (date1>date){
        timeDifference = Math.abs(date.getTime() - date1.getTime());
        differentDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
    }    
    if (todate=='')
    {
        differentDays=0;
    }
    return differentDays;
}

let subscribed_list='';
fs.readFile(roomSubscription, "utf8", (err, jsonString) => {
    if (err) {
        console.log("Error reading the JSON file 1:", err);
        return;
    }
    try {
        subscribed_list = JSON.parse(jsonString);
        //console.log(subscribed_list);
    } catch (err) {
        console.log("Error parsing JSON string 2:", err);
    }
});


let scheduletime_list='';
fs.readFile(washingScheduledtimejson, "utf8", (err, jsonString) => {
    if (err) {
        console.log("Error reading the JSON file 3:", err);
        return;
    }
    try {
        scheduletime_list = JSON.parse(jsonString);
        //console.log(scheduletime_list);
    } catch (err) {
        console.log("Error parsing JSON string 4:", err);
    }
});


// let seatbook_list='';
// fs.readFile(seatbookjson,"utf8", async (err, jsonString) => {
//     if (err) {
//         console.log("Error reading the JSON file seat book:", err);
//         return;
//     }
//     try {
//         seatbook_list = JSON.parse(jsonString);
//         console.log(seatbook_list);
        
//         for (let i = 0; i < seatbook_list.length; i++) {
//             const booking = seatbook_list[i];
//             console.log( booking);

//             try {
//                 const response = await axios.post(url, booking, {
//                 headers: {
//                     "X-Parse-Application-Id": booking._ApplicationId,
//                     "X-Parse-JavaScript-Key": booking._JavaScriptKey,
//                     "X-Parse-Session-Token": booking._SessionToken,
//                     "Content-Type": "application/json",
//                     },
//                 });

//                 console.log(`✔ Booking ${i + 1} sent successfully:`);
//                 console.log(response.data);
//                 console.log("-----------------------------------");

//             } catch (apiError) {
//             console.error(`❌ Failed to send record ${i + 1}`);
//             console.error(apiError.response?.data || apiError.message);
//             }


//         }
        
        
//     } catch (err) {
//         console.log("Error parsing JSON string seat book:", err);
//     }
// });


let objwash = {
    washing: []
};

fs.readFile(logPath, "utf8", function readFileCallback(err, data){
    if (err){
        console.log(err);
    } else {
    try {
       // objwash  = JSON.parse(data);
        objwash.washing.push(data_mywash);
        var json = JSON.stringify(objwash); //convert it back to json

        fs.writeFile(logPath,json, function(err){
            if(err) return console.log(err);
            //console.log('washing schedule added');
        });     
    } catch (err) {
        console.log("Error parsing JSON string 5:", err);
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
    //console.log('Room Selected  - Room ', _room);
    if (_room==0) {
        while (errorMsg.length > 0) {
            errorMsg.pop();
          }    
        errorMsg.push("select room");
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
    //console.log(scheduletime_list);
    dt_datePicker = addDays(1);
    res.render("index", { task: task, complete: complete , errorMsg:errorMsg ,dt_datePickerValue: dt_datePicker,subscriptions:subscribed_list});    
});

app.post("/selectPreviousdate", function(req, res) {    
    //console.log(scheduletime_list);
    dt_datePicker = subtractDays(1);
    res.render("index", { task: task, complete: complete , errorMsg:errorMsg ,dt_datePickerValue: dt_datePicker,subscriptions:subscribed_list});        
});

//render the ejs and display added task, completed task
app.get("/", function(req, res) {  
    dt_datePicker=Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: '2-digit'}).format(new Date()); 
    res.render("index", { 
        task: task
        , complete: complete 
        , errorMsg:errorMsg 
        ,dt_datePickerValue: dt_datePicker
        ,subscriptions:subscribed_list
        ,convertday:convertday
    });
});

function addDays (days, date = new Date(dt_datePicker)) {      
    date.setDate(date.getDate() + days)
    return  Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: '2-digit'}).format(date);
}
function subtractDays (days, date = new Date(dt_datePicker)) {      
    date.setDate(date.getDate() - days)
    return  Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: '2-digit'}).format(date);
}



async function sendBookings() {
    try {
        const jsonString = fs.readFileSync(seatbookjson, "utf8");
        const seatbook_list = JSON.parse(jsonString);

        for (let i = 0; i < seatbook_list.length; i++) {
            const booking = seatbook_list[i];
            console.log(`📌 Sending booking ${i + 1} for ${booking.assignedTo.name}`);

            try {
                const response = await axios.post(url, booking, {
                    headers: {
                        "X-Parse-Application-Id": booking._ApplicationId,
                        "X-Parse-JavaScript-Key": booking._JavaScriptKey,
                        "X-Parse-Session-Token": booking._SessionToken,
                        "Content-Type": "application/json",
                    },
                });

                console.log(`✔ Success:`, response.data);
            } catch (error) {
                console.log(`❌ Failed (${booking.assignedTo.name}):`);
                console.log(error.response?.data || error.message);
            }

            console.log("----------------------------------------");
        }

    } catch (err) {
        console.error("❌ Error reading or parsing file:", err);
    }
}

// 🔹 SCHEDULE FOR MIDNIGHT: `0 1 0 * * *` → 12:01 AM every day
// cron.schedule("0 1 0 * * *", () => {
//     console.log("⏰ Running scheduled task at: ", new Date().toLocaleString());
//     sendBookings();
// });

// 🔹 SCHEDULE FOR EVER MINUTE 
cron.schedule("* * * * *", () => {
    console.log("⏰ Running every 1 minute:", new Date().toLocaleString());
    sendBookings();
});


// 🔧 Test run immediately once (optional)
//sendBookings();


//set app to listen on port 3000
app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });