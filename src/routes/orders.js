module.exports = function registerRoutes({ app, pool, path, rootDir, bcrypt, jwt, JWT_SECRET, categories, subcategories, brands, defaultProducts, authenticateToken, requireAdmin, orders }) {
// =====================================================
// ORDERS - POSTGRESQL
// =====================================================


// =====================================================
// CREATE ORDER
// =====================================================

app.post(
  "/api/orders",
  authenticateToken,
  async (req, res) => {

    const client = await pool.connect();

    let transactionStarted = false;

    try {

      const {
        fullname,
        phone,
        address,
        city,
        note,
        paymentMethod,
        couponCode,
        items
      } = req.body;


      if (
        !fullname ||
        !phone ||
        !address ||
        !city
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Vui lòng nhập đầy đủ thông tin nhận hàng."
        });

      }


      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Giỏ hàng đang trống."
        });

      }


      // ===============================================
      // KHÔNG TIN GIÁ TỪ FRONTEND
      // TÍNH LẠI GIÁ TỪ PRODUCTS TRÊN SERVER
      // ===============================================

      const normalizedItems = [];


      for (const item of items) {

        const productResult =
          await client.query(
            `
            SELECT
              id,
              name,
              price,
              sizes,
              colors,
              color_name AS "colorName",
              variant_group AS "variantGroup",
              images
            FROM products
            WHERE id = $1
            LIMIT 1
            `,
            [Number(item.id)]
          );


        const product =
          productResult.rows[0];


        if (!product) {

          return res.status(400).json({
            success: false,
            message:
              `Sản phẩm ID ${item.id} không tồn tại.`
          });

        }


        const quantity =
          Math.max(
            1,
            parseInt(item.qty, 10) || 1
          );


        const size =
          String(
            item.size || ""
          ).trim();


        const color =
          String(
            product.colorName || ""
          ).trim();


        if (
          product.sizes?.length &&
          !size
        ) {

          return res.status(400).json({
            success: false,
            message:
              `Vui lòng chọn size cho ${product.name}.`
          });

        }


        if (
          product.sizes?.length &&
          !product.sizes.includes(size)
        ) {

          return res.status(400).json({
            success: false,
            message:
              `Size không hợp lệ cho ${product.name}.`
          });

        }


        normalizedItems.push({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          quantity,
          size,
          color,
          image:
            product.images?.[0] ||
            product.image ||
            ""
        });

      }


      const subtotal =
        normalizedItems.reduce(
          (sum, item) =>
            sum +
            item.price *
            item.quantity,
          0
        );


      let discount = 0;


      // ===============================================
      // LOAD SHOP SETTINGS
      // ===============================================

      const settingsResult =
        await client.query(
          `
          SELECT
            shipping_fee,
            free_shipping_threshold
          FROM shop_settings
          WHERE id = 1
          LIMIT 1
          `
        );


      const currentSettings =
        settingsResult.rows[0] || {
          shipping_fee: 30000,
          free_shipping_threshold: 1000000
        };


      const configuredShippingFee =
        Math.max(
          0,
          Number(
            currentSettings.shipping_fee || 0
          )
        );


      const freeShippingThreshold =
        Math.max(
          0,
          Number(
            currentSettings
              .free_shipping_threshold || 0
          )
        );


      let shippingFee =
        subtotal >= freeShippingThreshold
          ? 0
          : configuredShippingFee;


      // ===============================================
      // APPLY COUPON
      // ===============================================

      const normalizedCouponCode =
        String(couponCode || "")
          .trim()
          .toUpperCase();


      if (normalizedCouponCode) {

        const couponResult =
          await client.query(
            `
            SELECT *
            FROM coupons
            WHERE UPPER(code) = $1
              AND active = TRUE
              AND (
                start_at IS NULL
                OR start_at <= CURRENT_TIMESTAMP
              )
              AND (
                end_at IS NULL
                OR end_at >= CURRENT_TIMESTAMP
              )
            LIMIT 1
            `,
            [normalizedCouponCode]
          );


        if (
          couponResult.rows.length === 0
        ) {

          return res.status(400).json({
            success: false,
            message:
              "Mã giảm giá không hợp lệ hoặc đã hết hạn."
          });

        }


        const coupon =
          couponResult.rows[0];


        if (
          coupon.usage_limit !== null &&
          Number(coupon.used_count) >=
            Number(coupon.usage_limit)
        ) {

          return res.status(400).json({
            success: false,
            message:
              "Mã giảm giá đã hết lượt sử dụng."
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


        if (
          coupon.type === "percent"
        ) {

          discount =
            Math.floor(
              subtotal *
              Number(coupon.value) /
              100
            );


          if (coupon.max_discount) {

            discount =
              Math.min(
                discount,
                Number(
                  coupon.max_discount
                )
              );

          }

        }


        if (
          coupon.type === "fixed"
        ) {

          discount =
            Math.min(
              Number(coupon.value),
              subtotal
            );

        }


        if (
          coupon.type === "shipping"
        ) {

          shippingFee = 0;

        }

      }


      const total =
        Math.max(
          0,
          subtotal -
          discount +
          shippingFee
        );


      // ===============================================
      // PAYMENT
      // ===============================================

      const payment =
        paymentMethod === "bank"
          ? "bank"
          : "cod";


      const paymentStatus =
        payment === "bank"
          ? "paid"
          : "unpaid";


      const paidAt =
        paymentStatus === "paid"
          ? new Date()
          : null;


      const code =
        "SL" +
        Date.now() +
        Math.floor(
          Math.random() * 1000
        );


      // ===============================================
      // START TRANSACTION
      // ===============================================

      await client.query("BEGIN");

      transactionStarted = true;


      // ===============================================
      // CREATE ORDER
      // ===============================================

const orderResult =
  await client.query(
    `
      INSERT INTO orders (
        code,
        user_id,
        fullname,
        phone,
        address,
        city,
        note,
        payment_method,
        payment_status,
        paid_at,
        subtotal,
        discount,
        shipping_fee,
        total,
        status
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,
        $8,$9,$10,$11,$12,$13,$14,
        'pending'
      )
      RETURNING *
    `,
    [
      code,
      req.user.id,
      String(fullname).trim(),
      String(phone).trim(),
      String(address).trim(),
      String(city).trim(),

      String(note || "")
        .trim()
        .slice(0, 1000),

      payment,
      paymentStatus,
      paidAt,
      subtotal,
      discount,
      shippingFee,
      total
    ]
  );


      const order =
        orderResult.rows[0];


      // ===============================================
      // CREATE ORDER ITEMS
      // ===============================================

      for (
        const item of normalizedItems
      ) {

        await client.query(
          `
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            price,
            quantity,
            size,
            color,
            image
          )

          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8
          )
          `,
          [
            order.id,
            item.id,
            item.name,
            item.price,
            item.quantity,
            item.size || null,
            item.color || null,
            item.image
          ]
        );

      }


      // ===============================================
      // UPDATE COUPON USAGE
      // ===============================================

      if (normalizedCouponCode) {

        const useCouponResult =
          await client.query(
            `
            UPDATE coupons

            SET
              used_count =
                used_count + 1

            WHERE UPPER(code) = $1

              AND active = TRUE

              AND (
                usage_limit IS NULL
                OR used_count < usage_limit
              )

            RETURNING *
            `,
            [normalizedCouponCode]
          );


        if (
          useCouponResult.rows.length === 0
        ) {

          throw new Error(
            "Mã giảm giá đã hết lượt sử dụng."
          );

        }

      }


      // ===============================================
      // COMMIT
      // ===============================================

      await client.query("COMMIT");

      transactionStarted = false;


      return res.status(201).json({
        success: true,

        message:
          "Đặt hàng thành công.",

        order: {
          ...order,
          items: normalizedItems
        }
      });


    } catch (error) {

      if (transactionStarted) {

        await client.query("ROLLBACK");

      }


      console.error(
        "CREATE ORDER ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          error.message ===
          "Mã giảm giá đã hết lượt sử dụng."
            ? error.message
            : "Không thể tạo đơn hàng."
      });


    } finally {

      client.release();

    }

  }
);


};
