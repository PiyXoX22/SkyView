from astroquery.gaia import Gaia

query = """
SELECT TOP 200000
  ra,
  dec,
  parallax,
  pmra,
  pmdec,
  phot_g_mean_mag
FROM gaiadr3.gaia_source
WHERE phot_g_mean_mag < 10
AND parallax IS NOT NULL
"""

job = Gaia.launch_job(query)
job.get_results().write("gaia.csv", format="csv")
