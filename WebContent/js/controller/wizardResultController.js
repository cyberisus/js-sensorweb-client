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
    Created on : 20.08.2014, 08:56:00
    Author     : Boenki
*/

var WizardResultController = {
    
    init : function(){
        $(document).ready(function() {
            
            WizardResultController.initNaviLayout();
            WizardController.isLoading(false);  
            
            // check for parameters
            if (WizardResultController._hasParameter()) {
                $('.personalization-result-container').fadeIn('slow');
                WizardResultController.displayImageResults();
                WizardResultController.showResultsFromOtherUser( WizardOutlineController.selectedStations[0].tsID );
                //
                WizardResultController.output(); 
            } else {
                WizardController.setWarnings('no-parameters-selected');
                setTimeout( function() {
                    $('.wizard-pager').remove();
                    $('#wizard-content').empty();
                    WizardController.loadWizardTimePage();
                }, 5000);
            }
            
        });    
    },
    
    _hasParameter: function() {
        var check = true;
        console.log('--- HasParameters()');
        console.log(WizardOutlineController.selectedDate.from);
        console.log(WizardOutlineController.selectedDate.till);
        console.log(WizardOutlineController.selectedStations);
        console.log(!moment(WizardOutlineController.selectedDate.from).isValid());
        console.log(!moment(WizardOutlineController.selectedDate.till).isValid());
        console.log(moment(WizardOutlineController.selectedDate.till).isValid());
        console.log(moment(WizardOutlineController.selectedDate.till).isValid());
        
        
        if ($.isEmptyObject(WizardOutlineController.selectedStations)) {
            return false;
        } else if ( moment(WizardOutlineController.selectedDate.from).isValid() == false ) {
            return false;
        } else if ( moment(WizardOutlineController.selectedDate.till).isValid() == false ) {
            return false;
        } else {
            return true;
        }

    },
    
    clickListener: function(){
        // add one ts to chart
        $('[data-action=btnAddSingleTs]').on('click', function(event){
            var timeseriesID = $(this).attr('tsid');
            WizardResultController.addTsToChart( timeseriesID );   
            event.stopPropagation();
        });
        
        // add more then one ts to chart
        $('[data-action=addSelectedTs]').on('click', function(){
            TimeSeriesController.removeAllTS();
            ChartController.clearChart();
            $('#sim-results #output div[selected=selected]').each(function()
            {
                var tsID = $(this).find('a').attr('tsid');
                if(tsID !== "" && tsID !== "undefined") {    
                    WizardResultController.addTsToChart( tsID );
                }
            });                 
        });
        
        // check / uncheck timeseries
        $('#sim-results #output div').on('click', function(){
            if($(this).attr('selected')){
                $(this).removeAttr('selected');
                $(this).removeClass('ts-selected');
            } else {
                $(this).attr('selected', 'true');
                $(this).addClass('ts-selected');
            } 
        });
        
        // save search parameter
        
        
    },
    
    addTsToChart: function(timeseriesID) {
        var provider = Status.get('provider');       
        Pages.navigateToChart();
        TimeSeriesController.addTSbyId(timeseriesID, provider.apiUrl);
        var from = WizardOutlineController.selectedDate.from;
        var till = WizardOutlineController.selectedDate.till;
        TimeController.currentTimespan = {
            from: from,
            till: till,
            mode: "range"
        };
        TimeController.updateTimeExtent();
    },
    
    showResultsFromOtherUser: function( ts ) {
        $.when(Personalization.getSimilarResultsFromOtherUser( ts )).then( function( results ) {
            console.log('RES: ResultsFromOtherUser1');
            console.log(results);
            
            var apiUrl = Status.get('provider').apiUrl;
            var tsIDs = Object.keys(results); 

            if (!$.isEmptyObject(tsIDs))
            {
                
                var maxlength = tsIDs.length > 4 ? 4 : tsIDs.length;
                for(var i = 0; i < maxlength; i++){
                    
                    Rest.timeseries(tsIDs[i], apiUrl, null).done($.proxy(function(resultsTS){
                        
                        var lastVal = resultsTS.getLastValue();
                        console.log("LastValueObjct: " + lastVal);
                        console.log(lastVal);
                        var valueP = $.isEmptyObject(lastVal) ? '' : '<p>' + lastVal.value + ' ' + resultsTS.getUom() + ' (' + moment(+lastVal.timestamp).format() + ')</p>';
                         $('#other-user-results #output')
                            .append('<div >' 
                                + '<h4>' + resultsTS.getPhenomenonLabel() + '</h4>' 
                                + '<p>' + resultsTS.getProcedureLabel() + '</p>'
                                + '<p>' + resultsTS.getStationLabel() + '</p>'
                                + valueP
                                + '<p><a type="button" data-action="btnAddSingleTs" tsid="' + resultsTS.getTsId() + '"></a></p>'
                                +'</div>');

                    }));
                    
                }
                 
            } else {
                $('#other-user-results #output')
                            .append('<div class="">There are no similar results from other users.</div>');
            }
            
            
           
            
            
        });
    },
    
    displayImageResults : function(){
        var timeseries = [];
        var provider = Status.get('provider');
        
        
        
        /*
        Personalization.getAllUsers().done($.proxy(function(results) {
            // stuff
            $.each(results, function(id, result) {
                console.log(result);
            });
        }));
        
        Personalization.getUserById(2).done($.proxy(function(result) {
            // stuff
            $.each(result, function(id, person) {
                console.log(person);
            });
        }));
        */
        //
        if (!$.isEmptyObject(WizardOutlineController.selectedStations)) {      // check if some station are in the array
            Personalization.getSimilarTs(WizardOutlineController.selectedStations[0].tsID)
                .done($.proxy(function(result) {
                // stuff
                console.log("--------- REST SIMILARITY ----------");
                //console.log("Request: "+WizardOutlineController.selectedStations[0].tsID);
                console.log(result);

                $.each(result, function(id, ts) {

                    // set variable
                    var tsID = ts.id;
                    var offering = ts.offeringlabel;
                    var phenomenon = ts.phenomenonlabel;
                    var uom = ts.uom;
                    var lastValue = ts.lastValue;
                    var lastValueTime = ts.lastValueTime;
                    var procedure = ts.procedurelabel;

                    // check if latest data in timerange
                    var validTimeRange = "";
                    var isBefore = moment(+lastValueTime).isBefore(WizardOutlineController.selectedDate.from);

                    if (isBefore) {
                        validTimeRange = '<span title="There are no results for your selected time range!" class="noValue"></span>';
                    }

                    // first define cite with coods from ts
                    var city = "no City";
                    var lat = ts.lat;
                    var lng = ts.lng;

                    // create structure to fill
                    $('#sim-results #output')
                            .append('<div class="">' +
                                    '<p><h4>' + phenomenon + '</h4>' + validTimeRange + '</p>' +
                                    '<p>' + procedure + '</p>' +
                                    '<p>' + offering + '</p>' +
                                    '<p class="city' + id + '">' + city + '</p>' +
                                    '<p>' + lastValue + ' ' + uom + ' (' + moment(+lastValueTime).format() + ')</p>' +
                                    '<p><a type="button" data-action="btnAddSingleTs" tsid="' + tsID + '"> </a></p>' +
                                    '</div>');

                    var geocoder = new google.maps.Geocoder();
                    var lat = parseFloat(lat);
                    var lng = parseFloat(lng);
                    var latlng = new google.maps.LatLng(lng, lat);
                    geocoder.geocode({'latLng': latlng}, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results[1]) {
                                console.log(results);
                                var cityobj = results[1];
                                $('.city' + id).html('City <span>' + results[1].formatted_address + '</span>');

                            }
                        }
                    });

                });

                $('#sim-results #output')
                        .append('<br style="clear: both" />')
                        .append('<a type="button" data-action="addSelectedTs">Add selected TS to Chart</a>');
                //
                WizardResultController.clickListener();

            })).fail($.proxy(function(jqXHR, textStatus, abc) {
                alert("Request failed: " + textStatus);
                console.log(jqXHR.responseText);
            }));
        }
        

        
        $.each(WizardOutlineController.selectedStations, function(id, station) {
            console.log("Each Station with timeseries: ");
            console.log(station);
            
            WizardOutlineController.selectedTS.push(station.tsID);
            
            var offering = station.timeserie.offering.label;
            var foI = station.timeserie.feature.label;
            var procedure = station.timeserie.procedure.label;
            var phenomen = station.timeserie.phenomenon.label;
            var time = WizardOutlineController.selectedDate.from + "/" + WizardOutlineController.selectedDate.till;
            var link = "http://fluggs.wupperverband.de/sos/sos?" + 
                            "service=SOS&" + 
                            "REQUEST=GetObservation&" + 
                            "version=1.0.0&" +
                            "offering="+ offering + "&" +
                            "observedProperty="+ phenomen +"&" +
                            "eventTime="+ time +"&" +
                            "featureOfInterest="+ foI +"&" +
                            "procedure="+ procedure +"&" +
                            "diagramWidth=330&" +
                            "diagramHeight=200&" +
                            "responseFormat=image/jpeg";
                           
            $('#wizard-conent-result #results').append('<div loadid="loadimg'+id+'" class="resultimg"><img src="' + link + '"></div>');

            console.log("REST.timeseries: ");
            Rest.timeseries(null, provider.apiUrl, {
                service: provider.serviceID,
                phenomenon: station.timeserie.phenomenon.id,
                station: station.id,
                expanded: true
            }).done($.proxy(function(result) {


                
                        
                    
                
                $.each(result, function(id, results) {
                    
                    
                    /*
                    Rest.tsImage(results.getTsId(), time, provider.apiUrl, null )
                            .done($.proxy(function(erg) {
                                console.log(erg);
                            }));
                
                    timeseries.push(results.getTsId());
                    Rest.timeseries(results.getTsId(), provider.apiUrl, {
                        service: provider.serviceID,
                        expanded: true,
                        //timespan: time,
                        //base64: true,
                        force_latest_values: true,
                        status_intervals: true
                    }).done($.proxy(function(timeserie) {
                        console.log("TS-ID Result: ");
                        console.log(timeserie);
                        console.log(timeserie.fetchData(time) );
                        console.log(timeserie.getLastValue() );
                        console.log(timeserie.hasData() );
                        console.log(timeserie.getValues() );
                        
                        var timespan =  {
                            from: WizardOutlineController.selectedDate.from,
                            till: WizardOutlineController.selectedDate.till
                        }
                        timeserie.fetchData(timespan, function(){console.log("Data loaded.")});
                        

                    }));
                    
                    */
                
                });


                
            }));

            
        });
    },
    
    /*
     * http://sensorweb.demo.52north.org/52nSOSv3.2.1/sos?service=SOS
     * http://fluggs.wupperverband.de/sos/sos?service=SOS
     * http://www.fluggs.de/sos2/sos
     * http://fluggs.wupperverband.de/sos/sos?
     * 
      <img src="http://fluggs.wupperverband.de/sos/sos?
service=SOS&
REQUEST=GetObservation&
version=1.0.0&
offering=Niederschlag&
observedProperty=Niederschlagshoehe&
eventTime=2013-01-01T12:17:03.027/2014-01-01T12:17:03.027&
featureOfInterest=Opladen&
procedure=Niederschlagshoehe_Ronsdorf__Stundensumme&
responseFormat=image/jpeg"
/>
    
     */
    
    onImageLoad : function(selector, callback){
        $(selector).each(function(){
            if (this.complete || /*for IE 10-*/ $(this).height() > 0) {
                callback.apply(this);
            }
            else {
                $(this).on('load', function(){
                    callback.apply(this);
                });
            }
        });
    },
    
    initNaviLayout: function(){
        $('#wizard #wizard-nav').find('.active').removeClass('active');
        $('#wizard #wizard-nav').find('.active-last').removeClass('active-last');
        $('#wizard #wizard-nav .time').addClass('active');  
        $('#wizard #wizard-nav .phenomen').addClass('active');  
        $('#wizard #wizard-nav .place').addClass('active'); 
        $('#wizard #wizard-nav .result').addClass('active-last');  
    },
    
    output : function(){
        console.log("Phe: onstart: " + WizardPhenomenController.results.onstart + " onend: " + WizardPhenomenController.results.onend + " Diff: " + WizardPhenomenController.results.diff);
        console.log("Pla: onstart: " + WizardPlaceController.results.onstart + " onend: " + WizardPlaceController.results.onend + " Diff: " + WizardPlaceController.results.diff);
        //console.log("Phe: onstart: " + WizardPhenomenController.results.onstart + " onend: " + WizardPhenomenController.results.onend + " Diff: " + WizardPhenomenController.results.diff);
        console.log("-------");
        console.log(WizardOutlineController.selectedDate);
        console.log(WizardOutlineController.selectedPhenomena);
        console.log(WizardOutlineController.selectedStations);
        console.log(WizardOutlineController.selectedTS);
        console.log(WizardOutlineController.selectedPlaceType);
        console.log(WizardOutlineController.selectedCity);
        console.log(WizardOutlineController.selectedRadius);
        console.log(WizardOutlineController.selectedBBox);
        console.log(WizardOutlineController.currentResults);

    }

    
}


