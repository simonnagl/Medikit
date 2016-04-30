angular.module('starter.mediEinnahmeCtrl', [])


.controller('mediEinnahmeCtrl', ['$window','$log', '$scope', '$ionicModal', '$timeout', '$ionicPopup', 'MediStorage', function($window, $log, $scope, $ionicModal, $timeout, $ionicPopup, MediStorage) {

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
  
  default_einnahme = {
        mediname : "",
        einnahmemenge : {
            menge : undefined,
            einheit : undefined
        },
        uhrzeit : new Date(new Date().toString().slice(0,21)),
        wiederholungstag : {
          mo : false,
          di : false,
          mi : false,
          do : false,
          fr : false,
          sa : false,
          so : false, 
        },
        wiederholungsbeginn : new Date(),
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
    
    //Resetfunktion in Billig:
        $scope.einnahme.mediname = "";
        $scope.einnahme.einnahmemenge = "";
        $scope.einnahme.uhrzeit = "";
        $scope.einnahme.wiederholungstag = "";
        $scope.einnahme.wiederholungsbeginn = "";
        $scope.einnahme.wiederholungsende = "";
        $scope.einnahme.vibration = "";
  };
  
  // Triggered in the mediEinnahme_edit modal to close it
  $scope.closeMediEinnahmeEdit = function() {
    $scope.einnahmeview.hide();
    
    //Resetfunktion in Billig:
        $scope.einnahme.mediname = "";
        $scope.einnahme.einnahmemenge = "";
        $scope.einnahme.uhrzeit = "";
        $scope.einnahme.wiederholungstag = "";
        $scope.einnahme.wiederholungsbeginn = "";
        $scope.einnahme.wiederholungsende = "";
        $scope.einnahme.vibration = "";
  };
  
//// deleteMediEinnahme
  $scope.deleteMediEinnahme = function(deleteMediEinnahmeId) {
     //Abfangen ob es sich um ein neues Objekt handelt
     if ( !$scope.isNewEin ){
          $log.info('Delete: ' + deleteMediEinnahmeId);
          
     
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
    $scope.id = $scope.creatId();
    $scope.einnahme = angular.copy(default_einnahme);
    $log.debug("Uhrzeit: " + $scope.einnahme.uhrzeit);
    $scope.einnahmeview.show();
    
  };
  
//// Open the mediEinnahme_edit modal
  $scope.mediEinnahmeEdit = function(editObject) {
    $scope.isNewEin = false;
      $log.info('Edit Object: ', editObject);
        
        //Falls $scope.einnahme aus irgendwelchen Gründen nicht vorhanden ist,
        //um Fehler abzufangen, wird eine neue Instanz vorläufig geladen
        if($scope.einnahme == undefined){
          $scope.einnahme = angular.copy(default_einnahme);
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
        
    $scope.einnahmeview.show();
  };
  
//// Validation
  $scope.checkInput = function () {
    if( $scope.einnahme.med == undefined){
      $scope.whichinvalid = "Medikament";
      return false;
    } else if ($scope.einnahme.einnahmemenge.menge == undefined) {
      $scope.whichinvalid = "Einnahme Menge";
      return false;
    } else if ($scope.einnahme.einnahmemenge.einheit == undefined) {
      $scope.whichinvalid = "Einheit Menge";
      return false;
    } else {
      return true;
    }
  }  
  
//// Perform the mediEinnahme_neu action when the user add the einnahme form
  
   $scope.addEinnahme = function () {
     
     //Validation von Eingaben
     if(!$scope.checkInput()){
       $log.debug("Nicht Valide: " + $scope.whichinvalid);
       return "Nicht Valide";
     }
     
     //einnahme.med in einen richtiges Objekt umwandeln
     $log.debug("Format von einname.med vor parse: " + $scope.einnahme.med);
     if($scope.isNewEin){
       $scope.einnahme.med = JSON.parse($scope.einnahme.med);
     }
     
     $log.info("addEinnahme: " + $scope.einnahme.med.mediname);
     
     //Einnahme neu
     if ($scope.isNewEin){
        
        // Eine neue Einnahmeobjekt erstellen, welches danach gepushed und gespeichert wird.  
        mediEinnahmeToPush = {
            "id": 'e-' + $scope.id,     //neue Id 
            "mediname": $scope.einnahme.med.mediname,
            "einnahmemenge": $scope.einnahme.einnahmemenge,
            "uhrzeit": $scope.einnahme.uhrzeit,
            "wiederholungstag": $scope.einnahme.wiederholungstag,
            "wiederholungsbeginn": $scope.einnahme.wiederholungsbeginn,
            "wiederholungsende": $scope.einnahme.wiederholungsende,
            "vibration": $scope.einnahme.vibration
        }
        // Eine neue Einnahme pushen/speichern
        $scope.mediEinnahmeData.push({ //Man könnte auch nur das Objekt $scope.user pushen.
            mediEinnahmeToPush
        });
        
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
      } else {
        //Andernfalls soll die Einnahme aktuallisiert werden

        //Einnahme für das jeweilige Medikament in der Webstorage speichern
          //1. Medikament suchen
          var mediDataLength = $scope.mediData.length;
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
                }//if ende
              }//for ende
              
            }//if ende
          }//for ende

      }//else ende
      
        //Resetfunktion in Billig:
        /*$scope.einnahme.mediname = "";
        $scope.einnahme.einnahmemenge = "";
        $scope.einnahme.uhrzeit = "";
        $scope.einnahme.wiederholungstag = "";
        $scope.einnahme.wiederholungsbeginn = "";
        $scope.einnahme.wiederholungsende = "";
        $scope.einnahme.vibration = "";*/
        
        //Liste neu Laden
        $scope.loadMedisForEinnahme();

    // Simulate a mediEinnahme_neu delay.
    $timeout(function() {
      $scope.closeMediEinnahmeNeu();
    }, 10);
        
    };

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


////Pupup

   // When button is clicked, the popup will be shown...
   $scope.showPopup = function() {
      $scope.data = {}
      $scope.data.model = $scope.einnahme.wiederholungstag;
    
      // Custom popup
      var myPopup = $ionicPopup.show({
         //template: '<input type = "text" ng-model = "data.model">',
         //könnte man in eine templateUrl umändern und den viewcode extra auslagern.
         template: '<ion-list><ion-checkbox ng-model="data.model.mo">Montag</ion-checkbox><ion-checkbox ng-model="data.model.di">Dienstag</ion-checkbox><ion-checkbox ng-model="data.model.mi">Mittwoch</ion-checkbox><ion-checkbox ng-model="data.model.do">Donnerstag</ion-checkbox><ion-checkbox ng-model="data.model.fr">Freitag</ion-checkbox><ion-checkbox ng-model="data.model.sa">Samstag</ion-checkbox><ion-checkbox ng-model="data.model.so">Sonntag</ion-checkbox></ion-list>',
         title: 'Wiederholen',
         subTitle: '',
         scope: $scope,
			
         buttons: [
            { text: 'Abbrechen' }, {
               text: '<b>Ok</b>',
               type: 'button-positive',
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
   };
///Pupup ende


}]);


