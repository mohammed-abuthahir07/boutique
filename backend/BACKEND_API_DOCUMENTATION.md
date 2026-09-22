# Boutique Backend API Documentation

This file documents **only APIs that exist in the current backend source code** (`server.js` → routes → controllers → models).

**Base URL:** `http://localhost:5000`  
**Default port:** `process.env.PORT` or `5000`  
**JSON parser:** `express.json()` and `express.urlencoded({ extended: true })`  
**Static files:** `GET /uploads/...` (uploaded product images)

**Admin authentication** (`backend/middleware/authMiddleware.js`):

- Header: `Authorization: Bearer <TOKEN>`
- Token is created on admin login (`expiresIn: "1d"`, signed with `process.env.JWT_SECRET`)
- Missing header → `401` `{ "success": false, "message": "Authorization token is required" }`
- Wrong format → `401` `{ "success": false, "message": "Invalid authorization format" }`
- Invalid/expired token → `401` `{ "success": false, "message": "Invalid or expired token" }`

**Customer authentication** (`backend/middleware/customerAuthMiddleware.js`):

- Header: `Authorization: Bearer <TOKEN>`
- Token is created on register / login / Google login (`expiresIn: "7d"`, `role: "CUSTOMER"`)
- Missing header → `401` `{ "success": false, "message": "Authorization token is required" }`
- Wrong format → `401` `{ "success": false, "message": "Invalid authorization format" }`
- Token without `role: "CUSTOMER"` → `403` `{ "success": false, "message": "Customer access required" }`
- Invalid/expired token → `401` `{ "success": false, "message": "Invalid or expired token" }`

**Public APIs** do not require authentication.

---

# ADMIN SIDE APIs

---

# 1. Admin Authentication APIs

---

# 1. Admin Login

### METHOD

POST

### API

http://localhost:5000/api/admin/auth/login

### REQUEST

Headers:

```text
Content-Type: application/json
```

Body:

```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "message": "Admin login successful",
  "token": "<JWT>",
  "admin": {
    "id": 1,
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "ADMIN",
    "status": "ACTIVE"
  }
}
```

Error `400`:

```json
{
  "success": false,
  "message": "Email and password are required"
}
```

Error `401`:

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

Error `403`:

```json
{
  "success": false,
  "message": "Admin account is inactive"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 2. Get Logged-in Admin Profile

### METHOD

GET

### API

http://localhost:5000/api/admin/auth/profile

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "admin": {
    "id": 1,
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "ADMIN",
    "status": "ACTIVE",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Admin not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 2. Category APIs

All category routes use `authMiddleware`.

---

# 1. Get All Categories

### METHOD

GET

### API

http://localhost:5000/api/admin/categories

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "categories": [
    {
      "id": 1,
      "name": "Dresses",
      "slug": "dresses",
      "status": "ACTIVE",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to fetch categories"
}
```

---

# 2. Get Single Category

### METHOD

GET

### API

http://localhost:5000/api/admin/categories/:id

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

URL params:

```text
id = category id
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "category": {
    "id": 1,
    "name": "Dresses",
    "slug": "dresses",
    "status": "ACTIVE",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Category not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to fetch category"
}
```

---

# 3. Create Category

### METHOD

POST

### API

http://localhost:5000/api/admin/categories

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

Body:

```json
{
  "name": "Dresses"
}
```

Notes from controller:

- `name` is required (trimmed)
- `slug` is generated from `name` (lowercase, non-alphanumeric → `-`)
- New category status is set to `ACTIVE` in the model

### RESPONSE

Success `201`:

```json
{
  "success": true,
  "message": "Category created successfully",
  "category": {
    "id": 1,
    "name": "Dresses",
    "slug": "dresses",
    "status": "ACTIVE",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
}
```

Error `400`:

```json
{
  "success": false,
  "message": "Category name is required"
}
```

Error `409` (duplicate name):

```json
{
  "success": false,
  "message": "Category already exists"
}
```

Error `409` (duplicate slug):

```json
{
  "success": false,
  "message": "Category slug already exists"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to create category"
}
```

---

# 4. Update Category

### METHOD

PUT

### API

http://localhost:5000/api/admin/categories/:id

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

URL params:

```text
id = category id
```

Body:

```json
{
  "name": "Dresses",
  "status": "ACTIVE"
}
```

Notes from controller:

- `name` is required
- `status` is optional; if sent it must be `ACTIVE` or `INACTIVE`
- If `status` is omitted, the existing status is kept
- `slug` is regenerated from the new name

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "message": "Category updated successfully",
  "category": {
    "id": 1,
    "name": "Dresses",
    "slug": "dresses",
    "status": "ACTIVE",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
}
```

Error `400` (name):

```json
{
  "success": false,
  "message": "Category name is required"
}
```

Error `400` (status):

```json
{
  "success": false,
  "message": "Invalid category status"
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Category not found"
}
```

Error `409` (name):

```json
{
  "success": false,
  "message": "Another category with this name already exists"
}
```

Error `409` (slug):

```json
{
  "success": false,
  "message": "Another category with this slug already exists"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to update category"
}
```

---

# 5. Delete Category

### METHOD

DELETE

### API

http://localhost:5000/api/admin/categories/:id

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

URL params:

```text
id = category id
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

Error `400`:

```json
{
  "success": false,
  "message": "Category could not be deleted"
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Category not found"
}
```

Error `409` (MySQL foreign key `ER_ROW_IS_REFERENCED_2`):

```json
{
  "success": false,
  "message": "Cannot delete category because products are using it"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to delete category"
}
```

---

# 3. Product APIs

All product / variant / color-image routes use `authMiddleware`.

---

# 1. Get All Products

### METHOD

GET

### API

