<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>La Pine Map</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.css" rel="stylesheet">
    <script src="https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
        }
        #map {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 100%;
        }
        .type-buttons {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 1;
        }
        .type-button {
            width: 40px;
            height: 40px;
            background-color: #f0f0f0;
            border: none;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: background-color 0.3s ease; /* Add transition effect */
        }
        .type-button:hover {
            background-color: #ddd;
        }
        .selected {
            background-color: #333; /* Darken the selected button */
            color: #fff; /* Set text color to white */
        }
    </style>
</head>
<body>
<div id="map"></div>
<div class="type-buttons">
    <button class="type-button" onclick="setType('Housing')">🏡</button>
    <button class="type-button" onclick="setType('Infrastructure')">🏭</button>
    <button class="type-button" onclick="setType('Transportation')">🚎</button>
</div>
<script>
    mapboxgl.accessToken = 'pk.eyJ1IjoiaWFubWFoZXIzaiIsImEiOiJjbHRnM2g3Mmgwdm50MmpxcjNiaHppcGF0In0.EDCKHSTyRqogqjRVwC5pJA';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/ianmaher3j/cltxk9cdn01ij01r53gz169jm',
        center: [-121.50527954101562, 43.66847610473633],
        zoom: 12,
    });

    let selectedType = 'Housing'; // Default type

    function setType(type) {
        selectedType = type;

        // Remove 'selected' class from all buttons
        document.querySelectorAll('.type-button').forEach(button => {
            button.classList.remove('selected');
        });

        // Add 'selected' class to the clicked button
        document.querySelector(`[onclick="setType('${type}')"]`).classList.add('selected');
    }

    map.on('dblclick', (e) => {
        const comment = prompt('Add a short comment (maximum 250 characters):');
        if (comment === null || comment.trim() === '') {
            return;
        }

        // Create a marker at the clicked location with the selected type
        const marker = new mapboxgl.Marker({
            color: getMarkerColor(selectedType),
        })
            .setLngLat(e.lngLat)
            .setPopup(new mapboxgl.Popup().setHTML(`<strong>${selectedType}</strong><br>${comment}`))
            .addTo(map);
    });

    function getMarkerColor(type) {
        switch (type) {
            case 'Housing':
                return '#FF5733'; // Orange
            case 'Infrastructure':
                return '#3498DB'; // Blue
            case 'Transportation':
                return '#27AE60'; // Green
            default:
                return '#000'; // Default black
        }
    }
</script>
</body>
</html>











