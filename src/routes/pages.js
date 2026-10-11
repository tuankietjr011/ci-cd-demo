module.exports = function registerRoutes({ app, pool, path, rootDir, bcrypt, jwt, JWT_SECRET, categories, subcategories, brands, defaultProducts, authenticateToken, requireAdmin, orders }) {
// =====================================================
// ROUTES
// =====================================================

app.get("/admin", (req, res) => {
  res.sendFile(
    path.join(rootDir, "frontend", "admin", "index.html")
  );
});
app.get("/api/coupons", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        code,
        type,
        value,
        min_order,
        max_discount,
        usage_limit,
        used_count,
        active,
        start_at,
        end_at
      FROM coupons
      WHERE active = TRUE
        AND (start_at IS NULL OR start_at <= NOW())
        AND (end_at IS NULL OR end_at > NOW())
        AND (
          usage_limit IS NULL
          OR used_count < usage_limit
        )
      ORDER BY created_at DESC
    `);

    return res.json({
      success: true,
      coupons: result.rows
    });

  } catch (error) {
    console.error("GET PUBLIC COUPONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể tải mã giảm giá."
    });
  }
});

// Express 4 fallback
app.get("*", (req, res) => {
  res.sendFile(
    path.join(rootDir, "frontend", "index.html")
  );
});


};
