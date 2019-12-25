const BASE_URL="http://localhost:8000"
const CM_BASE_URL=BASE_URL+"/configs/"
const NS_BASE_RUL=BASE_URL+"/namespaces"
const SECRET_BASE_URL=BASE_URL+"/secrets/"

var cmOrSecret="ConfigMap"
res = document.getElementsByClassName("resourcebutton")
for(var i=0; i<res.length; i++){
    res[i].addEventListener("click", function(e){
        reset()
        id = e.target.getAttribute("id")
        cmOrSecret = e.target.innerHTML
        if (id == "cmbutton"){
            document.getElementById(id).classList.add("selected")
            document.getElementById("secretbutton").classList.remove("selected")
        }
        else if (id == "secretbutton"){
            document.getElementById(id).classList.add("selected")
            document.getElementById("cmbutton").classList.remove("selected")
        }
        changeUpdateButton(e.target)    
    })
}

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
        xmlObj.open("GET", NS_BASE_RUL, true);
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
        for (var i=0; i<allNamespaces.length; i++){
            var anOption = document.createElement("option")
            anOption.innerHTML=allNamespaces[i].metadata.name
            nsSelect.appendChild(anOption)
        }
    }
}

document.getElementById("namespaces").addEventListener("change", function (e){
    cmNameSelect = document.getElementById("cmnames")
    //document.getElementById("cm-data").innerHTML=""
    document.getElementById("cm-data").value=""
    // empty out the cmnames select
    cmNameSelect.length=0
    defaultOp = document.createElement("option")
    defaultOp.innerHTML="Select Name"
    cmNameSelect.appendChild(defaultOp)

    // e has the event
    ns = document.getElementById("namespaces").value
    // get all configmaps for this namespcaes 
    displayConfigMapsOfNs(ns)
    
})

// gets all resources cm or secret from a namespace
var gConOfNSObj = createXMLHttpRequestObject()
function displayConfigMapsOfNs(ns){
    if (gConOfNSObj != null){
        if (cmOrSecret== "ConfigMap"){
            gConOfNSObj.open("GET", CM_BASE_URL+"/"+ns, true)
        }
        else if (cmOrSecret =="Secret"){
            gConOfNSObj.open("GET", SECRET_BASE_URL+"/"+ns, true)
        }
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
    if (cmname != "Select Name"){
        if (xmlObj1!=null){
            console.log(cmOrSecret)
            if (cmOrSecret=="ConfigMap"){
                console.log("Getting configmaps")
                xmlObj1.open("GET", CM_BASE_URL+cmnamespace+"/"+cmname, true)
            }
            else if (cmOrSecret=="Secret"){
                console.log("Getting secrets")
                xmlObj1.open("GET", SECRET_BASE_URL+cmnamespace+"/"+cmname, true)
            }
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
        console.log("Printing before decoding")
        console.log(configmaps)
        // if we are getting secret we will have to 
        // decode the value of data and then display 
        // in the UI
        if (cmOrSecret == "Secret"){
            Object.keys(configmaps.data).forEach(function(key){
                configmaps.data[key] = window.atob(configmaps.data[key])
            })
        }
        console.log("Outputting the data ")
        console.log(configmaps.data)
        cmData.value = JSON.stringify(configmaps.data)
    }
}

document.getElementById("update-button").addEventListener("click", function (){
    updatedData = document.getElementById("cm-data").value
    cmName = document.getElementById("cmnames").value
    cmNamespace = document.getElementById("namespaces").value
    
    allConfigMaps.forEach(function (element){
        
        if ((cmName == element.metadata.name) && (cmNamespace == element.metadata.namespace)){
            
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
    if (cmOrSecret == "Secret"){
        Object.keys(configmap.data).forEach(function(key){
            configmap.data[key] = window.btoa(configmap.data[key])
        })
    }
    
    if (xmlObjUpdate != null){
        if (cmOrSecret == "ConfigMap"){
            xmlObjUpdate.open("PUT", CM_BASE_URL+namespace+"/"+name, true)
        }
        else if (cmOrSecret =="Secret"){
            xmlObjUpdate.open("PUT", SECRET_BASE_URL+namespace+"/"+name, true)
        }
            
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
        if (cmOrSecret == "ConfigMap"){
            messageSpan.innerHTML="ConfigMap was updated successfully."
        }
        else if (cmOrSecret == "Secret"){
            messageSpan.innerHTML="Secret was updated successfully."
        }
    }
    else{
        messageSpan.innerHTML="There was an issue updating the conifgmap, HTTPStatus-"+xmlObjUpdate.status
    }
    setTimeout(function(){messageSpan.innerHTML=""}, 1500)
}

// reset will reset the select boxes once we change the 
function reset(){
    // delete the resource names from resource select list
    cmNameSelect = document.getElementById("cmnames");
    cmNameSelect.length=0;
    defaultOp = document.createElement("option")
    defaultOp.innerHTML="Select Name"
    cmNameSelect.appendChild(defaultOp)

    // delete the content of the textarea
    //document.getElementById("cm-data").innerHTML="";
    document.getElementById("cm-data").value="";

    // reset the namespace select
    document.getElementById("namespaces").value="Select Namespace"
}

function changeUpdateButton(elem){
    v = "Update "+ elem.innerHTML;
    document.getElementById("update-button").innerHTML=v;
}