"use-strict";
var Rawdata
var parsedData

fetch('https://gist.githubusercontent.com/Bilka2/6b8a6a9e4a4ec779573ad703d03c1ae7/raw')
.then(r=>r.text())
.then(r=>{
    data=r
    .replace(/^[^{]*/,'') //strip leading code
    .replace(/\[("[^"\[\]]+")\]/g,'$1') //strip enclsosing [] around quoted names
    .replace(/(\n\s+)(\w+)\s+=/g,'$1"$2" =') //quote unquated property names
    .replace(/\[0\]\s*=\s*/g,'')// :( removing anomolus zero index in lighting
    .replace(/(,\s*"off_when_no_fluid_recipe"\s*=\s*\w+\s*)\}/g,'}$1') //fluid box array shouldn't have a named property in it
    .replace(/(-)?1\/0[^\r\n,]*/g,'"$1Infinity"')
    .replace(/\bnil\b/g,'null')
    for(;;){ //convert numerical array tables to arrays
        data1=data.replace(/\{((?:[^={}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*)\}/g,'[$1]')
        if(data1===data) break
        data=data1
    }
    Rawdata=data.replace(/ = /g,' : ')
    parsedData=JSON.parse(Rawdata)
    populateTable(parsedData)
    })

function CH(html){
    var div=document.createElement('div')
    div.innerHTML=html
    return div.firstElementChild
}
var sciencePacks=["automation-science-pack","logistic-science-pack","chemical-science-pack","military-science-pack","production-science-pack","utility-science-pack","space-science-pack"]

function populateTable(data){
    var tab=CH(`
    <table id="dragOrder">
    <thead>
      <tr>
        <th>Research</th>
        <td>Time (s/pack)</td>
        <td>Count</td>
        <td style="color:red;">
            <svg width="16" height="16" viewBox="0 0 512 512">
	           <use xlink:href="#icon-home"></use>
            </svg>
        </td>
        <td style="color:lime;">
            <svg width="16" height="16" viewBox="0 0 512 512">
	           <use xlink:href="#icon-home"></use>
            </svg>
        </td>
        <td style="color:cyan;">
            <svg width="16" height="16" viewBox="0 0 512 512">
	           <use xlink:href="#icon-home"></use>
            </svg>
        </td>
        <td style="color:darkslategrey;">
            <svg width="16" height="16" viewBox="0 0 512 512">
	           <use xlink:href="#icon-home"></use>
            </svg>
        </td>
        <td style="color:rebeccapurple;">
            <svg width="16" height="16" viewBox="0 0 512 512">
	           <use xlink:href="#icon-home"></use>
            </svg>
        </td>
        <td style="color:yellow;">
            <svg width="16" height="16" viewBox="0 0 512 512">
	           <use xlink:href="#icon-home"></use>
            </svg>
        </td>
        <td style="color:lightgrey;">
            <svg width="16" height="16" viewBox="0 0 512 512">
	           <use xlink:href="#icon-home"></use>
            </svg>
        </td>
      </tr>
    </thead>
    <tbody>
    </tbody>
    </table>`)
    var b=tab.lastElementChild
    b.addEventListener('mousedown',startDrag)
    for(var techname in data.technology){
        let tech=data.technology[techname]
        var row=document.createElement('tr')
        row.append(document.createElement('th'))
        row.lastElementChild.innerText=techname
        row.append(document.createElement('td'))
        row.lastElementChild.innerText=tech.unit.time
        row.append(document.createElement('td'))
        row.lastElementChild.innerText=tech.unit.count
        for(let science of sciencePacks){
            row.append(document.createElement('td'))
            for(let ingredient of tech.unit.ingredients){
                if(ingredient[0]==science){
                    row.lastElementChild.innerText=ingredient[1]
                }
            }
        }
        tech.row=row
        if(!tech.prerequisites){
            tech.prerequisites=[]
        }
        if(!tech.allows){
            tech.allows=[]
        }
        for(let preReq of tech.prerequisites){
            (data.technology[preReq].allows= data.technology[preReq].allows|| [])
            .push(techname)
        }
        b.append(row)
    }
    for(var rowIndex=0;rowIndex<b.rows.length;){
        let moved=false
        let currentRow=b.rows[rowIndex]
        for(let tech of data.technology[currentRow.firstElementChild.innerText].prerequisites){
            if(data.technology[tech].row.rowIndex > rowIndex){
                b.insertBefore(data.technology[tech].row,currentRow)
                moved=true
                break
            }
        }
        if(!moved){
            rowIndex++
        }
    }
    restoreOrder()
    document.body.append(tab)
    window.onunload=saveOrder.bind(null,b)
}

var dragging=[]
var dragoffset=0
var currentDragIndex=0
var diffLimHigh=80
var diffLimLow=-80
var dragChanges={}
function startDrag(event){
    var target=event.target
    while(target && target.tagName!='TR'){
        target=target.parentElement
    }
    if(!target){
        return
    }
    event.preventDefault()
    target.classList.add('dragging')
    dragging.push(target)

    let tech=parsedData.technology[target.firstElementChild.innerText]
    dragChanges={}
    populateDragChanges(tech,-1)
    populateDragChanges(tech,1)
    console.log(dragChanges)

    dragoffset=event.pageY
    window.addEventListener('mousemove',updateDrag)
    window.addEventListener('mouseup',stopDrag)

    currentDragIndex=0
    diffLimLow=diffLimHigh=0
    updateDrag(event)
    return true
}
function updateDrag(event){
    let limited=false
    while(1){
        var diff=event.pageY-dragoffset
        if(diff>diffLimHigh){
            limited=dragDown()
            console.log(currentDragIndex)
        }else if(diff<diffLimLow){
            limited=dragUp()
            console.log(currentDragIndex)
        }else{
            break
        }
        if(limited){
            break
        }
        if(currentDragIndex==0){
            diffLimLow=diffLimHigh=0
        }
        else if((currentDragIndex&1)^(currentDragIndex>0)){
            diffLimLow=-dragging[0].previousElementSibling.clientHeight/2
            diffLimHigh=0
        }else{
            diffLimLow=0
            diffLimHigh=dragging[dragging.length-1].nextElementSibling.clientHeight/2
        }
    }
    if(limited){
        diff=0
    }
    document.getElementById('dragOrder').style.setProperty('--y-offset',`${diff}px`)
}
function stopDrag(event){
    window.removeEventListener('mousemove',updateDrag)
    window.removeEventListener('mouseup',stopDrag)
    for(let tech of dragging){
        tech.classList.remove('dragging')
    }
    dragging=[]
}

function dragUp(){
    if(currentDragIndex<=0){
        return dragMore(-1)
    }
    return dragLess(1)
}

function dragDown(){
    if(currentDragIndex>=0){
        return dragMore(1)
    }
    return dragLess(-1)
}

function dragMore(moreDir){
    currentDragIndex+=moreDir
    if(currentDragIndex&1){
        return maybeAddDragees(moreDir)
    }
    return dragMove(moreDir)
}
function dragLess(moreDir){    
    let ret=false
    if(currentDragIndex&1){
        ret=maybeRemoveDragees(moreDir)        
    }else{
        dragMove(-moreDir)
    }
    currentDragIndex-=moreDir
    return ret
}

function dragMove(moveDir){
    var firstD=dragging[0]
    var lastD =dragging[dragging.length-1]
    var beforePos=firstD.offsetTop
    if(moveDir==1){ //move element from below up
        firstD.parentElement.insertBefore(lastD.nextElementSibling,firstD)
    }else{
        firstD.parentElement.insertBefore(firstD.previousElementSibling,lastD.nextElementSibling)
    }
    var afterpos=firstD.offsetTop
    dragoffset+=afterpos-beforePos
    return false
}

function populateDragChanges(initial,direction){
    let checkAttr=direction==-1?'prerequisites':'allows'
    let wouldGrab=new Set(initial[checkAttr])
    let i=-direction
    let checking=initial.row
    while(checking){
        let techname=checking.firstElementChild.innerText
        if(wouldGrab.has(techname)){
            dragChanges[i]=(dragChanges[i]+1) || 1
            for(let newGrab of parsedData.technology[techname][checkAttr]){
                wouldGrab.add(newGrab)
            }
        }else{
            i+=2*direction
        }
        if(direction==1){
            checking=checking.nextElementSibling
        }else{
            checking=checking.previousElementSibling
        }
    }
    dragChanges[i]=true//the end
}

function maybeRemoveDragees(moreDir){
    let changeCount=dragChanges[currentDragIndex]
    if(!changeCount){
        return false
    }
    if(changeCount===true){
        return false
    }
    let count=changeCount
    var changing=null
    while(count--){
        if(moreDir==1){
            changing=dragging.pop()
        }else{
            changing=dragging.shift()
        }
        changing.classList.remove('dragging')
    }
}

function maybeAddDragees(moreDir){
    let changeCount=dragChanges[currentDragIndex]
    if(!changeCount){
        return false
    }
    if(changeCount===true){
        currentDragIndex-=moreDir
        return true
    }
    let count=changeCount
    var changing=null
    while(count--){
        if(moreDir==1){
            changing=dragging[dragging.length-1].nextElementSibling
            dragging.push(changing)
        }else{
            changing=dragging[0].previousElementSibling
            dragging.unshift(changing)
        }
        changing.classList.add('dragging')
    }
}
function saveOrder(tbody){
    window.localStorage.setItem('techOrder',JSON.stringify(
      [].slice.call(tbody.rows).map((row)=>row.firstElementChild.innerText)
      ))
}
function restoreOrder(){
    JSON.parse(window.localStorage.getItem('techOrder')||'[]')
    .forEach((i)=>{
        ;(row=parsedData.technology[i].row)
        && row.parentElement.insertBefore(row,null)
    })
}