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

##API Reference


##Examples



##Issues

Discovered a bug? Please create an issue here on GitHub!

<a href="https://github.com/alitto/fast-n-fuzzy/issues">https://github.com/alitto/fast-n-fuzzy/issues</a>
