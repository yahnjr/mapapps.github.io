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