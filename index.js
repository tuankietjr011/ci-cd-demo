const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static(path.join(__dirname, "frontend")));

// =====================================================
// DATA
// =====================================================

const categories = [
  { id: "ao", name: "Áo" },
  { id: "quan", name: "Quần" },
  { id: "giay-dep", name: "Giày Dép" },
  { id: "phu-kien", name: "Phụ Kiện" },
  { id: "bong-da", name: "Đồ Bóng Đá" }
];

const subcategories = {
  ao: {
    nam: [
      { id: "ao-thun", name: "Áo Thun" },
      { id: "ao-polo", name: "Áo Polo" },
      { id: "ao-so-mi", name: "Áo Sơ Mi" },
      { id: "ao-khoac", name: "Áo Khoác" },
      { id: "ao-len", name: "Áo Len" },
      { id: "hoodie-sweater", name: "Hoodie / Sweater" },
      { id: "khac", name: "Khác" }
    ],

    nu: [
      { id: "ao-thun", name: "Áo Thun" },
      { id: "ao-croptop", name: "Áo Croptop" },
      { id: "ao-so-mi", name: "Áo Sơ Mi" },
      { id: "ao-khoac", name: "Áo Khoác" },
      { id: "ao-len", name: "Áo Len" },
      { id: "hoodie-sweater", name: "Hoodie / Sweater" },
      { id: "khac", name: "Khác" }
    ]
  },

  quan: {
    nam: [
      { id: "quan-jeans", name: "Quần Jeans" },
      { id: "quan-kaki", name: "Quần Kaki" },
      { id: "quan-tay", name: "Quần Tây" },
      { id: "quan-jogger", name: "Quần Jogger" },
      { id: "quan-short", name: "Quần Short" },
      { id: "khac", name: "Khác" }
    ],

    nu: [
      { id: "quan-jeans", name: "Quần Jeans" },
      { id: "quan-tay", name: "Quần Tây" },
      { id: "quan-ong-rong", name: "Quần Ống Rộng" },
      { id: "legging", name: "Legging" },
      { id: "quan-short", name: "Quần Short" },
      { id: "khac", name: "Khác" }
    ]
  },

  "giay-dep": {
    nam: [
      { id: "sneaker", name: "Sneaker" },
      { id: "giay-the-thao", name: "Giày Thể Thao" },
      { id: "giay-tay", name: "Giày Tây" },
      { id: "sandal", name: "Sandal" },
      { id: "dep", name: "Dép" }
    ],

    nu: [
      { id: "sneaker", name: "Sneaker" },
      { id: "giay-the-thao", name: "Giày Thể Thao" },
      { id: "cao-got", name: "Giày Cao Gót" },
      { id: "sandal", name: "Sandal" },
      { id: "dep", name: "Dép" }
    ]
  },

  "phu-kien": {
    nam: [
      { id: "tui-balo", name: "Túi / Balo" },
      { id: "mu", name: "Mũ" },
      { id: "vi", name: "Ví" },
      { id: "that-lung", name: "Thắt Lưng" },
      { id: "kinh", name: "Kính" },
      { id: "khac", name: "Khác" }
    ],

    nu: [
      { id: "tui-balo", name: "Túi / Balo" },
      { id: "mu", name: "Mũ" },
      { id: "vi", name: "Ví" },
      { id: "kinh", name: "Kính" },
      { id: "trang-suc", name: "Trang Sức" },
      { id: "khac", name: "Khác" }
    ]
  },

  "bong-da": {
    all: [
      { id: "ao-bong-da", name: "Áo Bóng Đá" },
      { id: "giay-bong-da", name: "Giày Bóng Đá" },
      { id: "phu-kien-bong-da", name: "Phụ Kiện Bóng Đá" }
    ]
  }
};

const brands = [
  "Nike",
  "adidas",
  "Louis Vuitton",
  "Gucci",
  "Dior"
];

// =====================================================
// PRODUCTS
// =====================================================

