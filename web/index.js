const BASE_URL="http://localhost:8000"
const CM_BASE_URL=BASE_URL+"/configs"
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
        xmlObj.open("GET", "http://localhost:8000/namespaces", true);
        xmlObj.onreadystatechange = processResponse;
        xmlObj.send(null)
    }
    else{
        console.log("Error getting xmlobj")
    }
})


// it displayes all the namespaces int he first drop down
function processResponse(){
    if ((xmlObj.status ==200) && (xmlObj.readyState == 4)){
        
        allNamespaces  = JSON.parse(xmlObj.responseText)
        const nsSelect = document.getElementById("namespaces")
        console.log("all the namespaces that we got are ", allNamespaces)
        for (var i=0; i<allNamespaces.length; i++){
            var anOption = document.createElement("option")
            anOption.innerHTML=allNamespaces[i].metadata.name
            nsSelect.appendChild(anOption)
        }
    }
}

document.getElementById("namespaces").addEventListener("change", function (e){
    cmNameSelect = document.getElementById("cmnames")
    document.getElementById("cm-data").innerHTML=""
    // empty out the cmnames select
    cmNameSelect.length=0
    defaultOp = document.createElement("option")
    defaultOp.innerHTML="Select CM Name"
    cmNameSelect.appendChild(defaultOp)

    // e has the event
    ns = document.getElementById("namespaces").value
    // get all configmaps for this namespcaes 
    displayConfigMapsOfNs(ns)
    
})

var gConOfNSObj = createXMLHttpRequestObject()
function displayConfigMapsOfNs(ns){
    if (gConOfNSObj != null){
        gConOfNSObj.open("GET", CM_BASE_URL+"/"+ns, true)
        gConOfNSObj.onreadystatechange = displayCMsResponse
        gConOfNSObj.send(null)
    }
}
var allConfigMaps
function displayCMsResponse(){
    if (gConOfNSObj.status == 200 && gConOfNSObj.readyState == 4){
        allConfigMaps = JSON.parse(gConOfNSObj.responseText)
        const cmSelect = document.getElementById("cmnames")

        allConfigMaps.forEach(function (element){
            var anOption = document.createElement("option")
            anOption.innerHTML = element.metadata.name
            cmSelect.appendChild(anOption)
        })
    }
}


var xmlObj1 = createXMLHttpRequestObject()
document.getElementById("cmnames").addEventListener("change", function (){
    cmnamespace = document.getElementById("namespaces").value
    cmname = document.getElementById("cmnames").value
    console.log("CMNames select was changed and the values that we have are ", cmnamespace, cmname)
    if (cmname != "Select CM Name"){
        if (xmlObj1!=null){
            xmlObj1.open("GET", "http://localhost:8000/configs/"+cmnamespace+"/"+cmname, true)
            xmlObj1.onreadystatechange = processCMResponse
            xmlObj1.send(null)
        }
        else{
            console.log("Error in xmlobj1")
        }
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
    var messageSpan = document.getElementById("updatemessage-span")
    if (xmlObjUpdate.status == 200 && xmlObjUpdate.readyState == 4){
        messageSpan.innerHTML="ConfigMap was updated successfully."
    }
    else{
        messageSpan.innerHTML="There was an issue updating the conifgmap, HTTPStatus-"+xmlObjUpdate.status
    }
}
