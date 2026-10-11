module.exports = function registerRoutes({ app, pool, path, rootDir, bcrypt, jwt, JWT_SECRET, categories, subcategories, brands, defaultProducts, authenticateToken, requireAdmin, orders }) {
// =====================================================
// MY ORDERS
// =====================================================

app.get(
  "/api/orders/my",
  authenticateToken,
  async (req, res) => {

    try {

      const orderResult =
        await pool.query(
          `
          SELECT *
          FROM orders
          WHERE user_id = $1
          ORDER BY created_at DESC
          `,
          [req.user.id]
        );


      const result = [];


      for (
        const order of orderResult.rows
      ) {

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


        result.push({
          ...order,
          items: itemsResult.rows
        });

      }


      return res.json({
        success: true,
        data: result
      });


    } catch (error) {

      console.error(
        "MY ORDERS ERROR:",
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
// CUSTOMER - CANCEL ORDER
// =====================================================

app.patch(
  "/api/orders/:code/cancel",
  authenticateToken,
  async (req, res) => {

    try {

      const code =
        String(
          req.params.code || ""
        ).trim();


      if (!code) {

        return res.status(400).json({
          success: false,
          message:
            "Thiếu mã đơn hàng."
        });

      }


      const result =
        await pool.query(
          `
          UPDATE orders

          SET
            status = 'cancelled',
            updated_at = CURRENT_TIMESTAMP

          WHERE code = $1
            AND user_id = $2
            AND status = 'pending'

          RETURNING *
          `,
          [
            code,
            req.user.id
          ]
        );


      if (
        result.rows.length === 0
      ) {

        const orderResult =
          await pool.query(
            `
            SELECT
              status
            FROM orders
            WHERE code = $1
              AND user_id = $2
            LIMIT 1
            `,
            [
              code,
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


        return res.status(400).json({
          success: false,
          message:
            "Chỉ có thể hủy đơn hàng đang chờ xác nhận."
        });

      }


      return res.json({
        success: true,
        message:
          "Hủy đơn hàng thành công.",
        order: result.rows[0]
      });


    } catch (error) {

      console.error(
        "CANCEL ORDER ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể hủy đơn hàng."
      });

    }

  }
);


};
