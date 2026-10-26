module.exports = function registerRoutes({ app, pool, path, rootDir, bcrypt, jwt, JWT_SECRET, categories, subcategories, brands, defaultProducts, authenticateToken, requireAdmin, orders }) {
// =====================================================
// ORDER DETAIL
// =====================================================

app.get(
  "/api/orders/:code",
  authenticateToken,
  async (req, res) => {

    try {

      const orderResult =
        await pool.query(
          `
          SELECT *
          FROM orders
          WHERE code = $1
            AND user_id = $2
          `,
          [
            req.params.code,
            req.user.id
          ]
        );


      if (
        orderResult.rows.length === 0
      ) {

        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy đơn hàng."
        });

      }


      const order =
        orderResult.rows[0];


      const itemsResult =
        await pool.query(
          `
          SELECT *
          FROM order_items
          WHERE order_id = $1
          ORDER BY id ASC
          `,
          [order.id]
        );


      return res.json({
        success: true,

        order: {
          ...order,
          items: itemsResult.rows
        }
      });


    } catch (error) {

      console.error(
        "ORDER DETAIL ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể tải đơn hàng."
      });

    }

  }
);


// =====================================================
// ADMIN ORDERS
// =====================================================

app.get(
  "/api/admin/orders",
  authenticateToken,
  requireAdmin,
  async (req, res) => {

    try {

      const orderResult =
        await pool.query(
          `
          SELECT
            orders.*,
            users.email
          FROM orders
          LEFT JOIN users
            ON users.id = orders.user_id
          ORDER BY orders.created_at DESC
          `
        );

      const orders = [];

      for (const order of orderResult.rows) {

        const itemsResult =
          await pool.query(
            `
            SELECT
              id,
              order_id,
              product_id,
              product_name,
              price,
              quantity,
              size,
              color,
              image
            FROM order_items
            WHERE order_id = $1
            ORDER BY id ASC
            `,
            [order.id]
          );

        orders.push({
          ...order,
          items: itemsResult.rows
        });

      }

      return res.json({
        success: true,
        data: orders
      });


    } catch (error) {

      console.error(
        "ADMIN ORDERS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể tải đơn hàng."
      });

    }

  }
);

// =====================================================
// ADMIN - UPDATE ORDER STATUS
// =====================================================

app.patch(
  "/api/admin/orders/:code/status",
  authenticateToken,
  requireAdmin,
  async (req, res) => {

    try {

      const code =
        String(req.params.code || "").trim();

      const status =
        String(req.body.status || "").trim();


      const allowedStatuses = [
        "pending",
        "confirmed",
        "shipping",
        "delivered",
        "cancelled"
      ];


      if (!code) {

        return res.status(400).json({
          success: false,
          message: "Thiếu mã đơn hàng."
        });

      }


      if (!allowedStatuses.includes(status)) {

        return res.status(400).json({
          success: false,
          message: "Trạng thái đơn hàng không hợp lệ."
        });

      }


    const result =
  await pool.query(
    `
    UPDATE orders

    SET
      status = $1::varchar,

      payment_status =
        CASE
          WHEN
            payment_method = 'cod'
            AND $1::varchar = 'delivered'
          THEN 'paid'

          ELSE payment_status
        END,

      paid_at =
        CASE
          WHEN
            payment_method = 'cod'
            AND $1::varchar = 'delivered'
          THEN COALESCE(
            paid_at,
            CURRENT_TIMESTAMP
          )

          ELSE paid_at
        END,

      updated_at = CURRENT_TIMESTAMP

    WHERE code = $2::varchar

    RETURNING *
    `,
    [
      status,
      code
    ]
  );

      if (result.rows.length === 0) {

        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng."
        });

      }


      return res.json({
        success: true,
        message:
          "Cập nhật trạng thái đơn hàng thành công.",
        order: result.rows[0]
      });


    } catch (error) {

      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể cập nhật trạng thái đơn hàng."
      });

    }

  }
);

// =====================================================
// ADMIN - UPDATE PAYMENT STATUS
// =====================================================

app.patch(
  "/api/admin/orders/:code/payment-status",
  authenticateToken,
  requireAdmin,
  async (req, res) => {

    try {

      const code =
        String(req.params.code || "").trim();

      const paymentStatus =
        String(
          req.body.paymentStatus || ""
        ).trim();


      const allowedPaymentStatuses = ["paid"];

      if (!code) {

        return res.status(400).json({
          success: false,
          message: "Thiếu mã đơn hàng."
        });

      }


      if (
        !allowedPaymentStatuses.includes(
          paymentStatus
        )
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Trạng thái thanh toán không hợp lệ."
        });

      }


      const result =
  await pool.query(
    `
    UPDATE orders
    SET
      payment_status = 'paid',
      paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP),
      updated_at = CURRENT_TIMESTAMP
    WHERE code = $1
      AND payment_method = 'bank'
      AND payment_status = 'pending_verification'
      AND status <> 'cancelled'
    RETURNING *
    `,
    [code]
  );


      if (result.rows.length === 0) {

        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy đơn hàng."
        });

      }


      return res.json({
        success: true,
        message:
          "Cập nhật trạng thái thanh toán thành công.",
        order: result.rows[0]
      });


    } catch (error) {

      console.error(
        "UPDATE PAYMENT STATUS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể cập nhật trạng thái thanh toán."
      });

    }

  }
);

// =====================================================
// ADMIN - CUSTOMERS

};
