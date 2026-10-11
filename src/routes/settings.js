module.exports = function registerRoutes({ app, pool, path, rootDir, bcrypt, jwt, JWT_SECRET, categories, subcategories, brands, defaultProducts, authenticateToken, requireAdmin, orders }) {
// =====================================================
// SHOP SETTINGS
// =====================================================

app.get(
  "/api/settings",
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          SELECT
            store_name,
            shipping_fee,
            free_shipping_threshold,
            updated_at

          FROM shop_settings

          WHERE id = 1

          LIMIT 1
        `);


      return res.json({
        success: true,

        settings:
          result.rows[0] || {
            store_name: "ShopLux",
            shipping_fee: 30000,
            free_shipping_threshold: 1000000
          }
      });


    } catch (error) {

      console.error(
        "GET SETTINGS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể tải cài đặt cửa hàng."
      });

    }

  }
);


// =====================================================
// ADMIN - UPDATE SHOP SETTINGS
// =====================================================

app.put(
  "/api/admin/settings",
  async (req, res) => {

    try {

      const storeName =
        String(
          req.body.store_name ??
          req.body.storeName ??
          "ShopLux"
        ).trim();


      const shippingFee =
        Math.max(
          0,
          Number(
            req.body.shipping_fee ??
            req.body.shippingFee ??
            0
          ) || 0
        );


      const freeShippingThreshold =
        Math.max(
          0,
          Number(
            req.body
              .free_shipping_threshold ??
            req.body
              .freeShippingThreshold ??
            0
          ) || 0
        );


      if (!storeName) {

        return res.status(400).json({
          success: false,
          message:
            "Tên cửa hàng không được để trống."
        });

      }


      const result =
        await pool.query(`
          INSERT INTO shop_settings (
            id,
            store_name,
            shipping_fee,
            free_shipping_threshold,
            updated_at
          )

          VALUES (
            1,
            $1,
            $2,
            $3,
            CURRENT_TIMESTAMP
          )

          ON CONFLICT (id)

          DO UPDATE SET

            store_name =
              EXCLUDED.store_name,

            shipping_fee =
              EXCLUDED.shipping_fee,

            free_shipping_threshold =
              EXCLUDED.free_shipping_threshold,

            updated_at =
              CURRENT_TIMESTAMP

          RETURNING *
        `, [
          storeName,
          shippingFee,
          freeShippingThreshold
        ]);


      return res.json({
        success: true,

        message:
          "Đã lưu cài đặt.",

        settings:
          result.rows[0]
      });


    } catch (error) {

      console.error(
        "UPDATE SETTINGS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,

        message:
          "Không thể lưu cài đặt."
      });

    }

  }
);



};
