# Woning Geulwijk, renders

Rondkijkers (360-gradenpanorama's) van de plannen voor woning Geulwijk, gerenderd in Blender vanuit het eigen model
van de woning (repo `geulwijk-3d`). Bekijken: https://johangorter.com/woning-renders/

- `index.html`: overzicht van alle rondkijkers (wordt gegenereerd).
- `kijker.js`, `kijker.css`: de gedeelde kijker (WebGL, geen bibliotheken). Slepen = rondkijken, scrollen of knijpen = zoom, 0 = beginstand.
- `<rondkijker>/`: per rondkijker `index.html`, `rondkijker.json` (naam, standpunten, momenten), `omslag.jpg` en per
  standpunt en moment een equirectangulair panorama `<standpunt>-<moment>.jpg` van 4096 x 2048.

Nieuwe rondkijker: in de (privé) repo `geulwijk-3d` renderen en `python3 tools/publiceer.py <naam> ...` draaien; het
stappenplan staat daar in `docs/werkwijze.md` onder "Publiceren: een rondkijker toevoegen". Daarna hier committen en
pushen met het noreply-adres als auteur. Bewerk `index.html` niet met de hand: het overzicht wordt gegenereerd uit de
`rondkijker.json` van elke map (met `bron`: hoe het gerenderd is).
