# Customer Management & Messaging API Documentation

This document describes the RESTful API endpoints for customer management and messaging in the Smart Business AI Assistant backend.

## Authentication

All endpoints require authentication. Vendors can only access and manage their own customers.

---

## Customer CRUD Endpoints

### Create Customer

- **POST** `/api/customers`
- **Body:**
  ```json
  {
    "name": "string",
    "email": "string (optional)",
    "phone": "string (optional)",
    "notes": "string (optional)"
  }
  ```
- **Response:**
  - `201 Created` with created customer object

### Get All Customers

- **GET** `/api/customers`
- **Response:**
  - `200 OK` with `{ data: [Customer, ...] }`

### Get Single Customer

- **GET** `/api/customers/:id`
- **Response:**
  - `200 OK` with customer object
  - `404 Not Found` if not found or not owned by vendor

### Update Customer

- **PUT** `/api/customers/:id`
- **Body:** (any updatable fields)
  ```json
  {
    "name": "string",
    "email": "string (optional)",
    "phone": "string (optional)",
    "notes": "string (optional)"
  }
  ```
- **Response:**
  - `200 OK` with updated customer object
  - `404 Not Found` if not found or not owned by vendor

### Delete Customer

- **DELETE** `/api/customers/:id`
- **Response:**
  - `204 No Content` on success
  - `404 Not Found` if not found or not owned by vendor

---

## Customer Messaging Endpoints

### Send Message to Single Customer

- **POST** `/api/customers/:id/message`
- **Body:**
  ```json
  {
    "message": "string"
  }
  ```
- **Response:**
  - `200 OK` with `{ success: true }`
  - `404 Not Found` if customer not found or not owned by vendor

### Send Message to Multiple Customers

- **POST** `/api/customers/message`
- **Body:**
  ```json
  {
    "customerIds": ["id1", "id2", ...],
    "message": "string"
  }
  ```
- **Response:**
  - `200 OK` with `{ success: true, sent: number }`

---

## Error Responses

- All errors return JSON with `{ message: string }` and appropriate HTTP status code.

---

## Notes

- All endpoints are protected and scoped to the authenticated vendor.
- Only the owner/vendor can access or modify their customers.
- Messaging endpoints may be rate-limited or audited for abuse.

---

For further details, see inline comments in the backend route/controller files.
