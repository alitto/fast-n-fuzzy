Fast n' Fuzzy
============

Fast n' Fuzzy implements a super fast algorithm to perform fuzzy string search over large collections of strings in JavaScript. This search algorithm is tolerant to typos and spelling errors so it is perfect for autocomplete-like UI components. It has a very small footprint and no dependencies. 
This algorithm uses an heuristic which approximates the edit distance for the evaluated strings and hence it does not relies on CPU intensive algorithms such as Levensthein or Jaro-Winkler distance.

##What does "Fuzzy String Search" mean?

In computer science, approximate string matching (often colloquially referred to as fuzzy string searching) is the technique of finding strings that match a pattern approximately (rather than exactly). The problem of approximate string matching is typically divided into two sub-problems: finding approximate substring matches inside a given string and finding dictionary strings that match the pattern approximately.

Fast n' Fuzzy focus on the latter of these two sub-problems and provides functionality to create a dictionary of strings which allows to find the strings closer to any given input string.

To learn more about Fuzzy String search you can read this <a href="http://en.wikipedia.org/wiki/Approximate_string_matching">Wikipedia Article</a>.

##Getting Started

Download the latest version from:
* <a href="https://github.com/alitto/fast-n-fuzzy/blob/master/dist/fast-n-fuzzy.js">fast-n-fuzzy.js</a>
* <a href="https://github.com/alitto/fast-n-fuzzy/blob/master/dist/fast-n-fuzzy.min.js">fast-n-fuzzy.min.js</a> (Minified version)

##Usage

Fuzzy search over a collection of strings

```javascript

// Create empty string map
var stringMap = new StringMap({
	maxSearchResults: 3 // Set default search results size
});

// Populate it with color names
var colors = [ "blue" , "yellow", "orange", "red", "pink", "brown", "black", "white", "purple"];

for(var i = 0; i < colors.length; i++){
	stringMap.add(colors[i], colors[i]);
}

// Search for "yelow" (missing one letter). 
// Returns an array with results in the form: [ { distance: x, value: "yellow" }, ... ]
stringMap.search("yellow");

```

##Examples

In the `examples` folder you can find some code examples:
* <a href="https://github.com/alitto/fast-n-fuzzy/blob/master/examples/jquery-autocomplete.html">jQuery Autocomplete integration example</a>
* <a href="https://github.com/alitto/fast-n-fuzzy/blob/master/examples/simple-console.html">Simple fuzzy search</a>


##API Reference

###StringMap Class 
String map which allows to perform fuzzy searches

####Methods:

* `add(key : String, value : Object)` : Indexes the @value under the given string @key
* `search(query : String)` : Performs a fuzzy string search over the keys on this map and returns the results as an array with the format: `[ { distance: 0.12, value: 'Some value' }, { distance: 0.25, value: 'Other value' }, ... ]`


##Issues

Discovered a bug? Please create an issue here on GitHub!

<a href="https://github.com/alitto/fast-n-fuzzy/issues">https://github.com/alitto/fast-n-fuzzy/issues</a>
