(function(global) {

	/**
	 * This map allows to store elements indexed by a numeric key
	 * in order to perform efficient lookups of elements with a 
	 * key value close to a certain number.
	 */
	function NumericMap(options){
		this.options = options || {};
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
				if(results[existentPos].distance > result.distance){
					// Replace previous result with newest
					results.splice(existentIndex, 1, result);
				}
			}else{
				results.push(result);
				addedValues.push(result.result);
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
	function StringMap(options){
		this.options = options || {};
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
		for(var i = 0; i < terms.length; i++){
			var term = terms[i].trim();
			term = this.normalizeTerm(term);
			if(term != ''){
				this.LTRMap.add(this.calculateLTRStringIndex(term), value);
				this.RTLMap.add(this.calculateRTLStringIndex(term), value);
			}
		}
	};

	// Search full query in this index
	StringMap.prototype.search = function(query, maxDistance, maxResults){

		var startTime = (new Date()).getTime();

		var result = new SearchResult(query);
		
		var terms = query.trim().split(/[\s,.]+/);

		// Search every term independently
		for(var i = 0; i < terms.length; i++){
			var term = terms[i].trim();
			if(term != ''){
				result.mergeResult(this._searchTerm(term, maxDistance, maxResults), maxResults);
			}
		}
		
		var sortedResults = result.getSortedResults();
		
		console.log("Search took " + ((new Date()).getTime() - startTime) + "ms");

		if(sortedResults.length > maxResults)
			return sortedResults.slice(0, maxResults);
		return sortedResults;
	};

	// Search a single term
	StringMap.prototype._searchTerm = function(term, maxDistance, maxResults){

		var result = new SearchResult(term);
		
		term = this.normalizeTerm(term);
		if(term != ''){
			// Search in LTR map
			result.merge(this.LTRMap.search(this.calculateLTRStringIndex(term), maxDistance, maxResults), maxResults, 1);
			// Search in RTL map
			result.merge(this.RTLMap.search(this.calculateRTLStringIndex(term), maxDistance, maxResults), maxResults, 1);
		}
		
		return result;
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
		var revStr = str.split("").reverse().join("");
		return this.calculateLTRStringIndex(revStr);
	}

	// Mid to Out string to number mapping
	StringMap.prototype.mtoStringMap = function(str){
		
		var middle = Math.floor(str.length / 2);
		var firstHalf = str.substring(0, middle);
		var secondHalf = str.substring(middle, str.length);
		// Reverse first half
		firstHalf = firstHalf.split("").reverse().join("");

		var interleaved = "";
		// Interleave
		for(var i = 0; i < Math.max(firstHalf.length, secondHalf.length); i++){
			// Pick from second half
			if(i < secondHalf.length)
				interleaved += secondHalf[i];
			// Pick from first half
			if(i < firstHalf.length)
				interleaved += firstHalf[i];
		}

		return this.calculateLTRStringIndex(interleaved);
	}

	// Map a char to an int
	StringMap.prototype.charToInt = function(char){
		return (char.charCodeAt(0) - this.MIN_CHAR) + 1;
	}

	StringMap.prototype.normalizeTerm = function(str){
		return StringUtils.removeDiacritics(str.toLowerCase().trim()).replace(/[^a-z]*/g, "");
	}


	function SearchResult(query){
		this.query = query;
		this.results = [];
		this.mergeCount = 0; 
		this.queryTermsCount = query.trim().split(/[\s,.]+/).length;
	}

	SearchResult.prototype.merge = function(entries, maxResults, distanceFactor){
		this.mergeCount++;

		distanceFactor = distanceFactor || 1;

		for(var i = 0; i < entries.length; i++){
			var entry = entries[i];
			var result = this.find(entry);
			var distance = entry.distance * distanceFactor;
			if(result == null){
				result = {
					times: 1,
					distances: [ distance ],
					minDistance: distance,
					avgDistance: distance,
					value: entry.value
				};
				this.results.push(result);
			}else{
				result.times++;
				result.minDistance = Math.min(result.minDistance, distance);
				result.distances.push(distance);
				result.avgDistance = avg(result.distances);
			}
			if(i + 1 >= maxResults) break;
		}

		// Recalculate scores
		var result;
		for(var i = 0; i < this.results.length; i++){
			result = this.results[i];
			result.score = this.calculateScore(result);
		}
	}

	SearchResult.prototype.mergeResult = function(result, maxResults){
		this.merge(result.toNumericMapResults(), maxResults);
	}

	SearchResult.prototype.find = function(entry){
		for(var i = 0; i < this.results.length; i++){
			var e = this.results[i];
			if(e.value == entry.value)
				return e;
		}
		return null;
	}

	SearchResult.prototype.calculateScore = function(result){
		var termsCount = result.value.trim().split(/[\s,.]+/).length;
		var score = result.avgDistance + 0.2 * Math.abs(this.mergeCount - result.times) + 0.2 * Math.abs(this.queryTermsCount - termsCount);
		return score;
	}
	
	SearchResult.prototype.getSortedResults = function(){
		return this.results.sort(sortByAttribute('score', true));
	}

	SearchResult.prototype.toNumericMapResults = function(){
		var entries = [];
		var sortedResults = this.getSortedResults();
		for(var i = 0; i < sortedResults.length; i++){
			var r = sortedResults[i];
			entries.push({
				distance: r.minDistance,
				value: r.value
			});
		}
		return entries;
	}

	// Utils

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

	function avg(numbers){
		var sum = 0;
		for(var i = 0; i < numbers.length; i++){
			sum += numbers[i];
		}
		return sum / numbers.length;
	}

	// Export class
	global.FastNFuzzy = StringMap;

})(this);