let products = [
  {
    id: 1,
    name: "Nike Premium Cotton T-Shirt",
    brand: "Nike",
    type: "ao",
    gender: "nam",
    subcategory: "ao-thun",
    price: 1290000,
    originalPrice: 1590000,
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900"
    ],
    desc: "Áo thun nam phong cách hiện đại, chất liệu cotton cao cấp.",
    rating: 4.9,
    sold: 128
  },

  {
    id: 2,
    name: "Gucci Luxury Hoodie",
    brand: "Gucci",
    type: "ao",
    gender: "nam",
    subcategory: "hoodie-sweater",
    price: 5990000,
    originalPrice: 6990000,
    sizes: ["M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900"
    ],
    desc: "Hoodie phong cách luxury với thiết kế sang trọng.",
    rating: 4.9,
    sold: 42
  },

  {
    id: 3,
    name: "Dior Women's Fashion",
    brand: "Dior",
    type: "ao",
    gender: "nu",
    subcategory: "ao-thun",
    price: 4590000,
    originalPrice: 5290000,
    sizes: ["S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=900"
    ],
    desc: "Thiết kế thời trang nữ thanh lịch và sang trọng.",
    rating: 5,
    sold: 31
  },

  {
    id: 4,
    name: "Louis Vuitton Luxury Bag",
    brand: "Louis Vuitton",
    type: "phu-kien",
    gender: "nu",
    subcategory: "tui-balo",
    price: 12900000,
    originalPrice: 14900000,
    sizes: [],
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900"
    ],
    desc: "Túi thời trang cao cấp dành cho phong cách sang trọng.",
    rating: 4.9,
    sold: 18
  },

  {
    id: 5,
    name: "adidas Football Jersey",
    brand: "adidas",
    type: "bong-da",
    gender: "all",
    subcategory: "ao-bong-da",
    price: 890000,
    originalPrice: 1190000,
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=900"
    ],
    desc: "Áo bóng đá thoáng khí, phù hợp thi đấu và luyện tập.",
    rating: 4.9,
    sold: 216
  }
];

let orders = [];

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

app.get("/api/products", (req, res) => {
  res.json({
    success: true,
    data: products
  });
});

// =====================================================
// ADMIN PRODUCT
// =====================================================

app.post("/api/admin/products", (req, res) => {
  const {
    name,
    brand,
    type,
    gender,
    subcategory,
    price,
    originalPrice,
    sizes,
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
    ? images.filter(Boolean).slice(0, 4)
    : [];

  const product = {
    id: Date.now(),
    name: String(name).trim(),
    brand: brand || "Nike",
    type,
    gender: gender || "all",
    subcategory: subcategory || "",
    price: Number(price),
    originalPrice:
      Number(originalPrice) || Number(price),
    sizes: Array.isArray(sizes) ? sizes : [],
    images: imageList,
    image: imageList[0] || "",
    desc: desc || "",
    rating: 5,
    sold: 0
  };

  products.unshift(product);

  res.json({
    success: true,
    product
  });
});

app.put("/api/admin/products/:id", (req, res) => {
  const product = products.find(
    p => Number(p.id) === Number(req.params.id)
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy sản phẩm"
    });
  }

  const fields = [
    "name",
    "brand",
    "type",
    "gender",
    "subcategory",
    "desc"
  ];

  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  if (req.body.price !== undefined) {
    product.price = Number(req.body.price);
  }

  if (req.body.originalPrice !== undefined) {
    product.originalPrice =
      Number(req.body.originalPrice) || product.price;
  }

  if (Array.isArray(req.body.sizes)) {
    product.sizes = req.body.sizes;
  }

  if (Array.isArray(req.body.images)) {
    product.images =
      req.body.images.filter(Boolean).slice(0, 4);

    product.image = product.images[0] || "";
  }

  res.json({
    success: true,
    product
  });
});

app.delete("/api/admin/products/:id", (req, res) => {
  const id = Number(req.params.id);

  products = products.filter(
    p => Number(p.id) !== id
  );

  res.json({
    success: true
  });
});

// =====================================================
// ORDERS
// =====================================================

app.get("/api/admin/orders", (req, res) => {
  res.json({
    success: true,
    data: orders
  });
});

app.post("/api/orders", (req, res) => {
  const order = {
    ...req.body,
    id: Date.now(),
    code: "SL" + Date.now(),
    createdAt: new Date().toISOString(),
    status: "pending"
  };

  orders.unshift(order);

  res.json({
    success: true,
    order
  });
});

// =====================================================
// ROUTES
// =====================================================

app.get("/admin", (req, res) => {
  res.sendFile(
    path.join(__dirname, "frontend", "admin.html")
  );
});

app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "frontend", "index.html")
  );
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Application running at port ${PORT}`);
});