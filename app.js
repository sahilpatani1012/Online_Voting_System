//Imports --------------------------------------------------------
import "dotenv/config";
import express, { response } from "express";
const app = express();
import { application, database } from "./firebaseConfig.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import ejs from "ejs";
import {
  doc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { fileURLToPath } from "url";
import { dirname } from "path";
import flash from "connect-flash";
import session from "express-session";

//Necessary inclusions ---------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//For ejs rendering, static files and body parsing -----------------------

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(
  session({
    secret: "secret",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
  })
);

//Collections for DB

const Voters = collection(database, "Voters");
const Candidates = collection(database, "Candidates");

//Firebase Auth Function
const auth = getAuth();

app.get("/userprofile", (req, res) => {
  res.render("userprofile");
});
//Auth Routes
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      res.send("Login Successful");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      res.send("Login unsuccessful");
    });
});

app.get("/", (req, res) => {
  res.render("index", { page: "index" });
});

app.get("/vote", (req, res) => {
  res.render("vote", { page: "vote" });
});

app.get("/results", (req, res) => {
  res.render("statistics", { page: "statistics" });
});

app.get("/contact", (req, res) => {
  res.render("contact", { page: "contact" });
});

app.get("/admin_login", (req, res) => {
  res.render("admin_login", { page: "admin_login" });
});

app.get("/register-candidate", (req, res) => {
  res.render("signupCandidate", { message: req.flash("message") });
});

app.post("/register-candidate", (req, res) => {
  const email = req.body.email;
  let section = req.body.section;
  section = section.toUpperCase();
  const candidate = {
    name: req.body.name,
    regno: req.body.regno,
    year: req.body.year,
    branch: req.body.branch,
    section: section,
    email: email,
    status: "candidate",
    cgpa: req.body.cgpa,
    blackdots: req.body.blackdot,
  };
  //   createUserWithEmailAndPassword(auth, email, password)
  //     .then((userCredential) => {
  //       const user = userCredential.user;
  //     })
  //     .catch((error) => {
  //       const errorCode = error.code;
  //       const errorMessage = error.message;
  //     });
  addDoc(Candidates, candidate).then(() => {
    req.flash(
      "message",
      "You have been registered as a Candidate successfully!"
    );
    res.redirect("/register-candidate");
  });
});

app.get("/register-voter", (req, res) => {
  res.render("signupVoter", { message: req.flash("message") });
});

app.post("/register-voter", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let section = req.body.section;
  section = section.toUpperCase();
  const voter = {
    name: req.body.name,
    regno: req.body.regno,
    year: req.body.year,
    branch: req.body.branch,
    status: "voter",
    section: section,
    email: req.body.email,
  };
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
  addDoc(Voters, voter).then(() => {
    req.flash("message", "You have been registered as a Voter successfully!");
    res.redirect("/register-voter");
  });
});

//Listen On Server
app.listen(process.env.PORT || 3000, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Server Started At Port 3000");
  }
});
