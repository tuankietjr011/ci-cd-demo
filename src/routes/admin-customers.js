module.exports = function registerRoutes({ app, pool, path, rootDir, bcrypt, jwt, JWT_SECRET, categories, subcategories, brands, defaultProducts, authenticateToken, requireAdmin, orders }) {
// =====================================================

app.get("/api/admin/customers", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
  u.id,
  u.fullname,
  u.email,
  u.phone,
  u.role,

  u.gender,
  u.birthday,
  u.avatar,

  u.linked_accounts
    AS "linkedAccounts",

  u.created_at,
  u.updated_at,

        COUNT(o.id)::INTEGER AS order_count,

        COALESCE(
          SUM(
            CASE
              WHEN o.status = 'delivered'
              THEN o.total
              ELSE 0
            END
          ),
          0
        )::BIGINT AS total_spent,

        MAX(o.created_at) AS last_order_at

      FROM users u

      LEFT JOIN orders o
        ON o.user_id = u.id

      WHERE u.role = 'customer'

      GROUP BY
  u.id,
  u.fullname,
  u.email,
  u.phone,
  u.role,
  u.gender,
  u.birthday,
  u.avatar,
  u.linked_accounts,
  u.created_at,
  u.updated_at

      ORDER BY u.created_at DESC
    `);

    return res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error(
      "GET ADMIN CUSTOMERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Không thể tải danh sách khách hàng."
    });
  }
});



};
