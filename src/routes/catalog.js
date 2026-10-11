module.exports = function registerRoutes({ app, pool, path, rootDir, bcrypt, jwt, JWT_SECRET, categories, subcategories, brands, defaultProducts, authenticateToken, requireAdmin, orders }) {
// =====================================================
// API
// =====================================================

app.get("/api/categories", (req, res) => {
  res.json({
    success: true,
    data: categories
  });
});

app.get("/api/subcategories", (req, res) => {
  res.json({
    success: true,
    data: subcategories
  });
});

app.get("/api/brands", (req, res) => {
  res.json({
    success: true,
    data: brands
  });
});

app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
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
      FROM products
      ORDER BY id DESC
    `);

    const productList = result.rows.map(product => ({
      ...product,
      id: Number(product.id),
      price: Number(product.price),
      originalPrice: Number(product.originalPrice),
      rating: Number(product.rating),
      sold: Number(product.sold),

      sizes: Array.isArray(product.sizes)
        ? product.sizes
        : [],

      colors: Array.isArray(product.colors)
        ? product.colors
        : [],

      colorName:
        product.colorName || "",

      variantGroup:
        product.variantGroup || "",
      
      images: Array.isArray(product.images)
        ? product.images
        : [],

      image:
        Array.isArray(product.images) &&
        product.images.length
        ? product.images[0]
        : ""

    }));

    return res.json({
      success: true,
      data: productList
    });

  } catch (error) {
    console.error(
      "GET PRODUCTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Không thể tải sản phẩm."
    });
  }
});

app.use(
  "/api/admin",
  authenticateToken,
  requireAdmin
);


};
