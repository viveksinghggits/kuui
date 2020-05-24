var actionSelected = "update"
document.addEventListener("DOMContentLoaded", function(){
    crosses = document.getElementsByClassName("crossbutton")
    for (let i = 0; i < crosses.length; i++) {
        crosses[i].addEventListener("click", hideMessage)
    }

    document.getElementById("add-cm-keys").addEventListener("click", addCMKey)
    actions = document.getElementsByClassName("action")
    for (let i = 0; i < actions.length; i++) {
        actions[i].addEventListener("click", function(e){
            id = e.target.getAttribute("id")
            actionSelected = id.substring(0, id.indexOf("-"))
            reset()
            resetAction(id)
            unSelectActionButtons(actions)
            document.getElementById(id).classList.add("selected")
            handleAction(id)
        })
    }
})

function hideMessage(e){
    e.target.parentElement.style.display = "none"
}

/*
When we switch over the actions for update and delete we need
the namespace and the name of the resource, but in the case of
create we dont need the name drop down, so we will just have to
display the the namespace dropdowon.
This function hides the name drop down if the action is Create
*/
function resetAction(){
    if (actionSelected =="create"){
        e = document.getElementById("cmnames")
        e.style.display="none"
        document.getElementById("res-name-div").style.display = "block"
    } else{
        document.getElementById("cmnames").style.display="block"
        document.getElementById("res-name-div").style.display = "none"
    }
}


function unSelectActionButtons(actions){
    for (let i = 0; i < actions.length; i++) {
        actions[i].classList.remove("selected")
    }
}

function handleAction(actionElemId){
    hideActionBody(actionElemId)
    // show only the app that has id as actionElemId-app
    s= actionElemId.substring(0, actionElemId.indexOf("-"))
    document.getElementById("resourcebody-"+s).style.display="block"
}

function hideActionBody(elemId){
    actionsBody = document.getElementsByClassName("resourcebody")
    for (let i = 0; i < actionsBody.length; i++) {
        actionsBody[i].style.display = "none"
    }
}

function displayDeleteResConfirmation(){
    deleResConf = document.getElementById("resourcebody-delete-confirm")
    deleResConf.style.display = "block"
}

function addCMKey(){
    addKeyValueTo("cm-key-value")
}


function addKeyValueTo(elem){
    d = document.createElement("div")
    d.classList.add("key-value")

    k = document.createElement("input")
    k.setAttribute("type", "text")
    k.classList.add("cm-key", "fancyinput")
    k.setAttribute("placeholder", "key")

    v = document.createElement("input")
    v.setAttribute("type", "text")
    v.classList.add("cm-value", "cm-value-margin", "fancyinput")
    v.setAttribute("placeholder", "value")

    cross = document.createElement("input")
    cross.setAttribute("type", "button")
    cross.setAttribute("tabindex", "-1")
    cross.value="*"
    cross.classList.add("plus-button", "cross-button", "iconbuttons")
    cross.style.width="27px"
    cross.addEventListener("click", removeKeyValue)

    d.appendChild(k)
    d.appendChild(v)
    d.appendChild(cross)
    document.getElementById(elem).appendChild(d)
}

function removeKeyValue(e){
    e.target.parentElement.remove(e.target)
}

document.getElementById("create-res-button").addEventListener("click", function(){

    ns = document.getElementById("namespaces").value
    name = document.getElementById("res-name").value
    let resFrom
    fromButtons = document.getElementsByName("cm-from")
    for (let i = 0; i < fromButtons.length; i++) {
        if (fromButtons[i].checked){
            resFrom = fromButtons[i].id
        }
    }

    let resdata = {}
    if (resFrom =="from-literal"){
        keyElems = document.getElementsByClassName("cm-key")
        valueElems = document.getElementsByClassName("cm-value")
        for (let i = 0; i < keyElems.length; i++) {
            resdata[keyElems[i].value]= valueElems[i].value
        }
    } else if (resFrom == "from-file"){
        fileContent = document.getElementById("creatres-ta").value
        fileName = document.getElementById("file-name").value
        resdata[fileName] = fileContent
    }
    if (cmOrSecret == "ConfigMap"){
        cm = {
            metadata:{
                name: name,
                namespace: ns
            },
            data: resdata,
            kind: "ConfigMap",
            apiVersion: "v1"
        }

        createConfigMap(cm)

    } else if (cmOrSecret == "Secret"){

        secret  = {
            apiVersion: "v1",
            kind: "Secret",
            stringData: resdata,
            metadata: {
                name: name,
                namespace: ns
            }
        }

        createSecret(secret)

    }
})

createSecXMLObj = createXMLHttpRequestObject()
function createSecret(sec){
    if (createSecXMLObj != null){
        createSecXMLObj.open("POST", SECRET_BASE_URL.substring(0,  SECRET_BASE_URL.length-1), true)
        createSecXMLObj.onreadystatechange = processCreateSecRes
        createSecXMLObj.send(JSON.stringify(sec))
    } else{
        console.log("Object was not created to create secret")
    }
}

function processCreateSecRes(){
    if (createSecXMLObj.status == 200 && createSecXMLObj.readyState == 4){
        secResponse = JSON.parse(createSecXMLObj.responseText)
        if (secResponse == null){
            displaySuccess("Resource was created", actionSelected)
        } else{
            displayError("There was an error:"+ JSON.stringify(secResponse), actionSelected)
        }
    }
}

createCMXMLObj = createXMLHttpRequestObject()
function createConfigMap(cm){
    if (createCMXMLObj!= null){
        createCMXMLObj.open("POST",  CM_BASE_URL.substring(0,  CM_BASE_URL.length-1), true)
        createCMXMLObj.onreadystatechange = processCreateResponse
        createCMXMLObj.send(JSON.stringify(cm))
    } else{
        console.log("Create object is nil")
    }
}

function processCreateResponse(){
    if (createCMXMLObj.status == 200 && createCMXMLObj.readyState == 4){
        response = JSON.parse(createCMXMLObj.responseText)
        if (response == null){
            displaySuccess("Resource was created", actionSelected)
        } else{
            displayError("There was an error:"+ JSON.stringify(response), actionSelected)
        }
    }
}

function createResFrom(elem){
    document.getElementById("cm-content-from-file").classList.toggle("displaynone")
    document.getElementById("cm-content-from-literal").classList.toggle("displaynone")
    document.getElementById("creatres-ta").innerHTML=""
}