xquery version "1.0-ml";

(: Namespace pattern must be:  
 : "http://marklogic.com/rest-api/resource/{$rname}" 
 : and prefix must match resource name :)
module namespace triplification = "http://marklogic.com/rest-api/resource/triplification";

import module namespace chigov2sem = "http://marklogic.com/chigovdata/modules/chigov2sem#" at "/ext/modules/chigov2sem.xqy";

declare namespace chidata = 'http://data.cityofchicago.org/rows/';

(:
declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";
:)

(: Conventions: 
 : Module prefix must match resource name, 
 : and function signatures must conform to examples below.
 : The $context map carries state between the extension
 : framework and the extension.
 : The $params map contains parameters set by the caller,
 : for access by the extension.
 :)

(: Function responding to GET method - must use local name 'get':)
declare function triplification:get(
    $context as map:map,
    $params  as map:map
) as document-node()*
{
    (: set 'output-types', used to generate content-type header :)
    let $output-types := map:put($context,"output-types","application/xml") 
    let $dburi := map:get($params,"dburi")
    let $row := fn:doc($dburi)//chidata:row
    return document { 
        chigov2sem:chigov2sem($dburi, $row)
        } 
    (: must return document node(s) :)
};

(: Function responding to PUT method - must use local name 'put'. :)
declare function triplification:put(
    $context as map:map,
    $params  as map:map,
    $input   as document-node()*
) as document-node()?
{
    (: get 'input-types' to use in content negotiation :)
    let $input-types := map:get($context,"input-types")
    let $negotiate := 
        if ($input-types = "application/xml")
        then () (: process, insert/update :) 
        else error((),"ACK",
          "Invalid type, accepts application/xml only") 
    return document { "Done"}  (: may return a document node :)
};

(: Function responding to POST method - must use local name 'post'. :)
declare function triplification:post(
    $context as map:map,
    $params  as map:map,
    $input   as document-node()*
) as document-node()*
{
    xdmp:log("post!")
};

(: Func responding to DELETE method - must use local name 'delete'. :)
declare function triplification:delete(
    $context as map:map,
    $params  as map:map
) as document-node()?
{
    xdmp:log("delete!")
};