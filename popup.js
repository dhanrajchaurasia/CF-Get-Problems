function ref(){
    var handleInfo = document.getElementById('handleInfo');
    chrome.storage.local.get(['userHandle'], function(result) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            handleInfo.innerHTML = `Your CF Handle isn't set yet!`
            return;
        } else {
            var userHandle = result.userHandle;
            if (userHandle) handleInfo.innerHTML = `Your current CF Handle is set to ${userHandle}`
            else handleInfo.innerHTML = `Your CF Handle isn't set yet!`
            return;
        }
    });    
    handleInfo.innerHTML = `Your CF Handle isn't set yet!`
}
ref();
document.getElementById('submit').addEventListener('click', function () {
    var userHandle = document.getElementById('userHandle').value;
    if (!userHandle) {
        alert("Please enter a user handle");
        return;
    }
    chrome.storage.local.set({ userHandle: userHandle }, function () {
        if (chrome.runtime.lastError){
            console.error(chrome.runtime.lastError);
            alert("Error: Unable to save user handle");
        }
        else{
            ref();
        }
    });
});
