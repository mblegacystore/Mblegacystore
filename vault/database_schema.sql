-- =====================================================
-- PANGKALAN DATA MB LEGACY STORE
-- Cetak Biru untuk Simpanan Rekod Transaksi & Pelanggan
-- Akan Diaktifkan di Mainnet
-- =====================================================

-- Jadual: Pelanggan
CREATE TABLE pelanggan (
    id_pelanggan INT PRIMARY KEY AUTO_INCREMENT,
    username_pi VARCHAR(100) UNIQUE NOT NULL,
    alamat_dompet VARCHAR(200) UNIQUE NOT NULL,
    tarikh_daftar TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jadual: Transaksi
CREATE TABLE transaksi (
    id_transaksi INT PRIMARY KEY AUTO_INCREMENT,
    id_pelanggan INT NOT NULL,
    jumlah_pi DECIMAL(10,4) NOT NULL,
    jenis_produk VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'selesai',
    tarikh_transaksi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pelanggan) REFERENCES pelanggan(id_pelanggan)
);

-- Jadual: Dompet Amanah
CREATE TABLE dompet_amanah (
    id_amanah INT PRIMARY KEY AUTO_INCREMENT,
    id_transaksi INT NOT NULL,
    jumlah_amanah DECIMAL(10,4) NOT NULL,
    kadar_amanah DECIMAL(4,2) DEFAULT 0.25,
    tarikh_rekod TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_transaksi) REFERENCES transaksi(id_transaksi)
);

-- Indeks untuk Prestasi Carian
CREATE INDEX idx_pelanggan ON pelanggan(username_pi);
CREATE INDEX idx_transaksi ON transaksi(tarikh_transaksi);

-- =====================================================
-- Nota: Kod ini akan diaktifkan apabila pangkalan data
-- disediakan di Mainnet. Untuk semakan CEO sahaja.
-- =====================================================
