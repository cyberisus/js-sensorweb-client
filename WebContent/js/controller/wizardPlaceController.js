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
    
    markers         : [],
    stations        : [],
    timeseries      : [],
    outlineCircle   : '',
    allSelectedPhenomenaStations : [],
    selectionLayer  : "",
    selectionCounter: 0,
    results         : [{'onstart': 0, 'onend': 0, 'diff':0}],
    
    init : function() {

        $(document).ready(function() {  
            WizardController.isLoading(false);   
            WizardPlaceController.initNaviLayout();
            WizardPlaceController.createMap();
            WizardPlaceController.handleClickListener();
   
            // clear all
            $.each(WizardPlaceController.markers, function( id, marker ) {
                WizardPlaceController.mapi.removeLayer(marker);
                WizardPlaceController.markers = [];
            });    
            
            // do stuff
            WizardPlaceController.selectionCounter = 0;
            WizardPlaceController.findStations();
            WizardPlaceController.initFromOutline();         
        });
    },
    
    createMap : function(){

        if( $("#wizardmap").length > 0) { 
            // Wuppertal : 51.260694, 7.149004
            this.mapi = L.map('wizardmap').setView([51.260694, 7.149004], 11);
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.mapi);
            L.Icon.Default.imagePath = 'images';
            this.mapi.whenReady(function(mapi) {
                // locate user methods
                this.mapi.on('locationfound', this.onLocationFound);
                this.mapi.on('locationerror', this.onLocationError);
                this.mapi.on('draw:created', function (e) {
                    var type = e.layerType,
                        layer = e.layer;
                        if( WizardPlaceController.selectionLayer != "" ) 
                            WizardPlaceController.mapi.removeLayer(WizardPlaceController.selectionLayer);
                        WizardPlaceController.selectionLayer = layer;

                       
                    // 
                    if (type === 'circle') {
                        // Do marker specific actions
                        var place = [ {lat: ''},  {lng: ''} ,  {radius: ''}];
                        place.lat = layer._latlng.lat;
                        place.lng = layer._latlng.lng;
                        place.radius = layer._mRadius;
                        
                       
                        
                        WizardOutlineController.addPlaceRadius( place );  
                        //WizardPlaceController.updateMarkerResults( place );
                        
                        
                        WizardPlaceController.findStations();
                        
                        /*
                        // Update result counter
                        console.log(WizardPlaceController.stations);
                        WizardOutlineController.selectedStations = [];
                        WizardOutlineController.selectedTS = [];
                        WizardOutlineController.selectedStations = WizardPlaceController.stations;
                        */
                       
                        //WizardOutlineController.updateResultNumber(null,WizardOutlineController.selectedStations.length);
                        //$('.outline-resultnumber').text( WizardOutlineController.selectedStations.length );
                    } 
                    if (type === 'rectangle') {
                        console.log(layer); 
                        console.log("Lat[0]: " + layer._latlngs[0].lat);
                        console.log("Lng[0]: " + layer._latlngs[0].lng);
                        
                        // Update result counter
                        WizardOutlineController.selectedStations = [];
                        WizardOutlineController.selectedStations = WizardPlaceController.stations;
                        WizardOutlineController.updateResultNumber(null,WizardOutlineController.selectedStations.length);
                    }
                    
                    WizardOutlineController.selectedPlaceType = type;
                    
                    // Do whatever else you need to. (save to db, add to map etc)
                    mapi.addLayer(layer);
                });
            }, this);
            
            L.control.scale().addTo(this.mapi);           
            
            var drawnItems = new L.FeatureGroup();
            this.mapi.addLayer(drawnItems);
            
            var drawControl = new L.Control.Draw({
                position: 'topright',
                draw: {
                    polyline: false,
                    polygon: false,
                    rectangle: false,
                    circle: {
                        shapeOptions: {
                            color: '#662d91'
                        }
                    },
                    marker: false
                },
                edit: false
            });
            this.mapi.addControl(drawControl);
            L.drawLocal.draw.toolbar.buttons.circle = 'Select your favorite timeseries!';
            
            new L.Control.GeoSearch({
                id: 123,
                url: 'http://nominatim.openstreetmap.org/search?format=json&q={s}',
                jsonpParam: 'json_callback',
                propertyName: 'display_name',
                propertyLoc: ['lat', 'lon'],
                position: 'topcenter',
                minLength: 2,
                showMarker: true,
                provider: new L.GeoSearch.Provider.OpenStreetMap(),
                zoomLevel: 13
            }).addTo(this.mapi);

        }
    },
    
    /*----- locate user -----*/
    locateUser: function() {
        this.mapi.locate({
            setView: true,
            maxZoom: Settings.zoom
        });
    },
    onLocationFound: function(e) {
        var radius = e.accuracy * 2;
        console.log(e);
        var popup = L.popup().setLatLng(e.latlng).setContent('<p>Here is your current location</p>');
        WizardPlaceController.mapi.openPopup(popup);
        L.circle(e.latlng, radius, {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5
        }).addTo(WizardPlaceController.mapi);
       
       
    },
    onLocationError: function(e) {
        alert(e.message);
    },
    
    /* add marker to map */
    
    findStations : function(){
        /*
         * IF (first-step) THEN
         * 
                * var provider = Status.get('provider');
               Rest.stations(null, provider.apiUrl, {
                   service: provider.serviceID
               }).done($.proxy(function(results) {
                   WizardPlaceController.findPhenomenForStation(results);
               }, this));
        
           ELSE
        
        */
       
       // remove all markers from map
        $.each(WizardPlaceController.markers, function( id, marker ) {
            WizardPlaceController.mapi.removeLayer(marker);
            WizardPlaceController.markers = [];
        });
        WizardPlaceController.selectionCounter = 0;
       
        // ausgangssituation 
        WizardPlaceController.stations = [];
        WizardOutlineController.selectedStations = [];
        WizardOutlineController.selectedTS = [];
        
        WizardPlaceController.allSelectedPhenomenaStations = [];
        WizardPlaceController.allSelectedPhenomenaStations = WizardPhenomenController.cacheAllStations.slice();
        
        console.log("allSelectedPhenomenaStations: " + WizardPlaceController.allSelectedPhenomenaStations.length);
        if (WizardPlaceController.allSelectedPhenomenaStations.length > 0 && $('.outline-resultnumber').text() != "0"){
            WizardController.isLoading(true);
            WizardPlaceController.findPhenomenForStation( WizardPlaceController.allSelectedPhenomenaStations ); 
        } else {
             WizardController.setWarnings('noPhenomenonSelected');
        }
       
        
    },
    
    findPhenomenForStation : function(stations){     
        var provider = Status.get('provider');
        var apiUrl = Status.get('provider').apiUrl;
        var i = 1;    

        // reset counter to count new
        WizardPlaceController.selectionCounter
        $.each(stations, function(id, station) {
            var sid = station.properties.id;
            // set coordinates from station
            var coordinates = {'lat' : station.geometry.coordinates[1], 'lng' : station.geometry.coordinates[0]};   
            // Load station with timeseries info    
            Rest.stations(sid, apiUrl).done($.proxy(function(results){
                // Add marker to map
                WizardPlaceController.findTimeseries(results, coordinates); 
                if(i == stations.length){    
                    WizardController.isLoading(false);
                    $('.outline-resultnumber').text(WizardPlaceController.selectionCounter);
                    WizardOutlineController.selectedStations = WizardPlaceController.stations;
                }
                i++;
            }));
            
            
        });        
    },
    
    findTimeseries : function(results, coordinates) {
        var apiUrl = Status.get('provider').apiUrl;
        var stationID = results.properties.id;
        //This result contains the geometry point of the staion and the phenomen label
        $.each(results.properties.timeseries, function(id, result) {
            // add marker
            WizardPlaceController.addMarkerToMap(result, coordinates, stationID, id); 
        });
    },
    
    addMarkerToMap: function(timeserie, coordinates, stationID, tsID) {
             
        // set station
        var station = {};
        station.id = stationID;
        station.coordinates = coordinates;
        station.phenomenID = timeserie.phenomenon.id;
        station.phenomenLabel = timeserie.phenomenon.label;
        station.tsID = tsID;
        station.timeserie = timeserie;
        //
        var phenomID = timeserie.phenomenon.id;
        var phenomLable = timeserie.phenomenon.label;
        // check if the stations contains the selected phenomena 
        if ($.inArray(phenomLable, WizardOutlineController.selectedPhenomena) !== - 1) {
            
            // Set Marker to map
            if(WizardOutlineController.selectedPlaceType == "circle"){
                
                if( WizardPlaceController.isInRadius( WizardOutlineController.selectedRadius, coordinates ) ){
                    var circle = L.circle([coordinates.lat, coordinates.lng], '150', {
                        color: 'yellow',
                        fillColor: '#f03',
                        fillOpacity: 0.5
                    }).addTo(WizardPlaceController.mapi);
                    
                    WizardPlaceController.markers.push(circle);
                    // chache stations for result
                    WizardPlaceController.stations.push(station)
                    WizardOutlineController.selectedStations.push(station);
                    WizardOutlineController.selectedTS.push(tsID);
                    
                    // count number of results in selection
                    WizardPlaceController.selectionCounter = WizardPlaceController.selectionCounter + 1;
 
                } else {
                    var circle = L.circle([coordinates.lat, coordinates.lng], '150', {
                        color: 'blue',
                        fillColor: '#f03',
                        fillOpacity: 0.5
                    }).addTo(WizardPlaceController.mapi);
                    WizardPlaceController.markers.push(circle);
                    // chache stations for result
                    //WizardOutlineController.selectedStations.push(station);
                    //WizardOutlineController.selectedTS.push(tsID);
                }
                
            } else {
                
                var circle = L.circle([coordinates.lat, coordinates.lng], '150', {
                    color: 'blue',
                    fillColor: '#f03',
                    fillOpacity: 0.5
                }).addTo(WizardPlaceController.mapi);
                WizardPlaceController.markers.push(circle);
                // chache stations for result
                WizardPlaceController.stations.push(station)
                WizardOutlineController.selectedStations.push(station);
                WizardOutlineController.selectedTS.push(tsID);
                
                WizardPlaceController.selectionCounter = WizardPlaceController.selectionCounter + 1;

                
            } 
        }

    },
    
    /*
    updateMarkerResults :  function( place ){
        // remove all markers from map
        $.each(WizardPlaceController.markers, function( id, marker ) {
            WizardPlaceController.mapi.removeLayer(marker);
            WizardPlaceController.markers = [];
        });
        // check for new markers in radius - using cache objects
        var newStations = [];
        var newOptinalStations = [];
        var OPT_STATIONS_M = 1000000;      //  1000 km
        WizardPlaceController.stations = [];
        
        $.each(WizardPlaceController.allSelectedPhenomenaStations, function( id, station ) {
            // Distance
            var centerLat   = place.lat;
            var centerLng   = place.lng;
            var stationLat  = station.coordinates.lat;
            var stationLng  = station.coordinates.lng;
            var dx          = 71.5 * (centerLng - stationLng);
            var dy          = 111.3 * (centerLat - stationLat);
            var maxDist     = place.radius;
            var currentDist = Math.sqrt( ( dx * dx ) + ( dy * dy ) ) * 1000; // in meter
            // set new marker
            if(currentDist <= maxDist){
                newStations.push(station);   
                WizardPlaceController.stations.push(station);
                WizardOutlineController.selectedTS.push(station.tsID);
            } else if (currentDist > maxDist && currentDist <= (maxDist + OPT_STATIONS_M)){
                newOptinalStations.push(station);
            }
        });      
        // create new marker on map for results
        $.each(newStations, function( id, station ) {
            // draw results
            var circle = L.circle([station.coordinates.lat, station.coordinates.lng], '150', {
                    color: 'yellow',
                    fillColor: '#f03',
                    fillOpacity: 0.5
            }).addTo(WizardPlaceController.mapi);
            WizardPlaceController.markers.push(circle);
        });       
        // create new marker on map for optional results
        $.each(newOptinalStations, function( id, station ) {
            // draw results
            var circle = L.circle([station.coordinates.lat, station.coordinates.lng], '150', {
                    color: 'blue',
                    fillColor: '#f03',
                    fillOpacity: 0.5
            }).addTo(WizardPlaceController.mapi);
            WizardPlaceController.markers.push(circle);
        });
        
    },
    */
    
    /* ------------ */

    handleClickListener : function(){
        $('[data-action="placeLocate"]').click(function() {
                WizardPlaceController.locateUser();
        });
        
        $('.btnBack').click(function() {
            $('.wizard-pager').remove();
            $('#wizard-content').empty();
            WizardController.loadWizardPhenomenPage();
            //WizardController.setActiveNav( $('#wizard-nav li.phenomen') );
            //WizardTimeController.setLastUserSearch();
        });
        
        
        $('.btnNext').click(function() {
              
            // Check if something was selected
            if(WizardPlaceController.stations.length == 0){
                
            }
            
            
            // Update result counter
                WizardOutlineController.currentResults = $('.outline-resultnumber').text();
                WizardPlaceController.results.onend = WizardOutlineController.currentResults;
                var diff = WizardPlaceController.results.onstart - WizardPlaceController.results.onend;
                WizardPlaceController.results.diff = diff;
                WizardOutlineController.currentResults = $('.outline-resultnumber').text();
                      
            // Load new page
                $('.wizard-pager').remove();
                $('#wizard-content').empty();
                WizardController.loadWizardResultPage();
                
            // Save search request to DB
                Personalization.saveSearchRequest();
                
        });
        $('.leaflet-draw-draw-circle').on('click', function() {
            /*// remove all markers from map
            $.each(WizardPlaceController.markers, function( id, marker ) {
                WizardPlaceController.mapi.removeLayer(marker);
                WizardPlaceController.markers = [];
            });
            */
           /*
            if( WizardPlaceController.selectionLayer != "" ) 
                WizardPlaceController.mapi.removeLayer(WizardPlaceController.selectionLayer);
            */
            // Load stations from cache
            /*
            $.each(WizardPlaceController.allSelectedPhenomenaStations, function(id, station){
                var circle = L.circle([station.coordinates.lat, station.coordinates.lng], '150', {
                    color: 'blue',
                    fillColor: '#f03',
                    fillOpacity: 0.5
                }).addTo(WizardPlaceController.mapi);
                WizardPlaceController.markers.push(circle);
            });
            */
            $('.outline-resultnumber').text( WizardPlaceController.results.onstart );
            
            // Remove outline Cirle from Map
            WizardPlaceController.mapi.removeLayer(  WizardPlaceController.outlineCircle );
            
        });
    },
    
    initFromOutline : function() {
      
        WizardPlaceController.results.onstart = WizardOutlineController.currentResults;
      
        if(WizardOutlineController.selectedPlaceType !== ""){
            /*
            // remove all markers from map
            $.each(WizardPlaceController.markers, function( id, marker ) {
                WizardPlaceController.mapi.removeLayer(marker);
                WizardPlaceController.markers = [];
            });
            if( WizardPlaceController.selectionLayer != "" ) 
                WizardPlaceController.mapi.removeLayer(WizardPlaceController.selectionLayer);

            */
           
            if (WizardOutlineController.selectedPlaceType == "circle") {

                var elem = WizardOutlineController.selectedRadius;
                WizardPlaceController.outlineCircle = L.circle([elem.lat, elem.lng], elem.radius, {
                    color: '#f03',
                    fillColor: '#f03',
                    fillOpacity: 0.5
                }).addTo(WizardPlaceController.mapi);

                /*
                WizardPlaceController.updateMarkerResults(elem);
                // Update result counter
                console.log(WizardPlaceController.stations);
                WizardOutlineController.selectedStations = [];
                WizardOutlineController.selectedTS = [];
                WizardOutlineController.selectedStations = WizardPlaceController.stations;

                //WizardOutlineController.updateResultNumber(null,WizardOutlineController.selectedStations.length);
                $('.outline-resultnumber').text(WizardOutlineController.selectedStations.length);
                */
            }

            if (WizardOutlineController.selectedPlaceType == "rectangle") {
                // stuff
            }  
        }
    },
    
    initNaviLayout: function(){
        $('#wizard #wizard-nav').find('.active').removeClass('active');
        $('#wizard #wizard-nav').find('.active-last').removeClass('active-last');
        $('#wizard #wizard-nav .time').addClass('active');  
        $('#wizard #wizard-nav .phenomen').addClass('active');  
        $('#wizard #wizard-nav .place').addClass('active-last');  
    }, 
    
    isInRadius: function(center, coordinates) {
        var centerLat = center.lat;
        var centerLng = center.lng;
        var stationLat = coordinates.lat;
        var stationLng = coordinates.lng;
        var dx = 71.5 * (centerLng - stationLng);
        var dy = 111.3 * (centerLat - stationLat);
        var maxDist = center.radius;
        var currentDist = Math.sqrt((dx * dx) + (dy * dy)) * 1000; // in meter
        if (currentDist <= maxDist) {
            return true;
        } else {
            return false;
        }
    }
            
    
}

