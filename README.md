# قالب اختصاصی پاسارگارد، مرزبان و مرزنشین اورانوس | Ourenus

## Desktop View
<img width="1458" alt="image" src="https://github.com/user-attachments/assets/49983ceb-fefd-4a35-a488-4202dc7bd353">

## Responsive Mobile View
![image](https://github.com/user-attachments/assets/9a0605e4-f339-4a79-86f5-5aadd4fee9d9)

---

## ساخته شده با
- **React**: Version 18
- **Vite**: Version 7
- **Material UI**: Version 6
- **Recharts**

---

## ویژگی‌ها
- 🚀 **پشتیبانی از پنل پاسارگارد، مرزبان و مرزنشین**: سازگاری کامل با معماری و API جدید پنل پاسارگارد (Pasarguard) و APIهای پیشین.
- 📊 **نمودار پیشرفته مصرف ترافیک (Usage Chart)**:
  - قابلیت انتخاب بازه‌های زمانی مختلف (**۲۴ ساعت گذشته، ۷ روز، ۳۰ روز، ۱۲ ماه و کل مصرف**).
  - پشتیبانی از دو حالت نمایش گرافیکی **ناحیه‌ای (Area Chart)** و **میله‌ای (Bar Chart)**.
  - نمایش خلاصه‌آمار هوشمند: **کل مصرف**، **میانگین مصرف** (ساعتی / روزانه / ماهانه) و **پیک مصرف** (بیشترین میزان استفاده).
  - مدیریت هوشمند وضعیت کاربر (قفل شدن و پیام اختصاصی برای وضعیت `On-Hold` یا بدون مصرف).
  - تشخیص خودکار نوع پنل (عدم نمایش نمودار برای پنل‌های قدیمی فاقد API لاگ مصرف).
- 📱 **لیست اپلیکیشن‌ها**: لیست کامل و هوشمند کانفیگ‌ها و اپ‌های متناسب با سیستم‌عامل کاربر.
- 👤 **اطلاعات دقیق کاربر و وضعیت سرویس**: نمایش زنده حجم مصرفی، حجم باقیمانده، زمان انقضا و وضعیت سرویس با رنگ‌بندی داینامیک.
- 🔑 **مدیریت کانفیگ**: دریافت لیست کانفیگ‌ها، کپی گروهی و تولید QR Code اختصاصی برای هر اتصال.
- 🌐 **چندزبانه (i18n)**: پشتیبانی کامل از زبان‌های فارسی، انگلیسی و روسی.
- 🎨 **طراحی مدرن Glassmorphism**: هماهنگی کامل در هر دو تم تاریک (Dark Mode) و روشن (Light Mode).
- ⚡ **تک فایلی (Single File)**: خروجی بهینه و سبک با قابلیت نصب روی هر وب‌سرور یا مستقیم روی پنل‌ها.

---

## مراحل نصب

### پاسارگارد (Pasarguard)

۱. **قالب را با دستور زیر دانلود کنید:**
   ```sh
   sudo wget -N -P /var/lib/pasarguard/templates/subscription/ https://github.com/MatinDehghanian/Ourenus/releases/latest/download/index.html
   ```

۲. **دستورات زیر را در ترمینال سرور خود وارد کنید:**
   ```sh
   echo 'CUSTOM_TEMPLATES_DIRECTORY="/var/lib/pasarguard/templates/"' | sudo tee -a /opt/pasarguard/.env
   echo 'SUBSCRIPTION_PAGE_TEMPLATE="subscription/index.html"' | sudo tee -a /opt/pasarguard/.env
   ```
   یا مقادیر زیر را در فایل `.env` در مسیر `/opt/pasarguard` با حذف `#` از حالت کامنت خارج کنید:
   ```env
   CUSTOM_TEMPLATES_DIRECTORY="/var/lib/pasarguard/templates/"
   SUBSCRIPTION_PAGE_TEMPLATE="subscription/index.html"
   ```

۳. **ریستارت کردن پاسارگارد:**
   ```sh
   pasarguard restart
   ```

---

### مرزبان (Marzban)

۱. **قالب را با دستور زیر دانلود کنید:**
   ```sh
   sudo wget -N -P /var/lib/marzban/templates/subscription/ https://github.com/MatinDehghanian/Ourenus/releases/latest/download/index.html
   ```

۲. **دستورات زیر را در ترمینال سرور خود وارد کنید:**
   ```sh
   echo 'CUSTOM_TEMPLATES_DIRECTORY="/var/lib/marzban/templates/"' | sudo tee -a /opt/marzban/.env
   echo 'SUBSCRIPTION_PAGE_TEMPLATE="subscription/index.html"' | sudo tee -a /opt/marzban/.env
   ```
   یا مقادیر زیر را در فایل `.env` در مسیر `/opt/marzban` از حالت کامنت خارج کنید:
   ```env
   CUSTOM_TEMPLATES_DIRECTORY="/var/lib/marzban/templates/"
   SUBSCRIPTION_PAGE_TEMPLATE="subscription/index.html"
   ```

۳. **ریستارت کردن مرزبان:**
   ```sh
   marzban restart
   ```

---

### مرزنشین (Marzneshin)

۱. **قالب را با دستور زیر دانلود کنید:**
   ```sh
   sudo wget -N -P /var/lib/marzneshin/templates/subscription/ https://github.com/MatinDehghanian/Ourenus/releases/latest/download/index.html
   ```

۲. **دستورات زیر را در ترمینال سرور خود وارد کنید:**
   ```sh
   echo 'CUSTOM_TEMPLATES_DIRECTORY="/var/lib/marzneshin/templates/"' | sudo tee -a /etc/opt/marzneshin/.env
   echo 'SUBSCRIPTION_PAGE_TEMPLATE="subscription/index.html"' | sudo tee -a /etc/opt/marzneshin/.env
   ```
   یا مقادیر زیر را در فایل `.env` در مسیر `/etc/opt/marzneshin` از حالت کامنت خارج کنید:
   ```env
   CUSTOM_TEMPLATES_DIRECTORY="/var/lib/marzneshin/templates/"
   SUBSCRIPTION_PAGE_TEMPLATE="subscription/index.html"
   ```

۳. **ریستارت کردن مرزنشین:**
   ```sh
   marzneshin restart
   ```

---

## بروزرسانی قالب
برای بروزرسانی به آخرین نسخه، کافیست دستور دانلود (مرحله ۱) را مجدداً اجرا کرده و سپس پنل را ریستارت کنید.

---

## شخصی سازی
برای شخصی‌سازی لیست اپلیکیشن‌ها و اطلاعات پشتیبانی:
- **لیست اپ‌ها**: [public-assets Apps JSON](https://github.com/MatinDehghanian/public-assets/blob/main/json/apps.json)
- ریپازیتوری را فورک کرده و لینک فایل JSON، لوگو یا نام برند خود را در متغیرهای محیطی (`.env`) تنظیم کنید.

**ویدیوهای آموزشی**:  
[![YouTube Tutorial Video](https://img.youtube.com/vi/l5Pvy6Hof9o/0.jpg)](https://www.youtube.com/watch?v=l5Pvy6Hof9o)
[![YouTube Tutorial Video #2](https://img.youtube.com/vi/6s8931r9E24/0.jpg)](https://youtu.be/6s8931r9E24)

---

## حمایت و سفارشات
برای ارتباط، پشتیبانی یا سفارش قالب اختصاصی در تلگرام: [Telegram @Mqtin](https://t.me/Mqtin).

<a href="https://nowpayments.io/donation?api_key=Z50AKDD-DHSMN86-P0DQ22X-1SQAFCA" target="_blank" rel="noreferrer noopener">
    <img src="https://nowpayments.io/images/embeds/donation-button-black.svg" alt="Crypto donation button by NOWPayments">
</a>

---

# Ourenus Subscription Template

A modern, responsive, and feature-rich subscription page template for **Pasarguard**, **Marzban**, and **Marzneshin**.

## Features
- **Pasarguard & Multi-Panel Compatibility**: Full native support for Pasarguard's new API alongside legacy Marzban/Marzneshin formats.
- **Interactive Usage Chart**:
  - Multiple time period views (**24H, 7D, 30D, 12M, All**).
  - Switchable **Area** and **Bar** chart formats.
  - Comprehensive usage stats summary (**Total Usage**, **Average Usage**, **Peak Usage**).
  - Smart status lock for on-hold/zero-traffic users.
  - Auto-hides when connecting to panels without usage logging API.
- **Dynamic User & Service Info**: Real-time traffic, remaining time, and dynamic status badges.
- **Application Setup Guides**: OS-tailored software recommendations with one-click import.
- **Config Management**: Direct copy and individual QR codes for all proxies.
- **Multi-Language**: Persian, English, and Russian out of the box.
- **Dark & Light Modes**: Glassmorphic theme built on Material UI and customized palette tokens.

---

## Installation Steps

### For Pasarguard

1. **Download the Template:**
   ```sh
   sudo wget -N -P /var/lib/pasarguard/templates/subscription/ https://github.com/MatinDehghanian/Ourenus/releases/latest/download/index.html
   ```

2. **Configure Environment in `/opt/pasarguard/.env`:**
   ```sh
   echo 'CUSTOM_TEMPLATES_DIRECTORY="/var/lib/pasarguard/templates/"' | sudo tee -a /opt/pasarguard/.env
   echo 'SUBSCRIPTION_PAGE_TEMPLATE="subscription/index.html"' | sudo tee -a /opt/pasarguard/.env
   ```

3. **Restart Pasarguard:**
   ```sh
   pasarguard restart
   ```

---

### For Marzban

1. **Download the Template:**
   ```sh
   sudo wget -N -P /var/lib/marzban/templates/subscription/ https://github.com/MatinDehghanian/Ourenus/releases/latest/download/index.html
   ```

2. **Configure Environment in `/opt/marzban/.env`:**
   ```sh
   echo 'CUSTOM_TEMPLATES_DIRECTORY="/var/lib/marzban/templates/"' | sudo tee -a /opt/marzban/.env
   echo 'SUBSCRIPTION_PAGE_TEMPLATE="subscription/index.html"' | sudo tee -a /opt/marzban/.env
   ```

3. **Restart Marzban:**
   ```sh
   marzban restart
   ```

---

### For Marzneshin

1. **Download the Template:**
   ```sh
   sudo wget -N -P /var/lib/marzneshin/templates/subscription/ https://github.com/MatinDehghanian/Ourenus/releases/latest/download/index.html
   ```

2. **Configure Environment in `/etc/opt/marzneshin/.env`:**
   ```sh
   echo 'CUSTOM_TEMPLATES_DIRECTORY="/var/lib/marzneshin/templates/"' | sudo tee -a /etc/opt/marzneshin/.env
   echo 'SUBSCRIPTION_PAGE_TEMPLATE="subscription/index.html"' | sudo tee -a /etc/opt/marzneshin/.env
   ```

3. **Restart Marzneshin:**
   ```sh
   marzneshin restart
   ```
