/* ---------------- DOTENV ----------------------*/
require("dotenv").config()

/* ---------------- child_process ---------------*/
const child_process = require("child_process");

/* ----------------- EXPRESS --------------------*/
const express = require("express");
const cors = require("cors"); 
const app = express();
const port = process.env.SERVER_PORT;

/* --- FS --- */
const fs = require("fs");

/* ___ CORS ___ */
app.use(cors());


/* --- BODY-PARSER --- */
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



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

var {UserModel, DeviceModel, DeviceUsageModel} = require("./models/user.js");

/* ----------------- BCRYPT --------------------*/
var bcrypt  = require("bcrypt");

app.get("/api/", (req,res) => {
    res.send("This is the backend server for our codefest2020 project. For the frontend use port 3001");
});

app.post("/api/login", (req,res) => {
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
                res.send(user);
            } else {
                res.status(401).send("error logging in");
            };
        });

    }).catch(err => console.log(err));
})

app.post("/api/register", (req,res) => {
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
            res.redirect("./api/dashboard/")
        })
        .catch((err) =>{
            console.log("Failed to register user ("+ username +"): Already Exists");
            res.status(401).send("User already exists"); });
    })
});

app.post("/api/addDevice", (req, res) => {
    UserModel.findOne({username: req.body.username}, (err,user) => {
        if (err) {
            res.status(500).send("Failed to find user");
        }
        const newDevice= new DeviceModel({
            name:req.body.deviceName,
            usage:[]
        });

        user.devices.push(newDevice);
        user.save()
        .then(() => {
            res.send(user);
        }).catch((err) => {
            console.log(err);
            res.status(500).send("Unable to save user with new device");
        });
    });
});

app.delete("/api/deleteDevice", (req, res) => {
    UserModel.findOne({"username": req.body.username}).then(user => {
        if(!user) {
            res.status(500).send("Failed to find user");
            return;
        }
        for (let i = 0; i < user.devices.length; i+=1) {
            if (user.devices[i].name === req.body.deviceName) {
                user.devices.splice(i, 1);
                break;
            }
        }
        user.save()
        .then(() => {
            res.send(user);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Unable to delete device");
        });
    })
    .catch(err => {
        res.status(500).send("Error removing device");
        console.log(err);
    });

});


app.post("/api/logout", (req, res) => {
	res.status(200);
	res.redirect("/");
});

app.get("/api/statsidk", (req,res) => {
    DeviceModel.find({},(err,devices) =>{
        if(err){
            res.status(500).send("Failed to get all devices");
            return;
        }
        res.send(devices);
    });
});

app.post("/api/_get_user", (req, res) => {
    UserModel.findOne({"username": req.body.username}).then(user => {
        if(!user){
            res.status(500).send("Failed to get user devices");
            return;
        }
        // TODO handle callback
        res.send(user.devices);
    });
});

app.get("/api/allUsers", (req, res) => {
    UserModel.find({}, (err, users) => {
        if(err){
            res.status(500).send("Failed to get user devices");
            return;
        }
        res.send(users);
    })
});

app.post("/api/log_usage", (req,res) => {
   console.log("received:", req.body.amount);
   UserModel.findOne({username:req.body.username}).then(user => {
      if(!user){
         res.status(401).send("User(" + req.body.username +") not found");
         return;
      }
      bcrypt.compare(req.body.password, user.password, (err, result)=>{
         if( result ) {
            user.devices.forEach(device => {
               if (device.name === req.body.device) {
                  /* Usage comes in as Liters convert to db which uses gallons */
                  const usage = new DeviceUsageModel({
                     date: new Date(),
                     amount: 0.264172 * req.body.amount
                  })
                  device.usage.push(usage);
               }
            })
            // TODO: handle this callback
            user.save(()=>{res.send("Done")});

         } else {
            res.status(401).send("error logging in");
         };
      });
   })
      .catch(err => {
         res.status(500).send("Error searching in database");
         console.log(err)
      });
});

app.get("/api/predict_weather", (req,res) => {
    const pyprog = child_process.spawn('python3', ["./src/externals/predict_weather.py", "--lat", 40/*req.body.lat*/, "--lon", -75/*req.body.lon*/]);
    streamToString(pyprog.stdout).then((stream) => {
        res.send(stream)
    });
});

function streamToString (stream) {
  const chunks = []
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}

/*
app.get("/api/insertDevices", (req,res) => {
    fs.readFile("/home/dennis/codefest-2020/server/src/dataset4.txt", "utf8", (err, data) => {
        if (err) throw err;


        var newDevices = {};

        var lines = data.split("\n");
        for(var i = 0; i<lines.length; i++) {
            var c = lines[i].split(",");
            if (c.length === 4) {
                var device = c[0].replace("\t", "");
                var date = new Date(c[1].replace("\t", "") + " " + c[2]);
                var amount = c[3].replace("\t", "");
            }

           const newUsage = new DeviceUsageModel({
                date: date,
                amount: amount
            });

            if (newDevices[device]) {
                newDevices[device].push(newUsage);
            } else {
                newDevices[device] = [newUsage];
            }
        }

        for(var device in newDevices){
            const newDevice = new DeviceModel({
                name: device,
                usage: newDevices[device]
            })

            UserModel.findOne({username: "dan"}, (err, user) => {
                if (err) {
                    res.status(500).send("failed to find user");
                }
                user.devices.push(newDevice);
                user.save()
                    .then(() => res.send(user))
                    .catch(() => res.status(500).send("that sucked"));
            });
        }

    });
});
*/

app.listen(port, () => {
  console.log(`Server at http://localhost:${port}`)
});

