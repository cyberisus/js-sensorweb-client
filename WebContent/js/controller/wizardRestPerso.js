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

var apiURL = Settings.boenkiProvider['apiUrl'];

var Personalization = {
    
    lastSearch : '', // on start get Object from DB
    
    getAllUsers: function() {
        return $.ajax({
            url: apiURL + 'user/',
            dataType: 'json',
            cache: false,
            crossDomain: true
        });
    },
    
    getUserById: function(id) {
        return $.ajax({
            url: apiURL + 'user/' + id,
            dataType: 'json',
            cache: false,
            crossDomain: true
        });
    },
    
    
    
    
    getSimilarTs: function(ts) {
        return $.ajax({
            url: apiURL + 'sim/' + ts,
            dataType: 'json',
            cache: false,
            crossDomain: true
        });  
    },
    
    /*
     *  Save search request from user to DB ------------------------------------
     */
    
    saveSearchRequest: function() {
        console.log(Personalization.getSearchParameters());
        return $.ajax({
            type: "POST",
            url: apiURL + 'search/add',
            data: Personalization.getSearchParameters(),
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            crossDomain: true
        });  
    },
    
    getSearchParameters: function() {
         var searchObj = {
             'userid'       : localStorage.getItem("sensorweb-wizard-user"),
             'from'         : WizardOutlineController.selectedDate.from,
             'till'         : WizardOutlineController.selectedDate.till,
             'phenomenon'   : WizardOutlineController.selectedPhenomenaID,
             'place'        : WizardOutlineController.selectedRadius,
             'timeseries'   : WizardOutlineController.selectedTS,
             'searchtime'   : moment().format()
         };     
         var jObj = $.toJSON(searchObj);
         return jObj;
    },
    
    getLastSearchFromUser : function(userID) {
        var dfd = $.Deferred();
        $.ajax({
            url: apiURL + 'search/last/' + userID,
            dataType: 'json',
            cache: false,
            crossDomain: true
        }).done(function(result){
            dfd.resolve(result);
        });
        return dfd.promise();
    },
    
    getLastSearch : function() {
        var dfd = $.Deferred();
        $.ajax({
            url: apiURL + 'search/last',
            dataType: 'json',
            cache: false,
            crossDomain: true
        }).done(function(result){
            dfd.resolve(result);
        });
        return dfd.promise();
    },
    
    getSimilarResultsFromOtherUser : function( ts ) {
        var dfd = $.Deferred();
        $.ajax({
            url: apiURL + 'search/other/' + ts,
            dataType: 'json',
            cache: false,
            crossDomain: true
        }).done(function(result){
            dfd.resolve(result);
        });
        return dfd.promise();
    },
    
    
    /*
     *  Collect user data to save in DB if new user ----------------------------
     */
    
    /* Rest call */
    saveUserData: function(user) {
        return $.ajax({
            type: "POST",
            url: apiURL + 'user/update',
            data: user,
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            crossDomain: true
        });  
    },
    
    
    /* functions to collect data */
    createUserObject: function(ip){
        var user = {
            'id': Personalization.getUserId(),
            'ip' : ip,
            'agent' : navigator.userAgent,
            'visittime' : moment().format(),
            'referrer' : document.referrer,
            'platform' : navigator.platform
        }; 
        var userJson = $.toJSON(user);
        console.log('LOG: Try to save user: ' + userJson);
        return userJson;
    },
    
    getUserId: function() {      
        var d = new Date();
        var id = d.getTime();
        // save NEW user
            
        if(Personalization.supportLocalStorage){
            if(localStorage.getItem("sensorweb-wizard-user") === null){
                localStorage.setItem("sensorweb-wizard-user", id);
                console.log('LocSto: Create new ID storage item');
                return id;
            } else {
                id = localStorage.getItem("sensorweb-wizard-user");
                console.log('LocSto: Get ID from storage');
                return id;
            }    
        } else {
            console.log('ERR: localStorage not supported!');
            return -1;
        }
         
    },
      
      
    getUserIp: function(){
        var dfd = $.Deferred();
        var userip = null;
        // simple solution -> better: server response
        $.get("http://ipinfo.io", function (response) {
            console.log('CL -> IP_' + response.ip);
            userip = response.ip;
            dfd.resolve(userip)
            
        }, "jsonp");

        console.log('CL -> return now');
        return dfd.promise();
        //return userip;
    },
    
    supportLocalStorage: function() {
        try {
          return 'localStorage' in window && window['localStorage'] !== null;
        } catch(e){
          return false;
        } 
    }
    
    
    
    
    
}

