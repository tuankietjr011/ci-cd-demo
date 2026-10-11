module.exports = function registerRoutes({ app, pool, path, rootDir, bcrypt, jwt, JWT_SECRET, categories, subcategories, brands, defaultProducts, authenticateToken, requireAdmin, orders }) {
// =====================================================
// ADMIN PRODUCT
// =====================================================

app.post("/api/admin/products", async (req, res) => {
  try {
    const {
      name,
      brand,
      type,
      gender,
      subcategory,
      price,
      originalPrice,
      sizes,
      colors,
      colorName,
      variantGroup,
      images,
      desc
    } = req.body;

    if (!name || !price || !type) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin sản phẩm"
      });
    }

    const imageList = Array.isArray(images)
      ? images.filter(Boolean).slice(0, 10)
      : [];

    const sizeList = Array.isArray(sizes)
      ? sizes
      : [];

    const colorList = Array.isArray(colors)
      ? colors
      : [];

    const result = await pool.query(
      `
        INSERT INTO products (
          name,
          brand,
          type,
          gender,
          subcategory,
          price,
          original_price,
          sizes,
          colors,
          color_name,
          variant_group,
          images,
          description,
          rating,
          sold
        )

        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15
        )

        RETURNING
          id,
          name,
          brand,
          type,
          gender,
          subcategory,
          price,
          original_price AS "originalPrice",
          sizes,
          colors,
          color_name AS "colorName",
          variant_group AS "variantGroup",
          images,
          description AS "desc",
          rating,
          sold
      `,
      [
        String(name).trim(),
        brand || "Nike",
        type,
        gender || "all",
        subcategory || "",
        Number(price),
        Number(originalPrice) || Number(price),
        JSON.stringify(sizeList),
        JSON.stringify(colorList),
        colorName || null,
        variantGroup || null,
        JSON.stringify(imageList),
        desc || "",
        5,
        0
      ]
    );

    const product = result.rows[0];

    product.id = Number(product.id);
    product.price = Number(product.price);
    product.originalPrice =
      Number(product.originalPrice);
    product.rating = Number(product.rating);
    product.sold = Number(product.sold);

    product.image =
      Array.isArray(product.images) &&
      product.images.length
        ? product.images[0]
        : "";

    return res.status(201).json({
      success: true,
      product
    });

  } catch (error) {
    console.error(
      "CREATE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Không thể thêm sản phẩm."
    });
  }
});

app.put("/api/admin/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      name,
      brand,
      type,
      gender,
      subcategory,
      price,
      originalPrice,
      sizes,
      colors,
      colorName,
      variantGroup,
      images,
      desc
    } = req.body;

    const imageList = Array.isArray(images)
      ? images.filter(Boolean).slice(0, 10)
      : [];

    const sizeList = Array.isArray(sizes)
      ? sizes
      : [];

      const colorList = Array.isArray(colors)
      ? colors
      : [];

    const result = await pool.query(
      `
        UPDATE products

        SET
          name = $1,
          brand = $2,
          type = $3,
          gender = $4,
          subcategory = $5,
          price = $6,
          original_price = $7,
          sizes = $8,
          colors = $9,
          color_name = $10,
          variant_group = $11,
          images = $12,
          description = $13,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $14

        RETURNING
          id,
          name,
          brand,
          type,
          gender,
          subcategory,
          price,
          original_price AS "originalPrice",
          sizes,
          colors,
          color_name AS "colorName",
          variant_group AS "variantGroup",
          images,
          description AS "desc",
          rating,
          sold
      `,
      [
        String(name || "").trim(),
        brand || "Nike",
        type || "",
        gender || "all",
        subcategory || "",
        Number(price) || 0,
        Number(originalPrice) || Number(price) || 0,
        JSON.stringify(sizeList),
        JSON.stringify(colorList),
        colorName || null,
        variantGroup || null,
        JSON.stringify(imageList),
        desc || "",
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm"
      });
    }

    const product = result.rows[0];

    product.id = Number(product.id);
    product.price = Number(product.price);
    product.originalPrice =
      Number(product.originalPrice);
    product.rating = Number(product.rating);
    product.sold = Number(product.sold);

    product.image =
      Array.isArray(product.images) &&
      product.images.length
        ? product.images[0]
        : "";

    return res.json({
      success: true,
      product
    });

  } catch (error) {
    console.error(
      "UPDATE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật sản phẩm."
    });
  }
});

app.delete("/api/admin/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await pool.query(
      `
        DELETE FROM products
        WHERE id = $1
        RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm."
      });
    }

    return res.json({
      success: true,
      message: "Đã xóa sản phẩm."
    });

  } catch (error) {
    console.error(
      "DELETE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Không thể xóa sản phẩm."
    });
  }
});


};
