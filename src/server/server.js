var http = require('http')
var url = require('url')
var fetch = require('node-fetch')
var dweeve = require('../exe/dweeve')


const routes = [
   {'route':'/ping', 'method':'GET','exe' :async (args,body) => "Okay!", 'isJson' : false},

  {'route':'/runRules', 'method':'POST','exe' :async (args,body) => await(runRules (args.ruleName, args.ruleVersion, JSON.parse(body))), 'isJson' : true},
];


//create a server object:
http.createServer(async function (req, res) {
  var b = await getBodyAndProcess(req, res);

  
}).listen(8080); //the server object listens on port 8080

async function processRequesst(req, res, body) {
  var q = url.parse(req.url, true).query;
  var p = url.parse(req.url, true).pathname;

  // CORS Response
  res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Request-Method', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin,Accept,Content-Type,*');
	if ( req.method === 'OPTIONS' ) {
		res.writeHead(200);
		res.end();
		return;
	}

  var r = routes.find(o=>o.route==p); // change to regex when needed
  if (r)
 // try {
    await execute(res, r.exe, q, body, r.isJson);
 // } catch (excp) {
 //   var s = excp.message;
 //   return400(res, p);
 // }
  else
    return404(res, p);

  res.end(); //end the response
}



async function execute(res, exe, args, body, isJson) {
//  try {
    var response =await exe(args, body);
 //   console.log (response);
    if (isJson) {
      res.writeHead(200, {'Content-Type': 'application/json'});  
      res.write(JSON.stringify(response)); //write a response to the client
      }
    else {
      res.writeHead(200, {'Content-Type': 'text/plain'});  
      res.write(response); //write a response to the client
    }
    
 // }
 // catch(err) {
 //   res.writeHead(400, {'Content-Type': 'text/html'});  
 //   res.write('Failed, with err:' + err); //write a response to the client
 // }
  return res;
}

function return404(res, path) {
  res.writeHead(404, {'Content-Type': 'text/plain'});  
  res.write('Could not find function for:' + path); //write a response to the client
  return res;
}

function return400(res, path) {
  res.writeHead(400, {'Content-Type': 'text/plain'});  
  res.write('Bad request data:' + path); //write a response to the client
  return res;
}

async function getBodyAndProcess(req, res) {
//  console.log ('getbody:'+req.method)
  if (req.method === 'POST' || req.method === 'PUT') {
    let body = '';
//    console.log ('gettingbody')
    var i = 1
    req.on('data', chunk => {
        body += chunk.toString(); // convert Buffer to string
//        console.log ('gettingbody:'+i++)
  
      });
    req.on('end', async () => {
      await processRequesst(req, res, body);
    });
  }
  else
    await processRequesst(req, res, '');
}

async function getDataFromAPI(url) {
    let response = await fetch(url)
    let data = await response.text()
    
    if (data==='')
        throw Error('Can not load rule by name/version. Not found')

    return data
}

async function runRules(ruleName,ruleVersion, inputPayload)
{
    try{
    const url = "https://mlabmetdataapi.azurewebsites.net/api/rule/"
    const authCode = "GEdIhFSYvzoazSaew76ugcAliu80NJCIuckDU5ivaaUK7DDTkL7ACg=="
    var dwl = await getDataFromAPI(url + ruleName + '/' + ruleVersion + '?code=' + authCode)

    result = dweeve.run(dwl, inputPayload)

    return JSON.parse(result)
    } catch (err) {
        return err
    }
}


