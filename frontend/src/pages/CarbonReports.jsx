import {
  useEffect,
  useState,
} from "react";


import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";


import {
  FaLeaf,
  FaTint,
  FaBolt,
  FaGlobe,
  FaChartLine,
  FaCheckCircle,
} from "react-icons/fa";


import API from "../services/api";

import sustainabilityService from "../services/sustainabilityService";

import "../css/CarbonReports.css";



function CarbonReports(){


const [collapsed,setCollapsed] =
useState(false);



const [loading,setLoading] =
useState(true);



const [carbon,setCarbon] =
useState({

  co2:0,
  water:0,
  energy:0,
  score:0

});





// =====================================================
// AUTO REFRESH
// =====================================================

useEffect(()=>{


loadCarbonData();



const timer =
setInterval(()=>{

loadCarbonData();


},30000);



return()=>{

clearInterval(timer);

};


},[]);







// =====================================================
// LOAD CARBON DATA
// =====================================================


const loadCarbonData = async()=>{


try{


setLoading(true);



const response =
await API.get(
"/waste-requests/"
);





const completed =
response.data.filter(
(item)=>

String(item.status)
.trim()
.toLowerCase()
===
"completed"

);






let totalCO2 = 0;

let totalWater = 0;

let totalEnergy = 0;

let totalScore = 0;






for(
const item of completed
){



const request = {


fabric_type:
item.material,


quantity:
Number(item.quantity),


source:
"Recovered Textile Waste",


condition:
"Processed"


};






const result =
await sustainabilityService
.analyzeSustainability(
request
);





const impact =
result.environmental_impact ||
{};







totalCO2 +=
Number(
impact.co2_saved ||
impact.co2Saved ||
0
);






totalWater +=
Number(
impact.water_saved ||
impact.waterSaved ||
0
);






totalEnergy +=
Number(
impact.energy_saved ||
impact.energySaved ||
0
);






totalScore +=
Number(
impact.environmental_score ||
impact.environmentalScore ||
0
);



}








setCarbon({



co2:
totalCO2.toFixed(2),



water:
totalWater.toFixed(0),



energy:
totalEnergy.toFixed(2),



score:

completed.length

?

(
totalScore /
completed.length
)
.toFixed(1)

:

0


});




}

catch(error){


console.error(
"Carbon Load Error:",
error
);


}


finally{


setLoading(false);


}


};









return(


<div className="dashboard">



<Sidebar

collapsed={collapsed}

setCollapsed={setCollapsed}

/>






<div

className={

`dashboard-content

${collapsed ? "collapsed" : ""}`

}

>





<Navbar />







<main className="carbon-page">







<section className="carbon-hero">





<div>





<div className="carbon-hero-icon">

<FaLeaf/>

</div>






<span>

Environmental Performance

</span>






<h1>

Carbon Reports

</h1>






<p>

Monitor carbon savings,
environmental impact and recycling performance.

</p>







<div className="carbon-meta">





<span>

<FaCheckCircle/>

Sustainability Tracking Active

</span>






<span>

Live Analysis

</span>





</div>






</div>







</section>









{
loading &&

<p>

Updating Carbon Data...

</p>

}









<section className="carbon-cards">








<Card

icon={<FaLeaf/>}

title="CARBON SAVED"

value={`${carbon.co2} Kg`}

text="Through textile recycling"

/>







<Card

icon={<FaTint/>}

title="WATER SAVED"

value={`${carbon.water} L`}

text="Resource conservation"

/>







<Card

icon={<FaBolt/>}

title="ENERGY SAVED"

value={`${carbon.energy} MJ`}

text="Energy reduction"

/>








<Card

icon={<FaGlobe/>}

title="ENVIRONMENT SCORE"

value={`${carbon.score}%`}

text="Environmental impact score"

/>







</section>









<section className="carbon-overview">





<div className="overview-header">





<div>


<span>

Performance

</span>





<h2>

Environmental Overview

</h2>






<p>

Current carbon performance

</p>






</div>






<FaChartLine/>






</div>









<div className="progress-box">





<div>


Carbon Saving


<strong>

{carbon.score}%

</strong>



</div>








<div className="progress-bar">



<span

style={{

width:`${carbon.score}%`

}}

/>



</div>







</div>






</section>









<section className="report-table">





<h2>

Carbon Summary

</h2>






<p>

Environmental impact details

</p>








<table>





<thead>

<tr>


<th>

Parameter

</th>



<th>

Value

</th>



</tr>

</thead>









<tbody>



<tr>

<td>

CO₂ Saved

</td>


<td>

{carbon.co2}

</td>


</tr>







<tr>

<td>

Water Saved

</td>


<td>

{carbon.water}

</td>


</tr>







<tr>

<td>

Energy Saved

</td>


<td>

{carbon.energy}

</td>


</tr>





</tbody>






</table>







</section>









</main>







</div>






</div>


);


}









function Card({

icon,

title,

value,

text

}){


return(



<div className="carbon-card">





<div className="carbon-icon">

{icon}

</div>






<span>

{title}

</span>






<h2>

{value}

</h2>






<p>

{text}

</p>







</div>


);


}






export default CarbonReports;