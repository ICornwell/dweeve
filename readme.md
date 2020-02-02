## d\~weeve - a Dataweave(ish) javascript thing ##

What it is/does:

* d\~weeve is a research / learning project
* d\~weeve transpiles the Mulesoft Dataweave 2.0 syntax into javascript and executes it
* d\~weeve supports most of the 'interesting' Dataweave language features 
* d\~weeve accepts json or xml payloads, but currently only emtis json
* d\~weeve is for fun and experimentation

What it isn't/doesn't:

* d\~weeve is not a full implementation of Dataweave 2.0
* d\~weeve is not for production / real use
* d\~weeve doesn't do lots and lots of Dataweave functions (it as alphabetically all a-f, and map/mapObject) (but they are easy to add)
* d\~weeve doesn't do type coercion (it's javascript so things are a little more flexible)
* d\~weeve doesn't have any ouput formats other than json, depsite having an xml output declaration

d\~weeve uses nearley [https://nearley.js.org/](https://nearley.js.org/) for grammar and parsing

There is a branch 'dweeve4browser' with some hacks and tweaks for running in the browser.

You can play with it here: http://dweeve.smallwalrus.com/

The repo is here: https://github.com/ICornwell/dweeve-browser
