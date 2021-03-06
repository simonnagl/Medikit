angular.module('starter.mediStorage', [])

.factory('MediStorage', ['$window', '$log', 'WebStorageMain', 
    function($window, $log, WebStorageMain) {
    
	var mediStorage = {
        loadAllMedikament : loadAllMedikament,
        loadMedikament : loadMedikament,
        updateMedikament : updateMedikament,
        saveMedikament : saveMedikament,
        deleteMedikament : deleteMedikament
	}
    
    // Gibt ein Array mit allen Medikamentenobjekten zurück
    function loadAllMedikament() {
        $log.debug("WebStorage: loadAllMedikament -> START");
        var allMedikamente = []; 
        allMedikamente = WebStorageMain.loadAllObject('medi-');
        $log.debug("WebStorage: loadAllMedikament -> END WITH SUCCESS");
        return allMedikamente;
    }
    
    function loadMedikament(madikament) {
        $log.debug("WebStorage: loadMedikament -> START");
        var value = WebStorageMain.loadObject("medi-" + medikament.id);  
        
        if (value != null) {
            $log.debug("WebStorage: loadMedikament -> END WITH SUCCESS");
            return value;
        } else {
            $log.debug("WebStorage: loadMedikament -> END WITH INFO -> Medi not found");
            return null;
        }

    }
    ;
    
    //Wird aufgerufen wenn ein Medikament bearbeitet wurde
    function updateMedikament(medikament) {
        $log.debug("WebStorage: updateMedikament -> START"); 
        WebStorageMain.saveObject("medi-" + medikament.id, medikament);
        $log.debug("WebStorage: updateMedikament -> END WITH SUCCESS");  
    }
    ;
    
    /** 
     * Gibt TRUE zurück wenn alles ok ist
     * Gibt False zurück wenn der Key bereits vorhanden ist
     * INFO: Das soll verhindern das ein User zwei gleichnamige Medis anlegt, 
     * da der name bei uns auch der Key ist
     * Wird aufgerufen wenn ein neues Medikament gespeichert werden soll.
     */   
    function saveMedikament(medikament) {
        $log.debug("WebStorage: saveMedikament -> START"); 
        if(WebStorageMain.isKeyAvailable("medi-" + medikament.id)){
                      
            WebStorageMain.saveObject("medi-" + medikament.id, medikament);
            $log.debug("WebStorage: saveMedikament -> END WITH SUCCESS");     
            return true;                   
            
        } else {
            $log.debug("WebStorage: saveMedikament -> END WITH ERROR -> Key not available");   
            return false;
        }
    }
    ;
    
    function deleteMedikament(medikament) {
        $log.debug("WebStorage: deleteMedikament -> START");  
        WebStorageMain.deleteObject("medi-" + medikament.id);
        $log.debug("WebStorage: deleteMedikament -> END WITH SUCCESS");
    }
    ;

	return mediStorage;
		
}]);