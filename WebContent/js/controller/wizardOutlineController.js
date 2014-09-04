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

var WizardOutlineController = {
    
    selectedDate        : [{'from' : ''},{'till' : ''}, {'mode' : ''}],
    selectedPhenomena   : [],
    selectedStations    : [],
    selectedPlaceType   : "",
    selectedCity        : "",
    selectedRadius      : [{lat: ''},  {lng: ''} ,  {radius: ''}],
    selectedBBox        : [],
    currentResults      : 0,
    
    init : function() {
        this.editSelectedFeatures();
        //alert(moment().startOf('day'));
        
        
        
    },
    
    refreshOutline : function() {
        
    },
    
    handleDates : function () {},
    
    handlePhenomena : function() {},
    
    handlePlaces : function() {},
    
    updateResultNumber : function(opt, number) {
        //var num = $('.outline-resultnumber').text();
        var num = this.currentResults; 
        var newResultCounts;
        if(opt == "add"){
            newResultCounts = parseInt(num) + number;
        } else if(opt =="sub"){
            newResultCounts = parseInt(num) - number;
        } else {
            newResultCounts = number;
        }
        //this.currentResults = newResultCounts;
        $('.outline-resultnumber').text(newResultCounts);
    },
    
    addDates : function(timespan) {
        this.selectedDate = timespan;
        this.selectedDate.mode  = timespan.mode;
        this.selectedDate.from  = moment(timespan.from).format();
        this.selectedDate.till  = moment(timespan.till).endOf('day').format();
        $('.datebox-start').text(this.selectedDate.from);
        $('.datebox-end').text(this.selectedDate.till);
    },
    
    addPhenomena : function(phenomena) {
        this.selectedPhenomena = phenomena;
        $('.phenomenbox-phenomena').empty();
        if( phenomena.length > 0) {
            $.each( phenomena, function( i, val ){
                $('.phenomenbox-phenomena').append( "<li>" + val + "</li>");
            });
        } else {
            $('.phenomenbox-phenomena').append( "<p>No selected phenomen.</p>");
        }
    },
    
    addPlaceRadius : function(place){
        this.selectedPlaceType = "radius";
        this.selectedRadius.lat = place.lat;
        this.selectedRadius.lng = place.lng;
        this.selectedRadius.radius = place.radius;
        $('.placebox-places').empty();
        $('.placebox-places').append('\
            <div>Lat: <span class="placebox-radius-lat">'+  Math.round(this.selectedRadius.lat * 100000) / 100000  +'</span></div>\n\
            <div>Lng: <span class="placebox-radius-lng">'+ Math.round(this.selectedRadius.lng * 100000) / 100000  +'</span></div>\n\
            <div>Radius: <span class="placebox-radius-radius">'+  Math.round(this.selectedRadius.radius * 100) / 100 +'</span></div>\n\
        ');
    },
    
    addPlaceBBox : function(){

    },
    
    addPlaceCity : function(){

    },
    
    
    editSelectedFeatures : function(){
        $('.edit-datebox').on('click', function(){ $('.wizard-pager').remove(); WizardController.loadWizardTimePage(); });
        $('.edit-phenomenbox').on('click', function(){ $('.wizard-pager').remove(); WizardController.loadWizardPhenomenPage(); });
        $('.edit-placebox').on('click', function(){ $('.wizard-pager').remove(); WizardController.loadWizardPlacePage(); });
    }
   
}


