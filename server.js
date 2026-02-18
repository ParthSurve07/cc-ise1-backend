import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


app.use(cors());
app.use(express.json());

app.get("/todos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM todos ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

app.post("/todos", async (req, res) => {
  try {
    const { text } = req.body;

    const result = await pool.query(
      "INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING *",
      [text, false]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

app.delete("/todos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    await pool.query("DELETE FROM todos WHERE id = $1", [id]);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

app.put("/todos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { text, completed } = req.body;

    const result = await pool.query(
      "UPDATE todos SET text = COALESCE($1, text), completed = COALESCE($2, completed) WHERE id = $3 RETURNING *",
      [text ?? null, completed ?? null, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
