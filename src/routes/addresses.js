module.exports = function registerRoutes({ app, pool, path, rootDir, bcrypt, jwt, JWT_SECRET, categories, subcategories, brands, defaultProducts, authenticateToken, requireAdmin, orders }) {
// =====================================================
// DELIVERY ADDRESSES API
// =====================================================


// =====================================================
// GET - LẤY DANH SÁCH ĐỊA CHỈ
// =====================================================

app.get(
  "/api/delivery-addresses",
  authenticateToken,
  async (req, res) => {

    try {

      const result =
        await pool.query(
          `
          SELECT
            id,
            label,
            recipient_name,
            phone,
            address,
            city,
            is_default,
            created_at,
            updated_at
          FROM delivery_addresses
          WHERE user_id = $1
          ORDER BY
            is_default DESC,
            created_at DESC
          `,
          [req.user.id]
        );


      return res.json({
        success: true,
        addresses: result.rows
      });


    } catch (error) {

      console.error(
        "GET DELIVERY ADDRESSES ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể tải địa chỉ giao hàng."
      });

    }

  }
);


// =====================================================
// POST - THÊM ĐỊA CHỈ
// =====================================================

app.post(
  "/api/delivery-addresses",
  authenticateToken,
  async (req, res) => {

    const client =
      await pool.connect();

    try {

      const label =
        String(
          req.body.label ||
          "Địa chỉ giao hàng"
        ).trim();


      const recipientName =
        String(
          req.body.recipientName || ""
        ).trim();


      const phone =
        String(
          req.body.phone || ""
        ).trim();


      const address =
        String(
          req.body.address || ""
        ).trim();


      const city =
        String(
          req.body.city || ""
        ).trim();


      const isDefault =
        req.body.isDefault === true;


      if (
        !recipientName ||
        !phone ||
        !address ||
        !city
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng."
        });

      }


      await client.query("BEGIN");


      const countResult =
        await client.query(
          `
          SELECT COUNT(*)::INTEGER AS count
          FROM delivery_addresses
          WHERE user_id = $1
          `,
          [req.user.id]
        );


      const firstAddress =
        countResult.rows[0].count === 0;


      const shouldBeDefault =
        firstAddress || isDefault;


      if (shouldBeDefault) {

        await client.query(
          `
          UPDATE delivery_addresses
          SET
            is_default = FALSE,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1
          `,
          [req.user.id]
        );

      }


      const result =
        await client.query(
          `
          INSERT INTO delivery_addresses (
            user_id,
            label,
            recipient_name,
            phone,
            address,
            city,
            is_default
          )

          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
          )

          RETURNING *
          `,
          [
            req.user.id,
            label,
            recipientName,
            phone,
            address,
            city,
            shouldBeDefault
          ]
        );


      await client.query("COMMIT");


      return res.status(201).json({
        success: true,
        message:
          "Đã thêm địa chỉ giao hàng.",
        address: result.rows[0]
      });


    } catch (error) {

      await client.query("ROLLBACK");

      console.error(
        "CREATE DELIVERY ADDRESS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể thêm địa chỉ giao hàng."
      });


    } finally {

      client.release();

    }

  }
);


// =====================================================
// PUT - SỬA ĐỊA CHỈ
// =====================================================

