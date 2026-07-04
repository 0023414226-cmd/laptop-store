# Website Thương mại Điện tử bán Laptop - Next.js 15, Prisma & Docker

Dự án Website thương mại điện tử chuyên nghiệp bán Laptop, được thiết kế theo cấu trúc **Clean Architecture** chuẩn Production. Hệ thống hỗ trợ đa vai trò (Guest, User, Admin) với đầy đủ các nghiệp vụ lọc cấu hình chi tiết (CPU, RAM, GPU), đặt hàng, xử lý giỏ hàng, mã giảm giá và báo cáo doanh thu quản trị.

---

## 🛠️ Công nghệ sử dụng

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend & APIs**: Next.js API Routes, NextAuth.js (Auth.js v4) với JWT, Zod Validation.
- **Database ORM**: Prisma ORM kết nối cơ sở dữ liệu **PostgreSQL**.
- **State Management**: Zustand (lưu trữ Cart, Wishlist, Filter bền vững qua LocalStorage).
- **Dockerization**: Multi-stage `Dockerfile` tối ưu hóa dung lượng (Standalone mode), `docker-compose.yml` kết hợp PostgreSQL & Node.js.
- **CI/CD**: GitHub Actions tự động build, test, đóng gói Docker Image, push lên Registry và SSH deploy tự động lên Ubuntu Server.

---

## 📁 Cấu trúc thư mục dự án

```text
├── .github/workflows/       # Cấu hình GitHub Actions CI/CD
├── app/                     # Next.js App Router (Pages & API Routes)
│   ├── api/                 # REST API endpoints (products, orders, auth, admin stats)
│   ├── admin/               # Trang quản trị (Dashboard, Products, Orders, Users)
│   ├── cart/                # Trang giỏ hàng
│   ├── checkout/            # Trang đặt hàng & thanh toán
│   ├── login/               # Trang đăng nhập
│   ├── register/            # Trang đăng ký thành viên
│   ├── products/            # Danh sách laptop & chi tiết laptop
│   ├── profile/             # Báo cáo cá nhân & Lịch sử mua hàng
│   ├── layout.tsx           # Layout dùng chung toàn hệ thống
│   └── page.tsx             # Trang chủ hệ thống
├── components/              # Các UI Components tái sử dụng (Navbar, ProductCard, etc.)
├── lib/                     # Client database, NextAuth, và các Zustand stores
├── prisma/                  # Schema định nghĩa 26 bảng dữ liệu và script Seed dữ liệu mẫu
├── public/                  # Các tài nguyên ảnh tĩnh
├── Dockerfile               # Tệp tin đóng gói Docker ứng dụng Next.js
├── docker-compose.yml       # Cấu hình khởi chạy nhanh Postgres và App
├── tsconfig.json            # Cấu hình TypeScript compiler
└── README.md                # Tài liệu hướng dẫn dự án
```

---

## ⚙️ Cấu hình môi trường (.env)

Sao chép tệp cấu hình mẫu và chỉnh sửa các giá trị kết nối:
```bash
cp .env.example .env
```
Các tham số cấu hình chính:
- `DATABASE_URL`: Đường dẫn kết nối cơ sở dữ liệu PostgreSQL.
- `NEXTAUTH_SECRET` & `JWT_SECRET`: Khóa mã hóa phiên đăng nhập JWT.
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Khóa tích hợp Google Login.

---

## 🚀 Khởi chạy trên môi trường cục bộ (Local Development)

### Bước 1: Cài đặt các thư viện phụ thuộc
```bash
npm install
```

### Bước 2: Tạo Cơ sở dữ liệu & Seed dữ liệu mẫu
Khởi tạo cơ sở dữ liệu PostgreSQL của bạn, cấu hình biến `DATABASE_URL` trong tệp `.env`, sau đó chạy:
```bash
# Đồng bộ hóa Prisma Schema vào Database
npx prisma migrate dev --name init

# Nạp dữ liệu sản phẩm Laptop, Thương hiệu, Admin mặc định
npx prisma db seed
```

Tài khoản đăng nhập mặc định:
- **Tài khoản Quản trị (Admin)**: `admin@laptop.com` / Mật khẩu: `Admin@123`
- **Tài khoản Thành viên (User)**: `user@laptop.com` / Mật khẩu: `User@123`

### Bước 3: Khởi chạy môi trường Dev
```bash
npm run dev
```
Truy cập vào trang chủ: `http://localhost:3000`

---

## 🐳 Khởi chạy nhanh bằng Docker & Docker Compose

Ứng dụng đã được cấu hình trọn gói bao gồm Database PostgreSQL và Next.js app, chỉ cần chạy lệnh sau ở thư mục gốc:

```bash
# Khởi chạy các container ngầm
docker compose up -d
```

Sau khi các container khởi động hoàn tất, chạy lệnh sau để tự động tạo bảng và nạp dữ liệu mẫu vào cơ sở dữ liệu bên trong container:
```bash
docker exec -it laptop-next-app npx prisma db push
docker exec -it laptop-next-app npx prisma db seed
```

Ứng dụng sẽ hoạt động tại địa chỉ: `http://localhost:3000`

---

## 🚢 CI/CD & Triển khai lên Ubuntu Server qua GitHub Actions

Quy trình tự động hóa được mô tả chi tiết trong [.github/workflows/deploy.yml](file:///.github/workflows/deploy.yml).

### Các bước chuẩn bị trên Ubuntu Server:
1. Đảm bảo server đã được cài đặt **Docker** và **Docker Compose**.
2. Mở cổng `80`/`3000` và cổng `5432` trên tường lửa nếu cần truy cập.

### Cấu hình Secrets trên GitHub Repository:
Để kích hoạt pipeline tự động deploy, hãy cấu hình các khóa sau trong **Settings -> Secrets and variables -> Actions** của repository:

| Tên Secret | Mô tả |
| :--- | :--- |
| `DOCKER_USERNAME` | Tài khoản Docker Hub để push ảnh |
| `DOCKER_PASSWORD` | Mật khẩu / Access Token Docker Hub |
| `SSH_HOST` | Địa chỉ IP của máy chủ Ubuntu |
| `SSH_USERNAME` | Tài khoản đăng nhập SSH (thường là `ubuntu` hoặc `root`) |
| `SSH_PRIVATE_KEY` | Khóa bảo mật Private Key dùng để SSH qua SSH-Key |
| `DB_PASSWORD` | Mật khẩu truy cập cơ sở dữ liệu Postgres trong container |
| `NEXTAUTH_SECRET` | Khóa bí mật JWT token ứng dụng |
| `NEXTAUTH_URL` | Địa chỉ tên miền trỏ về app (ví dụ: `https://laptopstore.vn`) |

Mỗi khi bạn đẩy (push) mã nguồn lên nhánh `main`, GitHub Actions sẽ tự thực hiện kiểm tra build, đóng gói Docker Image, đẩy lên Docker Hub, SSH trực tiếp vào Ubuntu Server để cập nhật và chạy lệnh migration database tự động.
