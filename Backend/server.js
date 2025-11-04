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
  host: "localhost",
  user: "root",
  password: "1234", // apna actual MySQL password likho
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
  let {
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

  // ✅ Normalize meal_type (convert "Breakfast" → "breakfast")
  meal_type = meal_type.toLowerCase();

  const token_number = Math.floor(100000 + Math.random() * 900000);

  // ✅ Fetch wallet balance before insert
  const getWalletSQL = `SELECT * FROM employee_wallet WHERE employee_code = ?`;
  db.query(getWalletSQL, [employee_code], (err, walletResult) => {
    if (err) return res.status(500).json({ error: err });
    if (walletResult.length === 0)
      return res.status(404).json({ message: "Wallet not found" });

    const wallet = walletResult[0];

    let breakfast = wallet.breakfast_credits;
    let lunchDinner = wallet.lunch_dinner_credits;

    // ✅ Check balance & deduct accordingly
    if (meal_type === "breakfast") {
      if (breakfast <= 0)
        return res.status(400).json({ message: "Insufficient breakfast credits" });
      breakfast -= 1;
    } else if (meal_type === "lunch" || meal_type === "dinner") {
      if (lunchDinner <= 0)
        return res.status(400).json({ message: "Insufficient lunch/dinner credits" });
      lunchDinner -= 1;
    }

    // ✅ Update wallet
    const updateWalletSQL = `
      UPDATE employee_wallet
      SET breakfast_credits = ?, lunch_dinner_credits = ?, updated_at = NOW()
      WHERE employee_code = ?
    `;
    db.query(updateWalletSQL, [breakfast, lunchDinner, employee_code], (err2) => {
      if (err2) return res.status(500).json({ error: err2 });

      // ✅ Insert meal record after wallet deduction
      const insertMealSQL = `
        INSERT INTO canteen_system_data 
        (employee_code, employee_name, employee_department, employee_designation, meal_type, quantity, token_number)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(
        insertMealSQL,
        [
          employee_code,
          employee_name,
          employee_department,
          employee_designation,
          meal_type,
          quantity,
          token_number,
        ],
        (err3) => {
          if (err3) {
            if (err3.code === "ER_DUP_ENTRY") {
              return res.status(400).json({
                message: "❌ This meal has already been taken today.",
              });
            }
            return res.status(500).json({ error: err3 });
          }

          res.json({
            message: "✅ Meal recorded successfully",
            token_number,
            order_time: new Date().toISOString(),
          });
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
app.get("/token-history", (req, res) => {
  const query = "SELECT * FROM canteen_system_data ORDER BY order_time DESC";
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching token history:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No token history found" });
    }

    console.log("✅ Token history fetched:", results.length, "records");
    res.json(results);
  });
});




app.listen(8281, () => {
  console.log("🚀 Server running on http://localhost:8281");
});



