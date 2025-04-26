-- DigiSchool SPP Payment System SQL Dump

-- Drop tables if they exist
DROP TABLE IF EXISTS pembayaran;
DROP TABLE IF EXISTS tagihan;
DROP TABLE IF EXISTS siswa;
DROP TABLE IF EXISTS kelas;
DROP TABLE IF EXISTS tahun_ajaran;
DROP TABLE IF EXISTS users;

-- Create tables
CREATE TABLE tahun_ajaran (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(20) NOT NULL,
  nominal_spp DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE kelas (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(50) NOT NULL,
  tingkat VARCHAR(20) NOT NULL,
  wali_kelas VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE siswa (
  id SERIAL PRIMARY KEY,
  nis VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(100) NOT NULL,
  jenis_kelamin CHAR(1) CHECK (jenis_kelamin IN ('L', 'P')),
  alamat TEXT,
  tanggal_lahir DATE,
  no_hp VARCHAR(20),
  email VARCHAR(100),
  kelas_id INTEGER REFERENCES kelas(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tagihan (
  id SERIAL PRIMARY KEY,
  siswa_id INTEGER REFERENCES siswa(id),
  tahun_ajaran_id INTEGER REFERENCES tahun_ajaran(id),
  bulan VARCHAR(20) NOT NULL,
  nominal DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  tanggal_jatuh_tempo DATE NOT NULL,
  keterangan TEXT,
  midtrans_transaction_id VARCHAR(100),
  midtrans_status VARCHAR(50),
  midtrans_payment_type VARCHAR(50),
  midtrans_transaction_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pembayaran (
  id SERIAL PRIMARY KEY,
  tagihan_id INTEGER REFERENCES tagihan(id) UNIQUE,
  tanggal_bayar TIMESTAMP NOT NULL,
  metode_pembayaran VARCHAR(50) NOT NULL,
  jumlah_bayar DECIMAL(10, 2) NOT NULL,
  bukti_pembayaran TEXT,
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff', 'student')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert dummy data
-- Insert tahun ajaran
INSERT INTO tahun_ajaran (nama, nominal_spp) VALUES 
  ('2022/2023', 500000),
  ('2023/2024', 550000),
  ('2024/2025', 600000);

-- Insert kelas
INSERT INTO kelas (nama, tingkat, wali_kelas) VALUES 
  ('10-A', '10', 'Budi Santoso'),
  ('10-B', '10', 'Siti Aminah'),
  ('11-A', '11', 'Joko Widodo'),
  ('11-B', '11', 'Mega Wati'),
  ('12-A', '12', 'Susilo Bambang'),
  ('12-B', '12', 'Prabowo Subianto');

-- Insert siswa
INSERT INTO siswa (nis, nama, jenis_kelamin, alamat, tanggal_lahir, no_hp, email, kelas_id)
VALUES
  ('100001', 'Ahmad Rizky', 'L', 'Jl. Pendidikan No. 1', '2005-01-01', '081234567890', 'ahmad@example.com', 1),
  ('100002', 'Budi Setiawan', 'L', 'Jl. Pendidikan No. 2', '2005-02-15', '081234567891', 'budi@example.com', 1),
  ('100003', 'Citra Dewi', 'P', 'Jl. Pendidikan No. 3', '2005-03-20', '081234567892', 'citra@example.com', 1),
  ('100004', 'Dian Sastro', 'P', 'Jl. Pendidikan No. 4', '2005-04-10', '081234567893', 'dian@example.com', 2),
  ('100005', 'Eko Prasetyo', 'L', 'Jl. Pendidikan No. 5', '2005-05-05', '081234567894', 'eko@example.com', 2),
  ('110001', 'Fani Wijaya', 'P', 'Jl. Pendidikan No. 6', '2004-06-15', '081234567895', 'fani@example.com', 3),
  ('110002', 'Galih Pratama', 'L', 'Jl. Pendidikan No. 7', '2004-07-20', '081234567896', 'galih@example.com', 3),
  ('110003', 'Hana Safira', 'P', 'Jl. Pendidikan No. 8', '2004-08-25', '081234567897', 'hana@example.com', 4),
  ('110004', 'Irfan Hakim', 'L', 'Jl. Pendidikan No. 9', '2004-09-30', '081234567898', 'irfan@example.com', 4),
  ('120001', 'Jihan Aulia', 'P', 'Jl. Pendidikan No. 10', '2003-10-05', '081234567899', 'jihan@example.com', 5),
  ('120002', 'Kevin Julio', 'L', 'Jl. Pendidikan No. 11', '2003-11-10', '081234567800', 'kevin@example.com', 5),
  ('120003', 'Lina Cantika', 'P', 'Jl. Pendidikan No. 12', '2003-12-15', '081234567801', 'lina@example.com', 6);

-- Insert admin user (password: admin123)
INSERT INTO users (username, password, name, role)
VALUES ('admin', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', 'Administrator', 'admin');
