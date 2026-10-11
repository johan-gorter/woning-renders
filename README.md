# Woning Geulwijk, renders

Rondkijkers (360-gradenpanorama's) van de plannen voor woning Geulwijk, gerenderd in Blender vanuit het eigen model
van de woning (repo `geulwijk-3d`). Bekijken: https://johangorter.com/woning-renders/

- `index.html`: overzicht van alle rondkijkers (wordt gegenereerd).
- `kijker.js`, `kijker.css`: de gedeelde kijker (WebGL, geen bibliotheken). Slepen = rondkijken, scrollen of knijpen = zoom, 0 = beginstand.
- `<rondkijker>/`: per rondkijker `index.html`, `rondkijker.json` (naam, standpunten, momenten), `omslag.jpg` en per
  standpunt en moment een equirectangulair panorama `<standpunt>-<moment>.jpg` van 4096 x 2048.

Nieuwe rondkijker: in `geulwijk-3d` met `python3 tools/publiceer.py <naam> ...` (zie de uitleg in dat script), daarna hier
committen en pushen.
