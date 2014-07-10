(function(global) {

	/**
	 * This map allows to store elements indexed by a numeric key
	 * in order to perform efficient lookups of elements with a 
	 * key value close to a certain number.
	 */
	function NumericMap(){
		this.entries = [];
	}

	/**
	 * Adds an element to the map
	 * 
	 * @param key numeric key
	 * @param value element to store under the given key
	 */
	NumericMap.prototype.add = function(key, value){
		var pos = 0;

		while(pos < this.entries.length && this.entries[pos].k <= key){
			pos++;
		}

		if(pos >= this.entries.length){
			// New entry
			this.entries.push({
				k: key,
				v: [ value ]
			});
		}else{
			var closestEntry = this.entries[pos];
			if(closestEntry.k == key){
				// Append value to existent entry
				if(closestEntry.v.indexOf(value) < 0)
					closestEntry.v.push(value);
			}else{
				// Add new entry
				this.entries.splice(pos, 0, {
					k: key,
					v: [ value ]
				});
			}
		}
	};

	/**
	 * Finds all the elements on this map whose key is at most
	 * {maxDistance} away from the given key. Results are sorted
	 * by distance to the key ascending.
	 *
	 * @param key numeric value to search
	 * @param maxDistance maximum distance to the given key
	 * @param maxResults maximum elements to return
	 * @return returns an array of elements with the distance to the 
	 * 			given key and the value found.
	 * 			E.g. { distance: 0.1, value: 'XX' }
	 */
	NumericMap.prototype.search = function(key, maxDistance, maxResults){
		var results = [];
		var addedValues = [];
		var leftPos, rightPos = 0;
		var distanceLeft, distanceRight = 0;
		var closestPos = this._closestBinarySearch(this.entries, 'k', key);

		for(var offset = 0; offset < maxResults; offset++){
			
			leftPos = closestPos - offset;
			rightPos = closestPos + offset;

			if(leftPos >= 0){
				entry = this.entries[leftPos];
				distance = Math.abs(entry.k - key);
				
				if(distance <= maxDistance){
					this._addSearchResult(results, addedValues, distance, entry);
				}
			}
			if(leftPos != rightPos && rightPos < this.entries.length){
				entry = this.entries[rightPos];
				distance = Math.abs(entry.k - key);
				
				if(distance <= maxDistance){
					this._addSearchResult(results, addedValues, distance, entry);
				}
			}
		}

		// Sort results by distance
		results = results.sort(sortByAttribute('distance', true));

		if(results.length > maxResults)
			return results.slice(0, maxResults);
		return results;
	};

	NumericMap.prototype._addSearchResult = function(results, addedValues, distance, entry){
		
		var result, existentIndex = null;

		for(var i = 0; i < entry.v.length; i++){

			result = {
				distance: distance,
				value: entry.v[i]
			};

			// Check if value was already added
			existentIndex = addedValues.indexOf(result.value);
			
			if(existentIndex >= 0){
				if(results[existentIndex].distance > distance){
					// Replace previous result with newest
					results.splice(existentIndex, 1, result);
				}
			}else{
				results.push(result);
				addedValues.push(result.value);
			}
		}
	};

	NumericMap.prototype._closestBinarySearch = function(arr, attr, value) {
		var lo = 0;
		var hi = arr.length - 1;
		var pos = 0;
		while (lo <= hi) {
			pos = Math.floor((lo + hi) / 2);
			if (arr[pos][attr] > value)
				hi = pos - 1;
			else if (arr[pos][attr] < value)
				lo = pos + 1;
			else{
				break;
			}
		}
		return pos;
	};

	/**
	 * This map allows to store elements indexed by a string key
	 * in order to perform efficient lookups of elements with a 
	 * key close to a certain string.
	 */
	function StringMap(){
		this.MIN_CHAR = "a".charCodeAt(0);
		this.MAX_CHAR = "z".charCodeAt(0);
		this.LTRMap = new NumericMap();
		this.RTLMap = new NumericMap();
	}

	/**
	 * Add a value to this map indexed by a string key
	 */
	StringMap.prototype.add = function(key, value){
		var terms = key.trim().split(/[\s,.]+/);

		// Create an entry in both maps for every term
		var t;
		for(var i = 0; i < terms.length; i++){
			t = this.normalizeTerm(terms[i].trim());
			if(t != ''){
				this.LTRMap.add(this.calculateLTRStringIndex(t), value);
				this.RTLMap.add(this.calculateRTLStringIndex(t), value);
			}
		}
	};

	// Search full query in this index
	StringMap.prototype.search = function(query, maxDistance, maxResults){

		var startTime = (new Date()).getTime();

		var terms = query.trim().split(/[\s,.]+/);

		var result = new SearchResult();
		
		// Search every term independently
		var t;
		for(var i = 0; i < terms.length; i++){
			t = terms[i].trim();
			if(t != ''){
				result.merge(this.searchTerm(t, maxDistance, maxResults));
			}
		}

		var sortedResults = result.getSortedResults();
		//var sortedResults = result.getSortedResultsLevensthein(query);

		console.log("Search took " + ((new Date()).getTime() - startTime) + "ms");

		if(sortedResults.length > maxResults)
			return sortedResults.slice(0, maxResults);
		return sortedResults;
	};

	// Search a single term
	StringMap.prototype.searchTerm = function(term, maxDistance, maxResults){

		term = this.normalizeTerm(term);

		if(term != ''){
			var result = new SearchResult();

			// Search in LTR map
			var ltrResults = this.LTRMap.search(this.calculateLTRStringIndex(term), maxDistance, maxResults);

			// Search in RTL map
			var rtlResults = this.RTLMap.search(this.calculateRTLStringIndex(term), maxDistance, maxResults);
			var rtlDistanceFactor = 1.5;

			var results = ([]).concat(ltrResults);

			var r;
			for(var i = 0; i < rtlResults.length; i++){
				r = rtlResults[i];
				results.push({ 
					value: r.value,
					distance: r.distance * rtlDistanceFactor
				});
			}

			result.merge(results);
			
			return result.getSortedResults();
		}

		return [];
	};

	// Left to Right string to number mapping
	StringMap.prototype.calculateLTRStringIndex = function(str){

		var N = 100;
		var rangeMin = 0;
		var rangeMax = 100;
		var maxValue = (this.MAX_CHAR - this.MIN_CHAR) + 1;
		var chr;
		for(var i = 0; i < str.length; i++){
			chr = this.charToInt(str[i]);
			
			// Calculate range limits
			N = rangeMax - rangeMin;
			rangeMax = rangeMin + chr * (N / maxValue);
			rangeMin = rangeMin + (chr - 1) * (N / maxValue);
		}
		
		var number = (rangeMax + rangeMin) / 2.0;

		return number;
	}

	// Right to Left string to number mapping
	StringMap.prototype.calculateRTLStringIndex = function(str){
		var revStr = str.split('').reverse().join('');
		return this.calculateLTRStringIndex(revStr);
	}

	// Map a char to an int
	StringMap.prototype.charToInt = function(char){
		return (char.charCodeAt(0) - this.MIN_CHAR) + 1;
	}

	StringMap.prototype.normalizeTerm = function(str){
		return StringUtils.removeDiacritics(str.toLowerCase().trim()).replace(/[^a-z]*/g, "");
	}


	function SearchResult(){
		this.mergedResults = [];
		this.distanceSize = 0;
		this.maxDistance = 100;
	}

	SearchResult.prototype.merge = function(results, distanceFactor){
		
		distanceFactor = distanceFactor || 1;

		var mr;

		// Add empty component to distance vectors of previous results
		for(var i = 0; i < this.mergedResults.length; i++){
			mr = this.mergedResults[i];
			mr.distances.push(this.maxDistance);
		}

		// Concat components of new results
		var r, e;
		for(var i = 0; i < results.length; i++){
			r = results[i];
			e = this.findByValue(this.mergedResults, r.value);

			if(e == null){
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
	}

	SearchResult.prototype.findByValue = function(results, value){
		for(var i = 0; i < results.length; i++){
			if(results[i].value == value)
				return results[i];
		}
		return null;
	}
	
	SearchResult.prototype.getSortedResults = function(){

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
	}

	SearchResult.prototype.getSortedResultsLevensthein = function(query){

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
	}

	// ------ UTILITIES ------

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

	// Export class
	global.FastNFuzzy = StringMap;

})(this);