http://localhost:5000/api/admin/products

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "category_id": 1,
      "category_name": "Dresses",
      "name": "Summer Dress",
      "description": "Cotton dress",
      "price": "1999.00",
      "stock": 10,
      "image": null,
      "status": "ACTIVE",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z",
      "variants": [
        {
          "id": 1,
          "product_id": 1,
          "color": "Red",
          "size": "M",
          "stock": 5,
          "created_at": "2026-01-01T00:00:00.000Z",
          "updated_at": "2026-01-01T00:00:00.000Z"
        }
      ],
      "colors": [
        {
          "id": 1,
          "product_id": 1,
          "color": "Red",
          "image": "/uploads/products/123-image.jpg",
          "sort_order": 1,
          "created_at": "2026-01-01T00:00:00.000Z"
        }
      ]
    }
  ]
}
```

Note from model: list API attaches color images as `colors` (not `color_images`).

Error `500`:

```json
{
  "success": false,
  "message": "Failed to fetch products"
}
```

---

# 2. Get Single Product

### METHOD

GET

### API

http://localhost:5000/api/admin/products/:id

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

URL params:

```text
id = product id
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "product": {
    "id": 1,
    "category_id": 1,
    "category_name": "Dresses",
    "name": "Summer Dress",
    "description": "Cotton dress",
    "price": "1999.00",
    "stock": 10,
    "image": null,
    "status": "ACTIVE",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z",
    "variants": [
      {
        "id": 1,
        "product_id": 1,
        "color": "Red",
        "size": "M",
        "stock": 5,
        "created_at": "2026-01-01T00:00:00.000Z",
        "updated_at": "2026-01-01T00:00:00.000Z"
      }
    ],
    "color_images": [
      {
        "id": 1,
        "product_id": 1,
        "color": "Red",
        "image": "/uploads/products/123-image.jpg",
        "sort_order": 1,
        "created_at": "2026-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Product not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to fetch product"
}
```

---

# 3. Create Product

### METHOD

POST

### API

http://localhost:5000/api/admin/products

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

Body:

```json
{
  "category_id": 1,
  "name": "Summer Dress",
  "description": "Cotton dress",
  "price": 1999,
  "stock": 10,
  "image": null
}
```

Notes from controller:

- Required: `category_id`, `name`, `price` (>= 0), `stock` (integer >= 0)
- `description` optional (trimmed or `null`)
- `image` optional string path/url (this create API is JSON, not file upload)
- Category must exist and have `status = "ACTIVE"`
- New product status is set to `ACTIVE` in the model

### RESPONSE

Success `201`:

```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": 1,
    "category_id": 1,
    "category_name": "Dresses",
    "name": "Summer Dress",
    "description": "Cotton dress",
    "price": "1999.00",
    "stock": 10,
    "image": null,
    "status": "ACTIVE",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z",
    "variants": [],
    "color_images": []
  }
}
```

Error `400` (category missing):

```json
{
  "success": false,
  "message": "Category is required"
}
```

Error `400` (name):

```json
{
  "success": false,
  "message": "Product name is required"
}
```

Error `400` (price):

```json
{
  "success": false,
  "message": "Valid product price is required"
}
```

Error `400` (stock):

```json
{
  "success": false,
  "message": "Valid product stock is required"
}
```

Error `400` (inactive category):

```json
{
  "success": false,
  "message": "Cannot create product under an inactive category"
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Category not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to create product"
}
```

---

# 4. Update Product

### METHOD

PUT

### API

http://localhost:5000/api/admin/products/:id

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

URL params:

```text
id = product id
```

Body:

```json
{
  "category_id": 1,
  "name": "Summer Dress",
  "description": "Cotton dress",
  "price": 1999,
  "stock": 10,
  "image": null,
  "status": "ACTIVE"
}
```

Notes from controller:

- Required: `category_id`, `name`, `price`, `stock`
- `status` optional; if sent must be `ACTIVE` or `INACTIVE`; otherwise existing status is kept
- If `image` is omitted (`undefined`), existing image is kept
- Category must exist and be `ACTIVE`

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {
    "id": 1,
    "category_id": 1,
    "category_name": "Dresses",
    "name": "Summer Dress",
    "description": "Cotton dress",
    "price": "1999.00",
    "stock": 10,
    "image": null,
    "status": "ACTIVE",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z",
    "variants": [],
    "color_images": []
  }
}
```

Error `400` (category missing):

```json
{
  "success": false,
  "message": "Category is required"
}
```

Error `400` (inactive category):

```json
{
  "success": false,
  "message": "Cannot assign product to an inactive category"
}
```

Error `400` (name):

```json
{
  "success": false,
  "message": "Product name is required"
}
```

Error `400` (price):

```json
{
  "success": false,
  "message": "Valid product price is required"
}
```

Error `400` (stock):

```json
{
  "success": false,
  "message": "Valid product stock is required"
}
```

Error `400` (status):

```json
{
  "success": false,
  "message": "Invalid product status"
}
```

Error `404` (product):

```json
{
  "success": false,
  "message": "Product not found"
}
```

Error `404` (category):

```json
{
  "success": false,
  "message": "Category not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to update product"
}
```

---

# 5. Delete Product

### METHOD

DELETE

### API

http://localhost:5000/api/admin/products/:id

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

URL params:

```text
id = product id
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

Error `400`:

```json
{
  "success": false,
  "message": "Product could not be deleted"
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Product not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to delete product"
}
```

---

# 4. Product Variant APIs

---

# 1. Create Product Variant

### METHOD

POST

### API

http://localhost:5000/api/admin/products/:id/variants

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

URL params:

```text
id = product id
```

Body:

```json
{
  "color": "Red",
  "size": "M",
  "stock": 5
}
```

Notes from controller:

- Required: `color`, `size`, `stock` (integer >= 0)
- Duplicate color+size on the same product is rejected (case-insensitive)

### RESPONSE

Success `201`:

```json
{
  "success": true,
  "message": "Product variant created successfully",
  "variant": {
    "id": 1,
    "product_id": 1,
    "color": "Red",
    "size": "M",
    "stock": 5,
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
}
```

Error `400` (color):

```json
{
  "success": false,
  "message": "Color is required"
}
```

Error `400` (size):

```json
{
  "success": false,
  "message": "Size is required"
}
```

Error `400` (stock):

```json
{
  "success": false,
  "message": "Valid variant stock is required"
}
```

Error `400` (duplicate):

```json
{
  "success": false,
  "message": "This color and size combination already exists"
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Product not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to create product variant"
}
```

---

# 2. Update Product Variant

### METHOD

PUT

### API

http://localhost:5000/api/admin/products/:id/variants/:variantId

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

URL params:

```text
id = product id
variantId = variant id
```

Body:

```json
{
  "color": "Blue",
  "size": "L",
  "stock": 8
}
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "message": "Product variant updated successfully",
  "variant": {
    "id": 1,
    "product_id": 1,
    "color": "Blue",
    "size": "L",
    "stock": 8,
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
}
```

Error `400` (color):

```json
{
  "success": false,
  "message": "Color is required"
}
```

Error `400` (size):

```json
{
  "success": false,
  "message": "Size is required"
}
```

Error `400` (stock):

```json
{
  "success": false,
  "message": "Valid variant stock is required"
}
```

Error `400` (duplicate):

```json
{
  "success": false,
  "message": "This color and size combination already exists"
}
```

Error `404` (product):

```json
{
  "success": false,
  "message": "Product not found"
}
```

Error `404` (variant, or variant does not belong to this product):

```json
{
  "success": false,
  "message": "Product variant not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to update product variant"
}
```

---

# 3. Delete Product Variant

### METHOD

DELETE

### API

http://localhost:5000/api/admin/products/:id/variants/:variantId

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

URL params:

```text
id = product id
variantId = variant id
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "message": "Product variant deleted successfully"
}
```

Error `404` (product):

```json
{
  "success": false,
  "message": "Product not found"
}
```

Error `404` (variant):

```json
{
  "success": false,
  "message": "Product variant not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to delete product variant"
}
```

---

# 5. Product Color Image APIs

---

# 1. Upload Product Color Images

### METHOD

POST

### API

http://localhost:5000/api/admin/products/:id/colors/:color/images

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: multipart/form-data
```

