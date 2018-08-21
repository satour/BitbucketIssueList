// 1. Global Variables and Constants -----------------------------
const bitbucketApi    = 'https://api.bitbucket.org/2.0/repositories/';
const defaultFields   = '?fields=values.id,values.title,values.links,values.state,values.updated_on,size,pagelen,next';

// 2. User Input Collection -----------------------------
function getBitbucketUser(){
  let user  = document.getElementById("BitbucketUsername").value;
  let pass   = document.getElementById("BitbucketPassword").value;
  return user + ":" + pass;
}

function getRepoName(){
  let owner  = document.getElementById("RepoOwnerName").value;
  let repo   = document.getElementById("RepoName").value;
  return owner + "/" + repo;
}

function getFilterOption(){
  let query_ar = [];
  let filter = document.getElementsByName('filter_state[]');
  filter.forEach(function(el){
    if (el.checked == true){ query_ar.push('state="' + el.value + '"'); }
  });
  query_str = '&q=' + query_ar.join([separator = ' OR ']);
  return query_str
}

function getSortOption(){
  let sort_by;
  document.getElementsByName('sort_by').forEach(function(el){
    if (el.checked == true){ sort_by = el.value; return; }
  });
  return '&sort=' + sort_by; 
}

// 3. Button Action ----------------------------

function action(){
  document.getElementById("tbody").innerHTML = '';
  sendData()
}

// 4. Event Listner ----------------------------

document.getElementById("btnGetIssues").addEventListener("click", function(){
  action();
});

// 5. Backend Procedures -----------------------------

function buildFirstTargetURL(){
  return bitbucketApi + getRepoName() + '/issues' + defaultFields + getFilterOption() + getSortOption();
}

function sendRequest(XHR, targetUrl){
  XHR.open('GET', targetUrl);
  XHR.setRequestHeader("Authorization", "Basic " + btoa(getBitbucketUser()));
  XHR.send();
  return XHR.response;
}

function sendData() {
  var XHR = new XMLHttpRequest();

  XHR.onreadystatechange = function() {
    if (XHR.readyState === 4) {
      insertTableBody(XHR.response)
      if (JSON.parse(XHR.response).next != undefined){
        let targetUrl = JSON.parse(XHR.response).next;
        sendRequest(XHR, targetUrl); //Recursive Requesting.
      }
    }
  }

  XHR.addEventListener('error', function() {
    alert('エラー！');
  });

  sendRequest(XHR, buildFirstTargetURL());
}

// 6. View Building & View Rendering -----------------------------
function insertTableBody(bitbucketResponse){
  const json    = JSON.parse(bitbucketResponse);
  const values  = json.values;
  const size    = json.size;

  values.forEach(function(el){
    let tr = document.createElement('tr');
    let td_id     = document.createElement('td');
    let td_title  = document.createElement('td');
    let td_state  = document.createElement('td');
    let td_update = document.createElement('td');
    
    td_id.innerHTML = el.id;
    td_title.innerHTML = '<a href="' + el.links.html.href + '" target="_blank">' + el.title + '</a>';
    td_state.innerHTML = el.state;
    td_update.innerHTML = el.updated_on.substr(0, 10);

    tr.appendChild(td_id);
    tr.appendChild(td_title);
    tr.appendChild(td_state);
    tr.appendChild(td_update);

    document.getElementById("tbody").appendChild(tr)
 });

 document.getElementById("count").innerText = size; //他の処理に切り出したいけどとりあえず
 
}
