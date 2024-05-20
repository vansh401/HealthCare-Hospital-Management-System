var express = require('express');
var multer = require('multer');
var app = express();
var bd = require('body-parser');
var ed = bd.urlencoded({ extended: false });
var my = require('mysql');
const session = require('express-session')
app.use(session({
    secret: '0xabcdererrerre112222222222',
    resave: false,
    saveUninitialized: false,
}));
app.set('view engine', 'ejs');

var con = my.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'medical'
});

app.use(express.static('Public'));
app.use(express.static('uploads'));
app.use(express.static('Public/images'));
app.use(express.static('Public/css'));
app.use(express.static('Public/js'));
// app.use(express.static('Public/views')); 

app.get('/home', (req, res) => {
    res.sendFile("./Public/home.html", { root: __dirname });
});


app.get('/', (req, res) => {
    res.sendFile("./Public/home.html", { root: __dirname });
});

app.get('/login', (req, res) => {
    res.sendFile("./Public/login.html", { root: __dirname });
});
// -------------------------------

app.get("/patientpanel", (req, res) => {
    var t = { pn: req.session.pname, ph: req.session.photo }
    res.render("patientpanel", { data: t });
});


app.get("/patient_reports", (req, res) => {
    var t = { pn: req.session.pname, ph: req.session.photo }
    res.render("patient_reports", { data: t });
});
// patient 

app.get("/patient_prescription", (req, res) => {
    var t = { pn: req.session.pname, ph: req.session.photo }
    res.render("patient_prescription", { data: t });
});
// -------------------------
app.get("/patient_appointments", (req, res) => {
    var t = { pn: req.session.pname, ph: req.session.photo }
    res.render("patient_appointments", { data: t });
});

app.get("/patient_finddoctor", (req, res) => {
    var t = { pn: req.session.pname, ph: req.session.photo }
    res.render("patient_finddoctor", { data: t });
});

app.get("/patient_feedback", (req, res) => {
    var t = { pn: req.session.pname, ph: req.session.photo }
    res.render("patient_feedback", { data: t });
});



app.post('/loginProcess', ed, function (req, res) {
    var role = req.body.role;
    var id = req.body.Id;
    var password = req.body.pass;

    if (role === 'Admin') {
        var sq = "SELECT * FROM admin WHERE emailId='" + id + "' AND pwd='" + password + "'";
        con.query(sq, function (err, data) {
            if (err) {
                throw err;
            } else {
                if (data.length > 0) {
                    res.render('adminpanel', { data: data });
                } else {
                    res.send('Invalid Email and Password');
                }
            }
        });

    } else if (role === 'Doctor') {
        var sq = "SELECT * FROM doctor WHERE email='" + id + "' AND password='" + password + "'";
        con.query(sq, function (err, data) {
            if (err) {
                throw err;
            } else {
                if (data.length > 0) {

                    req.session.dname = data[0].Name;
                    req.session.dem = data[0].email;
                    var t = { dn: req.session.dname, result: data }
                    res.render('doctorpanel', { data: t });
                } else {
                    res.send('Invalid Email and Password');
                }
            }
        });
    }
    else if (role === 'Patient') {
        var sq = "SELECT * FROM patient WHERE email='" + id + "' AND password='" + password + "'";
        con.query(sq, function (err, data) {
            if (err) {
                throw err;
            } else {
                if (data.length > 0) {
                    req.session.pname = data[0].Name;
                    req.session.pem = data[0].email;
                    req.session.photo = data[0].profilephotoPath;
                    var t = { pn: req.session.pname, ph: req.session.photo }

                    res.render('patientpanel', { data: t });
                } else {
                    res.send('Invalid Email and Password');
                }
            }
        });
    }
});
// res.send('Login Successfully');
// res.redirect('/adminpanel.html');
// res.render('adminpanel',{data: data});

// Doctor registration-------------------->
// using multer

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`);
    }
});
var upload = multer({ storage });

// -----------------
app.post('/doctorRegProcess', upload.single("profileImage"), ed, function (req, res) {
    var profilePath = req.file.path;
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.pass;
    var mobno = req.body.mobno;
    var gender = req.body.gender;
    var dob = req.body.dob;
    var nation = req.body.nationality;
    var qualify = req.body.qualification;
    var license = req.body.licenseno;
    var experienceyear = parseInt(req.body.experienceYr);
    var department = req.body.department;
    var regdate = req.body.regDate;

    var sql = "INSERT INTO doctor (profilephotoPath, Name, email, password, MobileNo, Gender, DOB, Nationality, Qualification, YearsOfExperience, LicensceNo, Department, Registration_date) VALUES ('" + profilePath + "','" + name + "','" + email + "','" + password + "','" + mobno + "','" + gender + "','" + dob + "','" + nation + "','" + qualify + "'," + experienceyear + ",'" + license + "','" + department + "','" + regdate + "')";

    con.query(sql, function (err, data) {
        if (err) {
            throw err;
        }
        else {
            res.redirect("/viewDoctors");
        }
    });
});
// -----------------------patient registrations --------------------
app.post('/patientRegProcess', upload.single("profileImg"), ed, function (req, res) {
    var profilePath = req.file.path;
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.pass;
    var mobno = req.body.mobno;
    var gender = req.body.gender;
    var dob = req.body.dob;
    var nation = req.body.nationality;
    var address = req.body.address;
    var emr_contact_name = req.body.emergency_contact_name;
    var relation = req.body.emergency_relation;
    var emr_contact_number = req.body.emergency_contact_number;
    var regdate = req.body.regDate;

    var sql = "INSERT INTO patient (profilephotoPath, Name, email, password, MobileNo, Gender, DOB, Nationality, Address, emergencyContactName, Relation, emergencyContactNumber, RegistrationDate) VALUES ('" + profilePath + "','" + name + "','" + email + "','" + password + "','" + mobno + "','" + gender + "','" + dob + "','" + nation + "','" + address + "','" + emr_contact_name + "','" + relation + "','" + emr_contact_number + "','" + regdate + "')";

    con.query(sql, function (err, data) {
        if (err) {
            throw err;
        }
        else {
            res.redirect("/login.html");
        }
    });

});



// --------------view doctors-------------------->>>>
app.get('/viewDoctors', (req, res) => {
    var sql = "select * from doctor";
    con.query(sql, function (err, result) {
        if (err) throw err;
        else {

            res.render('adminpanel', { data: result });
        }
    });
});

app.get('/DelD', (req, res) => {
    var e = req.query.em;
    var sql = "delete  from doctor where email='" + e + "'";
    con.query(sql, function (err, result) {
        if (err) throw err;
        else {

            res.redirect('viewDoctors');
        }
    });
});

// Dcotor search in patient panel----->>
app.post('/doctorSearch', ed, (req, res) => {
    var a = req.body.dsearch;
    var b = req.body.dsearch;
    var sql = "select * from doctor where Name='" + a + "' or Department='" + b + "'";
    con.query(sql, function (err, result) {
        if (err) throw err;
        else {
            if(result.length>0)
            {
            var t = { pn: req.session.pname, ph:req.session.photo, result: result }
            
            res.render('patient_finddoctor', { data: t});
            }
            else
            {
                res.send("Doctor Not Found");
            }
        }
    });
});

app.listen(8000, () => {
    console.log("Server listening on port 8000");
});