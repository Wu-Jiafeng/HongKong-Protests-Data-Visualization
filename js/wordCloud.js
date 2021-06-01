//sample data
let data={"2019-08-12":[{label:"",medias:[{media:"bbcchinese",comments:[""]}]}]}
let sortedKey
let topicList={}
let addonPara={
	pieAngle:0,
	mediaColor:['#bef67a','#6ab7ff','#ffd95b'],
	emphaColor:['#7cb342','#2196f3','#ffa726']
}
let mainRadius=150,pieRadius=30;
let cloudPara=[]

//D3.json("https://filearchiver.oss-cn-beijing.aliyuncs.com/visclass/class_project/data2.json",function(d){
d3.json("./data/data2.json").then(function(d){
	data=d
	sortedKey=Object.keys(data).sort()
	buildAddon(10,2,"2019-09-17","示威者",0)
})

function dateDiff(date1,date2){
	let dateStart=new Date(date1),dateEnd=new Date(date2)
	return Math.abs(dateEnd-dateStart)/(1000*60*60*24)
}
function dateNear(date){
	let dt=sortedKey.indexOf(date)
	let ret=[]
	for(let i=0;i<5;i++){
		ret.push(sortedKey[Math.max(0,dt-2)+i])
	}
	return ret
}

function buildPieData(date,topic){
	// build[media_index] is comments list
	let ret=[[],[],[]],dn=dateNear(date)
	for(let sep in dn){
		let build=[]
		for(let obj in data[dn[sep]]){
			if(data[dn[sep]][obj].label==topic){
				let medias=data[dn[sep]][obj].medias
				for(let m in medias){
					build.push(medias[m].comments)
				}
			}
		}
		for(let i in ret){
			ret[i]=ret[i].concat(build[i])
		}
	}
	return ret
}
function frequency(cmtlist){
	let map={}
	for(let cmt in cmtlist){
		words=cmtlist[cmt].split(' ')
		for(let word in words){
			if(map[words[word]]){
				map[words[word]]++;
			}
			else{
				map[words[word]]=1;
			}
		}
	}

	let ret=[[],[]]
	for(let key in map){
		ret[0].push(key)
		ret[1].push(map[key])
	}
	return ret
}

function drawWordCloud(i){
	let canvas=document.getElementById('cloud'+i)
	let freque=frequency(cloudPara[i].oriData[cloudPara[i].index])
	D3.select('#cloud'+i)
	  .selectAll('text')
	  .remove()
	D3.layout.cloud().size([1.9*mainRadius,1.9*mainRadius])
	  .words(freque[0].map(function(d,i){
	  	let ratio=freque[1][i]/Math.max.apply(null,freque[1])
	  	if(Math.sqrt(ratio)*mainRadius<10){
	  		ratio=0
	  	}
	  	return {"text":d,"size":Math.sqrt(ratio)*mainRadius/4}
	  })).fontSize((d)=>d.size)
	  .padding(2)
	  .rotate(0)
	  //.spiral("rectangular")
	  .on("end",function(words){
		D3.select('#cloud'+i)
		  .selectAll('text')
		  .data(words)
		  .enter()
		  .append('text')
		  .style("font-size",(d)=>d.size+'px')
		  .style('fill',function(d){
		  	if(Math.sqrt(d.x*d.x+d.y*d.y)<0.95*mainRadius)
		  		return addonPara.emphaColor[cloudPara[i].index]
		  	else return "rgba(0,0,0,0)"
		  })
		  .attr('text-anchor','middle')
		  .attr('transform',(d)=>"translate("+[d.x,d.y]+')')
		  .text((d)=>d.text)
	  }).start()
}
function removeAddon(i){
	D3.select('#wordCloud')
	  .remove()
	cloudPara=[]
}
function buildAddon(x,y,date,topic,i){
	//x,y is position, i is number of cloud
	cloud=D3.select('svg')
	  		.append('g')
	  		.attr('id','wordCloud')
	  		.attr('transform','translate('+x+','+y+')')
	cloud.append('circle').attr({
  	  	cx:mainRadius,
  		cy:mainRadius,
  		r:mainRadius
    }).style({
  		fill:'white',
  		'stroke-width':2,
  		stroke:'grey'
    })
    cloud.append('g').attr({
    	transform:"translate("+mainRadius+','+mainRadius+')',
    	id:'cloud'+i
    })
    let piecx=pieRadius*(1+Math.cos(addonPara.pieAngle)),piecy=pieRadius*(1-Math.sin(addonPara.pieAngle))
	cloud.append('circle').attr({
		cx:piecx,
		cy:piecy,
		r:pieRadius
	}).style({
		fill:'white',
		'stroke-width':2,
		stroke:'white'
	})
	cloudPara.push({
		x:x,
		y:y,
		index:0,
		oriData:buildPieData(date,topic)
	})
	let max=0
	for(let ip in cloudPara[i].oriData){
		if(cloudPara[i].oriData[ip].length>max){
			cloudPara[i].index=ip
			max=cloudPara[i].oriData[ip].length
		}
	}
	let pie=D3.layout.pie().value(d=>d.length)
	let pieData=pie(cloudPara[i].oriData)
	let arc=D3.svg.arc().innerRadius(0).outerRadius(pieRadius-2)

	let parent=cloud.append('g')
					.attr('transform','translate('+piecx+','+piecy+')')
	parent.selectAll('path')
		  .data(pieData)
		  .enter()
		  .append('path')
		  .attr('d',d=>arc(d))
		  .attr('id',(d,index)=>'piePiece'+i+'_'+index)
		  .attr('opacity',0.7)
		  .attr('fill',function(d,i){
		  	if(i==0){
		  		return addonPara.emphaColor[i]
		  	}
		  	else{
		  		return addonPara.mediaColor[i]
		  	}
		  }).on('click',function(d,index){
		  	D3.select('#piePiece'+i+'_'+cloudPara[i].index)
		  	  .attr('fill',addonPara.mediaColor[cloudPara[i].index])
		  	D3.select(this)
		  	  .attr('fill',addonPara.emphaColor[index])
		  	cloudPara[i].index=index
		  	drawWordCloud(i)
		  })

	drawWordCloud(i)
}