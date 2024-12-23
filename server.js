const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const cors = require("cors");
const path=require("path");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",         // Replace with your PostgreSQL username
  host: "localhost",
  database: "postgres",    // Replace with your database name
  password: "Vishwa31",    // Replace with your PostgreSQL password
  port: 5432,
});
app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname, 'Netflix_reg.html'));
    console.log(path.join(__dirname, 'Netflix_reg.html'))
    console.log("File found");
})

// API endpoint to handle registration
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
app.post("/newdata",async (req,res)=>{
  const { username, profile,olduser } = req.body;
  
    try {
      const query = `
        UPDATE userdata SET username=$2,profilepic=$1 WHERE username=$3 RETURNING *;
      `;
      const result = await pool.query(query, [username, profile,olduser]);
  
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
  try {
      const query = `SELECT username, profilepic FROM userdata WHERE username = $1`;
      const result = await pool.query(query, [req.query.username]);

      if (result.rows.length === 0) {
          return res.status(404).send("Profile not found.");
      }

      res.status(200).json(result.rows[0]);
  } catch (error) {
      console.error("Error fetching profile data:", error);
      res.status(500).send("Error occurred while fetching profile data.");
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

    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error during fetching:", error);
    res.status(500).send("Error occurred during fetching.");
  }
})
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