app.put(
  "/api/delivery-addresses/:id",
  authenticateToken,
  async (req, res) => {

    const client =
      await pool.connect();

    try {

      const id =
        Number(req.params.id);


      const label =
        String(
          req.body.label ||
          "Địa chỉ giao hàng"
        ).trim();


      const recipientName =
        String(
          req.body.recipientName || ""
        ).trim();


      const phone =
        String(
          req.body.phone || ""
        ).trim();


      const address =
        String(
          req.body.address || ""
        ).trim();


      const city =
        String(
          req.body.city || ""
        ).trim();


      const isDefault =
        req.body.isDefault === true;


      if (
        !id ||
        !recipientName ||
        !phone ||
        !address ||
        !city
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Thông tin địa chỉ không hợp lệ."
        });

      }


      await client.query("BEGIN");


      const exists =
        await client.query(
          `
          SELECT id
          FROM delivery_addresses
          WHERE
            id = $1
            AND user_id = $2
          `,
          [
            id,
            req.user.id
          ]
        );


      if (!exists.rows.length) {

        await client.query(
          "ROLLBACK"
        );


        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy địa chỉ."
        });

      }


      if (isDefault) {

        await client.query(
          `
          UPDATE delivery_addresses
          SET
            is_default = FALSE,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1
          `,
          [req.user.id]
        );

      }


      const result =
        await client.query(
          `
          UPDATE delivery_addresses
          SET
            label = $1,
            recipient_name = $2,
            phone = $3,
            address = $4,
            city = $5,
            is_default = $6,
            updated_at = CURRENT_TIMESTAMP
          WHERE
            id = $7
            AND user_id = $8
          RETURNING *
          `,
          [
            label,
            recipientName,
            phone,
            address,
            city,
            isDefault,
            id,
            req.user.id
          ]
        );


      await client.query("COMMIT");


      return res.json({
        success: true,
        message:
          "Đã cập nhật địa chỉ.",
        address: result.rows[0]
      });


    } catch (error) {

      await client.query("ROLLBACK");

      console.error(
        "UPDATE DELIVERY ADDRESS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể cập nhật địa chỉ."
      });


    } finally {

      client.release();

    }

  }
);


// =====================================================
// PATCH - ĐẶT LÀM ĐỊA CHỈ MẶC ĐỊNH
// =====================================================

app.patch(
  "/api/delivery-addresses/:id/default",
  authenticateToken,
  async (req, res) => {

    const client =
      await pool.connect();

    try {

      const id =
        Number(req.params.id);


      await client.query("BEGIN");


      const exists =
        await client.query(
          `
          SELECT id
          FROM delivery_addresses
          WHERE
            id = $1
            AND user_id = $2
          `,
          [
            id,
            req.user.id
          ]
        );


      if (!exists.rows.length) {

        await client.query(
          "ROLLBACK"
        );


        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy địa chỉ."
        });

      }


      await client.query(
        `
        UPDATE delivery_addresses
        SET
          is_default = FALSE,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
        `,
        [req.user.id]
      );


      const result =
        await client.query(
          `
          UPDATE delivery_addresses
          SET
            is_default = TRUE,
            updated_at = CURRENT_TIMESTAMP
          WHERE
            id = $1
            AND user_id = $2
          RETURNING *
          `,
          [
            id,
            req.user.id
          ]
        );


      await client.query("COMMIT");


      return res.json({
        success: true,
        message:
          "Đã đặt làm địa chỉ mặc định.",
        address: result.rows[0]
      });


    } catch (error) {

      await client.query("ROLLBACK");

      console.error(
        "DEFAULT DELIVERY ADDRESS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể đổi địa chỉ mặc định."
      });


    } finally {

      client.release();

    }

  }
);


// =====================================================
// DELETE - XÓA ĐỊA CHỈ
// =====================================================

app.delete(
  "/api/delivery-addresses/:id",
  authenticateToken,
  async (req, res) => {

    const client =
      await pool.connect();

    try {

      const id =
        Number(req.params.id);


      await client.query("BEGIN");


      const result =
        await client.query(
          `
          DELETE FROM delivery_addresses
          WHERE
            id = $1
            AND user_id = $2
          RETURNING
            id,
            is_default
          `,
          [
            id,
            req.user.id
          ]
        );


      if (!result.rows.length) {

        await client.query(
          "ROLLBACK"
        );


        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy địa chỉ."
        });

      }


      // Nếu vừa xóa địa chỉ mặc định,
      // tự chọn địa chỉ còn lại mới nhất
      if (
        result.rows[0].is_default
      ) {

        const nextAddress =
          await client.query(
            `
            SELECT id
            FROM delivery_addresses
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 1
            `,
            [req.user.id]
          );


        if (nextAddress.rows.length) {

          await client.query(
            `
            UPDATE delivery_addresses
            SET
              is_default = TRUE,
              updated_at = CURRENT_TIMESTAMP
            WHERE
              id = $1
              AND user_id = $2
            `,
            [
              nextAddress.rows[0].id,
              req.user.id
            ]
          );

        }

      }


      await client.query("COMMIT");


      return res.json({
        success: true,
        message:
          "Đã xóa địa chỉ giao hàng."
      });


    } catch (error) {

      await client.query("ROLLBACK");

      console.error(
        "DELETE DELIVERY ADDRESS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể xóa địa chỉ."
      });


    } finally {

      client.release();

    }

  }
);


};
