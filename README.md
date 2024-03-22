<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">
  <title>Add Points to Feature Layer</title>
  <link rel="stylesheet" href="https://js.arcgis.com/4.24/esri/themes/light/main.css">
  <script src="https://js.arcgis.com/4.24/"></script>
  <style>
    #viewDiv {
      height: 500px; /* Set your desired height */
      width: 100%; /* Adjust width as needed */
      margin: 0;
      padding: 0;
    }

    .topic-buttons {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      flex-direction: column; /* Buttons stacked vertically */
    }

    .topic-button {
      margin-bottom: 5px; /* Add spacing between buttons */
      padding: 5px 10px; /* Add some padding for better look */
      cursor: pointer;
      background-color: #eee; /* Default button color */
      border: 1px solid #ddd; /* Button border */
    }

    .topic-button.selected-topic {
      background-color: #ddd; /* Slightly darker for selected button */
    }

    /* Updated styling for the circles */
    .esri-geometry-point {
      outline: none; /* Remove outlines */
      width: 5px; /* Make circles smaller */
      height: 5px; /* Make circles smaller */
    }

    /* Updated styling for shrinking point symbols */
    @media (max-width: 600px) {
      .esri-geometry-point {
        width: 3px; /* Shrink circles when zoomed out */
        height: 3px; /* Shrink circles when zoomed out */
      }
    }

    /* Updated styling for the polygon layer */
    .esri-geometry-polygon {
      outline: red; /* Red outline */
      fill: blue; /* Blue fill color */
      fill-opacity: 0; /* 100% transparent */
    }
  </style>
</head>
<body>
  <div id="viewDiv"></div>
  <div class="topic-buttons">
    <div class="topic-button" id="housing">Housing</div>
    <div class="topic-button" id="infrastructure">Infrastructure</div>
    <div class="topic-button" id="transportation">Transportation</div>
    <div class="topic-button" id="parks">Parks & Nature</div>
    <div class="topic-button" id="employment">Employment</div>
  </div>
  <script>
    require([
      "esri/Map",
      "esri/views/MapView",
      "esri/layers/FeatureLayer",
      "esri/Graphic",
      "esri/symbols/SimpleMarkerSymbol",
      "esri/renderers/UniqueValueRenderer", // Added UniqueValueRenderer
      "esri/symbols/SimpleFillSymbol", // Added SimpleFillSymbol
      "esri/PopupTemplate"
    ], function(Map, MapView, FeatureLayer, Graphic, SimpleMarkerSymbol, UniqueValueRenderer, SimpleFillSymbol, PopupTemplate) {
      var map = new Map({
        basemap: "topo-vector"
      });

      var view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-121.5036, 43.6708], // Center on La Pine, Oregon
        zoom: 12 // Adjust zoom level as needed
      });

      // Placeholder feature layer URL (replace with your actual layer)
      var featureLayerUrl = "https://services3.arcgis.com/pZZTDhBBLO3B9dnl/arcgis/rest/services/LaPine_pub_comments/FeatureServer";

      // Create feature layer
      var featureLayer = new FeatureLayer({
        url: featureLayerUrl,
        outFields: ["*"],
        editable: true, // Allow editing
      });

      // Add feature layer to map
      map.add(featureLayer);

      // Define the UniqueValueRenderer
      var renderer = new UniqueValueRenderer({
        field: "topic", // Attribute to base the renderer on
        defaultSymbol: new SimpleMarkerSymbol(), // Default symbol if no match
        uniqueValueInfos: [ // Define unique values and symbols
          {
            value: "Housing",
            symbol: new SimpleMarkerSymbol({
              color: "blue"
            })
          },
          {
            value: "Infrastructure",
            symbol: new SimpleMarkerSymbol({
              color: "red"
            })
          },
          {
            value: "Transportation",
            symbol: new SimpleMarkerSymbol({
              color: "green"
            })
          },
          {
            value: "Parks",
            symbol: new SimpleMarkerSymbol({
              color: "orange"
            })
          },
          {
            value: "Employment",
            symbol: new SimpleMarkerSymbol({
              color: "purple"
            })
          }
        ]
      });

      // Apply the renderer to the feature layer
      featureLayer.renderer = renderer;

      // Add the new polygon layer with transparent fill
      var polygonLayerUrl = "https://services3.arcgis.com/pZZTDhBBLO3B9dnl/arcgis/rest/services/La_Pine_City_Limit/FeatureServer";
      var polygonLayer = new FeatureLayer({
        url: polygonLayerUrl,
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-fill",
            color: [0, 0, 255, 0], // Blue fill color with transparency
            outline: {
              color: [255, 0, 0, 1], // Red outline with transparency
              width: 2 // 2 pixel thick border
            }
          }
        }
      });

      // Add polygon layer to map
      map.add(polygonLayer);

      // Listen for double-click event
      view.on("double-click", function(event) {
        event.stopPropagation();
        // Create a new point graphic at the clicked location
        var point = {
          type: "point",
          longitude: event.mapPoint.longitude,
          latitude: event.mapPoint.latitude
        
        };

        // Get the selected topic
        var selectedTopic = document.querySelector(".selected-topic");
        if (!selectedTopic) {
          alert("Please select a topic before adding a point.");
          return;
        }

        // Create a new graphic with attributes
        var attributes = {
          pubcomment: prompt("Enter a short comment for this point:"), // Use "pubcomment" attribute
          topic: selectedTopic.id.charAt(0).toUpperCase() + selectedTopic.id.slice(1) // Set the topic attribute in title case
        };

        var newGraphic = new Graphic({
          geometry: point,
          attributes: attributes
        });

        // Save the new point to the feature layer
        featureLayer.applyEdits({
          addFeatures: [newGraphic]
        });
      });

      // Add event listeners for topic buttons
      var topicButtons = document.querySelectorAll(".topic-button");
      topicButtons.forEach(function(button) {
        button.addEventListener("click", function() {
          // Highlight the selected topic
          topicButtons.forEach(function(btn) {
            btn.classList.remove("selected-topic");
          });
          button.classList.add("selected-topic");
        });
      });

      // Create a custom popup template
      var popupTemplate = {
        title: "{topic}",
        content: [
          {
            type: "text",
            text: "<b>Comment:</b> {pubcomment}"
          }
        ]
      };

      // Set the popup template for the feature layer
      featureLayer.popupTemplate = popupTemplate;
    });
  </script>
</body>
</html>
