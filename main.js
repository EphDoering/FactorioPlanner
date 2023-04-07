"use strict";
var Rawdata
var parsedData

function getNewRaw(){
    fetch('https://gist.githubusercontent.com/Bilka2/6b8a6a9e4a4ec779573ad703d03c1ae7/raw')
    .then(r=>r.text())
    .then(r=>{
    console.log(performance.now()-prefectch)
    return r.text()
    })
.then(r=>{
    let start=performance.now()
    data=r
        .replace(/^[^{]*/,'') //strip leading code
    .replace(/--(?:\[(=*)\[(?:\](?!\1\]))?(?:[^\]]+\](?!\1\]))*[^\]]*\]\1\]|[^\r\n]+)/g,'')//remove comments
        .replace(/\[("[^"\[\]]+")\]/g,'$1') //strip enclsosing [] around quoted names
    .replace(/(\n\s+)(\w+)\s+=/g,'$1"$2" =') //quote unquoted property names
        .replace(/\[0\]\s*=\s*/g,'')// :( removing anomolus zero index in lighting
        .replace(/(,\s*"off_when_no_fluid_recipe"\s*=\s*\w+\s*)\}/g,'}$1') //fluid box array shouldn't have a named property in it
        .replace(/(-)?1\/0[^\r\n,]*/g,'"$1Infinity"')
        .replace(/\bnil\b/g,'null')
        let replace=/\{((?:[^={}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*\})*)\}/g
        for(;;){ //convert numerical array tables to arrays
            data1=data.replace(replace,'[$1]')
            if(data1===data) break
            data=data1
        }
        Rawdata=data.replace(/ = /g,' : ')
        parsedData=JSON.parse(Rawdata)
    let done=performance.now()
    console.log(start-prefectch,mid-start,late-mid,justJson-late,done-justJson)
    ;console.log(performance.now()-start)
    populateTable(parsedData)
    //console.log(performance.now()-done)
        })
}

fetch('raw1.0.0.json')//'https://gist.githubusercontent.com/Bilka2/6b8a6a9e4a4ec779573ad703d03c1ae7/raw')
.then(r=>r.json())
.then(gotRawData)

function CH(html){
    var div=document.createElement('div')
    div.innerHTML=html
    return div.firstElementChild
}
var sciencePacks=["automation-science-pack","logistic-science-pack","chemical-science-pack","military-science-pack","production-science-pack","utility-science-pack","space-science-pack"]


function gotRawData(data){
    parsedData=data
    getCrafters(data)
    populateTable(data)
}
var crafters={}
function getCrafters(data){
    if(!data || typeof data != 'object'){
        return
    }
    if(data.crafting_speed){
        crafters[data.name]=data
        return
    }
    for(let kid of Object.getOwnPropertyNames(data)){
        getCrafters(data[kid])
    }
}


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
    for(var techname in data.technologies){
        let tech=data.technologies[techname]
        var row=document.createElement('tr')
        row.fp_tech_name=techname
        row.append(document.createElement('th'))
        row.lastElementChild.innerText=techname
        row.append(document.createElement('td'))
        row.lastElementChild.innerText=tech.research_unit_energy
        row.append(document.createElement('td'))
        row.lastElementChild.innerText=tech.research_unit_count
        for(let science of sciencePacks){
            row.append(document.createElement('td'))
            if(!tech.research_unit_ingredients.length){
                tech.research_unit_ingredients=[]
                }
            for(let ingredient of tech.research_unit_ingredients){
                if(ingredient.name==science){
                    row.lastElementChild.innerText=ingredient.amount
            }
        }
        }
        tech.row=row
        if(!tech.prerequisites || !tech.prerequisites.length){
            tech.prerequisites=[]
        }
        if(!tech.allows){
            tech.allows=[]
        }
        for(let preReq of tech.prerequisites){
            (data.technologies[preReq].allows= data.technologies[preReq].allows|| [])
            .push(techname)
        }
        b.append(row)
    }
    for(var rowIndex=0;rowIndex<b.rows.length;){
        let moved=false
        let currentRow=b.rows[rowIndex]
        for(let tech of data.technologies[currentRow.fp_tech_name].prerequisites){
            if(data.technologies[tech].row.rowIndex > rowIndex){
                b.insertBefore(data.technologies[tech].row,currentRow)
                moved=true
                break
            }
        }
        if(!moved){
            rowIndex++
        }
    }
    restoreOrder()
    document.getElementById('technology').append(tab)
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

    let tech=data.technologies[target.fp_tech_name]
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
        }else if(diff<diffLimLow){
            limited=dragUp()
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
        let techname=checking.fp_tech_name
        if(wouldGrab.has(techname)){
            dragChanges[i]=(dragChanges[i]+1) || 1
            for(let newGrab of data.technologies[techname][checkAttr]){
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
      [].slice.call(tbody.rows).map((row)=>row.fp_tech_name)
      ))
}
function restoreOrder(){
    JSON.parse(window.localStorage.getItem('techOrder')||'[]')
    .forEach((i)=>{
        let row=data.technologies[i].row
        if(row){
           row.parentElement.insertBefore(row,null) 
        }
    })
}





