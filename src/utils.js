(function(global) {
    'use strict';

	// ------ UTILITY FUNCTIONS ------

	/**
	 * Generates am anonymous sort function to sort
	 * an array of objects by the given numeric attribute
	 */
	function sortByAttribute(attr, asc){
		return function (a, b){
			if(asc){
				if(a[attr] > b[attr])
					return 1;
			}else{
				if(a[attr] < b[attr])
					return 1;
			}
			if(a[attr] == b[attr])
				return 0;
			return -1;
		};
	}

	/** 
	 * Calculates the Euclidean distance between 2 vectors of the same size
	 */
	function distanceBetweenVectors(vA, vB){
		var s = 0, a = 0, b = 0;
		for(var i = 0; i < vA.length; i++){
			a = vA[i] ? vA[i] : 0;
			b = vB[i] ? vB[i] : 0;
			s += Math.pow(a - b, 2);
		}
		return Math.sqrt(s);
	}

	// Export functions
	global.distanceBetweenVectors = distanceBetweenVectors;
	global.sortByAttribute = sortByAttribute;

})(this);