module.exports = function registerRoutes({ app, pool, path, rootDir, bcrypt, jwt, JWT_SECRET, categories, subcategories, brands, defaultProducts, authenticateToken, requireAdmin, orders }) {
// =====================================================
// COUPONS
// =====================================================

app.post(
  "/api/coupons/validate",
  authenticateToken,
  async (req, res) => {
    try {
      const code = String(
        req.body.code || ""
      )
        .trim()
        .toUpperCase();

      const subtotal = Math.max(
        0,
        Number(req.body.subtotal) || 0
      );

      if (!code) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập mã giảm giá."
        });
      }

      const result = await pool.query(
        `
        SELECT *
        FROM coupons
        WHERE UPPER(code) = $1
          AND active = TRUE
          AND (start_at IS NULL OR start_at <= CURRENT_TIMESTAMP)
          AND (end_at IS NULL OR end_at >= CURRENT_TIMESTAMP)
        LIMIT 1
        `,
        [code]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Mã giảm giá không hợp lệ hoặc đã hết hạn."
        });
      }

      const coupon = result.rows[0];
      if (
  coupon.usage_limit !== null &&
  Number(coupon.used_count) >=
    Number(coupon.usage_limit)
) {
  return res.status(400).json({
    success: false,
    message: "Mã giảm giá đã hết lượt sử dụng."
  });
}

      if (
        subtotal <
        Number(coupon.min_order || 0)
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Đơn hàng tối thiểu ${Number(
              coupon.min_order
            ).toLocaleString("vi-VN")} ₫ để sử dụng mã này.`
        });
      }

      let discount = 0;

      if (coupon.type === "percent") {
        discount = Math.floor(
          subtotal *
          Number(coupon.value) /
          100
        );

        if (coupon.max_discount) {
          discount = Math.min(
            discount,
            Number(coupon.max_discount)
          );
        }
      }

      if (coupon.type === "fixed") {
        discount = Math.min(
          Number(coupon.value),
          subtotal
        );
      }

      const shippingDiscount =
        coupon.type === "shipping";

      return res.json({
        success: true,

        message:
          "Áp dụng mã giảm giá thành công.",

        coupon: {
          code: coupon.code,
          type: coupon.type,
          value: Number(coupon.value),
          discount,
          shippingDiscount
        }
      });

    } catch (error) {
      console.error(
        "VALIDATE COUPON ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Không thể kiểm tra mã giảm giá."
      });
    }
  }
);

// =====================================================
// ADMIN COUPONS
// =====================================================


// GET ALL COUPONS

app.get(
  "/api/admin/coupons",
  async (req, res) => {
    try {

      const result = await pool.query(`
        SELECT *
        FROM coupons
        ORDER BY created_at DESC
      `);

      return res.json({
        success: true,
        data: result.rows
      });

    } catch (error) {

      console.error(
        "GET ADMIN COUPONS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Không thể tải mã giảm giá."
      });

    }
  }
);


// CREATE COUPON

app.post(
  "/api/admin/coupons",
  async (req, res) => {
    try {

      const code =
        String(req.body.code || "")
          .trim()
          .toUpperCase();

      const type =
        String(req.body.type || "");

      const value =
        Math.max(
          0,
          Number(req.body.value) || 0
        );

      const minOrder = Math.max(
  0,
  Number(
    req.body.min_order ??
    req.body.minOrder ??
    0
  ) || 0
);

const maxDiscountRaw =
  req.body.max_discount ??
  req.body.maxDiscount;

const maxDiscount =
  maxDiscountRaw !== undefined &&
  maxDiscountRaw !== null &&
  maxDiscountRaw !== ""
    ? Math.max(0, Number(maxDiscountRaw) || 0)
    : null;

const usageLimitRaw =
  req.body.usage_limit ??
  req.body.usageLimit;

const usageLimit =
  usageLimitRaw !== undefined &&
  usageLimitRaw !== null &&
  usageLimitRaw !== ""
    ? Math.max(1, parseInt(usageLimitRaw, 10))
    : null;

const startAt =
  req.body.start_at ??
  req.body.startAt ??
  null;

const endAt =
  req.body.end_at ??
  req.body.endAt ??
  null;

const active =
  req.body.active !== false;


      const allowedTypes = [
        "percent",
        "fixed",
        "shipping"
      ];


      if (
        !code ||
        !allowedTypes.includes(type)
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Thông tin mã giảm giá không hợp lệ."
        });

      }


      if (
        type === "percent" &&
        (value <= 0 || value > 100)
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Phần trăm giảm phải từ 1 đến 100."
        });

      }


      if (
        endAt &&
        startAt &&
        new Date(endAt) <=
          new Date(startAt)
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Thời gian hết hạn phải sau thời gian bắt đầu."
        });

      }


      const result =
        await pool.query(
          `
          INSERT INTO coupons (
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
          )

          VALUES (
            $1,$2,$3,$4,$5,
            $6,0,$7,$8,$9
          )

          RETURNING *
          `,
          [
            code,
            type,
            value,
            minOrder,
            maxDiscount,
            usageLimit,
            active,
            startAt,
            endAt
          ]
        );


      return res.status(201).json({
        success: true,
        coupon: result.rows[0]
      });

    } catch (error) {

      console.error(
        "CREATE COUPON ERROR:",
        error
      );


      if (
        error.code === "23505"
      ) {

        return res.status(409).json({
          success: false,
          message:
            "Mã giảm giá đã tồn tại."
        });

      }


      return res.status(500).json({
        success: false,
        message:
          "Không thể tạo mã giảm giá."
      });

    }
  }
);


// UPDATE COUPON

app.put(
  "/api/admin/coupons/:id",
  async (req, res) => {
    try {

      const id =
        Number(req.params.id);


      const code =
        String(req.body.code || "")
          .trim()
          .toUpperCase();

      const type =
        String(req.body.type || "");

      const value =
        Math.max(
          0,
          Number(req.body.value) || 0
        );

      const minOrder = Math.max(
  0,
  Number(
    req.body.min_order ??
    req.body.minOrder ??
    0
  ) || 0
);

const maxDiscountRaw =
  req.body.max_discount ??
  req.body.maxDiscount;

const maxDiscount =
  maxDiscountRaw !== undefined &&
  maxDiscountRaw !== null &&
  maxDiscountRaw !== ""
    ? Math.max(0, Number(maxDiscountRaw) || 0)
    : null;

const usageLimitRaw =
  req.body.usage_limit ??
  req.body.usageLimit;

const usageLimit =
  usageLimitRaw !== undefined &&
  usageLimitRaw !== null &&
  usageLimitRaw !== ""
    ? Math.max(1, parseInt(usageLimitRaw, 10))
    : null;

const startAt =
  req.body.start_at ??
  req.body.startAt ??
  null;

const endAt =
  req.body.end_at ??
  req.body.endAt ??
  null;

const active =
  req.body.active !== false;

      if (
        endAt &&
        startAt &&
        new Date(endAt) <=
          new Date(startAt)
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Thời gian hết hạn phải sau thời gian bắt đầu."
        });

      }


      const result =
        await pool.query(
          `
          UPDATE coupons

          SET
            code = $1,
            type = $2,
            value = $3,
            min_order = $4,
            max_discount = $5,
            usage_limit = $6,
            active = $7,
            start_at = $8,
            end_at = $9

          WHERE id = $10

          RETURNING *
          `,
          [
            code,
            type,
            value,
            minOrder,
            maxDiscount,
            usageLimit,
            active,
            startAt,
            endAt,
            id
          ]
        );


      if (!result.rows.length) {

        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy mã giảm giá."
        });

      }


      return res.json({
        success: true,
        coupon: result.rows[0]
      });

    } catch (error) {

      console.error(
        "UPDATE COUPON ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Không thể cập nhật mã giảm giá."
      });

    }
  }
);


// TOGGLE COUPON

app.patch(
  "/api/admin/coupons/:id/toggle",
  async (req, res) => {
    try {

      const result =
        await pool.query(
          `
          UPDATE coupons
          SET active = NOT active
          WHERE id = $1
          RETURNING *
          `,
          [
            Number(req.params.id)
          ]
        );


      if (!result.rows.length) {

        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy mã giảm giá."
        });

      }


      return res.json({
        success: true,
        coupon: result.rows[0]
      });

    } catch (error) {

      console.error(
        "TOGGLE COUPON ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Không thể thay đổi trạng thái mã."
      });

    }
  }
);


// DELETE COUPON

app.delete(
  "/api/admin/coupons/:id",
  async (req, res) => {
    try {

      const result =
        await pool.query(
          `
          DELETE FROM coupons
          WHERE id = $1
          RETURNING id
          `,
          [
            Number(req.params.id)
          ]
        );


      if (!result.rows.length) {

        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy mã giảm giá."
        });

      }


      return res.json({
        success: true
      });

    } catch (error) {

      console.error(
        "DELETE COUPON ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Không thể xóa mã giảm giá."
      });

    }
  }
);


};
