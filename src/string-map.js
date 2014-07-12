(function(global) {
	'use strict';

	/**
	 * This map allows to store elements indexed by a string key
	 * in order to perform efficient lookups of elements with a 
	 * key close to a certain string.
	 */
	function StringMap(options){
		options = options || {};
		this.charsDistribution = options.charsDistribution || 'QWERTY'; // Distribution of chars: 'QWERTY' or 'ASCII'
		this.LTRMap = new NumericMap();
		this.RTLMap = new NumericMap();

		this.charsDistributions = {
			'ASCII': 'abcdefghijklmnopqrstuvwxyz',
			'QWERTY': 'qazwsxedcrfvtgbyhnujmikolp'
		};

		this.setCharsDistribution(this.charsDistribution);
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
			if(t !== ''){
				this.LTRMap.add(this.calculateLTRStringIndex(t), value);
				this.RTLMap.add(this.calculateRTLStringIndex(t), value);
			}
		}
	};

	// Search full query in this index
	StringMap.prototype.search = function(query, maxDistance, maxResults){

		var startTime = (new Date()).getTime();

		var terms = query.trim().split(/[\s,.]+/);

		var result = new StringMapSearchResult();
		
		// Search every term independently
		var t;
		for(var i = 0; i < terms.length; i++){
			t = terms[i].trim();
			if(t !== ''){
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

		if(term !== ''){
			var result = new StringMapSearchResult();

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
		var rangeMax = N;
		var maxValue = N;
		var chr;
		for(var i = 0; i < str.length; i++){
			chr = this.charToInt(str[i]);
			
			// Calculate range limits
			N = rangeMax - rangeMin;
			rangeMax = rangeMin + chr * (N / maxValue);
			rangeMin = rangeMin + (chr - 1) * (N / maxValue);
		}
		
		var index = (rangeMax + rangeMin) / 2.0;

		return index;
	};

	// Right to Left string to number mapping
	StringMap.prototype.calculateRTLStringIndex = function(str){
		var revStr = str.split('').reverse().join('');
		return this.calculateLTRStringIndex(revStr);
	};

	// Map a char to an int
	StringMap.prototype.charToInt = function(char){
		return this.distribution[char];
	};

	// Set new char distribution
	StringMap.prototype.setCharsDistribution = function(distributionName){
		var dist = this.charsDistributions[distributionName.toUpperCase()];
		if(!dist)
			dist = this.charsDistributions.QWERTY;
		var charsArr = dist.split('');
		var map = {};
		for(var i = 0; i < charsArr.length; i++){
			map[charsArr[i]] = i + 1;
		}
		this.distribution = map;
	};

	StringMap.prototype.normalizeTerm = function(str){
		return StringUtils.removeDiacritics(str.toLowerCase().trim()).replace(/[^a-z]*/g, "");
	};

	// Export class
	global.StringMap = StringMap;
	global.exports = global.StringMap;

})(this);