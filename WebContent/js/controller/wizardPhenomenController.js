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

var WizardPhenomenController =  {
    
    init : function() {
        var provider = Status.get('provider');
        Rest.phenomena(null, provider.apiUrl, {
            service: provider.serviceID
        }).done($.proxy(this.fillPhenomenaList, this));
        this.initButtons();
    },
    
    fillPhenomenaList : function(results) {
        $.each(results, $.proxy(function(index, elem) {
            var test = Math.floor((Math.random() * 3));
            var phe = '<label><input type="checkbox" hasstations="' + test + '" class="chkPhenomen" data-id="' +elem.id + '"> ' + elem.label +' (+' + test + ')</label>';
            $('#wizard-conent-phenomen .phenomena-list').append(phe);            
        }));
        this.handleChanges();
    },
    
    warningNoStations : function() {    
        $('#wizard-conent-phenomen .phenomena-list').before(
            '<p class="wizard-warningbox">There are no stations for your selection.<p>'
        ); 
    },
    
    handleChanges : function(){
        $('#wizard-conent-phenomen .phenomena-list input').change( function() {
            if ($(this).is(':checked') && $(this).attr('hasstations') == 0 ){
                WizardPhenomenController.warningNoStations();
            } else if( $(this).is(':checked') && $(this).attr('hasstations') != 0 ){
                // add to OutlineBox
            };
        });
        $('#wizard-conent-phenomen .phenomena-list input').focusout( function() {
            $('#wizard-conent-phenomen p.wizard-warningbox').remove();
        });
    },
    
    initButtons : function(){
        $('#wizard-buttons .btnNext').on('click', function() {
            $('.wizard-pager').remove();
            WizardController.loadWizardPlacePage();
            WizardController.setActiveNav( $('#wizard-nav li.place') );
        });
        $('#wizard-buttons .btnBack').on('click', function() {
            $('.wizard-pager').remove();
            WizardController.loadWizardTimePage();
            WizardController.setActiveNav( $('#wizard-nav li.time') );
        });
        $('#wizard-buttons .btnSkip').on('click', function() {
            //
        });
    }
    
    
}


