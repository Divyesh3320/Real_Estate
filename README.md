# 🏠 Property Buy/Sell/Rent Platform

A modern, full-stack real estate web platform that allows users to **buy, sell, or rent** properties with advanced filtering, dynamic property listings, secure authentication, and admin-level management. Built using **React.js**, **.NET Core Web API**, **SQL Server**, and styled with **Bootstrap 5** for a clean, responsive UI.

---

## 🔑 Key Features

### 👤 User Side
- **Responsive Design**: Built with Bootstrap 5 for mobile-first, cross-device compatibility.
- **Advanced Filtering**:
  - Filter by **Purpose** (Buy/Rent)
  - Filter by **City** (across Gujarat)
  - Filter by **Property Type/Subtype**
  - Filter by **Price Range**
    
<table>
  <tr>
    <td><img src="https://res.cloudinary.com/dfojntght/image/upload/v1752752352/Screenshot_2025-07-17_170822_horwug.png" alt="Admin Dashboard" width="300" height="200" /></td>
    <td><img src="https://res.cloudinary.com/dfojntght/image/upload/v1752752352/Screenshot_2025-07-17_170822_horwug.png" alt="Admin Dashboard" width="300" height="200" /></td>
    <td><img src="https://res.cloudinary.com/dfojntght/image/upload/v1752752352/Screenshot_2025-07-17_170822_horwug.png" alt="Admin Dashboard" width="300" height="200" /></td>
  </tr>
</table>

- **Dynamic Property Posting**:
  - Add detailed property info including:
    - Property Type & Subtype
    - Location
    - Price
    - Features
    - Contact Details
    - Property Images (stored in **Cloudinary**)
- **Property Listing UI**:
  - Cleanly styled cards
  - Images, prices, and key specifications displayed
  - Mobile-friendly responsive layout

### 🛠️ Admin Side
- **Admin Dashboard**:
  - View all registered users
  - Access and manage all posted properties
  - Full CRUD operations on any property listing
- **Authentication System**:
  - Secure login system with **email/password**
  - Role-based access control for Admin and User

---

## 🧰 Tech Stack

| Layer         | Technology                        |
|---------------|-----------------------------------|
| **Frontend**  | React.js, Bootstrap, HTML, CSS    |
| **Backend**   | .NET Core Web API (.NET 6/7)       |
| **Database**  | SQL Server                        |
| **Cloud**     | Cloudinary (for images) |
| **Auth**      | JWT-based secure login            |