function getBP(event){
    navigator.clipboard.readText()
    .then(getProductionCapabiltiy)
    .then(console.log)
}
function addCapabilitiesTo(cap1,cap2){
    cap1.drain+=cap2.drain
    for(let i in cap2){
        if(cap1[i]){
            addCapabilityTo(cap1[i],cap2[i])
        }else{
            cap1[i]=Object.assign({},cap2[i])
        }
    }
}
function addCapabilityTo(cap1,cap2){
    cap1.speed+=cap2.speed
    cap1.pollution+=cap2.pollution
    cap1.power_usage+=cap2.power_usage
}
function getProductionCapabiltiy(blueprint){
    if(typeof blueprint == 'string'){
        blueprint=parseBluePrintStr(blueprint)
    }
    var entities=blueprint.blueprint.entities
    var capabilities={}
    Object.defineProperty(capabilities,'drain',{writable:true,value:0})
    for(let entity of entities){
        if(!crafters[entity.name]){
            continue
        }
        let crafter=crafters[entity.name]
        let power_usage=+crafter.energy_usage.slice(0,-2)
        let power_drain=power_usage*0.03
        if(crafter.energy_source.drain){
            power_drain=+crafter.energy_source.drain.slice(0,-2)
        }
        capabilities.drain+=power_drain
        let capability={
            speed:crafter.crafting_speed,
            power_usage,
            pollution:crafter.energy_source.emissions_per_minute || 0
        }

        let recipe=entity.recipe
        if(!recipe){
            let cc=crafter.crafting_categories
            if(cc.length != 1 || cc[0]!="smelting"){
                continue
            }
            recipe='smelting'
        }
        if(capabilities[recipe]){
            addCapabilityTo(capabilities[recipe],capability)
        }else{
            capabilities[recipe]=capability
        }
    }
    return capabilities
}

function parseBluePrintStr(BPstring){
    let ver=BPstring[0]
    if(+ver!==0){
        throw new Error("Advanced Bluprint Version")
    }
    let BPObj=JSON.parse(pako.inflate(Base64.decode(BPstring.slice(1)),{to:'string'}))
    var entities=t
}


document.getElementById('BPButton').addEventListener('click',getBP);
/**********
* Caches *
**********/
var data
const CACHE_Version = 1
const CACHE_NAME = "JSON_DATA_"+CACHE_Version
var file_in=document.createElement('input')
file_in.type='file'
document.body.append(file_in)
file_in.addEventListener('change',(e)=>{
    var files=e.target.files
    if(files.length==1){
        name=window.prompt("Enter a name for this collection of mods.","Sea Block")
        caches.open(CACHE_NAME)
        .then(c=>{
            c.put(
                "./V"+CACHE_Version+"/"+name.replace('/',"%2F"),
                new Response(files[0]))
            .then(refresh_cached_data_options.bind(null,name))
        })
    }
})

var data_select=document.createElement('select')
document.body.append(data_select)
function refresh_cached_data_options(name){
    caches.open(CACHE_NAME)
    .then((c)=>{
        return c.keys()
    })
    .then((keys)=>{
        while(data_select.firstChild){
            data_select.remove(data_select.firstChild);
        }
        for(let request of keys){
            let op=document.createElement('option')
            op.innerText=unescape(request.url.split('/').slice(-1)[0])
            data_select.append(op)
        }
        if(name){
            data_select.value=name
            data_select.dispatchEvent(new Event('change'))
        }
        return true;
    })
}

function load_data(name){
    caches.open(CACHE_NAME)
    .then((c)=>{
        return c.match("./V"+CACHE_Version+"/"+name.replace('/',"%2F"))
    })
    .then((r)=>r.json())
    .then((r)=>{data=r
        populateTable(data)
        simplifyRecipes()
    })
}
data_select.addEventListener('change',(e)=>{
    load_data(e.target.value)
})

refresh_cached_data_options("Sea Block")

/**********
* Locales *
**********/
function get_local_string(description){
    if(typeof description == "string"){
        return description
    }
    return data.translations[description[0]].replace(/\b__(\d+)__\b/g,
        (m,num)=>{
            let subDesc=description[+num]
            if(!subDesc){
                return m;
            }
            return get_local_string(subDesc)
        })
}

