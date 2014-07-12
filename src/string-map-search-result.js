(function(global) {
	'use strict';

	


	function StringMapSearchResult(){
		this.mergedResults = [];
		this.distanceSize = 0;
		this.maxDistance = 100;
	}

	StringMapSearchResult.prototype.merge = function(results, distanceFactor){
		
		distanceFactor = distanceFactor || 1;

		var mr;

		// Add empty component to distance vectors of previous results
		for(var i = 0; i < this.mergedResults.length; i++){
			mr = this.mergedResults[i];
			mr.distances.push(this.maxDistance);
		}

		// Concat components of new results
		var r, e;
		for(var j = 0; j < results.length; j++){
			r = results[j];
			e = this.findByValue(this.mergedResults, r.value);

			if(e === null){
				// Add new result
				e = {
					distances: [],
					value: r.value
				};

				// Padding
				for(var n = 0; n < this.distanceSize + 1; n++){
					e.distances.push(this.maxDistance);
				}

				this.mergedResults.push(e);
			}

			e.distances[this.distanceSize] = Math.min(e.distances[this.distanceSize], r.distance * distanceFactor);
		}

		this.distanceSize++;
	};

	StringMapSearchResult.prototype.findByValue = function(results, value){
		for(var i = 0; i < results.length; i++){
			if(results[i].value == value)
				return results[i];
		}
		return null;
	};
	
	StringMapSearchResult.prototype.getSortedResults = function(){

		var zero = [];
		for(var n = 0; n < this.distanceSize; n++){
			zero.push(0);
		}
		zero.push(this.distanceSize);

		var results = [];
		var mr, distances, termsCount;
		for(var i = 0; i < this.mergedResults.length; i++){
			mr = this.mergedResults[i];
			termsCount = mr.value.split(/[\s,.]+/).length;
			distances = mr.distances.concat([termsCount]);
			results.push({
				value: mr.value,
				distances: mr.distances,
				distance: distanceBetweenVectors(distances, zero, mr.value)
			});
		}

		results.sort(sortByAttribute('distance', true));

		return results;
	};

	StringMapSearchResult.prototype.getSortedResultsLevensthein = function(query){

		var results = [];
		query = query.trim();

		for(var i = 0; i < this.mergedResults.length; i++){
			var mr = this.mergedResults[i];
			results.push({
				value: mr.value,
				distance: StringUtils.getEditDistance(query, mr.value)
			});
		}

		results.sort(sortByAttribute('distance', true));

		return results;
	};

	// Export class
	global.StringMapSearchResult = StringMapSearchResult;
	global.exports = global.StringMapSearchResult;

})(this);