CREATE DATABASE IF NOT EXISTS alumniconnect_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE alumniconnect_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'alumni') NOT NULL DEFAULT 'alumni',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alumni_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  phone VARCHAR(30) NULL,
  gender VARCHAR(20) NULL,
  department VARCHAR(100) NULL,
  graduation_year YEAR NULL,
  cgpa DECIMAL(3,2) NULL,
  degree_program VARCHAR(100) NULL,
  employment_status VARCHAR(50) NULL,
  company VARCHAR(150) NULL,
  job_title VARCHAR(100) NULL,
  skills TEXT NULL,
  linkedin VARCHAR(255) NULL,
  bio TEXT NULL,
  contact_visible TINYINT(1) NOT NULL DEFAULT 0,
  profile_image VARCHAR(255) NULL,
  resume VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_alumni_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
