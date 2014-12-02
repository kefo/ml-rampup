xquery version "1.0";
(:
: Module Name: Generate Sem Triples from Chicago Gov Data
:
: Module Version: 1.0
:
: Date: 2014 Nov 22
:
: Copyright: Public Domain
:
: Proprietary XQuery Extensions Used: xdmp (MarkLogic), sem (MarkLogic)
:
: Xquery Specification: January 2007
:
: Module Overview: Generate sem triples from Chicago
:   Gov data
:
:)
(:~
: Generates sem triples from Chicago Gov data
:
: @author Kevin Ford (kefo@marklogic.com)
: @since November 22, 2014
: @version 1.0
:)
module namespace chigov2sem = 'http://marklogic.com/chigovdata/modules/chigov2sem#';


(: import module namespace sem = "http://marklogic.com/semantics" at "/MarkLogic/semantics.xqy"; :)
declare namespace sem = "http://marklogic.com/semantics";
declare namespace xdmp = "http://marklogic.com/xdmp"; 
declare namespace chidata = 'http://data.cityofchicago.org/rows/';

(:~
: Transform Chicago Gov Data to Sem Triples
:
: @param $xml is the scheme requested
: @return element as sem:triples
:)
declare function chigov2sem:chigov2sem(
    $dburi as xs:string,
    $row as element()
) as element(sem:triples)
{
    let $baseuri := "http://localhost:7000/resources/"
    return
        if (fn:contains($dburi, "gifts")) then
            chigov2sem:gift-triples($baseuri, $dburi, $row)
        else if (fn:contains($dburi, "lobbyists")) then
            chigov2sem:lobbyist-triples($baseuri, $dburi, $row)
        else
            <sem:triples />
    
};

