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
        this.output();
        this.displayImageResults();
    },
    
    displayImageResults : function(){
        var timeseries = [];
        var provider = Status.get('provider');
        
        /*
         * 
        $.support.cors =  true;
        
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
        
        $.each(WizardOutlineController.selectedStations, function(id, station) {
            console.log("Each Station with timeseries: ");
            console.log(station);
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
    
    output : function(){
        console.log("Phe: onstart: " + WizardPhenomenController.results.onstart + " onend: " + WizardPhenomenController.results.onend + " Diff: " + WizardPhenomenController.results.diff);
        console.log("Pla: onstart: " + WizardPlaceController.results.onstart + " onend: " + WizardPlaceController.results.onend + " Diff: " + WizardPlaceController.results.diff);
        //console.log("Phe: onstart: " + WizardPhenomenController.results.onstart + " onend: " + WizardPhenomenController.results.onend + " Diff: " + WizardPhenomenController.results.diff);
        console.log("-------");
        console.log(WizardOutlineController.selectedDate);
        console.log(WizardOutlineController.selectedPhenomena);
        console.log(WizardOutlineController.selectedStations);
        console.log(WizardOutlineController.selectedPlaceType);
        console.log(WizardOutlineController.selectedCity);
        console.log(WizardOutlineController.selectedRadius);
        console.log(WizardOutlineController.selectedBBox);
        console.log(WizardOutlineController.currentResults);

    }
    
}


