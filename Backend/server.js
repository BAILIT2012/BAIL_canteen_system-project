const express= require("express");
const cors= require("cors");
const mysql= require("mysql2");

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

// ✅ MySQL Connection
const db = mysql.createConnection({
  host: "192.168.5.20",
    user: "remote_user",
    password: "Bail@123",
    database: "employee_auth",
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection Error:", err);
  } else {
    console.log("✅ MySQL Connected Successfully (employee_auth)");
  }
});

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// ✅ Employee fetch route (for QR code)
app.get("/get-employee/:code", (req, res) => {
  const code = req.params.code;
  db.query(
    "SELECT * FROM employee_qr WHERE employee_code = ?",
    [code],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.length === 0)
        return res.status(404).json({ message: "Employee not found" });
      res.json(result[0]);
    }
  );
});

// ✅ Meal submit route (Fixed version)
app.post("/canteen/submit-meal", (req, res) => {
  const {
    employee_code,
    employee_name,
    employee_department,
    employee_designation,
    meal_type,
    quantity,
  } = req.body;

  if (!employee_code || !meal_type) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd format

  // 🔹 Step 1: Check if the employee already took same meal today
  const checkQuery = `
    SELECT * FROM canteen_system_data
    WHERE employee_code = ? AND meal_type = ? AND DATE(created_at) = ?
  `;

  db.query(checkQuery, [employee_code, meal_type, today], (err, results) => {
    if (err) {
      console.log("Error Meal Checking", err);
      return res
        .status(500)
        .json({ error: "Server error while checking meal record" });
    }

    // ✅ If already took this meal — stop here
    if (results.length > 0) {
      return res.status(400).json({
        message: `⚠️ You already took your ${meal_type} today.`,
      });
    }

    // 🔹 Step 2: Fetch wallet
    const walletQuery = `
      SELECT breakfast_credits, lunch_dinner_credits 
      FROM employee_wallet 
      WHERE employee_code = ?
    `;

    db.query(walletQuery, [employee_code], (err, walletResults) => {
      if (err)
        return res.status(500).json({ error: "Error fetching wallet data" });

      if (walletResults.length === 0)
        return res.status(404).json({ message: "Wallet not found" });

      const wallet = walletResults[0];

      // 🔹 Step 3: Deduct credits based on meal type
      if (meal_type === "Breakfast") {
        if (wallet.breakfast_credits < 1)
          return res
            .status(400)
            .json({ message: "❌ Insufficient breakfast credits" });

        wallet.breakfast_credits -= 1;
      } else if (meal_type === "Lunch" || meal_type === "Dinner") {
        if (wallet.lunch_dinner_credits < 1)
          return res
            .status(400)
            .json({ message: "❌ Insufficient lunch/dinner credits" });

        wallet.lunch_dinner_credits -= 1;
      }

      // 🔹 Step 4: Update wallet
      const updateWalletQuery = `
        UPDATE employee_wallet 
        SET breakfast_credits = ?, lunch_dinner_credits = ?
        WHERE employee_code = ?
      `;

      db.query(
        updateWalletQuery,
        [
          wallet.breakfast_credits,
          wallet.lunch_dinner_credits,
          employee_code,
        ],
        (err2) => {
          if (err2)
            return res
              .status(500)
              .json({ error: "Error updating wallet credits" });

          // 🔹 Step 5: Insert meal record
          const token_number = Math.floor(100000 + Math.random() * 900000);
          const insertMealQuery = `
            INSERT INTO canteen_system_data 
            (employee_code, employee_name, employee_department, employee_designation, meal_type, quantity, token_number, amount_deducted)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;

          db.query(
            insertMealQuery,
            [
              employee_code,
              employee_name,
              employee_department,
              employee_designation,
              meal_type,
              quantity,
              token_number,
              1, // one credit used
            ],
            (err3) => {
              if (err3)
                return res
                  .status(500)
                  .json({ error: "Error inserting meal record" });

              res.json({
                message: "✅ Meal recorded successfully",
                token_number,
                order_time: new Date().toISOString(),
              });
            }
          );
        }
      );
    });
  });
});

//Meal Status API
app.get("/get-meal-status", (req, res) => {
  db.query("SELECT * FROM canteen_system_data ORDER BY order_time DESC", (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});


//meal status track api
app.get("/meal-status/:employee_code", (req, res) => {
  const { employee_code } = req.params;

  console.log("🔍 Fetching meal for:", employee_code);

  const query = `
    SELECT * 
    FROM canteen_system_data 
    WHERE employee_code = ? 
    ORDER BY order_time DESC 
    LIMIT 1
  `;

  db.query(query, [employee_code], (err, results) => {
    if (err) {
      console.error("❌ Error fetching meal data:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      console.log("⚠️ No recent meal found for", employee_code);
      return res.status(404).json({ message: "No recent meal found" });
    }

    console.log("✅ Latest meal found:", results[0]);
    res.json(results[0]);
  });
});


// ✅ Yeh Canteen System (server.js, port 8281) me likho
app.get("/get-wallet/:code", async (req, res) => {
  const code = req.params.code;
  try {
    const response = await fetch(`http://localhost:8081/api/wallet/${code}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching wallet from employee system:", err);
    res.status(500).json({ error: "Failed to fetch wallet" });
  }
});


// ✅ Token History API (for employee system)
app.get("/api/token-history/:employee_code", (req, res) => {
  const employeeCode = req.params.employee_code;

  const query = `
    SELECT *
    FROM token_history
    WHERE employee_code = ?
    ORDER BY id DESC
  `;

  db.query(query, [employeeCode], (err, result) => {
    if (err) {
      console.error("Error fetching token history:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
});




app.listen(8281, () => {
  console.log("🚀 Server running on http://localhost:8281 & Connected to MySQL on local WiFi (192.168.5.20)");
});



