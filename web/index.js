function createXMLHttpRequestObject(){
	
	if(window.XMLHttpRequest){
		xmlHTTPRequest = new XMLHttpRequest();
	}
	else{
		xmlHTTPRequest = new ActiveXObject("Microsoft.XMLHTTP");
	}
	return xmlHTTPRequest;
}


var xmlObj = createXMLHttpRequestObject()
document.addEventListener("DOMContentLoaded", function(){
    if (xmlObj != null){
        xmlObj.open("GET", "http://localhost:8000/configs", true);
        xmlObj.onreadystatechange = processResponse;
        xmlObj.send(null)
    }
    else{
        console.log("Error getting xmlobj")
    }
})

var allConfigMaps= null
function processResponse(){
    if ((xmlObj.status ==200) && (xmlObj.readyState == 4)){
        
        allConfigMaps  = JSON.parse(xmlObj.responseText)
        const namespaces = new Set();
        for (var i=0; i<allConfigMaps.length; i++){
            namespaces.add(allConfigMaps[i].metadata.namespace)
        }
        const nsSelect = document.getElementById("namespaces")
        namespaces.forEach(function(element){
            var anOption = document.createElement("option")
            anOption.innerHTML=element
            nsSelect.appendChild(anOption)
        })
    }
}

document.getElementById("namespaces").addEventListener("change", function (e){
    cmNameSelect = document.getElementById("cmnames")
    document.getElementById("cm-data").innerHTML=""
    // empty out the cmnames select
    cmNameSelect.length=0
    // e has the event
    ns = document.getElementById("namespaces").value
    
    for (i=0; i<allConfigMaps.length; i++){
        if (allConfigMaps[i].metadata.namespace==ns){
            var anOption = document.createElement("option")
            anOption.innerHTML=allConfigMaps[i].metadata.name
            cmNameSelect.appendChild(anOption)
        }
    }
})


var xmlObj1 = createXMLHttpRequestObject()
document.getElementById("cmnames").addEventListener("change", function (){
    cmnamespace = document.getElementById("namespaces").value
    cmname = document.getElementById("cmnames").value
    if (xmlObj1!=null){
        xmlObj1.open("GET", "http://localhost:8000/configs/"+cmnamespace+"/"+cmname, true)
        xmlObj1.onreadystatechange = processCMResponse
        xmlObj1.send(null)
    }
    else{
        console.log("Error in xmlobj1")
    }
})

function processCMResponse(){
    if ((xmlObj1.status == 200) && (xmlObj1.readyState == 4)){
        configmaps = JSON.parse(xmlObj1.responseText)
        
        cmData = document.getElementById("cm-data")
        //cmData.innerHTML = JSON.stringify(configmaps.data)
        cmData.innerText = JSON.stringify(configmaps.data)
    }
}

document.getElementById("update-button").addEventListener("click", function (){
    updatedData = document.getElementById("cm-data").value
    cmName = document.getElementById("cmnames").value
    cmNamespace = document.getElementById("namespaces").value
    
    allConfigMaps.forEach(function (element){
        
        if ((cmName == element.metadata.name) && (cmNamespace == element.metadata.namespace)){
            console.log("updated data is "+ updatedData+" and element.data is "+ JSON.stringify(element.data))
            if (updatedData != JSON.stringify(element.data)){
                updateConfigMap(cmName, cmNamespace, element, updatedData)
            }
            else{
                console.log("Configmap was not updated")
            }
        }
    })
    
})

var xmlObjUpdate = createXMLHttpRequestObject()
function updateConfigMap(name, namespace, configmap, updatedData){
    configmap.data = JSON.parse(updatedData)
    console.log("Updated configmaps would be "+JSON.stringify(configmap))
    if (xmlObjUpdate != null){
        xmlObjUpdate.open("PUT", "http://localhost:8000/configs/"+namespace+"/"+name, true)
        xmlObjUpdate.onreadystatechange = processUpdateResponse
        xmlObjUpdate.send(JSON.stringify(configmap))
    }
    else{
        console.log("xmlObjUpdate is null")
    }
}
function processUpdateResponse(){
    if (xmlObjUpdate.status == 200 && xmlObjUpdate.readyState == 4){
        console.log(xmlObjUpdate.responseText)
    }
}
