/* ---------------- DOTENV ----------------------*/
require("dotenv").config()

/* ---------------- child_process ---------------*/
const spawn = require("child_process");

/* ----------------- EXPRESS --------------------*/
const express = require("express");
const cors = require("cors"); 
const app = express();
const port = process.env.SERVER_PORT;
/* --- EXPRESS-SESSION --- */
var session = require("express-session");
app.use(
	session({
	  secret: process.env.SESSION_SECRET,
	  resave: true,
	  saveUninitialized: true
	})
);
/* --- BODY-PARSER --- */
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


/* ___ CORS ___ */
app.use(cors())


/* ----------------- MONGODB --------------------*/
// Connect to mongodb
const mongoose = require("mongoose");

mongoose.connect(process.env.DB_URL + process.env.DB_TABLE,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var {UserModel, DeviceModel} = require("./models/user.js");

/* ----------------- BCRYPT --------------------*/
var bcrypt  = require("bcrypt");

app.get("/", (req,res) => {
    res.send("This is the backend server for our codefest2020 project. For the frontend use port 3001");
});

app.post("/login", (req,res) => {
    let { username, password } = req.body;

    if(!username || !password ) {
        res.sendStatus(400);
        return;
    }
    UserModel.findOne({username:username}).then(user => {
        if(!user){
            res.status(401).send("User not found");
        }
        bcrypt.compare(password, user.password, (err, result)=>{  
            if( result ) {
                req.session.loggedin = true;
                req.session.user = user;
                res.send(user);
            } else {
                res.status(401).send("error logging in");
            };
        });
        
    }).catch(err => console.log(err));
})

app.post("/register", (req,res) => {
    let { username, password } = req.body;
    if (!username || !password) {
        res.sendStatus(400);
        return;
    } 

    bcrypt.hash(password, 10/* salt */, (err, hash) =>{
        const newUser = new UserModel({
            username:username,
            password: hash,
            devices: []
        });
        newUser.save()
        .then(() => {
            req.session.loggedin = true;
            res.redirect("./dashboard")
        })
        .catch((err) =>{
            console.log("Failed to register user ("+ username +"): Already Exists")
            res.status(401).send("User already exists");
        });
    })
});

app.post("/logout", (req, res) => {
	req.session.destroy();
	res.status(200);
	res.redirect("/");
});

app.get("/statsidk", (req,res) => {
    if(!req.session.loggedin){
		res.redirect("/404.html")
        return;
    }
    DeviceModel.find().then((err,devices) =>{
        if(err){
            res.status(500).send("Failed to get all devices");
            return;
        }
        res.send(devices);
    });
});

app.post("/_get_user", (req, res) => {
    UserModel.find({username: req.body.username}).then((err,user) =>{
        if(err){
            res.status(500).send("Failed to get all devices");
            return;
        }
        res.send(user);
    });
});

app.post("/add_device", (req, res) => {
    if(!req.session.loggedin){
		res.redirect("/404.html")
        return;
    }
    const newDevice= new DeviceModel({
        name:req.body.name,
        usage:[]
    });
    req.session.user.devices.push(newDevice);
    req.session.user.devices.save(done);
    res.status(200);
});

app.post("/log_usage", (req,res) => {
    UserModel.findOne({username:req.body.username}).then(user => {
        if(!user){
            res.status(401).send("User(" + req.body.username +") not found");
            return;
        }
        user.devices.findOne({name:req.body.device}).then(device => {
            if(!device){
                res.status(401).send("Device(" + req.body.device +") not found for user(" + req.body.username + ")");
                return;
            }
            device.usage.push(req.body.timestamp);
            device.save(done);

        });
    }).catch(err => {
        res.status(500).send("Error searching in database");
        console.log(err)
    });
});

app.post("/predict_weather", (req,res) => {
    const pyprog = spawn('python3', ["./externals/predict_weather.py --lat " + req.body.lat + " --lon " + req.body.lon]);
    pyprog.stdout.on('data', (data) => {
        res.send(data);
    });
    pyprog.stderr.on('data', (data) => {
        res.send(data);
    });
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

