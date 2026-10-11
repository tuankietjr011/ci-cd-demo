module.exports = function registerRoutes({ app, pool, path, rootDir, bcrypt, jwt, JWT_SECRET, categories, subcategories, brands, defaultProducts, authenticateToken, requireAdmin, orders }) {
// =====================================================
// AUTH - REGISTER
// =====================================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const fullname = String(
      req.body.fullname || req.body.name || ""
    ).trim();

    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const phone = String(req.body.phone || "").trim();

    const password = String(req.body.password || "");

    if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự."
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email này đã được đăng ký."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `
      INSERT INTO users
        (fullname, email, phone, password_hash)
      VALUES
        ($1, $2, $3, $4)
      RETURNING
        id,
        fullname,
        email,
        phone,
        role,
        created_at
      `,
      [fullname, email, phone || null, passwordHash]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    return res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công.",
      token,
      user
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể đăng ký tài khoản."
    });
  }
});

// =====================================================
// AUTH - LOGIN
// =====================================================

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mật khẩu."
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        fullname,
        email,
        phone,
        password_hash,
        role,
        created_at
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác."
      });
    }

    const user = result.rows[0];

    const passwordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác."
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    delete user.password_hash;

    return res.json({
      success: true,
      message: "Đăng nhập thành công.",
      token,
      user
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể đăng nhập."
    });
  }
});

// =====================================================
// AUTH - CURRENT USER
// =====================================================

app.use(
  "/api/admin",
  authenticateToken,
  requireAdmin
);

app.get
("/api/auth/me", 
  authenticateToken, 
  async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
  id,
  fullname,
  email,
  phone,
  role,
  gender,
  birthday,
  avatar,
  linked_accounts AS "linkedAccounts",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
FROM users
WHERE id = $1
LIMIT 1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản."
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error("AUTH ME ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin tài khoản."
    });
  }
});


};
