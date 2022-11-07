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
  setDoc,
  getFirestore,
} from "firebase/firestore";
import { fileURLToPath } from "url";
import { dirname } from "path";
import flash from "connect-flash";
import session from "express-session";
const db = getFirestore(application);

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
      res.redirect("/voter-dashboard");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      res.send("Login unsuccessful");
    });
});

app.get("/voter-dashboard", async (req, res) => {
  const currentUser = auth.currentUser;
  if (currentUser === null) {
    res.redirect("/login");
    return;
  }
  let voterInfo = [];
  const email = currentUser.email;
  let q = query(Voters, where("email", "==", email));
  let querySnap = await getDocs(q);
  querySnap.forEach((docFile) => {
    voterInfo.push(docFile.data());
  });
  let year = voterInfo[0].year;
  let section = voterInfo[0].section;
  let candidatesList = [];
  q = query(
    Candidates,
    where("year", "==", year),
    where("section", "==", section)
  );
  querySnap = await getDocs(q);
  querySnap.forEach((docFile) => {
    candidatesList.push(docFile.data());
  });
  onAuthStateChanged(auth, (user) => {
    if (user) {
      res.render("voterDashboard", {
        candidatesList: candidatesList,
        message: req.flash("message"),
      });
    } else {
      res.redirect("/login");
    }
  });
});

app.post("/voter-dashboard", async (req, res) => {
  const candidateID = req.body.candidateID;
  let candidateInfo = [];
  let currVotes;
  let q = query(Candidates, where("regno", "==", candidateID));
  let querySnap = await getDocs(q);
  querySnap.forEach((docFile) => {
    candidateInfo.push(docFile.data());
  });
  console.log(candidateInfo);
  currVotes = candidateInfo[0].votes;
  currVotes += 1;
  setDoc(
    doc(database, "Candidates", candidateID),
    {
      votes: currVotes,
    },
    { merge: true }
  );
  req.flash("message", "Thanks for voting!");
  res.redirect("/voter-dashboard");
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
  const regno = req.body.regno;
  section = section.toUpperCase();
  const candidate = {
    name: req.body.name,
    regno: regno,
    year: req.body.year,
    branch: req.body.branch,
    section: section,
    email: email,
    status: "candidate",
    cgpa: req.body.cgpa,
    blackdots: req.body.blackdot,
    votes: 0,
  };

  setDoc(doc(database, "Candidates", regno), candidate);
  req.flash("message", "You have been registered as a Candidate successfully!");
  res.redirect("/register-candidate");
});

app.get("/register-voter", (req, res) => {
  res.render("signupVoter", { message: req.flash("message") });
});

app.post("/register-voter", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
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
    votingStatus: false,
  };
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
