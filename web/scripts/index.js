let BASE_URL=""
let ls  = window.localStorage;
let CM_BASE_URL=BASE_URL+"/configs/"
let NS_BASE_RUL=BASE_URL+"/namespaces"
let SECRET_BASE_URL=BASE_URL+"/secrets/"

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

function initBaseURLBox(){
    BASE_URL = ls.getItem("BASE_URL")
    if (BASE_URL == null){
        epdiv = document.getElementById("endpointdiv")
        epdiv.style.display="block"
    }
    else{
        CM_BASE_URL=BASE_URL+"/configs/"
        NS_BASE_RUL=BASE_URL+"/namespaces"
        SECRET_BASE_URL=BASE_URL+"/secrets/"
    }
}

function updateBaseURL(){
    baseurl  = document.getElementById("baseurl").value
    let reg = new RegExp('((http[s]?):\/)\/[a-z]*[A-Z]*:\d*', 'g')
    res = baseurl.match(reg)
    
    if (res == null){
        document.getElementById("invalidurl").innerHTML="Endpoint doesnt seem to be valid."
    }
    else{
        ls.setItem("BASE_URL", baseurl)
        document.location.reload()
    }
    
}

var xmlObj = createXMLHttpRequestObject()
document.addEventListener("DOMContentLoaded", function(){
    initBaseURLBox()
    document.getElementById("updateurlbutton").addEventListener("click", updateBaseURL)
    
    if (xmlObj != null){
        try{
            xmlObj.open("GET", NS_BASE_RUL, true);
            xmlObj.onreadystatechange = processResponse;
            xmlObj.send(null)
        }
        catch(e){
            displayError(e, actionSelected)
        }
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
    if (actionSelected == "update"){
        if (cmname != "Select Name"){
            if (xmlObj1!=null){
                
                if (cmOrSecret=="ConfigMap"){
                    xmlObj1.open("GET", CM_BASE_URL+cmnamespace+"/"+cmname, true)
                }
                else if (cmOrSecret=="Secret"){
                    xmlObj1.open("GET", SECRET_BASE_URL+cmnamespace+"/"+cmname, true)
                }
                xmlObj1.onreadystatechange = processCMResponse
                xmlObj1.send(null)
            }
            else{
                console.log("Error in xmlobj1")
            }
        }
    } else{
        displayDeleteResConfirmation()
    }
})

function processCMResponse(){
    if ((xmlObj1.status == 200) && (xmlObj1.readyState == 4)){
        configmaps = JSON.parse(xmlObj1.responseText)
        
        cmData = document.getElementById("cm-data")
        
        // if we are getting secret we will have to 
        // decode the value of data and then display 
        // in the UI
        if (cmOrSecret == "Secret"){
            Object.keys(configmaps.data).forEach(function(key){
                configmaps.data[key] = window.atob(configmaps.data[key])
            })
        }
        
        cmData.value = JSON.stringify(configmaps.data, null, 4)
    }
}

document.getElementById("delete-res-button").addEventListener("click", function(){
    resName = document.getElementById("cmnames").value
    resNS = document.getElementById("namespaces").value

    // are you sure you want to delete the resource
    confirmName = document.getElementById("delete-res-conf").value
    if (resName== confirmName){
        deleteResource(resName, resNS)
    } else{
        displayError("The name that you selected and the one you entered don't match.", actionSelected)
    }
})

let delResXMLObj = createXMLHttpRequestObject()
function deleteResource(resName, resNS){

    if (delResXMLObj != null){
        if (cmOrSecret == "Secret"){
            delResXMLObj.open("DELETE", SECRET_BASE_URL+resNS+"/"+resName, true)
        } else{
            delResXMLObj.open("DELETE", CM_BASE_URL+resNS+"/"+resName, true)
        }

        delResXMLObj.onreadystatechange = processDelResourceResponse
        delResXMLObj.send(null)
    } else{
        console.log("there was an issue creating XML object to delete the resource.")
    }
    
}

function processDelResourceResponse(){
    if (delResXMLObj.status == 200 && delResXMLObj.readyState == 4){
        console.log("Response that we got from delete resource :"+ JSON.parse(delResXMLObj.responseText))
        displaySuccess("Resource was deleted", actionSelected)
    } else{
        console.log("Status of the del res response object was not OK")
    }
}

document.getElementById("update-res-button").addEventListener("click", function (){
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
    try{
        configmap.data = JSON.parse(updatedData)
    }
    catch(e){
        displayError("Invalid input data.", actionSelected)
        return
    }
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
    document.getElementById("delete-res-conf").value =""
    document.getElementById("resourcebody-delete-confirm").style.display="none"
    
    // select the configmaps by default
    document.getElementById("cmbutton").classList.add("selected")
    document.getElementById("secretbutton").classList.remove("selected")
}

function changeUpdateButton(elem){
    if (actionSelected == "delete"){
        v = "Delete "+ elem.innerHTML;
    } else if (actionSelected == "create"){
        v = "Create "+ elem.innerHTML;
    } else if (actionSelected =="update"){
        v = "Update "+ elem.innerHTML;
    }
    document.getElementById(actionSelected+"-res-button").innerHTML=v;
}

function displayError(e, action){
    var messageSpan = document.getElementById(action+"message-span")    
    var messageDiv = document.getElementById(action+"message")    
    messageSpan.innerHTML="Error : "+ e;
    messageSpan.style.color = "red"
    messageSpan.style.fontWeight="bold"
    messageDiv.style.display="block"
}

function displaySuccess(message, action){
    var messageSpan = document.getElementById(action+"message-span")    
    var messageDiv = document.getElementById(action+"message")
    messageSpan.innerHTML="Success : "+ message;
    messageSpan.style.color = "green"
    messageSpan.style.fontWeight="bold"
    messageDiv.style.display = "block"
}