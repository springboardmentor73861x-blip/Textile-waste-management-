import {
 useEffect,
 useState
} from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
 FaLeaf,
 FaGlobe,
 FaRecycle,
 FaTint,
 FaBolt,
 FaChartLine,
 FaFileDownload,
 FaCheckCircle
} from "react-icons/fa";

import API from "../services/api";
import sustainabilityService from "../services/sustainabilityService";

import "../css/ESGReports.css";



function ESGReports(){


const [collapsed,setCollapsed] =
useState(false);



const [esg,setESG] =
useState({

  sustainability:0,
  environmental:0,
  co2:0,
  water:0,
  energy:0,
  recycling:"N/A"

});



useEffect(()=>{


loadESGData();


const timer =
setInterval(()=>{


loadESGData();


},30000);



return()=>{


clearInterval(timer);


};


},[]);







const loadESGData = async()=>{


try{


const response =
await API.get(
"/waste-requests/"
);




const completed =
response.data.filter(
(item)=>

String(item.status)
.toLowerCase()
==="completed"

);




let sustainabilityScore=0;

let environmentalScore=0;

let co2=0;

let water=0;

let energy=0;

let recycling="";





for(
const item of completed
){


const result =
await sustainabilityService
.analyzeSustainability({

fabric_type:
item.material,


quantity:
Number(item.quantity),


source:
"Recovered Textile Waste",


condition:
"Processed"

});




const sustainability =
result.sustainability || {};



const impact =
result.environmental_impact || {};



const recommendation =
result.recycling_recommendation || {};





sustainabilityScore +=
Number(
sustainability.sustainability_score ||
0
);



environmentalScore +=
Number(
impact.environmental_score ||
0
);



co2 +=
Number(
impact.co2_saved ||
0
);



water +=
Number(
impact.water_saved ||
0
);



energy +=
Number(
impact.energy_saved ||
0
);



recycling =
recommendation.recommended_recycling_method ||
"N/A";



}






setESG({

sustainability:

completed.length
?
(
sustainabilityScore /
completed.length
)
.toFixed(1)
:
0,



environmental:

completed.length
?
(
environmentalScore /
completed.length
)
.toFixed(1)
:
0,



co2:
co2.toFixed(2),



water:
water.toFixed(0),



energy:
energy.toFixed(2),



recycling

});




}

catch(error){


console.log(
"ESG Error",
error
);


}



};









return(


<div className="dashboard">



<Sidebar

collapsed={collapsed}

setCollapsed={setCollapsed}

/>





<div className={`dashboard-content ${
collapsed?"collapsed":""
}`}>



<Navbar />





<main className="esg-page">





<section className="esg-header">


<div>


<span>
SUSTAINABILITY INTELLIGENCE
</span>


<h1>
ESG Reports
</h1>


<p>
Environmental, Social and Governance performance analysis.
</p>


</div>


<FaLeaf/>

</section>







<section className="esg-cards">





<Card

icon={<FaLeaf/>}

title="SUSTAINABILITY SCORE"

value={`${esg.sustainability}%`}

/>





<Card

icon={<FaGlobe/>}

title="ENVIRONMENT SCORE"

value={`${esg.environmental}%`}

/>





<Card

icon={<FaRecycle/>}

title="RECYCLING METHOD"

value={esg.recycling}

/>





</section>








<section className="esg-impact">



<h2>

Environmental Impact

</h2>



<div className="impact-grid">



<div>

<FaLeaf/>

<h3>

CO₂ Saved

</h3>


<strong>

{esg.co2}

</strong>


</div>




<div>

<FaTint/>

<h3>

Water Saved

</h3>


<strong>

{esg.water}

</strong>


</div>





<div>

<FaBolt/>

<h3>

Energy Saved

</h3>


<strong>

{esg.energy}

</strong>


</div>



</div>



</section>







<section className="esg-chart">


<FaChartLine/>

<h2>

ESG Performance Tracking Active

</h2>


<p>

AI based sustainability monitoring from recovered textile waste.

</p>


</section>







</main>



</div>



</div>



);


}






function Card({
icon,
title,
value
}){


return(

<div className="esg-card">

<div>
{icon}
</div>


<span>
{title}
</span>


<h2>
{value}
</h2>


</div>

);


}



export default ESGReports;