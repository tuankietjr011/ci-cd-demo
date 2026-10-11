module.exports = function registerRoutes({ app, pool, path, rootDir, bcrypt, jwt, JWT_SECRET, categories, subcategories, brands, defaultProducts, authenticateToken, requireAdmin, orders }) {
// =====================================================
// USER PROFILE
// =====================================================

// LẤY THÔNG TIN CÁ NHÂN
app.get(
  "/api/profile",
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

      return res.json({
        success: true,
        user: result.rows[0]
      });
    } catch (error) {
      console.error(
        "GET PROFILE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Không thể tải thông tin cá nhân."
      });
    }
  }
);


// CẬP NHẬT THÔNG TIN CÁ NHÂN
app.put(
  "/api/profile",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        fullname,
        phone,
        gender,
        birthday,
        avatar,
        linkedAccounts
      } = req.body;

      const cleanFullname =
        String(fullname || "").trim();

      const cleanPhone =
        String(phone || "").trim();

      const cleanGender =
        String(gender || "").trim();

      const cleanBirthday =
        birthday
          ? String(birthday).trim()
          : null;

      const cleanAvatar =
        String(avatar || "").trim();

      const allowedGenders = [
        "",
        "nam",
        "nu",
        "khac"
      ];

      if (!cleanFullname) {
        return res.status(400).json({
          success: false,
          message:
            "Họ và tên không được để trống."
        });
      }

      if (
        !allowedGenders.includes(
          cleanGender
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Giới tính không hợp lệ."
        });
      }

      let cleanLinkedAccounts = [];

      if (Array.isArray(linkedAccounts)) {
        cleanLinkedAccounts =
          linkedAccounts
            .map(item => ({
              provider:
                String(
                  item?.provider || ""
                ).trim(),

              account:
                String(
                  item?.account || ""
                ).trim()
            }))
            .filter(
              item =>
                item.provider ||
                item.account
            );
      }

      const result = await pool.query(
        `
        UPDATE users

        SET
          fullname = $1,
          phone = $2,
          gender = $3,
          birthday = $4,
          avatar = $5,
          linked_accounts = $6::jsonb,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $7

        RETURNING
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
        `,
        [
          cleanFullname,
          cleanPhone || null,
          cleanGender || null,
          cleanBirthday,
          cleanAvatar || null,
          JSON.stringify(
            cleanLinkedAccounts
          ),
          req.user.id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy tài khoản."
        });
      }

      return res.json({
        success: true,
        message:
          "Cập nhật thông tin thành công.",
        user: result.rows[0]
      });
    } catch (error) {
      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Không thể cập nhật thông tin cá nhân."
      });
    }
  }
);


};
