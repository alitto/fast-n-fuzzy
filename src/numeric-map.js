(function(global) {
	'use strict';

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
		var entry, distance;

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

	// Export class
	global.NumericMap = NumericMap;

})(this);