declare function chigov2sem:gift-triples(
    $baseuri as xs:string,
    $dburi as xs:string, 
    $row as element(chidata:row)
    ) as element(sem:triples)
{
    (: Gift details :)
    let $gift-description := xs:string($row/chidata:gift_description)
    let $gift-value := xs:string($row/chidata:value)
    let $gift-uri := fn:concat($baseuri, "gifts/", fn:replace($dburi, '/docs/gifts/', "") )
    let $gift-uri := fn:replace($gift-uri, '.xml', "")
    
    (: Lobbyist :)
    let $llast := xs:string($row/chidata:lobbyist_last_name)
    let $lfirst := xs:string($row/chidata:lobbyist_first_name)
    let $lmiddle := 
        if ($row/chidata:lobbyist_middle_initial) then
            xs:string($row/chidata:lobbyist_middle_initial)
        else
            ""
    let $lname := fn:normalize-space(fn:concat($llast, ", ", $lfirst , " ", $lmiddle))
    let $lname-normalized := chigov2sem:normalize($lname)
    let $lname-uri := fn:concat($baseuri, "people/" ,$lname-normalized)

    (: Lobbied For :)
    let $lfor := xs:string($row/chidata:employer_name)
    let $lfor-normalized := chigov2sem:normalize($lfor)
    let $lfor-uri := fn:concat($baseuri, "organizations/" ,$lfor-normalized)
    
    (: Recipient :)
    let $rname := xs:string($row/chidata:recipient_name)
    let $rname-normalized := chigov2sem:normalize($rname)
    let $rname-title := 
        if ($row/chidata:recipient_title) then
            xs:string($row/chidata:recipient_title)
        else 
            ""
    let $rname-uri := fn:concat($baseuri, "people/" ,$rname-normalized)
    
    (: Recipient Agency :)
    let $aname := xs:string($row/chidata:recipient_agency_name)
    let $aname-normalized := chigov2sem:normalize($aname)
    let $aname-uri := fn:concat($baseuri, "organizations/" ,$aname-normalized)
    
    return
        element sem:triples {
            
            (: Gift :)
            element sem:triple {
                element sem:subject { $gift-uri },
                element sem:predicate { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
                element sem:object { "http://marklogic.com/chigovdata/vocab#Gift" }
            },
            element sem:triple {
                element sem:subject { $gift-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#givenBy" },
                element sem:object { $lname-uri }
            },
            element sem:triple {
                element sem:subject { $gift-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#giftingFirm" },
                element sem:object { $lfor-uri }
            },
            element sem:triple {
                element sem:subject { $gift-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#givenTo" },
                element sem:object { $rname-uri }
            },
            element sem:triple {
                element sem:subject { $gift-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#receivingAgency" },
                element sem:object { $aname-uri }
            },
            element sem:triple {
                element sem:subject { $gift-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#description" },
                element sem:object {
                    attribute datatype { "http://www.w3.org/2001/XMLSchema#string" },
                    $gift-description
                }
            },
            element sem:triple {
                element sem:subject { $gift-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#value" },
                element sem:object {
                    attribute datatype { "http://www.w3.org/2001/XMLSchema#integer" },
                    $gift-value
                }
            },
            chigov2sem:generate-foundIn($gift-uri, $dburi),
            
            (: Lobbyist :)
            chigov2sem:generate-name($lname-uri, $lname),
            element sem:triple {
                element sem:subject { $lname-uri },
                element sem:predicate { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
                element sem:object { "http://xmlns.com/foaf/0.1/Person" }
            },
            element sem:triple {
                element sem:subject { $lname-uri },
                element sem:predicate { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
                element sem:object { "http://marklogic.com/chigovdata/vocab#Lobbyist" }
            },
            element sem:triple {
                element sem:subject { $lname-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#lobbied" },
                element sem:object { $rname-uri }
            },
            element sem:triple {
                element sem:subject { $lname-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#lobbied" },
                element sem:object { $aname-uri }
            },
            element sem:triple {
                element sem:subject { $lname-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#lobbiedFor" },
                element sem:object { $lfor-uri }
            },
            chigov2sem:generate-foundIn($lname-uri, $dburi),
            
            (: Lobbied For :)
            chigov2sem:generate-name($lfor-uri, $lfor),
            element sem:triple {
                element sem:subject { $lfor-uri },
                element sem:predicate { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
                element sem:object { "http://xmlns.com/foaf/0.1/Organization" }
            },
            element sem:triple {
                element sem:subject { $lfor-uri },
                element sem:predicate { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
                element sem:object { "http://marklogic.com/chigovdata/vocab#Company" }
            },
            element sem:triple {
                element sem:subject { $lfor-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#lobbyist" },
                element sem:object { $lname-uri }
            },
            element sem:triple {
                element sem:subject { $lfor-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#lobbied" },
                element sem:object { $rname-uri }
            },
            element sem:triple {
                element sem:subject { $lfor-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#lobbied" },
                element sem:object { $aname-uri }
            },
            chigov2sem:generate-foundIn($lfor-uri, $dburi),
            
            (: Lobbied/Receiving individual :)
            chigov2sem:generate-name($rname-uri, $rname),
            element sem:triple {
                element sem:subject { $rname-uri },
                element sem:predicate { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
                element sem:object { "http://xmlns.com/foaf/0.1/Person" }
            },
            element sem:triple {
                element sem:subject { $rname-uri },
                element sem:predicate { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
                element sem:object { "http://marklogic.com/chigovdata/vocab#Recipient" }
            },
            if ($rname-title ne "") then
                element sem:triple {
                    element sem:subject { $rname-uri },
                    element sem:predicate { "http://marklogic.com/chigovdata/vocab#jobTitle" },
                    element sem:object { $rname-title }
                }
            else
                (),
            element sem:triple {
                element sem:subject { $rname-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#lobbiedBy" },
                element sem:object { $lname-uri }
            },
            element sem:triple {
                element sem:subject { $rname-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#lobbiedBy" },
                element sem:object { $lfor-uri }
            },
            element sem:triple {
                element sem:subject { $rname-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#representativeOf" },
                element sem:object { $aname-uri }
            },
            chigov2sem:generate-foundIn($rname-uri, $dburi),
            
            (: Lobbied/Receiving Agency :)
            chigov2sem:generate-name($aname-uri, $aname),
            element sem:triple {
                element sem:subject { $aname-uri },
                element sem:predicate { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
                element sem:object { "http://xmlns.com/foaf/0.1/Organization" }
            },
            element sem:triple {
                element sem:subject { $aname-uri },
                element sem:predicate { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
                element sem:object { "http://marklogic.com/chigovdata/vocab#RecipientOrganization" }
            },
            element sem:triple {
                element sem:subject { $aname-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#lobbiedBy" },
                element sem:object { $lname-uri }
            },
            element sem:triple {
                element sem:subject { $aname-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#lobbiedBy" },
                element sem:object { $lfor-uri }
            },
            element sem:triple {
                element sem:subject { $aname-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#hasRepresentative" },
                element sem:object { $rname-uri }
            },
            chigov2sem:generate-foundIn($aname-uri, $dburi)
        }
};


declare function chigov2sem:lobbyist-triples(
    $baseuri as xs:string,
    $dburi as xs:string, 
    $row as element(chidata:row)
    ) as element(sem:triples)
{
    (: Lobbyist :)
    let $llast := xs:string($row/chidata:lobbyist_last_name)
    let $lfirst := xs:string($row/chidata:lobbyist_first_name)
    let $lmiddle := 
        if ($row/chidata:lobbyist_middle_initial) then
            xs:string($row/chidata:lobbyist_middle_initial)
        else
            ""
    let $lname := fn:normalize-space(fn:concat($llast, ", ", $lfirst , " ", $lmiddle))
    let $lname-normalized := chigov2sem:normalize($lname)
    let $lname-uri := fn:concat($baseuri, "people/" ,$lname-normalized)

    (: Lobbying Firm :)
    let $lfirm := xs:string($row/chidata:employer_name)
    let $lfirm-normalized := chigov2sem:normalize($lfirm)
    let $lfirm-uri := fn:concat($baseuri, "organizations/" ,$lfirm-normalized)
    
    (: Client / Lobbies for :)
    let $cname := xs:string($row/chidata:client_name)
    let $cname-normalized := chigov2sem:normalize($cname)
    let $cname-uri := fn:concat($baseuri, "organizations/" ,$cname-normalized)
    
    (: Lobbied Dept Agency :)
    let $aname := xs:string($row/chidata:lobbied_department_name)
    let $aname-normalized := chigov2sem:normalize($aname)
    let $aname-uri := fn:concat($baseuri, "organizations/" ,$aname-normalized)
    
    return
        element sem:triples {

            (: Lobbyist :)
            chigov2sem:generate-name($lname-uri, $lname),
            element sem:triple {
                element sem:subject { $lname-uri },
                element sem:predicate { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
                element sem:object { "http://xmlns.com/foaf/0.1/Person" }
            },
            element sem:triple {
                element sem:subject { $lname-uri },
                element sem:predicate { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
                element sem:object { "http://marklogic.com/chigovdata/vocab#Lobbyist" }
            },
            element sem:triple {
                element sem:subject { $lname-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#employedBy" },
                element sem:object { $lfirm-uri }
            },
            element sem:triple {
                element sem:subject { $lname-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#lobbied" },
                element sem:object { $aname-uri }
            },
            element sem:triple {
                element sem:subject { $lname-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#lobbiedFor" },
                element sem:object { $cname-uri }
            },
            chigov2sem:generate-foundIn($lname-uri, $dburi),
            
            (: Employed By :)
            chigov2sem:generate-name($lfirm-uri, $lfirm),
            element sem:triple {
                element sem:subject { $lfirm-uri },
                element sem:predicate { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
                element sem:object { "http://xmlns.com/foaf/0.1/Organization" }
            },
            element sem:triple {
                element sem:subject { $lfirm-uri },
                element sem:predicate { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
                element sem:object { "http://marklogic.com/chigovdata/vocab#Firm" }
            },
            element sem:triple {
                element sem:subject { $lfirm-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#lobbyist" },
                element sem:object { $lname-uri }
            },
            chigov2sem:generate-foundIn($lfirm-uri, $dburi),
        
            (: Client / Lobbied For :)
            chigov2sem:generate-name($cname-uri, $cname),
            element sem:triple {
                element sem:subject { $cname-uri },
                element sem:predicate { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
                element sem:object { "http://xmlns.com/foaf/0.1/Organization" }
            },
            element sem:triple {
                element sem:subject { $cname-uri },
                element sem:predicate { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
                element sem:object { "http://marklogic.com/chigovdata/vocab#Company" }
            },
            element sem:triple {
                element sem:subject { $cname-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#lobbyist" },
                element sem:object { $lname-uri }
            },
            element sem:triple {
                element sem:subject { $cname-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#lobbied" },
                element sem:object { $aname-uri }
            },
            chigov2sem:generate-foundIn($cname-uri, $dburi),

            (: Lobbied/Receiving Agency :)
            chigov2sem:generate-name($aname-uri, $aname),
            element sem:triple {
                element sem:subject { $aname-uri },
                element sem:predicate { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
                element sem:object { "http://xmlns.com/foaf/0.1/Organization" }
            },
            element sem:triple {
                element sem:subject { $aname-uri },
                element sem:predicate { "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
                element sem:object { "http://marklogic.com/chigovdata/vocab#RecipientOrganization" }
            },
            element sem:triple {
                element sem:subject { $aname-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#lobbiedBy" },
                element sem:object { $lname-uri }
            },
            element sem:triple {
                element sem:subject { $aname-uri },
                element sem:predicate { "http://marklogic.com/chigovdata/vocab#lobbiedBy" },
                element sem:object { $lfirm-uri }
            },
            chigov2sem:generate-foundIn($aname-uri, $dburi)
        }
};
    

declare function chigov2sem:normalize($str) as xs:string
{
    fn:lower-case(fn:replace($str, "\s|,|\.|'|\(|\)", ""))
};

declare function chigov2sem:generate-foundIn(
    $uri as xs:string, 
    $dburi as xs:string
    ) as element(sem:triple)
{
    element sem:triple {
        element sem:subject { $uri },
        element sem:predicate { "http://marklogic.com/chigovdata/vocab#foundIn" },
        element sem:object { $dburi }
    }    
};


declare function chigov2sem:generate-name(
    $uri as xs:string, 
    $name as xs:string*
    ) as element(sem:triple)
{
    element sem:triple {
        element sem:subject { $uri },
        element sem:predicate { "http://xmlns.com/foaf/0.1/name" },
        element sem:object {
            attribute datatype { "http://www.w3.org/2001/XMLSchema#string" },
            $name
        }
    }    
};