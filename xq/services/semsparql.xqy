xquery version "1.0-ml";

(: Namespace pattern must be:  
 : "http://marklogic.com/rest-api/resource/{$rname}" 
 : and prefix must match resource name :)
module namespace semsparql = "http://marklogic.com/rest-api/resource/semsparql";

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
declare function semsparql:get(
    $context as map:map,
    $params  as map:map
) as document-node()*
{
    (: set 'output-types', used to generate content-type header :)
    let $output-types := map:put($context,"output-types","application/json") 
    let $q := map:get($params,"q")
    let $results := 
        if ($q ne "") then
            let $qparams := map:new(map:entry("q", $q))
            return
                sem:sparql(fn:concat('
                    SELECT DISTINCT ?s
                    WHERE {
                        ?s <http://xmlns.com/foaf/0.1/name> ?o . 
                        ', 
                        fn:string-join(
                            for $v in $q
                            return fn:concat('FILTER ( regex(str(?o), "', $v ,'", "i") )'), 
                        " . "), '
                    }
                '), (), (), 
                    cts:and-query(
                        for $v in $q
                        return cts:word-query($v)
                    )
                )
        else
            sem:sparql('
                SELECT DISTINCT ?s
                WHERE {
                    ?s <http://xmlns.com/foaf/0.1/name> ?o . 
                }
                ', (), (), ())
    return 
        document {
            text {
                xdmp:to-json(sem:query-results-serialize($results, 'json'))
            }
        } 
    (: must return document node(s) :)
};