URL params:

```text
id = product id
color = color name (example: Red)
```

form-data:

```text
images = file (repeat field, max 10 files)
```

Multer settings from route file:

- Field name: `images`
- Max files: `10`
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/jpg`
- Max size: `5 * 1024 * 1024` (5 MB)
- Saved under `uploads/products/`
- Stored image path: `/uploads/products/<filename>`
- `sort_order` starts at existing image count + 1

### RESPONSE

Success `201`:

```json
{
  "success": true,
  "message": "Product color images uploaded successfully",
  "images": [
    {
      "id": 1,
      "product_id": 1,
      "color": "Red",
      "image": "/uploads/products/1710000000000-photo.jpg",
      "sort_order": 1
    }
  ]
}
```

Error `400` (color):

```json
{
  "success": false,
  "message": "Color is required"
}
```

Error `400` (files):

```json
{
  "success": false,
  "message": "At least one image is required"
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Product not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to upload color images"
}
```

---

# 2. Delete Product Color Image

### METHOD

DELETE

### API

http://localhost:5000/api/admin/products/:id/colors/:color/images/:imageId

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

URL params:

```text
id = product id
color = color name (present in the URL; controller uses id + imageId)
imageId = color image id
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "message": "Product color image deleted successfully"
}
```

Error `404` (image missing, or image.product_id does not match `:id`):

```json
{
  "success": false,
  "message": "Product color image not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to delete color image"
}
```

---

# 6. Offer APIs

All offer routes use `authMiddleware`.

---

# 1. Get All Offers

### METHOD

GET

### API

http://localhost:5000/api/admin/offers

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "offers": [
    {
      "id": 1,
      "title": "Festival Sale",
      "description": "20% off",
      "image": null,
      "discount_type": "PERCENTAGE",
      "discount_value": "20.00",
      "start_date": "2026-01-01",
      "end_date": "2026-01-31",
      "status": "ACTIVE",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 2. Get Single Offer

### METHOD

GET

### API

http://localhost:5000/api/admin/offers/:id

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

URL params:

```text
id = offer id
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "offer": {
    "id": 1,
    "title": "Festival Sale",
    "description": "20% off",
    "image": null,
    "discount_type": "PERCENTAGE",
    "discount_value": "20.00",
    "start_date": "2026-01-01",
    "end_date": "2026-01-31",
    "status": "ACTIVE",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Offer not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 3. Create Offer

### METHOD

POST

### API

http://localhost:5000/api/admin/offers

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

Body:

```json
{
  "title": "Festival Sale",
  "description": "20% off",
  "image": null,
  "discount_type": "PERCENTAGE",
  "discount_value": 20,
  "start_date": "2026-01-01",
  "end_date": "2026-01-31"
}
```

Notes from controller:

- Required: `title`, `discount_type`, `discount_value`, `start_date`, `end_date`
- `description` and `image` optional (trimmed or `null`)
- `discount_type` must be `PERCENTAGE` or `FIXED`
- `discount_value` must be a finite number >= 0
- If `PERCENTAGE`, value cannot exceed `100`
- `start_date` cannot be after `end_date`
- New offer status is set to `ACTIVE` in the model

### RESPONSE

Success `201`:

```json
{
  "success": true,
  "message": "Offer created successfully",
  "offer_id": 1
}
```

Error `400` (required fields):

```json
{
  "success": false,
  "message": "Title, discount type, discount value, start date and end date are required"
}
```

Error `400` (type):

```json
{
  "success": false,
  "message": "Discount type must be PERCENTAGE or FIXED"
}
```

Error `400` (value):

```json
{
  "success": false,
  "message": "Discount value must be a valid non-negative number"
}
```

Error `400` (percentage):

```json
{
  "success": false,
  "message": "Percentage discount cannot exceed 100"
}
```

Error `400` (dates):

```json
{
  "success": false,
  "message": "Start date cannot be after end date"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 4. Update Offer

### METHOD

PUT

### API

http://localhost:5000/api/admin/offers/:id

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

URL params:

```text
id = offer id
```

Body:

```json
{
  "title": "Festival Sale",
  "description": "20% off",
  "image": null,
  "discount_type": "PERCENTAGE",
  "discount_value": 20,
  "start_date": "2026-01-01",
  "end_date": "2026-01-31",
  "status": "ACTIVE"
}
```

Notes from controller:

- Required: `title`, `discount_type`, `discount_value`, `start_date`, `end_date`, `status`
- `status` must be `ACTIVE` or `INACTIVE`

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "message": "Offer updated successfully"
}
```

Error `400` (required fields):

```json
{
  "success": false,
  "message": "Title, discount type, discount value, start date, end date and status are required"
}
```

Error `400` (type):

```json
{
  "success": false,
  "message": "Discount type must be PERCENTAGE or FIXED"
}
```

Error `400` (status):

```json
{
  "success": false,
  "message": "Status must be ACTIVE or INACTIVE"
}
```

Error `400` (value):

```json
{
  "success": false,
  "message": "Discount value must be a valid non-negative number"
}
```

Error `400` (percentage):

```json
{
  "success": false,
  "message": "Percentage discount cannot exceed 100"
}
```

Error `400` (dates):

```json
{
  "success": false,
  "message": "Start date cannot be after end date"
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Offer not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 5. Delete Offer

### METHOD

DELETE

### API

http://localhost:5000/api/admin/offers/:id

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

URL params:

```text
id = offer id
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "message": "Offer deleted successfully"
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Offer not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 7. Order APIs

All admin order routes use `authMiddleware`.

---

# 1. Get All Orders

### METHOD

GET

### API

http://localhost:5000/api/admin/orders

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "orders": [
    {
      "id": 1,
      "order_id": "ORD-1710000000000",
      "customer_name": "Jane Doe",
      "customer_email": "jane@example.com",
      "customer_phone": "9876543210",
      "shipping_address": "12 Main Street",
      "total_amount": "1999.00",
      "order_status": "PENDING",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 2. Get Single Order With Items

### METHOD

GET

### API

http://localhost:5000/api/admin/orders/:id

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

URL params:

```text
id = orders.id (numeric database id, not order_id string)
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "order": {
    "id": 1,
    "order_id": "ORD-1710000000000",
    "customer_name": "Jane Doe",
    "customer_email": "jane@example.com",
    "customer_phone": "9876543210",
    "shipping_address": "12 Main Street",
    "total_amount": "1999.00",
    "order_status": "PENDING",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z",
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "product_id": 1,
        "product_name": "Summer Dress",
        "price": "1999.00",
        "quantity": 1,
        "subtotal": "1999.00",
        "created_at": "2026-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

Note from admin `orderItemModel.findByOrderId`: selected columns are `id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `subtotal`, `created_at`. This admin items query does **not** return `variant_id`, `variant_color`, or `variant_size`.

Error `404`:

```json
{
  "success": false,
  "message": "Order not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 3. Update Order Status

### METHOD

PUT

### API

http://localhost:5000/api/admin/orders/:id/status

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

URL params:

```text
id = orders.id
```

Body:

```json
{
  "order_status": "CONFIRMED"
}
```

Allowed `order_status` values from controller:

```text
PENDING
CONFIRMED
PROCESSING
SHIPPED
DELIVERED
CANCELLED
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "message": "Order status updated successfully"
}
```

Error `400` (missing):

```json
{
  "success": false,
  "message": "Order status is required"
}
```

Error `400` (invalid):

```json
{
  "success": false,
  "message": "Invalid order status"
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Order not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 8. Inventory APIs

---

# 1. Get Product Inventory

### METHOD

GET

### API

http://localhost:5000/api/admin/inventory

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "inventory": [
    {
      "id": 1,
      "product_name": "Summer Dress",
      "category_name": "Dresses",
      "price": "1999.00",
      "stock": 10,
      "status": "ACTIVE",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

Note from model: this returns product-level `p.stock`, not variant stock.

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 9. Dashboard APIs

All dashboard routes use `authMiddleware`.

---

# 1. Dashboard Summary

### METHOD

GET

### API

http://localhost:5000/api/admin/dashboard/summary

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "summary": {
    "total_orders": 10,
    "total_revenue": "19990.00",
    "active_products": 8,
    "out_of_stock_products": 1,
    "low_stock_products": 2,
    "pending_orders": 3,
    "completed_orders": 4,
    "active_categories": 5
  }
}
```

Notes from model:

- `total_revenue` = `SUM(total_amount)` where `order_status != 'CANCELLED'`
- `active_products` = products with `status = 'ACTIVE'`
- `out_of_stock_products` = products with `stock = 0`
- `low_stock_products` = products with `stock > 0 AND stock <= 5 AND status = 'ACTIVE'`
- `pending_orders` = `order_status = 'PENDING'`
- `completed_orders` = `order_status = 'DELIVERED'`
- `active_categories` = categories with `status = 'ACTIVE'`

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 2. Dashboard Monthly Revenue

### METHOD

GET

### API

http://localhost:5000/api/admin/dashboard/monthly-revenue

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "monthly_revenue": [
    {
      "month": "2026-01",
      "revenue": "5000.00"
    }
  ]
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 3. Dashboard Yearly Revenue

### METHOD

GET

### API

http://localhost:5000/api/admin/dashboard/yearly-revenue

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "yearly_revenue": [
    {
      "year": 2026,
      "revenue": "50000.00"
    }
  ]
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 4. Dashboard Recent Orders

### METHOD

GET

### API

http://localhost:5000/api/admin/dashboard/recent-orders

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "recent_orders": [
    {
      "id": 1,
      "order_id": "ORD-1710000000000",
      "customer_name": "Jane Doe",
      "customer_phone": "9876543210",
      "total_amount": "1999.00",
      "order_status": "PENDING",
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

Note from model: last `10` orders by `created_at DESC`.

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 5. Dashboard Recent Products

### METHOD

GET

### API

http://localhost:5000/api/admin/dashboard/recent-products

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "recent_products": [
    {
      "id": 1,
      "name": "Summer Dress",
      "price": "1999.00",
      "stock": 10,
      "status": "ACTIVE",
      "created_at": "2026-01-01T00:00:00.000Z",
      "category_name": "Dresses"
    }
  ]
}
```

Note from model: last `10` products by `created_at DESC`.

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 6. Dashboard Low Stock

### METHOD

GET

### API

http://localhost:5000/api/admin/dashboard/low-stock

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "low_stock_products": [
    {
      "id": 1,
      "name": "Summer Dress",
      "price": "1999.00",
      "stock": 3,
      "status": "ACTIVE",
      "category_name": "Dresses"
    }
  ]
}
```

Note from model: `stock > 0 AND stock <= 5 AND status = 'ACTIVE'`.

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 7. Dashboard Recent Activity

### METHOD

GET

### API

http://localhost:5000/api/admin/dashboard/recent-activity

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "recent_activity": [
    {
      "id": 1,
      "order_id": "ORD-1710000000000",
      "customer_name": "Jane Doe",
      "total_amount": "1999.00",
      "order_status": "PENDING",
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

Note from model: last `10` orders by `created_at DESC`.

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 10. Analytics APIs

All analytics routes use `authMiddleware`.

---

# 1. Analytics Summary

### METHOD

GET

### API

http://localhost:5000/api/admin/analytics/summary

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "summary": {
    "total_orders": 10,
    "total_revenue": "19990.00",
    "pending_orders": 3,
    "completed_orders": 4,
    "products_sold": 15,
    "active_products": 8,
    "out_of_stock_products": 1,
    "low_stock_products": 2
  }
}
```

Notes from model:

- `total_revenue` excludes `CANCELLED`
- `products_sold` = `SUM(order_items.quantity)` for non-cancelled orders
- `low_stock_products` = products with `stock > 0 AND stock <= 5` (no `ACTIVE` filter in this query)

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 2. Analytics Order Status

### METHOD

GET

### API

http://localhost:5000/api/admin/analytics/order-status

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "order_status": [
    {
      "order_status": "PENDING",
      "order_count": 3
    }
  ]
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 3. Analytics Best Selling Products

### METHOD

GET

### API

http://localhost:5000/api/admin/analytics/best-selling-products

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "best_selling_products": [
    {
      "product_id": 1,
      "product_name": "Summer Dress",
      "total_quantity": 12,
      "total_sales": "23988.00"
    }
  ]
}
```

Note from model: non-cancelled orders only, `LIMIT 10`, ordered by `total_quantity DESC`.

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 4. Analytics Monthly Orders

### METHOD

GET

### API

http://localhost:5000/api/admin/analytics/monthly-orders

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "monthly_orders": [
    {
      "month": "2026-01",
      "order_count": 7
    }
  ]
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 5. Analytics Monthly Revenue

### METHOD

GET

### API

http://localhost:5000/api/admin/analytics/monthly-revenue

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "monthly_revenue": [
    {
      "month": "2026-01",
      "revenue": "5000.00"
    }
  ]
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 6. Analytics Category Sales

### METHOD

GET

### API

http://localhost:5000/api/admin/analytics/category-sales

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "category_sales": [
    {
      "category_id": 1,
      "category_name": "Dresses",
      "products_sold": 12,
      "total_sales": "23988.00"
    }
  ]
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 11. Customer Management APIs

All admin customer routes use `authMiddleware`.

Current model behavior (actual code):

- `getPurchaseSummary()` returns a hardcoded object
- `getOrdersByCustomerId()` returns `[]`
- `getOrderDetails()` returns `[]`

Those responses are documented as the backend currently returns them.

---

# 1. Get All Customers

### METHOD

GET

### API

http://localhost:5000/api/admin/customers

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "customers": [
    {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "9876543210",
      "status": "ACTIVE",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to fetch customers",
  "error": "<error.message>"
}
```

---

# 2. Get One Customer

### METHOD

GET

### API

http://localhost:5000/api/admin/customers/:id

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

URL params:

```text
id = customer id (must be a positive integer)
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "customer": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9876543210",
    "status": "ACTIVE",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z",
    "purchase_summary": {
      "total_orders": 0,
      "total_products_bought": 0,
      "total_spent": "0.00",
      "last_order_date": null
    }
  }
}
```

Error `400`:

```json
{
  "success": false,
  "message": "Invalid customer ID"
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Customer not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to fetch customer details",
  "error": "<error.message>"
}
```

---

# 3. Get Customer Orders

### METHOD

GET

### API

http://localhost:5000/api/admin/customers/:id/orders

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

URL params:

```text
id = customer id
```

Body:

```json
null
```

### RESPONSE

Success `200` (current model returns an empty orders array):

```json
{
  "success": true,
  "customer": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "orders": []
}
```

Error `400`:

```json
{
  "success": false,
  "message": "Invalid customer ID"
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Customer not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to fetch customer orders",
  "error": "<error.message>"
}
```

---

# 4. Get One Customer Order

### METHOD

GET

### API

http://localhost:5000/api/admin/customers/:id/orders/:orderId

### REQUEST

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

URL params:

```text
id = customer id
orderId = order id
```

Body:

```json
null
```

### RESPONSE

Success `200` (controller always sets `order: null`; current model returns empty `items`):

```json
{
  "success": true,
  "customer": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "order": null,
  "items": []
}
```

Error `400`:

```json
{
  "success": false,
  "message": "Invalid customer ID or order ID"
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Customer not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to fetch order details",
  "error": "<error.message>"
}
```

---

# 12. Any other actual Admin API

No other admin routes are mounted in `server.js`.

Mounted admin prefixes:

```text
/api/admin/auth
/api/admin/categories
/api/admin/products
/api/admin/offers
/api/admin/orders
/api/admin/analytics
/api/admin/dashboard
/api/admin/inventory
/api/admin/customers
```

---

# PUBLIC SIDE APIs

Public routes have **no authentication**.

---

# 1. Public Product APIs

---

# 1. Get All Active Public Products

### METHOD

GET

### API

http://localhost:5000/api/public/products

### REQUEST

Headers:

```text
none
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "count": 1,
  "products": [
    {
      "id": 1,
      "category_id": 1,
      "category_name": "Dresses",
      "name": "Summer Dress",
      "description": "Cotton dress",
      "price": "1999.00",
      "image": null,
      "status": "ACTIVE",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

Notes from model:

- Only products with `p.status = 'ACTIVE'` and `c.status = 'ACTIVE'`
- This listing does **not** include `stock`, `variants`, or `color_images`

Error `500`:

```json
{
  "success": false,
  "message": "Failed to fetch products",
  "error": "<error.message>"
}
```

---

# 2. Get Single Active Public Product

### METHOD

GET

### API

http://localhost:5000/api/public/products/:id

### REQUEST

Headers:

```text
none
```

URL params:

```text
id = product id (digits only)
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "product": {
    "id": 1,
    "category_id": 1,
    "category_name": "Dresses",
    "name": "Summer Dress",
    "description": "Cotton dress",
    "price": "1999.00",
    "image": null,
    "status": "ACTIVE",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z",
    "variants": [
      {
        "id": 1,
        "product_id": 1,
        "color": "Red",
        "size": "M",
        "stock": 5,
        "created_at": "2026-01-01T00:00:00.000Z",
        "updated_at": "2026-01-01T00:00:00.000Z"
      }
    ],
    "color_images": [
      {
        "id": 1,
        "product_id": 1,
        "color": "Red",
        "image": "/uploads/products/123-image.jpg",
        "sort_order": 1,
        "created_at": "2026-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

Error `400`:

```json
{
  "success": false,
  "message": "Invalid product ID"
}
```

Error `404` (not found, inactive product, or inactive category):

```json
{
  "success": false,
  "message": "Product not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to fetch product details",
  "error": "<error.message>"
}
```

---

# 2. Public Offer APIs

---

# 1. Get All Active Public Offers

### METHOD

GET

### API

http://localhost:5000/api/public/offers

### REQUEST

Headers:

```text
none
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "count": 1,
  "offers": [
    {
      "id": 1,
      "title": "Festival Sale",
      "description": "20% off",
      "image": null,
      "discount_type": "PERCENTAGE",
      "discount_value": "20.00",
      "start_date": "2026-01-01",
      "end_date": "2026-01-31",
      "status": "ACTIVE",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

Note from model: `WHERE status = 'ACTIVE'`.

Error `500`:

```json
{
  "success": false,
  "message": "Failed to fetch offers",
  "error": "<error.message>"
}
```

---

# 2. Get Single Active Public Offer

### METHOD

GET

### API

http://localhost:5000/api/public/offers/:id

### REQUEST

Headers:

```text
none
```

URL params:

```text
id = offer id (digits only)
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "offer": {
    "id": 1,
    "title": "Festival Sale",
    "description": "20% off",
    "image": null,
    "discount_type": "PERCENTAGE",
    "discount_value": "20.00",
    "start_date": "2026-01-01",
    "end_date": "2026-01-31",
    "status": "ACTIVE",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
}
```

Error `400`:

```json
{
  "success": false,
  "message": "Invalid offer ID"
}
```

Error `404` (not found or not `ACTIVE`):

```json
{
  "success": false,
  "message": "Offer not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to fetch offer",
  "error": "<error.message>"
}
```

---

# 3. Any other actual Public API

No other public routes are mounted in `server.js`.

Mounted public prefixes:

```text
/api/public/products
/api/public/offers
```

---

# CUSTOMER SIDE APIs

Customer tokens must have `role: "CUSTOMER"`.

---

# 1. Customer Register API

---

# 1. Customer Register

### METHOD

POST

### API

http://localhost:5000/api/customer/auth/register

### REQUEST

Headers:

```text
Content-Type: application/json
```

Body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "9876543210",
  "password": "secret1"
}
```

Notes from controller:

- Required: `name`, `email`, `phone`, `password`
- `name` trimmed, min length `2`
- `email` trimmed and lowercased, regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- `password` min length `6`
- JWT expires in `7d`

### RESPONSE

Success `201`:

```json
{
  "success": true,
  "message": "Customer registered successfully",
  "token": "<JWT>",
  "customer": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9876543210",
    "status": "ACTIVE"
  }
}
```

Error `400` (required):

```json
{
  "success": false,
  "message": "Name, email, phone and password are required"
}
```

Error `400` (name):

```json
{
  "success": false,
  "message": "Name must be at least 2 characters"
}
```

Error `400` (email):

```json
{
  "success": false,
  "message": "Please enter a valid email address"
}
```

Error `400` (password):

```json
{
  "success": false,
  "message": "Password must be at least 6 characters"
}
```

Error `409`:

```json
{
  "success": false,
  "message": "An account with this email already exists"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Customer registration failed",
  "error": "<error.message>"
}
```

---

# 2. Customer Login API

---

# 1. Customer Email/Password Login

### METHOD

POST

### API

http://localhost:5000/api/customer/auth/login

### REQUEST

Headers:

```text
Content-Type: application/json
```

Body:

```json
{
  "email": "jane@example.com",
  "password": "secret1"
}
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "message": "Customer login successful",
  "token": "<JWT>",
  "customer": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9876543210",
    "status": "ACTIVE"
  }
}
```

Error `400`:

```json
{
  "success": false,
  "message": "Email and password are required"
}
```

Error `401` (unknown user or wrong password):

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

Error `401` (Google-only account, `password` is null):

```json
{
  "success": false,
  "message": "This account uses Google login. Please continue with Google."
}
```

Error `403`:

```json
{
  "success": false,
  "message": "Your account is inactive"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Customer login failed",
  "error": "<error.message>"
}
```

---

# 3. Customer Google Login API

---

# 1. Customer Google Login

### METHOD

POST

### API

http://localhost:5000/api/customer/auth/google

### REQUEST

Headers:

```text
Content-Type: application/json
```

Body:

```json
{
  "credential": "<GOOGLE_ID_TOKEN>"
}
```

Notes from controller:

- `credential` is a Google ID token
- Verified with `google-auth-library` using `process.env.GOOGLE_CLIENT_ID`
- If Google ID exists → login
- Else if email exists → link `google_id` when missing
- Else create customer with `phone: null`, `password: null`, `google_id`

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "message": "Google login successful",
  "token": "<JWT>",
  "customer": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": null,
    "status": "ACTIVE"
  }
}
```

Error `400`:

```json
{
  "success": false,
  "message": "Google credential is required"
}
```

Error `401` (invalid token / missing payload):

```json
{
  "success": false,
  "message": "Invalid Google credential"
}
```

Error `401` (missing Google account fields):

```json
{
  "success": false,
  "message": "Google account information is missing"
}
```

Error `401` (unverified Google email):

```json
{
  "success": false,
  "message": "Google email is not verified"
}
```

Error `401` (verify/library failure):

```json
{
  "success": false,
  "message": "Google authentication failed",
  "error": "<error.message>"
}
```

Error `403`:

```json
{
  "success": false,
  "message": "Your account is inactive"
}
```

Error `409`:

```json
{
  "success": false,
  "message": "This email is already linked to another Google account"
}
```

---

# 4. Customer Authentication/Profile API

This is the profile endpoint on the **auth** router (`/api/customer/auth/profile`).  
It uses `CustomerAuthModel.findById` and does **not** return `profile_image`.

---

# 1. Get Customer Auth Profile

### METHOD

GET

### API

http://localhost:5000/api/customer/auth/profile

### REQUEST

Headers:

```text
Authorization: Bearer <CUSTOMER_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "customer": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9876543210",
    "status": "ACTIVE",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Customer not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to fetch customer profile",
  "error": "<error.message>"
}
```

---

# 5. Customer Profile APIs

These routes are mounted at `/api/customer/profile` and use `ProfileModel` (includes `profile_image`).  
All profile routes use `customerAuthMiddleware`.

---

# 1. Get Customer Profile

### METHOD

GET

### API

http://localhost:5000/api/customer/profile

### REQUEST

Headers:

```text
Authorization: Bearer <CUSTOMER_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "customer": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9876543210",
    "profile_image": null,
    "status": "ACTIVE",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Customer not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to fetch profile",
  "error": "<error.message>"
}
```

---

# 2. Update Customer Profile

### METHOD

PUT

### API

http://localhost:5000/api/customer/profile

### REQUEST

Headers:

```text
Authorization: Bearer <CUSTOMER_TOKEN>
Content-Type: application/json
```

Body:

```json
{
  "name": "Jane Doe",
  "phone": "9876543210"
}
```

Notes from controller:

- `name` is required, trimmed, min length `2`
- `phone` optional; if omitted/empty it is stored as `null`
- `profile_image` is **not** taken from the request; existing `customer.profile_image` is written back

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "customer": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9876543210",
    "profile_image": null,
    "status": "ACTIVE",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
}
```

Error `400` (name required):

```json
{
  "success": false,
  "message": "Name is required"
}
```

Error `400` (name length):

```json
{
  "success": false,
  "message": "Name must be at least 2 characters"
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Customer not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to update profile",
  "error": "<error.message>"
}
```

---

# 6. Customer Favorites APIs

All favorite routes use `customerAuthMiddleware`.

---

# 1. Add Favorite

### METHOD

POST

### API

http://localhost:5000/api/customer/favorites/:productId

### REQUEST

Headers:

```text
Authorization: Bearer <CUSTOMER_TOKEN>
```

URL params:

```text
productId = product id (digits only)
```

Body:

```json
null
```

### RESPONSE

Success `201`:

```json
{
  "success": true,
  "message": "Product added to favorites",
  "favorite": {
    "id": 1,
    "product_id": 1
  }
}
```

Error `400` (invalid id):

```json
{
  "success": false,
  "message": "Invalid product ID"
}
```

Error `400` (inactive product):

```json
{
  "success": false,
  "message": "This product is not available"
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Product not found"
}
```

Error `409`:

```json
{
  "success": false,
  "message": "Product is already in favorites"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to add product to favorites",
  "error": "<error.message>"
}
```

---

# 2. Get My Favorites

### METHOD

GET

### API

http://localhost:5000/api/customer/favorites

### REQUEST

Headers:

```text
Authorization: Bearer <CUSTOMER_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "count": 1,
  "favorites": [
    {
      "id": 1,
      "product_id": 1,
      "created_at": "2026-01-01T00:00:00.000Z",
      "category_id": 1,
      "category_name": "Dresses",
      "name": "Summer Dress",
      "description": "Cotton dress",
      "price": "1999.00",
      "image": null,
      "status": "ACTIVE"
    }
  ]
}
```

Note from model: only favorites whose product and category are `ACTIVE`.

Error `500`:

```json
{
  "success": false,
  "message": "Failed to fetch favorites",
  "error": "<error.message>"
}
```

---

# 3. Check Favorite

### METHOD

GET

### API

http://localhost:5000/api/customer/favorites/:productId

### REQUEST

Headers:

```text
Authorization: Bearer <CUSTOMER_TOKEN>
```

URL params:

```text
productId = product id (digits only)
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "product_id": 1,
  "is_favorite": true
}
```

Error `400`:

```json
{
  "success": false,
  "message": "Invalid product ID"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to check favorite",
  "error": "<error.message>"
}
```

---

# 4. Remove Favorite

### METHOD

DELETE

### API

http://localhost:5000/api/customer/favorites/:productId

### REQUEST

Headers:

```text
Authorization: Bearer <CUSTOMER_TOKEN>
```

URL params:

```text
productId = product id (digits only)
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "message": "Product removed from favorites"
}
```

Error `400`:

```json
{
  "success": false,
  "message": "Invalid product ID"
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Product is not in favorites"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to remove product from favorites",
  "error": "<error.message>"
}
```

---

# 7. Customer Cart APIs

All cart routes use `customerAuthMiddleware`.  
`customer_id` is taken from the JWT (`req.customer.id`), never from the request body.

---

# 1. Add Product Variant To Cart

### METHOD

POST

### API

http://localhost:5000/api/customer/cart

### REQUEST

Headers:

```text
Authorization: Bearer <CUSTOMER_TOKEN>
Content-Type: application/json
```

Body:

```json
{
  "product_id": 1,
  "variant_id": 1,
  "quantity": 2
}
```

Notes from controller:

- `product_id`, `variant_id`, `quantity` must be positive integers
- Product and category must be `ACTIVE`
- Quantity cannot exceed `product_variants.stock`
- If the same variant already exists in the cart, quantity is increased (`200`)
- New cart item returns `201`

### RESPONSE

Success `201` (new item):

```json
{
  "success": true,
  "message": "Product variant added to cart successfully",
  "cart_item": {
    "id": 1,
    "product_id": 1,
    "variant_id": 1,
    "color": "Red",
    "size": "M",
    "quantity": 2
  }
}
```

Success `200` (existing item quantity updated):

```json
{
  "success": true,
  "message": "Cart quantity updated successfully",
  "cart_item": {
    "id": 1,
    "product_id": 1,
    "variant_id": 1,
    "color": "Red",
    "size": "M",
    "quantity": 3
  }
}
```

Error `400` (validation):

```json
{
  "success": false,
  "message": "product_id, variant_id and a valid quantity are required"
}
```

Error `400` (product inactive):

```json
{
  "success": false,
  "message": "This product is not available"
}
```

Error `400` (category inactive):

```json
{
  "success": false,
  "message": "This product category is not available"
}
```

Error `400` (out of stock; color/size come from the selected variant):

```json
{
  "success": false,
  "message": "Selected Red / M variant is out of stock"
}
```

Error `400` (quantity greater than stock):

```json
{
  "success": false,
  "message": "Only 5 item(s) available for Red / M"
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Product or selected variant not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to add product to cart",
  "error": "<error.message>"
}
```

---

# 2. Get Customer Cart

### METHOD

GET

### API

http://localhost:5000/api/customer/cart

### REQUEST

Headers:

```text
Authorization: Bearer <CUSTOMER_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "cart": {
    "items": [
      {
        "cart_item_id": 1,
        "product_id": 1,
        "variant_id": 1,
        "product_name": "Summer Dress",
        "color": "Red",
        "size": "M",
        "image": null,
        "price": 1999,
        "quantity": 2,
        "available_stock": 5,
        "subtotal": "3998.00"
      }
    ],
    "item_count": 1,
    "total_quantity": 2,
    "subtotal": "3998.00",
    "total": "3998.00"
  }
}
```

Notes from controller:

- `price` is `Number(item.price)`
- `subtotal` / `total` are strings from `.toFixed(2)`
- Empty cart still returns this object with `items: []`, `item_count: 0`, `total_quantity: 0`, `subtotal: "0.00"`, `total: "0.00"`

Error `500`:

```json
{
  "success": false,
  "message": "Failed to fetch cart",
  "error": "<error.message>"
}
```

---

# 3. Update Cart Item Quantity

### METHOD

PUT

### API

http://localhost:5000/api/customer/cart/items/:itemId

### REQUEST

Headers:

```text
Authorization: Bearer <CUSTOMER_TOKEN>
Content-Type: application/json
```

URL params:

```text
itemId = customer_cart_items.id
```

Body:

```json
{
  "quantity": 3
}
```

Notes from controller:

- `itemId` must be a positive integer
- `quantity` must be a positive integer
- Ownership is checked: cart item must belong to the logged-in customer

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "message": "Cart quantity updated successfully",
  "cart_item": {
    "id": 1,
    "product_id": 1,
    "variant_id": 1,
    "color": "Red",
    "size": "M",
    "quantity": 3
  }
}
```

Error `400` (item id):

```json
{
  "success": false,
  "message": "Invalid cart item ID"
}
```

Error `400` (quantity):

```json
{
  "success": false,
  "message": "Quantity must be a positive integer"
}
```

Error `400` (product inactive):

```json
{
  "success": false,
  "message": "This product is no longer available"
}
```

Error `400` (category inactive):

```json
{
  "success": false,
  "message": "This product category is no longer available"
}
```

Error `400` (out of stock):

```json
{
  "success": false,
  "message": "Selected Red / M variant is out of stock"
}
```

Error `400` (too many):

```json
{
  "success": false,
  "message": "Only 5 item(s) available for Red / M"
}
```

Error `404` (cart item):

```json
{
  "success": false,
  "message": "Cart item not found"
}
```

Error `404` (variant):

```json
{
  "success": false,
  "message": "Product variant not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to update cart quantity",
  "error": "<error.message>"
}
```

---

# 4. Remove Cart Item

### METHOD

DELETE

### API

http://localhost:5000/api/customer/cart/items/:itemId

### REQUEST

Headers:

```text
Authorization: Bearer <CUSTOMER_TOKEN>
```

URL params:

```text
itemId = customer_cart_items.id
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "message": "Product variant removed from cart"
}
```

Error `400`:

```json
{
  "success": false,
  "message": "Invalid cart item ID"
}
```

Error `404`:

```json
{
  "success": false,
  "message": "Cart item not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to remove cart item",
  "error": "<error.message>"
}
```

---

# 8. Customer Order APIs

All customer order routes use `customerAuthMiddleware`.

---

# 1. Create Order From Cart

### METHOD

POST

### API

http://localhost:5000/api/customer/orders

### REQUEST

Headers:

```text
Authorization: Bearer <CUSTOMER_TOKEN>
Content-Type: application/json
```

Body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "9876543210",
  "shipping_address": "12 Main Street"
}
```

