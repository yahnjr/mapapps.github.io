mapboxgl.accessToken = 'pk.eyJ1IjoiaWFubWFoZXIzaiIsImEiOiJjbHRnM2g3Mmgwdm50MmpxcjNiaHppcGF0In0.EDCKHSTyRqogqjRVwC5pJA';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/ianmaher3j/cltxk9cdn01ij01r53gz169jm',
        center: [-121.50527954101562, 43.66847610473633],
        zoom: 12,
        doubleClickZoom: false // Disable zoom on double click
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
                return '#FB7105'; // Orange
            case 'Employment':
                return '#800080'; // Purple
            case 'Parks & Nature':
                return '#00FF00'; // Bright Green
            default:
                return '#000'; // Default black
        }
    }