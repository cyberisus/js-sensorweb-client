/*
 * Copyright (C) 2014-2014 52°North Initiative for Geospatial Open Source
 * Software GmbH
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 as published
 * by the Free Software Foundation.
 *
 * If the program is linked with libraries which are licensed under one of
 * the following licenses, the combination of the program with the linked
 * library is not considered a "derivative work" of the program:
 *
 *     - Apache License, version 2.0
 *     - Apache Software License, version 1.0
 *     - GNU Lesser General Public License, version 3
 *     - Mozilla Public License, versions 1.0, 1.1 and 2.0
 *     - Common Development and Distribution License (CDDL), version 1.0
 *
 * Therefore the distribution of the program linked with libraries licensed
 * under the aforementioned licenses, is permitted by the copyright holders
 * if the distribution is compliant with both the GNU General Public
 * License version 2 and the aforementioned licenses.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General
 * Public License for more details.
 */
/*
    Created on : 05.08.2014, 19:00:00
    Author     : Boenki
*/
var marker, circle;



var WizardPlaceController = {
    
    myMarker : "",
    myCircle : "",
    
    init : function() {

        $(document).ready(function() {     
            WizardPlaceController.createMap();
            WizardPlaceController.handleClickListener();
            WizardPlaceController.initFromOutline();       
        });
    },
    
    createMap : function(){

        if( $("#wizardmap").length > 0) { 
            
            this.map = L.map('wizardmap').setView([51.505, 7], 13);
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);
            L.Icon.Default.imagePath = 'images';
            this.map.whenReady(function(map) {
                // locate user methods
                this.map.on('locationfound', this.onLocationFound);
                this.map.on('locationerror', this.onLocationError);
                this.map.on('draw:created', function (e) {
                    var type = e.layerType,
                        layer = e.layer;

                    console.log(type);
                    if (type === 'circle') {
                        // Do marker specific actions
                        var place = [ {lat: ''},  {lng: ''} ,  {radius: ''}];
                        place.lat = layer._latlng.lat;
                        place.lng = layer._latlng.lng;
                        place.radius = layer._mRadius;
                        WizardOutlineController.addPlaceRadius( place );                 
                    } 
                    if (type === 'rectangle') {
                        console.log(layer); 
                        console.log("Lat[0]: " + layer._latlngs[0].lat);
                        console.log("Lng[0]: " + layer._latlngs[0].lng);
                    }
                    
                    WizardOutlineController.selectedPlaceType = type;
                    
                    // Do whatever else you need to. (save to db, add to map etc)
                    map.addLayer(layer);
                });
            }, this);
            L.control.scale().addTo(this.map);
            
            
            var drawnItems = new L.FeatureGroup();
            this.map.addLayer(drawnItems);
            
            var drawControl = new L.Control.Draw({
                position: 'topright',
                draw: {
                    polyline: {
                        metric: true
                    },
                    polygon: {
                        allowIntersection: false,
                        showArea: true,
                        drawError: {
                            color: '#b00b00',
                            timeout: 1000
                        },
                        shapeOptions: {
                            color: '#bada55'
                        }
                    },
                    circle: {
                        shapeOptions: {
                            color: '#662d91'
                        }
                    },
                    marker: false
                },
                edit: {
                    featureGroup: drawnItems,
                    edit: true,
                    remove: true
                }
            });
            this.map.addControl(drawControl);
            
            new L.Control.GeoSearch({
                url: 'http://nominatim.openstreetmap.org/search?format=json&q={s}',
                jsonpParam: 'json_callback',
                propertyName: 'display_name',
                propertyLoc: ['lat', 'lon'],
                position: 'topcenter',
                minLength: 2,
                showMarker: true,
                provider: new L.GeoSearch.Provider.OpenStreetMap(),
                zoomLevel: 13
            }).addTo(this.map);
            

        }
    },
    
    /*----- locate user -----*/
    locateUser: function() {
        this.map.locate({
            setView: true,
            maxZoom: Settings.zoom
        });
    },
    onLocationFound: function(e) {
        var radius = e.accuracy * 2;
        console.log(e);
        var popup = L.popup().setLatLng(e.latlng).setContent('<p>Here is your current location</p>');
        WizardPlaceController.map.openPopup(popup);
        L.circle(e.latlng, radius, {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5
        }).addTo(WizardPlaceController.map);
       
       
    },
    onLocationError: function(e) {
        alert(e.message);
    },

    handleClickListener : function(){
        $('[data-action="placeLocate"]').click(function() {
                WizardPlaceController.locateUser();
        });
    },
    
    initFromOutline : function() {
        
        console.log("selType: " + WizardOutlineController.selectedPlaceType);
        
        if(WizardOutlineController.selectedPlaceType !== ""){
            
            if(WizardOutlineController.selectedPlaceType == "circle"){
                var elem = WizardOutlineController.selectedRadius;
                console.log(WizardOutlineController.selectedRadius);
                var circle = L.circle([elem.lat, elem.lng], elem.radius, {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5
                }).addTo(WizardPlaceController.map);
            }
            
            if(WizardOutlineController.selectedPlaceType == "rectangle"){
                // stuff
            }
            
        }
        
        
    }
    
}

