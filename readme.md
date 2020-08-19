## d\~weeve - a Dataweave(ish) javascript thing ##

What it is/does:

* d\~weeve is a research / learning project
* d\~weeve transpiles the Mulesoft Dataweave 2.0 syntax into javascript and executes it
* d\~weeve supports nearly all of the Dataweave language sytex / features 
* d\~weeve accepts json or xml payloads, but currently only emtis json
* d\~weeve is for fun and experimentation

What it isn't/doesn't:

* d\~weeve is not quite a full implementation of Dataweave 2.0 (but it is getting close for core library functions)
* d\~weeve is not for production / real use
* d\~weeve doesn't do some Dataweave functions (it as alphabetically all a-p(ish) + some) (but they are easy to add)
* d\~weeve doesn't do type coercion (it's javascript so things are a little more flexible, it does support 'is' and 'as' though)
* d\~weeve doesn't have any ouput formats other than json, depsite having an xml output declaration

d\~weeve uses nearley [https://nearley.js.org/](https://nearley.js.org/) for grammar and parsing

There was a branch 'dweeve4browser' with some hacks and tweaks for running in the browser, killed this as this now has a nicely babel'd lib build.

You can play with it here: http://dweeve.smallwalrus.com/

The repo is here: https://github.com/ICornwell/dweeve-react
