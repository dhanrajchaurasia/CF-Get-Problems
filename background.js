const url = window.location.href;

const match1 = url.match(/contest\/(\d+)/);
const match2 = url.match(/problemset\/problem\/(\d+)/);
var contestNumber = null

if (match1) contestNumber = match1[1];
else if (match2) contestNumber = match2[1];
else contestNumber = -1

const requestURL = `https://codeforces.com/api/contest.standings?contestId=${contestNumber}&from=1&count=1`;
var showRating = false, requestURL2 = "";
chrome.storage.local.get(['userHandle'], function(result){
    if (!chrome.runtime.lastError) {
        var userHandle = result.userHandle;
        requestURL2 = `https://codeforces.com/api/contest.status?contestId=${contestNumber}&handle=${userHandle}`;
    }
}); 
chrome.storage.local.get(['showRating'], function(result){
    if (!chrome.runtime.lastError && result.showRating != undefined) {
        showRating = result.showRating;
    }
});
fetchData();
async function fetchData(){
    const Verdict = {
        AC: "rgb(64, 255, 64)",
        WA: "rgb(255, 0, 0)",
        NA: "#0d9aff",
    };
    const problems = [], verdicts = {};
    try{
        const response = await fetch(requestURL);
        const data = await response.json();
        const problemsList = data.result.problems;
        const response2 = await fetch(requestURL2);
        const data2 = await response2.json();
        if(data2.status === "OK"){
            const res = data2.result;
            for (var i = 0; i < res.length; i++){
                const index = res[i].problem.index;
                const curVerdict = (res[i].verdict == "OK" ? Verdict["AC"] : Verdict["WA"]);
                if (!(index in verdicts) || (index in verdicts && verdicts[index] != Verdict["AC"])) verdicts[index] = curVerdict; 
            }
        }
        if(data.status == "OK"){
            for(var i = 0; i < problemsList.length; i++){
                const index = problemsList[i].index;
                const title = index + " - " + problemsList[i].name;
                const rating = problemsList[i].rating;
                const verdict = (index in verdicts ? verdicts[index] : Verdict["NA"])
                const problemUrl = `https://codeforces.com/contest/${contestNumber}/problem/${index}`;
                problems.push({index:index, url:problemUrl, title:title, rating:rating, verdict:verdict});
            }
        }
    }
    catch(e){
    }
    var toInsert;
    if(problems){
       toInsert = `
            <div class="roundbox sidebox" style="">
                <div class="roundbox-lt">&nbsp;</div>
                <div class="roundbox-rt">&nbsp;</div>
                <div class="caption titled">→ Contest Problems
                    <i class="sidebar-caption-icon las la-angle-down" onclick="
                        if (this.classList.contains('la-angle-right')) {
                            document.getElementById('Tagblock').style.display = 'block';
                            this.classList.add('la-angle-down');
                            this.classList.remove('la-angle-right');
                        } else {
                            document.getElementById('Tagblock').style.display = 'none';
                            this.classList.add('la-angle-right');
                            this.classList.remove('la-angle-down');
                        }">
                    </i>
                    <div class="top-links"></div>
                </div>
                <div id="Tagblock" style="display: block;">
                <div style="display: flex; margin: 8px auto; flex-wrap: wrap; justify-content: center; align-items: center; text-align: center;">
            `
        problems.forEach(e => {
            toInsert += `
            <span style="width:3em; margin: 2px; text-align: center; box-sizing: border-box;">
                <a title="${e.title}" href="${e.url}" style="color:${e.verdict}">${e.index}</a>
                <br><span class="small" title="Problem Rating">${e.rating == null || !showRating ? '-' : e.rating}</span>
            </span>`
        });
        toInsert += `
            </div>
            <div class="smaller" style="margin: 1em; text-align:center;">
            <input id="change-hide-tag-status" type="checkbox" ${showRating ? "" : "checked"}>
            <label for="change-hide-tag-status" style="vertical-align: top">Hide Rating</label>
            </div>
            </div>`
    }
    const getProblemBox = document.createElement("div");
    getProblemBox.innerHTML = toInsert;
    document.querySelector("#sidebar").prepend(getProblemBox);
    const checkBox = document.getElementById('change-hide-tag-status');
    checkBox.addEventListener('click', function () {
        chrome.storage.local.get(['showRating'], function(result){
            if (!chrome.runtime.lastError) {
                var showRating = result.showRating;
                showRating = !showRating;
                chrome.storage.local.set({ showRating: showRating }, function () {});
                checkBox.checked = showRating;
                location.reload();
            }
        });
    });
}
