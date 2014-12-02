xquery version "1.0-ml";

(: Namespace pattern must be:  
 : "http://marklogic.com/rest-api/transform/{$rname}" 
 : and prefix must match transform name :)
module namespace load = "http://marklogic.com/rest-api/transform/load";
  
import module namespace chigov2sem = "http://marklogic.com/chigovdata/modules/chigov2sem#" at "/ext/modules/chigov2sem.xqy";

declare namespace chidata = 'http://data.cityofchicago.org/rows/';

declare function load:transform(
  $context as map:map,
  $params as map:map,
  $content as document-node()
) as document-node()
{
    if (fn:empty($content/*)) then $content
    else
        let $dburi := xs:string(map:get($context,"uri"))
        let $triples := chigov2sem:chigov2sem($dburi, $content/element())
        return document {
        <mets:mets PROFILE="metadataRecord" OBJID="{$dburi}" 
            xsi:schemaLocation="http://www.loc.gov/METS/ http://www.loc.gov/standards/mets/mets.xsd" 
            xmlns:xlink="http://www.w3.org/1999/xlink" 
            xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
            xmlns:sem="http://marklogic.com/semantics" 
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
            xmlns:mets="http://www.loc.gov/METS/">
            <mets:dmdSec ID="main">
                <mets:mdWrap MDTYPE="OTHER">
                    <mets:xmlData>
                        {$content}
                    </mets:xmlData>
                </mets:mdWrap>
            </mets:dmdSec>
            <mets:dmdSec ID="semrdf">
                <mets:mdWrap MDTYPE="OTHER">
                    <mets:xmlData>
                        {$triples}
                    </mets:xmlData>
                </mets:mdWrap>
            </mets:dmdSec>
            <mets:structMap>
                <mets:div TYPE="dataRecord" DMDID="main semrdf"/>
            </mets:structMap>
        </mets:mets>
        }

};