/*************
* Search GUI *
*************/

let search_gui=(function(){
    function update_search(input){
        let data_set=find(input.value);
        let ele=null;
        let search_results=input.search_results
        let had_some=!!search_results.firstElementChild
        while((ele=search_results.firstElementChild)){
            ele.remove()
        }
        for(let [key,data] of data_set){
            ele=document.createElement('div')
            ele.innerText=data
            ele.search_key=key
            search_results.append(ele)
        }
        let has_some=!!search_results.firstElementChild
        if(has_some!=had_some){
            if(has_some){
                search_results.style.display="block"
            }else{
                search_results.style.display="none"
            }
        }
    }
    function on_input(e){
        update_search(e.target)
    }
    function on_blur(e){
        if(e.target.search_results.prevent_blur){
            e.target.search_results.prevent_blur=false;
            e.preventDefault();
            return false;
        }
        let ele=null;
        while((ele=e.target.search_results.firstElementChild)){
            ele.remove()
        }
        e.target.search_results.style.display="none"
    }
    function on_focus(e){
        var r=e.target.getBoundingClientRect()
        e.target.search_results.style.display="block"
        var relative=document.body.parentNode.getBoundingClientRect();
        e.target.search_results.style.top =(r.bottom -relative.top)+'px';//this will place ele below the selection
        e.target.search_results.style.right=-(r.right-relative.right)+'px';
        e.target.search_results.style.display="none"
        update_search(e.target)
    }
    function on_click(e){
        e.currentTarget.select_callback(e.target.search_key);
    }
    return function add_search_to_input(input,find_callback,select_callback){
        input.addEventListener('input',on_input)
        input.addEventListener('blur',on_blur)
        input.addEventListener('focus',on_focus)
        let search_results=document.createElement('div')
        search_results.className="search_results"
        input.search_results=search_results
        ;(input.offsetParent || document.body).append(search_results)
        search_results.style.width=""+search.offsetWidth+"px"
        search_results.addEventListener("click",on_click)
        //to prevent blur from closing the dropdown before the click registers
        search_results.addEventListener("mousedown",(e)=>{
            e.preventDefault();
        })
        search_results.select_callback=select_callback
    }
})()

/*********
* search *
*********/

function gen_search_data(data_set){
    let words=new Map()
    for(let key in data_set){
        let item = data_set[key]        
        if(item.localised_name){
            if(!item.localised_name_str){
                item.localised_name_str=get_local_string(item.localised_name)
            }
            item.localised_name_str.replace(/\S+/g,(m)=>{
                m=m.toLocaleLowerCase()
                if(!words.has(m)){
                    words.set(m,new Map())
                }
                words.get(m).set(key,item.localised_name_str)
            })
        }
    }
    return words
}

function gen_snips(words){
    let snips=new Map()
    for(let [word,items] of words){
        for(let end=3;end<=word.length;end++){
            for(let start=0;start+3<=end;start++){
                let snip = word.slice(start,end)
                if(!snips.has(snip)){
                    snips.set(snip,new Map(items))
                }else{
                    let snipList=snips.get(snip)
                    for(let [key,item] of items){
                        snipList.set(key,item)
                    }
                }
            }
        }
    }
    return snips
}

function find(search){
    if(!currentSnips){
        currentSnips=gen_snips(gen_search_data(data.recipes))
    }
    let snips=currentSnips
    let search_snips=(search.match(/\S+/g)||[]).map((s)=>s.toLocaleLowerCase())
    let ret=null
    for(let snip of search_snips){
        if(snips.has(snip)){
            let list=snips.get(snip)
            if(ret){
                for(let [key,item] of ret){
                    if(!list.has(key)){
                        ret.delete(key)
                    }
                }
            }else{
                ret=new Map(list)
            }
        }else{
            if(snip.length>=3){
                return new Map()
            }
        }
    }
    if(!ret){
        return new Map()
    }
    return ret
}
let currentSnips=null
let search=document.createElement('input')
search.type="search"
document.getElementById('factory').append(search);
search_gui(search,find,(key)=>{
    console.log("key:",key)
    currentSubUnit.add(key,data.recipes[key])
})


/*******************
* Recipe Selectors *
*******************/

function gen_recipe_by_category(data){
    data.recipes_by_category={};
    for( name in data.recipes){
        let r=data.recipes[name]
        cat=data.recipes_by_category[r.category]||(data.recipes_by_category[r.category]={})
        cat[name]=r
    }
}

