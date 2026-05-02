# =====================================================
# ENJIN AUDIT PERIBADI - MB LEGACY STORE (CEO ONLY)
# =====================================================
# Fungsi: Mengimbas transaksi dompet Pi, mengasingkan
# 25% ke Dompet Amanah, dan menjana laporan bulanan.
# Prinsip: 75% Syarikat, 25% Charity/Zakat/Cukai.
# =====================================================

import json
import os
from datetime import datetime

# --- KONFIGURASI UTAMA ---
DOMAIN_OPERASI = "GB6PP..."  # Gantikan dengan alamat dompet operasi sebenar
DOMAIN_AMANAH = "GCPIZ62LJ7IL6XD25NTZRQKMX"  # Alamat Dompet Amanah

KADAR_AMANAH = 0.25  # 25% untuk Charity/Zakat
KADAR_SYARIKAT = 0.75  # 75% untuk Syarikat

FAIL_LOG = "laporan_audit_bulanan.txt"  # Nama fail laporan

# --- FUNGSI UTAMA ---
def kira_transaksi(transaksi_list):
    """
    Menerima senarai transaksi (jumlah dalam Pi) dan mengasingkan
    mengikut nisbah yang ditetapkan.
    """
    if not transaksi_list:
        return None

    jumlah_masuk = sum(transaksi_list)
    jumlah_amanah = jumlah_masuk * KADAR_AMANAH
    jumlah_syarikat = jumlah_masuk * KADAR_SYARIKAT

    return {
        "jumlah_masuk": round(jumlah_masuk, 4),
        "jumlah_amanah": round(jumlah_amanah, 4),
        "jumlah_syarikat": round(jumlah_syarikat, 4),
    }

def jana_laporan(data_kewangan):
    """
    Menjana laporan audit bulanan dalam format teks.
    """
    if not data_kewangan:
        return "❌ Tiada data transaksi untuk diproses."

    tarikh = datetime.now().strftime("%d %B %Y, %H:%M")
    laporan = f"""
    ========================================
    LAPORAN AUDIT BULANAN - MB LEGACY STORE
    ========================================
    Tarikh: {tarikh}
    Nisbah: {int(KADAR_SYARIKAT*100)}% Syarikat / {int(KADAR_AMANAH*100)}% Amanah

    --- RINGKASAN KEWANGAN ---
    Jumlah Masuk:     {data_kewangan['jumlah_masuk']} Pi
    Ke Syarikat (75%): {data_kewangan['jumlah_syarikat']} Pi
    Ke Amanah (25%):  {data_kewangan['jumlah_amanah']} Pi

    --- PANDUAN ZAKAT ---
    Anggaran Zakat Perniagaan (2.5% dari untung bersih):
    Jumlah : {round(data_kewangan['jumlah_syarikat'] * 0.025, 4)} Pi

    --- ALAMAT DOMAIN ---
    Operasi: {DOMAIN_OPERASI}
    Amanah : {DOMAIN_AMANAH}

    ========================================
    Laporan ini dijana secara automatik.
    Untuk semakan CEO sahaja.
    ========================================
    """
    return laporan

def simpan_laporan(laporan):
    """
    Menyimpan laporan ke dalam fail teks.
    """
    with open(FAIL_LOG, "a", encoding="utf-8") as f:
        f.write(laporan + "\n")
    print(f"✅ Laporan disimpan ke {FAIL_LOG}")

# --- CONTOH PENGGUNAAN (UJIAN) ---
if __name__ == "__main__":
    # Contoh transaksi bulanan (dalam Pi)
    transaksi_bulan_ini = [10, 5, 1, 20, 3, 8, 15, 2, 7, 12]

    print("🔄 Memproses transaksi...")
    hasil = kira_transaksi(transaksi_bulan_ini)

    if hasil:
        laporan = jana_laporan(hasil)
        print(laporan)
        simpan_laporan(laporan)
        print("🎉 Audit selesai. CEO boleh menyemak laporan.")
    else:
        print("⚠️ Tiada data untuk diaudit.")
