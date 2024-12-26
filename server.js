const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const cors = require("cors");
const path=require("path");
const multer = require("multer");

const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const pool = new Pool({
  user: "postgres",  
  host: "localhost",
  database: "postgres",    
  password: "Vishwa31",   
  port: 5432,
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname, 'Netfilx_login.html'));
    console.log(path.join(__dirname, 'Netfilx_login.html'))
    console.log("File found");
})
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const query = `
      INSERT INTO registrations (name, email, password)
      VALUES ($1, $2, $3)
    `;
    await pool.query(query, [username, email, password]);
    res.status(200).send("Registration successful!");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error occurred during registration.");
  }
});
app.get("/Netflix_login.html", (req, res) => {
    res.sendFile(path.join(__dirname, "Netfilx_login.html"));
  });
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const query = `
        SELECT * FROM registrations
        WHERE name = $1 AND password = $2
      `;
      const result = await pool.query(query, [username, password]);
  
      if (result.rows.length === 0) {
        return res.status(401).send("Invalid username or password.");
      }
  
      res.status(200).send("Login successful!");
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).send("Error occurred during login.");
    }
  });
app.get("/Profile.html",(req,res)=>{
  res.sendFile(path.join(__dirname, "Profile.html"));
})
app.get("/Profile_form.html",(req,res)=>{
  res.sendFile(path.join(__dirname, "Profile_form.html"));
})
app.post("/Profile_form.html", (req, res) => {
  res.redirect("/Profile.html");
});
app.post("/newdata", upload.single('profile'),async (req,res)=>{ 
  const { username, old_user } = req.body;
  const profile = req.file ? req.file.filename : null;
  console.log(profile);
    try {
      const query = `
        UPDATE userdata SET username=$1,profilepic=$2 WHERE username=$3 RETURNING *;
      `;
      const result = await pool.query(query, [username, profile,old_user]);
      console.log(result.rows);
      if (result.rows.length === 0) {
        return res.status(401).send("Invalid username or no image selected.");
      }
      res.status(200).send("Update successful!");
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).send("Error occurred during login.");
    }
})
app.get("/getprofile", async (req, res) => {
  const { username } = req.query;
  console.log(username);
  if (!username) {
    return res.status(400).send('Username is required');
  }
  try {
    const result = await pool.query(`SELECT username, profilepic FROM userdata WHERE username = $1`, [username]);
    console.log(result.rows);

      if (result.rows.length === 0) {
          return res.status(404).send("Profile not found.");
      }

      res.status(200).json(result.rows[0]);
  } catch (error) {
      console.error("Error fetching profile data:", error);
      res.status(500).send("Error occurred while fetching profile data.");
  }
});
app.get("/getuserdata",async (req,res)=>{
  try {
    const query = `
      SELECT * FROM userdata
    `;
    const result = await pool.query(query);
    console.log(result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Error occurred while fetching user data.");
  }
});
app.get("/Search.html",(req,res)=>{
  res.sendFile(path.join(__dirname, "Search.html"));
})
app.get("/search",async (req,res)=>{
  try {
    const query = `
      SELECT * FROM moviedetails
    `;
    const result = await pool.query(query);


    if (result.rows.length === 0) {
      return res.status(401).send("Invalid username or password.");
    }
    console.log(result.rows);
    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error during fetching:", error);
    res.status(500).send("Error occurred during fetching.");
  }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
