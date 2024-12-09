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

    let selectedValue = '';

    function createCommentModal() {
        var modalDiv = document.createElement('div');
        modalDiv.id = 'commentModal';
        modalDiv.style.cssText = `
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.4);
        `;

        var modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background-color: #fefefe;
            margin: 15% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-width: 500px;
            border-radius: 10px;
        `;

        var commentLabel = document.createElement('label');
        commentLabel.textContent = 'Add a Comment:';
        commentLabel.style.display = 'block';
        commentLabel.style.marginBottom = '10px';

        var commentInput = document.createElement('textarea');
        commentInput.id = 'commentInput';
        commentInput.style.cssText = `
            width: 90%;
            height: 100px;
            margin-bottom: 10px;
            padding: 10px;
        `;

        var submitButton = document.createElement('button');
        submitButton.className = 'submitBtn';
        submitButton.textContent = 'Submit Comment';
        submitButton.style.marginRight = '10px';

        var cancelButton = document.createElement('button');
        cancelButton.className = 'cancelBtn';
        cancelButton.textContent = 'Cancel';

        modalContent.appendChild(commentLabel);
        modalContent.appendChild(commentInput);
        modalContent.appendChild(submitButton);
        modalContent.appendChild(cancelButton);
        modalDiv.appendChild(modalContent);
        document.body.appendChild(modalDiv);

        return {
            modal: modalDiv,
            input: commentInput,
            submitBtn: submitButton,
            cancelBtn: cancelButton
        };
    }

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

    var commentModal = createCommentModal();

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
    var topicsDropdown = document.getElementById("topics-dropdown");

    var pinSymbol = new SimpleMarkerSymbol({
        color: "red",
        size: 8,
        outline: { color: "white", width: 1 }
    });

    view.on("click", function(event) {
        var selectedValue = topicsDropdown.value;
        console.log(`Selected topic: ${selectedValue}`)
        if (selectedValue === "") {
            return;
        }

        var point = event.mapPoint;
        
        var newGraphic = new Graphic({
            geometry: point,
            symbol: pinSymbol,
            attributes: {
                type: selectedValue
            }
        });

        view.graphics.add(newGraphic);

        commentModal.modal.style.display = 'block';
        commentModal.input.value = '';

        window.currentTempPin = {
            geometry: point,
            type: selectedValue
        };
    });

    commentModal.submitBtn.addEventListener('click', function() {
        var comment = commentModal.input.value.trim();
        
        if (window.currentTempPin) {
            var tempPin = window.currentTempPin;
            tempPin.comment = comment;
            
            tempPins.push(tempPin);
            
            document.getElementById("buttons-box").style.display = "flex";
            
            commentModal.modal.style.display = 'none';
        }
    });


    var point = event.mapPoint;
    
    var newGraphic = new Graphic({
        geometry: point,
        symbol: pinSymbol,
        attributes: {
            type: selectedValue
        }
    });

    view.graphics.add(newGraphic);

    tempPins.push({
        geometry: point,
        type: selectedValue
    });

    if (tempPins.length > 0) {
        document.getElementById("buttons-box").style.display = "flex";
    }

    document.getElementById("submitBtn").addEventListener("click", function() {
        if (tempPins.length === 0) {
            alert("No pins to submit.");
            return;
        }

        tempPins.forEach(function(pin) {
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
                console.log("Comments submitted!", result);
            }).catch(function(error) {
                console.error("Error submitting comments:", error);
            });
        });

        tempPins = [];
        view.graphics.removeAll();
        document.getElementById("buttons-box").style.display = "none";
    });

    document.getElementById("cancelBtn").addEventListener("click", function() {
        tempPins = [];
        view.graphics.removeAll();
        document.getElementById("buttons-box").style.display = "none";
    });

    commentModal.cancelBtn.addEventListener('click', function() {
        var graphics = view.graphics.toArray();
        if (graphics.length > 0) {
            view.graphics.remove(graphics[graphics.length - 1]);
        }

        commentModal.modal.style.display = 'none';
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

