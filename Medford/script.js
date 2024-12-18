require([
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/Home",
    "esri/widgets/Locate",
    "esri/widgets/Search",
    "esri/layers/FeatureLayer",
    "esri/layers/GeoJSONLayer",
    "esri/Graphic",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/renderers/UniqueValueRenderer",
    "esri/Basemap",
    ], function(Map, MapView, Home, Locate, Search, FeatureLayer, GeoJSONLayer, Graphic, SimpleMarkerSymbol, UniqueValueRenderer, Basemap) {
        var map = new Map({
        basemap: "hybrid"
    });

    let selectedValue = 'None';
    let addPointHandler;

    const commentModal = document.getElementById("commentModal");
    const commentField = document.getElementById("commentField");
    const submitComment = document.getElementById("submitComment");
    const cancelComment = document.getElementById("cancelComment");
    const topicsDropdown = document.getElementById("topicsDropdown");

    topicsDropdown.addEventListener('change', () => {
        selectedValue = topicsDropdown.value;
        return selectedValue;
    })

    var view = new MapView({
        container: "viewDiv",
            map: map,
            extent: {
                xmin: -122.93,
                ymin: 42.27,
                xmax: -122.79,
                ymax: 42.41,
            spatialReference: { wkid: 4326 }
            }
        });

    var cityLimits = "https://services3.arcgis.com/pZZTDhBBLO3B9dnl/arcgis/rest/services/Medford_tsap_layers/FeatureServer/6";
    var cityLimitsLayer = new FeatureLayer({
        url: cityLimits,
        renderer: {
        type: "simple",
        symbol: {
            type: "simple-fill",
            color: [190, 190, 190, 0.3],
            outline: {
            color: [245, 245, 245, 1],
            width: 2
            }
        }
        }
    });
    var parks = "https://services3.arcgis.com/pZZTDhBBLO3B9dnl/arcgis/rest/services/Medford_tsap_layers/FeatureServer/4";
    var parksLayer = new FeatureLayer({
        url: parks,
        renderer: {
        type: "simple",
        symbol: {
            type: "simple-fill",
            color: [167, 201, 163, 0.8],
            outline: {
            color: [209, 209, 209, 0],
            }
        }
        }
    });
    var waterBodies = "https://services3.arcgis.com/pZZTDhBBLO3B9dnl/arcgis/rest/services/Medford_tsap_layers/FeatureServer/3";
    var waterBodiesLayer = new FeatureLayer({
        url: waterBodies,
        renderer: {
        type: "simple",
        symbol: {
            type: "simple-fill",
            color: [127, 169, 199, 0.8],
            outline: {
            color: [209, 209, 209, 0],
            }
        }
        }
    });
    var comments = "https://services3.arcgis.com/pZZTDhBBLO3B9dnl/arcgis/rest/services/Medford_tsap_layers/FeatureServer/0";
    var commentsLayer = new FeatureLayer({
        url: comments,
        outFields: ["*"],
        editable: true,
        popupTemplate: {
            title: `{type}`,
            content: `
            <b>Comment: </b> {comment}
            `
        }
    });

    map.add(cityLimitsLayer);
    map.add(parksLayer);
    map.add(waterBodiesLayer);
    map.add(commentsLayer);

    var renderer = {
        type: "unique-value",
        field: "type",
        uniqueValueInfos: [
            {
            value: "Near Miss",
            symbol: {
                type: "simple-marker",
                color: "#0D47A1", // Dark Blue
                size: 8,
                outline: { color: "white", width: 1 }
            }
            },
            {
            value: "Not Enough Separation",
            symbol: {
                type: "simple-marker",
                color: "#1E88E5", // Blue
                size: 8,
                outline: { color: "white", width: 1 }
            }
            },
            {
            value: "Distracted Driving",
            symbol: {
                type: "simple-marker",
                color: "#00ACC1", // Cyan
                size: 8,
                outline: { color: "white", width: 1 }
            }
            },
            {
            value: "Insufficient Lighting",
            symbol: {
                type: "simple-marker",
                color: "#26A69A", // Teal
                size: 8,
                outline: { color: "white", width: 1 }
            }
            },
            {
            value: "Speeding",
            symbol: {
                type: "simple-marker",
                color: "#2E7D32", // Dark Green
                size: 8,
                outline: { color: "white", width: 1 }
            }
            },
            {
            value: "Line of Sight",
            symbol: {
                type: "simple-marker",
                color: "#66BB6A", // Green
                size: 8,
                outline: { color: "white", width: 1 }
            }
            },
            {
            value: "Other",
            symbol: {
                type: "simple-marker",
                color: "#9CCC65", // Light Green
                size: 8,
                outline: { color: "white", width: 1 }
            }
            }
        ]
        };
    
    view.whenLayerView(cityLimitsLayer).then(function(layerView) {
        view.watch("scale", function(scale) {
            if (scale > 5000) {
                cityLimitsLayer.renderer.symbol.color = [0, 0, 0, 0];
            } else {
                cityLimitsLayer.renderer.symbol.color = [190, 190, 190, 0.3];
            }
        });
    });

    commentsLayer.renderer = renderer;

    var tempPins = [];

    var pinSymbol = new SimpleMarkerSymbol({
        color: "red",
        size: 8,
        outline: { color: "white", width: 1 }
    });

    addPointHandler = view.on("click", function(event) {
        var point = event.mapPoint;
        
        var newGraphic = new Graphic({
            geometry: point,
            symbol: pinSymbol
        });
    
        view.graphics.add(newGraphic);

        window.currentTempPin = {
            geometry: point,
            type: null,
            comment: null
        }
    
        commentModal.style.display = 'block';
        commentField.value = '';        
        topicsDropdown.selectedIndex = 0;
    });
    
    submitComment.addEventListener('click', function() {
        console.log(window.currentTempPin);
        var comment = commentField.value.trim();
        
        if (window.currentTempPin && selectedValue !== "") {
            window.currentTempPin.type = selectedValue;
            window.currentTempPin.comment = comment;
            
            console.log("Pin being added:", window.currentTempPin);
            tempPins.push(window.currentTempPin);    
            
            commentModal.style.display = 'none';
            window.currentTempPin = null;
        } else {
            console.log("Error with selected type");
        }
    });

    document.getElementById("submitBtn").addEventListener("click", function() {
        const validPins = tempPins.filter(pin => pin.geometry && pin.type);
    
        if (validPins.length === 0) {
            alert("No valid pins to submit.");
            console.log("No valid pins found:", tempPins);
            return;
        }

        console.log("Submitting the following valid pins:", validPins);
    
        validPins.forEach(function(pin, index) {
            console.log(`Submitting valid pin #${index + 1}:`, pin);
    
            var newGraphic = new Graphic({
                geometry: pin.geometry,
                attributes: {
                    type: pin.type,
                    comment: pin.comment || ''
                }
            });
    
            commentsLayer.applyEdits({
                addFeatures: [newGraphic]
            }).then(function(result) {
                console.log(`Pin #${index + 1} submitted successfully:`, result);
            }).catch(function(error) {
                console.error(`Error submitting pin #${index + 1}:`, error);
            });
        });
    
        tempPins = [];
        view.graphics.removeAll();
    
        if (addPointHandler) {
            addPointHandler.remove(); 
            addPointHandler = null;
        }

        document.getElementById("extra-comment-box").style.display = 'block';
        document.getElementById("submitBtn").style.display = 'none';
        document.getElementById("cancelBtn").style.display = 'none';
        document.getElementById("buttons-box").innerHTML = '<h3>Map comments submitted, thank you!</h3>';

    });    

    document.getElementById("cancelBtn").addEventListener("click", function() {
        tempPins = [];
        view.graphics.removeAll();
    });

    cancelComment.addEventListener('click', function() {
        var graphics = view.graphics.toArray();
        if (graphics.length > 0) {
            view.graphics.remove(graphics[graphics.length - 1]);
        }

        commentModal.style.display = 'none';
        window.currentTempPin = null;
    });

    document.getElementById("commentSubmit").addEventListener("click", function() {
        var extraCommentText = document.getElementById("extraComment").value.trim();
        
        if (extraCommentText) {
            var extraCommentGraphic = new Graphic({
                geometry: {
                    type: "point",
                    longitude: 0,
                    latitude: 0
                },
                attributes: {
                    type: "Extra Comment",
                    comment: extraCommentText
                }
            });
    
            commentsLayer.applyEdits({
                addFeatures: [extraCommentGraphic]
            }).then(function(result) {
                console.log("Extra comment submitted!", result);
                
                var containerDiv = document.getElementById('extra-comment-box');
                if (containerDiv) {
                    containerDiv.innerHTML = '<h3>Thanks for your feedback!</h3>';
                }
                document.getElementById('commentSubmit').style.display = "none";
            }).catch(function(error) {
                console.error("Error submitting extra comment:", error);
                alert("Failed to submit extra comment. Please try again.");
            });
        } else {
            alert("Please enter a comment before submitting.");
        }
    });
    
    var searchWidget = new Search({
        view: view
    });
    view.ui.add(searchWidget, "top-left");
    
    var homeWidget = new Home({
        view: view
    });
    view.ui.add(homeWidget, "top-left");
    
    var locateWidget = new Locate({
        view: view
    });
    view.ui.add(locateWidget, "top-left");
    view.ui.move("zoom", "top-left");
});