Notes from controller:

- Required: `name`, `email`, `phone`, `shipping_address`
- `name` min length `2`
- `email` trimmed and lowercased, regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- `shipping_address` min length `5`
- Cart must have at least one item
- Product and category must be `ACTIVE`
- Quantity cannot exceed variant stock
- `order_id` is generated as `ORD-<Date.now()>`
- Order status is `PENDING`
- Variant stock is reduced
- Customer cart items are cleared after success
- Price/total are calculated from the database, not from the request body

### RESPONSE

Success `201`:

```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "id": 1,
    "order_id": "ORD-1710000000000",
    "customer": {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "9876543210"
    },
    "shipping_address": "12 Main Street",
    "items": [
      {
        "product_id": 1,
        "variant_id": 1,
        "color": "Red",
        "size": "M",
        "product_name": "Summer Dress",
        "price": 1999,
        "quantity": 2,
        "subtotal": "3998.00"
      }
    ],
    "total_amount": "3998.00",
    "order_status": "PENDING"
  }
}
```

Error `400` (required):

```json
{
  "success": false,
  "message": "Name, email, phone and shipping address are required"
}
```

Error `400` (name):

```json
{
  "success": false,
  "message": "Name must be at least 2 characters"
}
```

Error `400` (email):

```json
{
  "success": false,
  "message": "Please enter a valid email address"
}
```

