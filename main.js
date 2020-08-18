var data

fetch('vanilla-1.0.0.json')
.then(r=>r.json())
.then(r=>{data=r})