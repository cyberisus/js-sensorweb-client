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
    Created on : 05.08.2014, 14:17:13
    Author     : Boenki
*/

var WizardTimeController = {
    
    isLoaded : false,
    
    init: function(){
        $(document).ready(function() {
            
                WizardTimeController.loadTimeRangeSlider();
                WizardTimeController.loadPresets();
                WizardTimeController.initButtons();

            
        });
    },
    
    loadTimeRangeSlider: function () {
        
          
            
            var startValue = $.Link({
                    target: '-tooltip-<div class="tooltip"></div>',
                    //target: $("#wizard-time-startPicker")
                    method: function ( value ) {
                            $("#wizard-time-startPicker").val(value);
                            var theDate = new Date(+value);
                            $(this).html(
                                    '<strong>Value: </strong>' +
                                    '<span class="pfeil"></span><span  id="wizard-time-startSlider-value">' + formatDate(theDate) + '</span>'        
                            );
                            $('#wizard-time-startPicker').val( formatDate(theDate) );       
                    } 
            });
            
            var endValue = $.Link({
                    target: '-tooltip-<div class="tooltip"></div>',
                    method: function ( value ) {
                            $("#wizard-time-endPicker").val(value);
                            var theDate = new Date(+value);
                            $(this).html(
                                    '<strong>Value: </strong>' +
                                    '<span class="pfeil"></span><span  id="wizard-time-endSlider-value">' + formatDate(theDate, true) + '</span>'    
                            );
                            $('#wizard-time-endPicker').val( formatDate(theDate, true) );                        
                    } 
            });
            
            $("#wizard-dateslider").noUiSlider({
                start: 40,
                    range: {              
                        min: timestamp('2010'),
                        max: timestamp('2015')
                    },
                    connect: true,
                    step: 24 * 60 * 60 * 1000, // * 7
                    start: [ timestamp('2011'), timestamp('2013') ],
                    serialization: {
                            lower: [ startValue ],
                            upper: [ endValue ],
                        format: {
                            decimals: 0   
                        }
                    }
            });
            
            $('#wizard-time-startPicker').datepicker({
                position:'above',
                autoclose: true,
                format: 'dd.mm.yyyy'
            
            }).on('changeDate', function (date){
               
                TimeController.evaluateDate;
                $(this).val( $(this).val() + ' 00:00+02:00');  
                $('#wizard-time-startSlider-value').text( formatDate(date.date) );
               
            });
            
            $('#wizard-time-endPicker').datepicker({
                position:'above',
                autoclose: true,  
                format: 'dd.mm.yyyy'
            
            }).on('changeDate', function (date){
               
                TimeController.evaluateDate;        
                $(this).val( $(this).val() + ' 23:59+02:00'); 
                $('#wizard-time-endSlider-value').text( formatDate(date.date) );
           });
               
       

    },
    
    loadPresets : function() {
        // Better way?
        $(document).ready(function() {       
            var data = TimeController.timeRangeData;             
            $.each( TimeController.timeRangeData, function( key, timespan ) {
                $.each( timespan, function( key, timespan2 ) {
                    $('#wizard-conent-time #presets').append('<a class="btn btn-default multiline-button preset-btn">' + timespan2.label + '</a>');
                });
            });
        });
    },
    
    initButtons : function(){
        $('#wizard-buttons .btnNext').on('click', function() {
            $('.wizard-pager').remove();
            WizardController.loadWizardPhenomenPage();
            WizardController.setActiveNav( $('#wizard-nav li.phenomen') );
        });
        $('#wizard-buttons .btnSkip').on('click', function() {
            //
        });
    }
}

// Create a new date from a string, return as a timestamp.
function timestamp(str){
    return new Date(str).getTime();   
}

// Create a string representation of the date.
function formatDate ( date, start ) {
    var hours = (start == true) ? "23" : "00";
    var minutes = (start == true) ? "59" : "00";
    var day = (date.getDate() < 10) ? "0" + date.getDate() : date.getDate();
    var month = date.getMonth() + 1;
    month = (month < 10) ? "0" + month : month;
    
    return  day + '.' + month + '.' + date.getFullYear() + ' ' +
            hours + ':' + minutes + '+02:00';
    /*
    return weekdays[date.getDay()] + ", " +
        date.getDate() + nth(date.getDate()) + " " +
        months[date.getMonth()] + " " +
        date.getFullYear();
        */
}

