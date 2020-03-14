var actionSelected = "update"
document.addEventListener("DOMContentLoaded", function(){
    actions = document.getElementsByClassName("action")
    for (let i = 0; i < actions.length; i++) {
        actions[i].addEventListener("click", function(e){
            reset()
            id = e.target.getAttribute("id")
            actionSelected = id.substring(0, id.indexOf("-"))
            unSelectActionButtons(actions)
            document.getElementById(id).classList.add("selected")
            handleAction(id)
        })
    }
})

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