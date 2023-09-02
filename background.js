const url = window.location.href;

const match1 = url.match(/contest\/(\d+)/);
const match2 = url.match(/problemset\/problems\/(\d+)/);
var contestNumber = null

if (match1) contestNumber = match1[1];
else if (match2) contestNumber = match2[1];
else contestNumber = -1
const requestURL = `https://codeforces.com/api/contest.standings?contestId=${contestNumber}&from=1&count=1`;

fetchData();

async function fetchData(){
    const problems = [];
    try{
        const response = await fetch(requestURL);
        const data = await response.json();
        const problemsList = data.result.problems;

        if(data.status == "OK"){
            for(var i = 0; i < problemsList.length; i++){
                const index = problemsList[i].index;
                const title = index + " - " + problemsList[i].name;
                const rating = problemsList[i].rating;
                const problemUrl = `https://codeforces.com/contest/${contestNumber}/problem/${index}`;
                problems.push({index:index, url:problemUrl, title:title, rating:rating});
            }
        }
    }
    catch(e){
    }
    console.log(problems);
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
            console.log(e);
            toInsert += `
            <span style="width:3em; margin: 2px; text-align: center; box-sizing: border-box;">
                <a title="${e.title}" href="${e.url}">${e.index}</a>
                <br><span class="small" title="Problem Rating">${e.rating == null ? '-' : e.rating}</span>
            </span>
            `
        });
        toInsert += '</div></div>'
    }
    const getProblemBox = document.createElement("div");
    getProblemBox.innerHTML = toInsert;
    document.querySelector("#sidebar").prepend(getProblemBox);
}