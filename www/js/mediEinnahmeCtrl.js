angular.module('starter.mediEinnahmeCtrl', [])


.controller('MediEinnahmeCtrl', ['$window','$log', '$scope', '$ionicModal', '$timeout', '$ionicPopup', '$cordovaDialogs', 'MediStorage', 'EinnahmeStorage',  function($window, $log, $scope, $ionicModal, $timeout, $ionicPopup , $cordovaDialogs, MediStorage, EinnahmeStorage) {

    //Controller mediEinnahmeCtrl

   // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  
  // Form data for the mediEinnahme_neu modal
  $scope.mediEinnahmeData = [];
  $scope.mediData = [];
  $scope.checkvalid = {};
  
  var defaultEinnahme = {
        mediname : "",
        einnahmemenge : {
            menge : 0.5,
            einheit : "keine Ein."
        },
        uhrzeit : "",
        wiederholungstag : {
          mo : true,
          di : true,
          mi : true,
          do : true,
          fr : true,
          sa : true,
          so : true, 
        },
        wiederholungsbeginn : "",
        wiederholungsende : "",
        vibration : false,
    }
  
  //Alle Medikamente laden und anschließend nur die Medikamente heraussuchen die einnahmen haben
  $scope.loadMedisForEinnahme = function() {
    $scope.mediEinnahmeData = []; //leeren
    $log.info('Start loadMedisForEinnahme');
    
    $scope.mediData = MediStorage.loadAllMedikament();
    var mediDataLength = $scope.mediData.length;
    for(var i=0; i < mediDataLength; i++){
      if ($scope.mediData[i].einnahmen != undefined && $scope.mediData[i].einnahmen.length > 0){
        for(var j=0; j < $scope.mediData[i].einnahmen.length; j++){
          $scope.mediEinnahmeData.push($scope.mediData[i].einnahmen[j]);  
        }
      }
    }
    $log.info('Ende loadMedisForEinnahme, Medikamente mit vorhandenen Einnahmen herausgefiltert');
  };
  //Liste von Medikament und Einnahmen laden
  $scope.loadMedisForEinnahme();
  
  // Erstellung einer neuen Einnahme.id
  $scope.creatId = function() {
    var id = Date.now();
    $log.info('Neue ID :' + id);
    return id;
  };
 
  
  // Create the mediEinnahme_neu modal that we will use later
    $ionicModal.fromTemplateUrl('templates/mediEinnahme_edit.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.einnahmeview = modal;
  });
  
  // Triggered in the mediEinnahme_neu modal to close it
  $scope.closeMediEinnahmeNeu = function() {
    $scope.einnahmeview.hide();
    $scope.einnahme = angular.copy(defaultEinnahme); //Reset
  };
  
  // Triggered in the mediEinnahme_edit modal to close it
  $scope.closeMediEinnahmeEdit = function() {
    $scope.einnahmeview.hide();
    $scope.einnahme = angular.copy(defaultEinnahme); //Reset
  };
  
//// deleteMediEinnahme
  $scope.deleteMediEinnahme = function(deleteMediEinnahmeId) {
     //Abfangen ob es sich um ein neues Objekt handelt
     if ( !$scope.isNewEin ){
          $log.info('Delete: ' + deleteMediEinnahmeId);
          
          //Zukünftige Einnahmen in der Webstorage ebenfalls löschen
          EinnahmeStorage.deleteEinnahme(deleteMediEinnahmeId);
     
          //einnahme.med in einen richtiges Objekt umwandeln
          //$scope.einnahme.med = JSON.parse($scope.einnahme.med);
          $log.debug("In diesem Med wird gelöscht: " + $scope.einnahme.mediname);     
                    
          //Einnahme für das jeweilige Medikament in der Webstorage löschen/speichern
          //1. Medikament suchen
          var mediDataLength = $scope.mediData.length;
          for (var i=0; i < mediDataLength; i++){
            if ($scope.mediData[i].mediname == $scope.einnahme.mediname){ //TODO auf medi-id suche umstellen
              
              //2. Einnahme im Medikament suchen und anschließend löschen
              var mediEinnahmenLength = $scope.mediData[i].einnahmen.length;
              for (var j=0; j < mediEinnahmenLength; j++){
                if($scope.mediData[i].einnahmen[j].id == deleteMediEinnahmeId){
                  $log.debug("mediData[i].einnahmen[j] " + $scope.mediData[i].einnahmen[j].id);                  
                  $scope.mediData[i].einnahmen.splice(j, 1);
                  break;
                }
              }
              
              //3. Medikament in der Storage aktualisieren
              MediStorage.updateMedikament($scope.mediData[i]);
            }
          }
          
            //Liste von Medikament und Einnahmen laden
            $scope.loadMedisForEinnahme();
          
     } else {
        //Objekt soll nicht gelöscht werden, da es ein neues Objekt war 
          $log.info('Neues Objekt, wird nur verworfen');
     }
     
     $scope.closeMediEinnahmeEdit();
  };

  
//// Open the mediEinnahme_neu modal
  $scope.mediEinnahmeNeu = function() {
    $scope.isNewEin = true;             //kennzeichnet neue Einnahme
    $scope.loadMedisForEinnahme();      //Liste von Medikament und Einnahmen laden
    $scope.id = $scope.creatId();
    defaultEinnahme.uhrzeit = new Date(new Date().toString().slice(0,21)); //auf die aktuelle Uhrzeit setzen
    defaultEinnahme.wiederholungsbeginn = new Date(); 
    defaultEinnahme.wiederholungsende = new Date(); 
    defaultEinnahme.wiederholungsende.setHours(23,59,59); //auf Ende des Tages setzen
    $scope.einnahme = angular.copy(defaultEinnahme);
    $log.debug("Uhrzeit: " + $scope.einnahme.uhrzeit);
    $scope.einnahmeview.show();
    
  };
  
//// Open the mediEinnahme_edit modal
  $scope.mediEinnahmeEdit = function(editObject) {
    $scope.isNewEin = false;
    $scope.loadMedisForEinnahme();      //Liste von Medikament und Einnahmen laden
      $log.info('Edit Object: ', editObject);
        
        //Falls $scope.einnahme aus irgendwelchen Gründen nicht vorhanden ist,
        //um Fehler abzufangen, wird eine neue Instanz vorläufig geladen
        if($scope.einnahme == undefined){
          $scope.einnahme = angular.copy(defaultEinnahme);
        }
        
        
        //$scope.einnahme.med muss gesetzt werden
        $scope.setEinnahmeMed(editObject.mediname);
        $log.debug("Format von einnahme.med: " + $scope.einnahme.med);
        
        $scope.einnahme.id = editObject.id;
        $scope.einnahme.mediname = editObject.mediname;
        $scope.einnahme.einnahmemenge = editObject.einnahmemenge;
        $scope.einnahme.uhrzeit = new Date(editObject.uhrzeit);
        $scope.einnahme.wiederholungstag = editObject.wiederholungstag;
        $scope.einnahme.wiederholungsbeginn = new Date(editObject.wiederholungsbeginn);
        $scope.einnahme.wiederholungsende = new Date(editObject.wiederholungsende);
        $scope.einnahme.vibration = editObject.vibration;
        $log.debug("Einnahme: " + $scope.einnahme);
        $scope.tmpPackungsgroesse = editObject.packungsgroesse;

        
        //wichtig für später zur Überprüfung ob Medikament für eine vorhandene Einnahme geändert wurde. 
        $scope.tempMediId = $scope.einnahme.med.id;
        
    $scope.einnahmeview.show();
  };
  
//// Validation
  $scope.checkInput = function () {
    if( $scope.einnahme.med == undefined){
      $scope.whichinvalid = "Medikament";
          $cordovaDialogs.alert('Kein gültiges Medikament ausgewählt!', 'Medikament Fehlerhaft', 'OK')
              .then(function() {
             // callback success
          });
      return false;
    } else if ($scope.einnahme.einnahmemenge.menge == undefined) {
      $scope.whichinvalid = "Einnahme Menge";
          $cordovaDialogs.alert('Kein gültige Einnahme Menge ausgewählt!', 'Einnahme Menge Fehlerhaft', 'OK')
             .then(function() {
             // callback success
          });
      return false;
    } else if ($scope.einnahme.einnahmemenge.einheit == undefined) {
      $scope.whichinvalid = "Einheit Menge";
           $cordovaDialogs.alert('Kein gültige Einnahme Einheit ausgewählt!', 'Einnahme Einheit Fehlerhaft', 'OK')
             .then(function() {
              // callback success
           });
      return false;
    } else if ($scope.einnahme.uhrzeit == undefined) {
      $scope.whichinvalid = "Uhrzeit";
           $cordovaDialogs.alert('Keine gültige Uhrzeit ausgewählt!', 'Uhrzeit Fehlerhaft', 'OK')
             .then(function() {
              // callback success
           });
      return false;
    } else if ($scope.einnahme.wiederholungsbeginn == undefined) {
      $scope.whichinvalid = "Wiederholungsbeginn";
           $cordovaDialogs.alert('Kein gültige Einnahmebeginn Menge ausgewählt!', 'Wiederholungsbeginn Fehlerhaft', 'OK')
             .then(function() {
              // callback success
           });
      return false;
    } else if ($scope.einnahme.wiederholungsende == undefined){
      $scope.whichinvalid = "Wiederholungsende";
           $cordovaDialogs.alert('Kein gültige Wiederholungsende ausgewählt!', 'Wiederholungsende Fehlerhaft', 'OK')
             .then(function() {
              // callback success
           });
      return false;
    } else {
      return true;
    }
  }  
  
//// Zukünftige Einnahmen berechnen und speichern
   $scope.setNextEinnahmen = function (nextMediEinnahme){
     var tempNextEinnahme = angular.copy(nextMediEinnahme);
     nextMediEinnahme.wanneinnahmen = [];
     
     if (nextMediEinnahme.wiederholungstag.mo || nextMediEinnahme.wiederholungstag.di || nextMediEinnahme.wiederholungstag.mi || nextMediEinnahme.wiederholungstag.do || nextMediEinnahme.wiederholungstag.fr || nextMediEinnahme.wiederholungstag.sa || nextMediEinnahme.wiederholungstag.so ){
        
        //erst soll ermittelt werden, welche Zeitangabe verwendet werden soll 
        //bzw. ob eine Wiederholungsbeginn hinter Aktuell liegt.
        if (nextMediEinnahme.uhrzeit < nextMediEinnahme.wiederholungsbeginn){
         
          //die Uhrzeit von Wiederholungsbeginn müsste angepasst werden. 
          var minusbeginnuhrzeit = nextMediEinnahme.wiederholungsbeginn.getHours()*60*60*1000 + nextMediEinnahme.wiederholungsbeginn.getMinutes()*60*1000 + nextMediEinnahme.wiederholungsbeginn.getMilliseconds();
          var minusuhrzeit = nextMediEinnahme.uhrzeit.getHours()*60*60*1000 + nextMediEinnahme.uhrzeit.getMinutes()*60*1000 + nextMediEinnahme.uhrzeit.getMilliseconds();
          var resttage = (nextMediEinnahme.wiederholungsbeginn.getTime() - minusbeginnuhrzeit) - (nextMediEinnahme.uhrzeit.getTime() - minusuhrzeit);
          var tag = 1*24*60*60*1000; //Tag in Millisekunden
          
          if(resttage < tag){
          tempNextEinnahme.wiederholungsbeginn.setTime(nextMediEinnahme.uhrzeit.getTime() + resttage + tag);
          } else {
          tempNextEinnahme.wiederholungsbeginn.setTime(nextMediEinnahme.uhrzeit.getTime() + resttage);  
          }
          
          $log.debug("Welcher Zeitpunkt ist größer 'Beginn': " + tempNextEinnahme.wiederholungsbeginn);
          
          
        } else {
          //sonst setze tempBeginn auf das aktuellere Datum/Zeitpunkt
          tempNextEinnahme.wiederholungsbeginn = nextMediEinnahme.uhrzeit;
          $log.debug("Welcher Zeitpunkt ist größer 'Uhrzeit': " + tempNextEinnahme.wiederholungsbeginn);
        }
        
        var tag = 1*24*60*60*1000; //Tag in Millisekunden
        var diffTage =  (((((tempNextEinnahme.wiederholungsende.getTime() - tempNextEinnahme.wiederholungsbeginn.getTime())/24)/60)/60)/1000);
        $log.debug("diffTage: " + diffTage);
        
        for(var i = 0; i < diffTage; i++){ //evtl. besser: while(tempNextEinnahme.wiederholungsbeginn < tempNextEinnahme.wiederholungsende)
 
          if (tempNextEinnahme.wiederholungsbeginn.getDay() == 0 && nextMediEinnahme.wiederholungstag.so){
            //Einnahme speichern und einen Tag hochzählen
            $log.debug("Einnahmezeitpunkt So: " + tempNextEinnahme.wiederholungsbeginn);
            var termin = new Date(tempNextEinnahme.wiederholungsbeginn.getTime());
            nextMediEinnahme.wanneinnahmen.push({zeitpunkt: termin.valueOf(), genommen: false});
            tempNextEinnahme.wiederholungsbeginn.setTime(tempNextEinnahme.wiederholungsbeginn.getTime() + tag);
          
          } else if (tempNextEinnahme.wiederholungsbeginn.getDay() == 1 && nextMediEinnahme.wiederholungstag.mo){
            //Einnahme speichern und einen Tag hochzählen
            $log.debug("Einnahmezeitpunkt Mo: " + tempNextEinnahme.wiederholungsbeginn);
            var termin = new Date(tempNextEinnahme.wiederholungsbeginn.getTime());
            nextMediEinnahme.wanneinnahmen.push({zeitpunkt: termin.valueOf(), genommen: false});
            tempNextEinnahme.wiederholungsbeginn.setTime(tempNextEinnahme.wiederholungsbeginn.getTime() + tag);
          
          } else if (tempNextEinnahme.wiederholungsbeginn.getDay() == 2 && nextMediEinnahme.wiederholungstag.di){
            //Einnahme speichern und einen Tag hochzählen
            $log.debug("Einnahmezeitpunkt Di: " + tempNextEinnahme.wiederholungsbeginn);
            var termin = new Date(tempNextEinnahme.wiederholungsbeginn.getTime());
            nextMediEinnahme.wanneinnahmen.push({zeitpunkt: termin.valueOf(), genommen: false});
            tempNextEinnahme.wiederholungsbeginn.setTime(tempNextEinnahme.wiederholungsbeginn.getTime() + tag);
          
          } else if (tempNextEinnahme.wiederholungsbeginn.getDay() == 3 && nextMediEinnahme.wiederholungstag.mi){
            //Einnahme speichern und einen Tag hochzählen
            $log.debug("Einnahmezeitpunkt Mi: " + tempNextEinnahme.wiederholungsbeginn);
            var termin = new Date(tempNextEinnahme.wiederholungsbeginn.getTime());
            nextMediEinnahme.wanneinnahmen.push({zeitpunkt: termin.valueOf(), genommen: false});
            tempNextEinnahme.wiederholungsbeginn.setTime(tempNextEinnahme.wiederholungsbeginn.getTime() + tag);
          
          } else if (tempNextEinnahme.wiederholungsbeginn.getDay() == 4 && nextMediEinnahme.wiederholungstag.do){
            //Einnahme speichern und einen Tag hochzählen
            $log.debug("Einnahmezeitpunkt Do: " + tempNextEinnahme.wiederholungsbeginn);
            var termin = new Date(tempNextEinnahme.wiederholungsbeginn.getTime());
            nextMediEinnahme.wanneinnahmen.push({zeitpunkt: termin.valueOf(), genommen: false});
            tempNextEinnahme.wiederholungsbeginn.setTime(tempNextEinnahme.wiederholungsbeginn.getTime() + tag);
          
          } else if (tempNextEinnahme.wiederholungsbeginn.getDay() == 5 && nextMediEinnahme.wiederholungstag.fr){
            //Einnahme speichern und einen Tag hochzählen
            $log.debug("Einnahmezeitpunkt Fr: " + tempNextEinnahme.wiederholungsbeginn);
            var termin = new Date(tempNextEinnahme.wiederholungsbeginn.getTime());
            nextMediEinnahme.wanneinnahmen.push({zeitpunkt: termin.valueOf(), genommen: false});
            tempNextEinnahme.wiederholungsbeginn.setTime(tempNextEinnahme.wiederholungsbeginn.getTime() + tag);
          
          } else if (tempNextEinnahme.wiederholungsbeginn.getDay() == 6 && nextMediEinnahme.wiederholungstag.sa){
            //Einnahme speichern und einen Tag hochzählen
            $log.debug("Einnahmezeitpunkt Sa: " + tempNextEinnahme.wiederholungsbeginn);
            var termin = new Date(tempNextEinnahme.wiederholungsbeginn.getTime());
            nextMediEinnahme.wanneinnahmen.push({zeitpunkt: termin.valueOf(), genommen: false});
            tempNextEinnahme.wiederholungsbeginn.setTime(tempNextEinnahme.wiederholungsbeginn.getTime() + tag);
          
          } else {
            //sonst einen Tag hochzählen ohne Einnahme zu speichern.
            tempNextEinnahme.wiederholungsbeginn.setTime(tempNextEinnahme.wiederholungsbeginn.getTime() + tag);
          }
        
        }//For zu ende
        
        //Speichern im Webstorage
        $log.debug(" - Zukünftige Einnahmen werden gesichert -");
        EinnahmeStorage.saveEinnahme(nextMediEinnahme);
        
        
     }//End If
     
   }//Ende Einnahmen-Berechnung
  
  
//// Perform the mediEinnahme_neu action when the user add the einnahme form 
   $scope.addEinnahme = function () {
     
     //Validation von Eingaben
     if(!$scope.checkInput()){
       $log.debug("Nicht Valide: " + $scope.whichinvalid);
       return "Nicht Valide";
     }
     
     //einnahme.med in einen richtiges Objekt umwandeln
     /*$log.debug("Format von einname.med vor parse: " + $scope.einnahme.med);
     if($scope.isNewEin){
       $scope.einnahme.med = JSON.parse($scope.einnahme.med);
     }
     
     $log.info("addEinnahme: " + $scope.einnahme.med.mediname);*/
     
     //Einnahme neu
     if ($scope.isNewEin){
        
        //einnahme.med in einen richtiges Object umwandeln
        $log.debug("Format von einname.med vor parse: " + $scope.einnahme.med);
        $scope.einnahme.med = JSON.parse($scope.einnahme.med);
        $log.info("addEinnahme: " + $scope.einnahme.med.mediname);
        
        // Eine neue Einnahmeobjekt erstellen, welches danach gepushed und gespeichert wird.  
        var mediEinnahmeToPush = {
            "id": $scope.id,     //neue Id 
            "mediname": $scope.einnahme.med.mediname,
            "einnahmemenge": $scope.einnahme.einnahmemenge,
            "packungsgroesse": $scope.einnahme.med.packungsgroesse.menge,
            "snoozemin": $scope.einnahme.med.snoozemin,
            "uhrzeit": $scope.einnahme.uhrzeit,
            "wiederholungstag": $scope.einnahme.wiederholungstag,
            "wiederholungsbeginn": $scope.einnahme.wiederholungsbeginn,
            "wiederholungsende": $scope.einnahme.wiederholungsende,
            "vibration": $scope.einnahme.vibration
        }
        // Eine neue Einnahme pushen/speichern. 
        $scope.mediEinnahmeData.push(mediEinnahmeToPush); //Könnte man weglassen, da eh zum Schluss neu geladen wird :D
        
        // Neue Einnahme für das jeweilige Medikament in der Webstorage speichern
          //1. Medikament suchen
          var mediDataLength = $scope.mediData.length;
          for (var i=0; i < mediDataLength; i++){
            if ($scope.mediData[i].mediname == $scope.einnahme.med.mediname){ //TODO auf medi-id suche umstellen
              
              //2. Die neue Einnahme im Medikament hinterlegen
              if($scope.mediData[i].einnahmen == undefined){
                $scope.mediData[i].einnahmen = [];
              }
              $scope.mediData[i].einnahmen.push(mediEinnahmeToPush);
              
              //3. Medikament in der Storage aktualisieren
              MediStorage.updateMedikament($scope.mediData[i]);
            }
          }
        
        //zukünftige Einnahmen berechnen und im Webstorage separat speichern
        $scope.setNextEinnahmen(mediEinnahmeToPush);
          
      } else {
        //Andernfalls soll die Einnahme aktuallisiert werden
        
        var mediDataLength = $scope.mediData.length;
        
        //Überprüfung ob Einname-Medikament geändert wurde
        if ($scope.tempMediId != $scope.einnahme.med.id){
          
          //einnahme.med in einen richtiges Object umwandeln
          $log.debug("Format von einname.med vor parse: " + $scope.einnahme.med);
          $scope.einnahme.med = JSON.parse($scope.einnahme.med);
          $log.info("addEinnahme: " + $scope.einnahme.med.mediname);
        
          //wenns ungleich ist, somit hat sich das Medikament geändert 
          //und man müsste im alten Medikament die Einnahme löschen 
          //und dazu gehörende Zukunfts Termin ebenfalls löschen
          //und die Einnahme unter dem neuen Medikament neu erstellen sowie die zukünftigen Termine erstellen
          //1. Medikament suchen
          for (var i=0; i < mediDataLength; i++){
            if ($scope.mediData[i].id == $scope.tempMediId){
                            
              //2. Einnahme im Medikament suchen und anschließend löschen
              var mediEinnahmenLength = $scope.mediData[i].einnahmen.length;
              for (var j=0; j < mediEinnahmenLength; j++){
                if($scope.mediData[i].einnahmen[j].id == $scope.einnahme.id){
                  $log.debug("mediData[i].einnahmen[j] " + $scope.mediData[i].einnahmen[j].id);                  
                  $scope.mediData[i].einnahmen.splice(j, 1);
                  break;
                }
              }
              
              //3. Medikament in der Storage aktualisieren
              MediStorage.updateMedikament($scope.mediData[i]);
            }          
          }
          //4.Zukünftige Einnahmen in der Webstorage ebenfalls löschen
          EinnahmeStorage.deleteEinnahme($scope.einnahme.id);
          
          //nach dem die Einnahme und Historie mit dem alten Medikament bereinigt wurde,
          //wird im Prenzip ein neue Einnahme erstellt und gespeichert
          //somit erst Vorkerungen treffen damit auch eine neue Einnahme gültig ist.
          $scope.isNewEin = true;
          $scope.einnahme.med = JSON.stringify($scope.einnahme.med);
          $scope.addEinnahme();
          
        } else {
        //Ansonsten nur die Einnahme in dem nicht geänderten Medikament aktualisieren 
        
        //Einnahme für das jeweilige Medikament in der Webstorage speichern
          //1. Medikament suchen
          
          for (var i=0; i < mediDataLength; i++){
            if ($scope.mediData[i].mediname == $scope.einnahme.med.mediname){ //TODO auf medi-id suche umstellen
              
              //2. Die gewünschte Einnahme zum ändern Suchen
              var einnahmenLength = $scope.mediData[i].einnahmen.length;
              for (var j=0; j < einnahmenLength; j++){
                if($scope.mediData[i].einnahmen[j].id == $scope.einnahme.id){
                //3. Die geänderte Einnahme im Medikament aktualisieren                                          
                   $scope.mediData[i].einnahmen[j].mediname = $scope.einnahme.med.mediname;
                   $scope.mediData[i].einnahmen[j].einnahmemenge = $scope.einnahme.einnahmemenge;
                   $scope.mediData[i].einnahmen[j].uhrzeit = $scope.einnahme.uhrzeit;
                   $scope.mediData[i].einnahmen[j].wiederholungstag = $scope.einnahme.wiederholungstag;
                   $scope.mediData[i].einnahmen[j].wiederholungsbeginn = $scope.einnahme.wiederholungsbeginn;
                   $scope.mediData[i].einnahmen[j].wiederholungsende = $scope.einnahme.wiederholungsende;
                   $scope.mediData[i].einnahmen[j].vibration = $scope.einnahme.vibration;
                   
                   //4. Medikament in der Storage aktualisieren
                   MediStorage.updateMedikament($scope.mediData[i]);
                             
                   //Zukünftige Einnahmen in der Webstorage ebenfalls aktualisieren, durch erst löschen, neu berechnen und speichern.
                   EinnahmeStorage.deleteEinnahme($scope.einnahme.id);
                   $scope.setNextEinnahmen($scope.mediData[i].einnahmen[j]);
          
                }//if ende
              }//for ende
              
            }//if ende
          }//for ende
        }//inneres else ende

      }//else ende
        
        //Liste neu Laden
        $scope.loadMedisForEinnahme();

    // Simulate a mediEinnahme_neu delay.
    $timeout(function() {
      $scope.closeMediEinnahmeNeu();
    }, 10);
        
    };

////setMediname
  $scope.setMediname = function(mediname) {
    $log.debug("Setze Mediname: " + mediname);
    $scope.einnahme.mediname = mediname;
  }

/////////setEinnahmeMed
  $scope.setEinnahmeMed = function(checkMediname){
  
    for(var i=0; i < $scope.mediData.length; i++)
      if($scope.mediData[i].mediname == checkMediname){
        $scope.einnahme.med = $scope.mediData[i];
      }
  }

////getDayname
  $scope.getDayname = function(days){
    var dayAsString = "";
    if (days != undefined){
      if(days.mo != undefined && days.mo){
        dayAsString = dayAsString + "Mo. ";
      } 
      if(days.di != undefined && days.di){
        dayAsString = dayAsString + "Di. ";
      }   
      if(days.mi != undefined && days.mi){
        dayAsString = dayAsString + "Mi. ";
      }  
      if(days.do != undefined && days.do){
        dayAsString = dayAsString + "Do. ";
      }  
      if(days.fr != undefined && days.fr){
        dayAsString = dayAsString + "Fr. ";
      }  
      if(days.sa != undefined && days.sa){
        dayAsString = dayAsString + "Sa. ";
      }
      if(days.so != undefined && days.so){
        dayAsString = dayAsString + "So. ";
      }
      if(days.mo && days.di && days.mi && days.do && days.fr && days.sa && days.so){
        dayAsString = "Täglich";
      }  
      if(!days.mo && !days.di && !days.mi && !days.do && !days.fr && !days.sa && !days.so){
        dayAsString = "keine Wdh.";
      }
    }
  
    return dayAsString;
  }

////
  $scope.updateEinheit = function(me) {
    if(me != undefined){
      var med = JSON.parse(me);
      $scope.einnahme.einnahmemenge.einheit = med.packungsgroesse.einheit;
    }
  
  }
  
  $scope.addNewMediPackung = function() {
     var einnahme = EinnahmeStorage.loadEinnahme($scope.einnahme.id);
     var neuPackungsinhalt = einnahme.packungsgroesse + $scope.tmpPackungsgroesse;
     einnahme.packungsgroesse = neuPackungsinhalt;
     EinnahmeStorage.updateEinnahme(einnahme);
  }

////Pupup

   // When button is clicked, the popup will be shown...
   $scope.showPopup = function() {
      $scope.data = {}
      $scope.data.model = $scope.einnahme.wiederholungstag;
    
      // Custom popup
      var myPopup = $ionicPopup.show({
         //template: '<input type = "text" ng-model = "data.model">',
         //könnte man in eine templateUrl umändern und den viewcode extra auslagern.
         template: '<ion-list class="checkbox-balanced"><ion-checkbox ng-model="data.model.mo">Montag</ion-checkbox><ion-checkbox ng-model="data.model.di">Dienstag</ion-checkbox><ion-checkbox ng-model="data.model.mi">Mittwoch</ion-checkbox><ion-checkbox ng-model="data.model.do">Donnerstag</ion-checkbox><ion-checkbox ng-model="data.model.fr">Freitag</ion-checkbox><ion-checkbox ng-model="data.model.sa">Samstag</ion-checkbox><ion-checkbox ng-model="data.model.so">Sonntag</ion-checkbox></ion-list>',
         title: 'Wiederholen',
         subTitle: '',
         scope: $scope,
			
         buttons: [
            { text: 'Abbrechen' }, {
               text: '<b>Ok</b>',
               type: 'button-positive button-dark',
                  onTap: function(e) {
						
                      //Ok button wurde gedrückt, übernehme dein Werte
                      $scope.einnahme.wiederholungstag = $scope.data.model;
                      $log.info('Gesetzte Werte: ', $scope.data.model); 
                      
                  }
            }
         ]
      });

      myPopup.then(function(res) {
         $log.info('Tapped!', res);
      });    
   };///Pupup ende


}]);