Error `400` (phone):

```json
{
  "success": false,
  "message": "Phone number is required"
}
```

Error `400` (address):

```json
{
  "success": false,
  "message": "Shipping address must be at least 5 characters"
}
```

Error `400` (empty cart):

```json
{
  "success": false,
  "message": "Your cart is empty"
}
```

Error `400` (inactive product; product name comes from cart):

```json
{
  "success": false,
  "message": "Summer Dress is no longer available"
}
```

Error `400` (inactive category):

```json
{
  "success": false,
  "message": "Summer Dress category is no longer available"
}
```

Error `400` (out of stock):

```json
{
  "success": false,
  "message": "Summer Dress (Red / M) is out of stock"
}
```

Error `400` (quantity greater than stock):

```json
{
  "success": false,
  "message": "Only 5 Summer Dress (Red / M) available"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to place order",
  "error": "<error.message>"
}
```

---

# 2. Get My Orders

### METHOD

GET

### API

http://localhost:5000/api/customer/orders

### REQUEST

Headers:

```text
Authorization: Bearer <CUSTOMER_TOKEN>
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "count": 1,
  "orders": [
    {
      "id": 1,
      "order_id": "ORD-1710000000000",
      "customer_name": "Jane Doe",
      "customer_email": "jane@example.com",
      "customer_phone": "9876543210",
      "shipping_address": "12 Main Street",
      "total_amount": "3998.00",
      "order_status": "PENDING",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

Note from model: filtered by `orders.customer_id`, ordered by `created_at DESC`. This list does **not** include items.

Error `500`:

```json
{
  "success": false,
  "message": "Failed to fetch orders",
  "error": "<error.message>"
}
```

---

# 3. Get One My Order

### METHOD

GET

### API

http://localhost:5000/api/customer/orders/:id

### REQUEST

Headers:

```text
Authorization: Bearer <CUSTOMER_TOKEN>
```

URL params:

```text
id = orders.id (digits only, numeric database id)
```

Body:

```json
null
```

### RESPONSE

Success `200`:

```json
{
  "success": true,
  "order": {
    "id": 1,
    "customer_id": 1,
    "order_id": "ORD-1710000000000",
    "customer_name": "Jane Doe",
    "customer_email": "jane@example.com",
    "customer_phone": "9876543210",
    "shipping_address": "12 Main Street",
    "total_amount": "3998.00",
    "order_status": "PENDING",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z",
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "variant_id": 1,
        "variant_color": "Red",
        "variant_size": "M",
        "product_name": "Summer Dress",
        "price": "1999.00",
        "quantity": 2,
        "subtotal": "3998.00",
        "created_at": "2026-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

Error `400`:

```json
{
  "success": false,
  "message": "Invalid order ID"
}
```

Error `404` (not found or not owned by this customer):

```json
{
  "success": false,
  "message": "Order not found"
}
```

Error `500`:

```json
{
  "success": false,
  "message": "Failed to fetch order",
  "error": "<error.message>"
}
```

---

# 9. Any other actual Customer API

No other customer routes are mounted in `server.js`.

Mounted customer prefixes:

```text
/api/customer/auth
/api/customer/profile
/api/customer/favorites
/api/customer/cart
/api/customer/orders
```

There is no customer logout, password-reset, address-book, payment, coupon, or cancel-order API in the current backend.

---

# Route map from server.js

```text
/api/admin/auth          → admin/routes/authRoutes.js
/api/admin/categories    → admin/routes/categoryRoutes.js
/api/admin/products      → admin/routes/productRoutes.js
/api/admin/offers        → admin/routes/offerRoutes.js
/api/admin/orders        → admin/routes/orderRoutes.js
/api/admin/analytics     → admin/routes/analyticsRoutes.js
/api/admin/dashboard     → admin/routes/dashboardRoutes.js
/api/admin/inventory     → admin/routes/inventoryRoutes.js
/api/admin/customers     → admin/routes/customerRoutes.js
/api/public/products     → public/routes/productRoutes.js
/api/public/offers       → public/routes/offerRoutes.js
/api/customer/auth       → customer/routes/customerauthRoutes.js
/api/customer/profile    → customer/routes/profileRoutes.js
/api/customer/favorites  → customer/routes/favoriteRoutes.js
/api/customer/cart       → customer/routes/cartRoutes.js
/api/customer/orders     → customer/routes/orderRoutes.js
```
