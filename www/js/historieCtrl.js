angular.module('starter.historieCtrl', ['ionic'])

.controller('HistorieCtrl', function($scope, $stateParams, $ionicModal, $timeout, $log, $cordovaDialogs, HistorieStorage) {
    
    $scope.medicine = HistorieStorage.loadAll();
    $scope.optionNav = false;
  
    $scope.params = $stateParams.isNichtEingenommen;
        if ($scope.params == "true") {
            $scope.nichtGenommen = true;
        } else {
            $scope.nichtGenommen = false;
        }
    ;
    
    $scope.updateToggle = function() {
        if($scope.nichtGenommen == false) {
            $scope.nichtGenommen = true;
        } else {
            $scope.nichtGenommen = false;
        }
    }
    ;
    
    $scope.toggleOptionNav = function() {
        if ($scope.optionNav) {
            $scope.optionNav = false;
        } else {
            $scope.optionNav = true;
        }
    }
    ;
    
    $scope.checkFilter = function(x) {
        var vonDateValue = $scope.onezoneDatepickervon.date.valueOf();
        var bisDateValue = $scope.onezoneDatepickerbis.date.valueOf();
        // TODO: Für Testzwecke wurde die bisZeit auskommentiert
        if ((x.einnahmezeitsoll >= vonDateValue) /*&& (x.einnahmezeitsoll <= maxDateValue)**/){
            if ($scope.nichtGenommen == true) {
                if (x.einnahmezeitist == null){
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }   
        } else {
            return false;
        }   
    }
    ;


      
    $scope.currentDate = new Date();
    $scope.minDate = new Date(2000, 6, 1);
    $scope.maxDate = new Date();
 
    $scope.onezoneDatepickervon = {
        date: new Date(), // MANDATORY                    
        mondayFirst: false,             
        // months: months,                 
        // daysOfTheWeek: daysOfTheWeek,   
        startDate: new Date(1900, 1, 1),           
        endDate: new Date(),                   
        disablePastDays: false,
        disableSwipe: false,
        disableWeekend: false,
        // disableDates: disableDates,
        // disableDaysOfWeek: disableDaysOfWeek,
        showDatepicker: false,
        showTodayButton: true,
        calendarMode: false,
        hideCancelButton: false,
        hideSetButton: false,
        //highlights: highlights,
        callback: function(value){
        $scope.showFilter = function(x) {
            retur(true);
        }
        }
    }
    ;

    $scope.onezoneDatepickerbis = {
        date: new Date(), // MANDATORY                    
        mondayFirst: false,             
        // months: months,                 
        // daysOfTheWeek: daysOfTheWeek,   
        startDate: new Date(1900, 1, 1),           
        endDate: new Date(),                   
        disablePastDays: false,
        disableSwipe: false,
        disableWeekend: false,
        // disableDates: disableDates,
        // disableDaysOfWeek: disableDaysOfWeek,
        showDatepicker: false,
        showTodayButton: true,
        calendarMode: false,
        hideCancelButton: false,
        hideSetButton: false,
        //highlights: highlights,
        callback: function(value){}
    }
    ;
    
    $scope.changeEinnahmeStatus = function(einnahme) {
        if (einnahme.einnahmezeitist == null){
            $cordovaDialogs.confirm('Möchten Sie die Einnahme des Medikamentes bestätigen?', 'Einnahme bestätigen', ['JA','NEIN'])
            .then(function(buttonIndex) {
                // no button = 0, 'eingenommen' = 1, 'nichtGenommen' = 2
                var btnIndex = buttonIndex;
                if(btnIndex == 1) {
                    einnahme.einnahmezeitist = new Date().getTime();
                } else {
                    einnahme.einnahmezeitist = null;
                }
                EinnahmeStorage.updateEinnahme(einnahme);
            });
        }
    }

    
});