function gen_recipe_by_ingredient(data){
    data.recipes_by_ingredient={};
    for(let name in data.recipes){
        let r=data.recipes[name]
        for(let i in r.simplified_ingedients){
            let cat=data.recipes_by_ingredient[i]||(data.recipes_by_ingredient[i]={})
            cat[name]=r
        }
    }
}

function gen_recipe_by_product(data){
    data.recipes_by_product={};
    for(let name in data.recipes){
        let r=data.recipes[name]
        for(let i in r.simplified_products){
            let cat=data.recipes_by_product[i]||(data.recipes_by_product[i]={})
            cat[name]=r
        }
    }
}


/******************
* Subunit Builder *
******************/
function simplifyRecipes(){
    for(let key in data.recipes){
        let r=data.recipes[key]
        r.simplified_products={}
        if(r.products.length){
            for(let p of r.products){
                let amount=p.probability*((p.amount_min+p.amount_max)/2 || p.amount)
                if(amount){
                    r.simplified_products[p.name]=amount
                }
            }
        }
        r.simplified_ingedients={}
        if(r.ingredients.length){
            for(let i of r.ingredients){
                r.simplified_ingedients[i.name]=i.amount
            }
        }
    }
}


let currentSubUnit=null;
document.getElementById('new_factory_subunit').addEventListener('click',()=>{
    currentSubUnit=new Subunit()
    document.getElementById('factory').append(currentSubUnit.table)
})

function Subunit(){
    this.recipes={}
    this.forced_ext=new Set()
    this.user_ext=new Set()
    this.items={}
    this.table=CH(`<form><table><thead><tr>
       <th>Item  </th>
       <th>External</th>
       </tr></thead><tbody></tbody></table></form>`)
    this.table_body=this.table.lastElementChild.lastElementChild
}
Subunit.prototype={
    add:function add(name,recipe_or_subunit){
        this.recipes[name]=recipe_or_subunit
        this.calculate()
    },
    calculate:function(){
        gen_recipe_by_product(this)
        gen_recipe_by_ingredient(this)
        for(name in this.items){
            this.items[name].is_ingredient=false
            this.items[name].is_product=false
        }
        for(name in this.recipes_by_product){
            if(!this.items[name]){
                this.items[name]={
                    is_ingredient:false,
                    is_product:true,
                    row:null
                }
            }else{
                this.items[name].is_product=true;
            }
        }
        for(name in this.recipes_by_ingredient){
            if(!this.items[name]){
                this.items[name]={
                    is_ingredient:true,
                    is_product:false,
                    row:null
                }
            }else{
                this.items[name].is_ingredient=true;
            }
        }
        for(name in this.items){
            let item= this.items[name]
            if(!item.row){
                item.row=document.createElement('tr')
                item.row.append(document.createElement('td'))
                item.row.lastChild.innerText=name
                item.row.append(document.createElement('td'))
                item.row.lastChild.append(document.createElement('input'))
                item.row.lastChild.lastChild.type="checkbox"
                item.row.lastChild.lastChild.name="ext_"+name
                this.table_body.append(item.row)
            }
            var check=this.table["ext_"+name]
            if(!check.disabled){
                if( check.checked){
                    this.user_ext.add(name)
                }else{
                    this.user_ext.delete(name)
                }
            }
            if(item.is_product && item.is_ingredient){
                check.disabled=false
                check.checked=this.user_ext.has(name)
            }else if(item.is_product ||  item.is_ingredient){
                check.disabled=true
                check.checked=true
            }else{
                item.row.remove()
                delete this.items[name]
            }
        }
        for(name of this.user_ext){
            if(!this.items[name]){
                this.user_ext.delete(name)
            }
        }
    },
    add_ext:function add_input(item){
        this.user_ext.add(item)
    },
    remove_ext:function remove_input(item){
        this.user_ext.delete(item)
    }
}


async function t(){
    // Filter on devices with the Arduino Uno USB Vendor/Product IDs.
    const filters = [
      { usbVendorId: 0x0403, usbProductId: 0x6001 }
    ];

    // Prompt user to select an Arduino Uno device.
    const port = await navigator.serial.requestPort({ filters });
    undefined
    await port.open({ baudRate: 115200 })
    undefined
    const textEncoderw = new TextEncoderStream();
    const writableStreamClosed = textEncoderw.readable.pipeTo(port.writable);

    const twriter = textEncoderw.writable.getWriter();

    const textEncoderr = new TextDecoderStream();
    const readaStreamClosed = port.readable.pipeTo(textEncoderr.writable);

    const treader = textEncoderr.readable.getReader(); 
    
    await twriter.write('helo\r')
    console.log(await treader.read())

}
