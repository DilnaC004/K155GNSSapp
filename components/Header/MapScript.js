// Mapscript template edited from: https://leafletjs.com/examples/quick-start/example.html
    
const MapScript = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <base target="_top">
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        
        <title>Leeaflet for K155GNSSapp</title>
        
        <link rel="shortcut icon" type="image/x-icon" href="docs/images/favicon.ico" />

        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

        <style>
            html, body {
                height: 100%;
                margin: 0;
            }
            .leaflet-container {
                height: 83%;
                width: 100%;
                max-width: 100%;
                max-height: 100%;
            }
        </style>

        
    </head>
    <body>



    <div id="map" style="flex: 1"></div>
    <script>

        var map = L.map('map').setView([49.74375000, 15.33863889], 7);

        const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

    </script>



    </body>
    </html>
`

export default MapScript;