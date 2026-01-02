import pandas as pd
import numpy as np
import json

# ==============================
# 1. Load bintang Gaia lokal
# ==============================
try:
    df = pd.read_csv("gaia.csv")  # ganti sesuai file Gaia CSV kamu

    # Hindari parallax 0 atau NULL
    df['parallax'] = df['parallax'].replace(0, np.nan)
    df = df.dropna(subset=['parallax'])

    # Hitung jarak (parsec)
    df['distance_pc'] = 1000 / df['parallax']

    # Konversi RA/DEC ke radian
    df['ra_rad'] = np.radians(df['ra'])
    df['dec_rad'] = np.radians(df['dec'])

    # Konversi ke koordinat Cartesian
    df['x'] = df['distance_pc'] * np.cos(df['dec_rad']) * np.cos(df['ra_rad'])
    df['y'] = df['distance_pc'] * np.cos(df['dec_rad']) * np.sin(df['ra_rad'])
    df['z'] = df['distance_pc'] * np.sin(df['dec_rad'])

    # Ukuran bintang dari magnitude (lebih kecil magnitude → lebih besar)
    df['size'] = 10 / (df['phot_g_mean_mag'] + 1)

    gaia_stars = df[['x', 'y', 'z', 'size']].to_dict(orient='records')
except FileNotFoundError:
    print("File gaia.csv tidak ditemukan, melewati Gaia stars...")
    gaia_stars = []

# ==============================
# 2. Generate bintang acak Milky Way (disk + bulge)
# ==============================
n_random = 100000  # jumlah bintang acak
# Disk Milky Way
R_disk = np.random.uniform(0, 15000, n_random)  # radius disk (pc)
phi_disk = np.random.uniform(0, 2*np.pi, n_random)
z_disk = np.random.normal(0, 300, n_random)  # ketebalan disk

x_disk = R_disk * np.cos(phi_disk)
y_disk = R_disk * np.sin(phi_disk)
z_disk = z_disk

size_disk = np.random.uniform(0.5, 2, n_random)  # ukuran bintang acak

disk_stars = [{'x': x_disk[i], 'y': y_disk[i], 'z': z_disk[i], 'size': size_disk[i]}
              for i in range(n_random)]

# Bulge galaksi (pusat)
n_bulge = 20000
r_bulge = np.random.normal(0, 2000, n_bulge)
theta = np.arccos(np.random.uniform(-1, 1, n_bulge))
phi = np.random.uniform(0, 2*np.pi, n_bulge)

x_bulge = r_bulge * np.sin(theta) * np.cos(phi)
y_bulge = r_bulge * np.sin(theta) * np.sin(phi)
z_bulge = r_bulge * np.cos(theta)
size_bulge = np.random.uniform(1, 3, n_bulge)

bulge_stars = [{'x': x_bulge[i], 'y': y_bulge[i], 'z': z_bulge[i], 'size': size_bulge[i]}
               for i in range(n_bulge)]

# ==============================
# 3. Gabungkan semua bintang
# ==============================
all_stars = gaia_stars + disk_stars + bulge_stars

# ==============================
# 4. Skalakan ke Three.js scene
# ==============================
scale = 0.001  # 1 pc → 0.001 unit
for star in all_stars:
    star['x'] *= scale
    star['y'] *= scale
    star['z'] *= scale

# ==============================
# 5. Export ke JSON
# ==============================
with open("stars_threejs.json", "w") as f:
    json.dump(all_stars, f)

print(f"Selesai! Total bintang: {len(all_stars)}")
print("File stars_threejs.json siap digunakan di Three.js")
