xquery version "1.0-ml";

(: Namespace pattern must be:  
 : "http://marklogic.com/rest-api/resource/{$rname}" 
 : and prefix must match resource name :)
module namespace describe = "http://marklogic.com/rest-api/resource/describe";

import module namespace sem = "http://marklogic.com/semantics" at "/MarkLogic/semantics.xqy";
  
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
declare function describe:get(
    $context as map:map,
    $params  as map:map
) as document-node()*
{
    (: set 'output-types', used to generate content-type header :)
    let $output-types := map:put($context,"output-types","application/json") 
    let $uri := map:get($params,"uri")[1]
    let $inverse := map:get($params,"inverse")[1]
    let $inverse := fn:normalize-space($inverse)
    let $inverse := 
        if ($inverse eq "" or $inverse ne "true") then
            "false"
        else
            "true"
    let $results := 
        let $qparams := map:new(map:entry("uri", sem:iri($uri)))
        return
            if ($inverse eq "false") then
                sem:sparql('
                    SELECT DISTINCT ?p ?o ?n
                    WHERE {
                        $uri ?p ?o . 
                        OPTIONAL {
                            ?o <http://xmlns.com/foaf/0.1/name> ?n .
                        }
                    }
                ', $qparams, (), ())
            else
                sem:sparql('
                    SELECT DISTINCT ?s ?n ?p
                    WHERE {
                        ?s ?p $uri . 
                        OPTIONAL {
                            ?s <http://xmlns.com/foaf/0.1/name> ?n .
                        }
                    }
                ', $qparams, (), ())
    return 
        document {
            text {
                xdmp:to-json(sem:query-results-serialize($results, 'json'))
            }
        } 
    (: must return document node(s) :)
};
