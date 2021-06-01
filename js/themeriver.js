chart("./data/data2.json", "orange");
// chart("data/data2.json", "orange");
var datearray = [];
var colorrange = ["#FF0000", "#FF8000", "#FFFF00", "#80FF00", "#00FF00", "#00FF80", "#40FFFF", "#0080FF", "#0000FF", "#8000FF", "#FF00FF", "#FF0080"];
var colordict={"警察":"rgba(255,0,0,.65)","示威者":"rgba(255,128,0,.65)","示威":"rgba(255,255,0,.65)","游行":"rgba(128,255,0,.65)",
			"逃犯条例":"rgba(0,255,0,.65)","政府":"rgba(0,255,128,.65)","警暴":"rgba(64,255,255,.65)","中央":"rgba(0,128,255,.65)",
			"美国":"rgba(0,0,255,.65)","台湾":"rgba(128,0,255,.65)","选举":"rgba(255,0,255,.65)","人权与自由":"rgba(255,0,128,.65)"};
drawLegend();

colordict4circle={"BBC中文":"#7cb342","人民日报":"#2196f3","香港众志":"#ffa726"};

d3.select("#togglelegend").on("click", toggleLegend);
function gettext(date){
	if (document.getElementById(date))
		document.getElementById(date).scrollIntoView();
	else
		console.log("error")
}

function compare(property){
	return function(a,b){
		var value1 = a[property];
		var value2 = b[property];
		return value1 - value2;
	}
}

function formatDateTime(date) { 　　　　　
　　var y = date.getFullYear(); 
    var m = date.getMonth() + 1;  
    m = m < 10 ? ('0' + m) : m;  
    var d = date.getDate();  
    d = d < 10 ? ('0' + d) : d;  
    return y + '-' + m + '-' + d; 
}

function chart(jsonpath, color) {
if (color == "blue") {
  colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
}
else if (color == "pink") {
  colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
}
else if (color == "orange") {
  //colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
  colorrange=["#FF0000", "#FF8000", "#FFFF00", "#80FF00", "#00FF00", "#00FF80", "#40FFFF", "#0080FF", "#0000FF", "#8000FF", "#FF00FF", "#FF0080"];
  colordict={"警察":"#FF0000","示威者":"#FF8000","示威":"#FFFF00","游行":"#80FF00",
			"逃犯条例":"#00FF00","政府":"#00FF80","警暴":"#40FFFF","中央":"#0080FF",
			"美国":"#0000FF","台湾":"#8000FF","选举":"#FF00FF","人权与自由":"#FF0080"};
}
strokecolor = colorrange[0];
var format = D3.time.format("%Y-%m-%d");
var margin = {top: 20, right: 10, bottom: 30, left: 30};
var width = document.body.clientWidth * 0.9 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;
var x = D3.time.scale()
    .range([0, 2*width/3]);
var y = D3.scale.linear()
    .range([height-10, 0]);
var xi = D3.time.scale()
    .range([0, 1*width/2]);
var yi = D3.scale.linear()
    .range([height-10, 0]);

var z = D3.scale.ordinal()
    //.range(["#FF0000", "#FF8000", "#FFFF00", "#80FF00", "#00FF00", "#00FF80", "#40FFFF", "#0080FF", "#0000FF", "#8000FF", "#FF00FF", "#FF0080"]);
    .range(colorrange)
var xAxis = D3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(D3.time.weeks)
    .ticks(10)
    .tickSize(15);

var stack = D3.layout.stack()
    .offset("silhouette")
    .values(function(d) { return d.values; })
    .x(function(d) { return d.date; })
    .y(function(d) { return d.value; });
	
var nest = D3.nest()
    .key(function(d) { return d.key; });
var area = D3.svg.area()
    .interpolate("basis")
    .x(function(d) { return x(d.date); })
    .y0(function(d) { return y(d.y0); })
    .y1(function(d) { return y(d.y0 + d.y); });
	
var area1 = D3.svg.area()
    .interpolate("cardinal")
    .x(function(d) { return xi(d.date); })
    .y0(function(d) { return yi(d.y0+0.2*d.y); })
    .y1(function(d) { return yi(d.y0 +d.y); });
	
var svg = D3.select(".chart").append("svg")
    .attr("width", 2*width/3 + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 300)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + (margin.top + 70) + ")");
	
var graph = d3.json(jsonpath).then(function(data0) {
	var data=[];
	for(var key in data0){
		for(var i=0;i<12;i++){
			var valueDic = new Array();
			valueDic["BBC"]=(data0[key][i]["medias"][0]["comments"]).length;
			valueDic["HK"]=(data0[key][i]["medias"][1]["comments"]).length;
			valueDic["PD"]=(data0[key][i]["medias"][2]["comments"]).length;
			value=valueDic["BBC"]+valueDic["HK"]+valueDic["PD"];
			valueDic["key"]=data0[key][i]["label"];
			valueDic["value"]=Math.pow(value,0.5);
			valueDic["date"]=format.parse(key);
			data.push(valueDic);
		}
	}
	data.sort(compare('date'));
  var layers = stack(nest.entries(data));
  x.domain(D3.extent(data, function(d) { return d.date; }));
  var ymax = D3.max(data, function(d) { return d.y0 + d.y; });
  y.domain([0, ymax]);
  svg.selectAll(".layer")
      .data(layers)
    .enter().append("path")
      .attr("class", "layer")
      .attr("d", function(d) { return area(d.values); })
      .style("fill", function(d, i) { return z(i); });

  var tooltip = svg.append("g")
    .attr("class", "tooltip");
  tooltip.append("rect")
    .attr("height", 20)
    .style("fill", "#fff")
    .style("opacity", 0.5);
  tooltip.append("text")
    .attr("class", "tooltip-text")
    .attr("font-size", "10px")
    .text("");
  
  svg.append("g")
      .attr("class", "x axis")
      .attr("font", "Segoe UI")
      .attr("font-size", 15)
      .attr("opacity", .8)
      .attr("font-weight", 700)
      .attr("transform", "translate(0," + (height - 40) + ")")
      .call(xAxis);
  
  svg.selectAll(".layer")
    .attr("opacity", 0.65)
	.on("click",function(d,i){
		mousex = D3.mouse(this)[0];
		mousey = D3.mouse(this)[1];
		var ix = x.invert(mousex);
		ix.setHours(0,0,0,0);
    //subchart(layers,data0,ix);
    removeAddon(0)
		buildAddon(10,2,formatDateTime(ix),d.key,0)
		gettext(formatDateTime(ix));
	})
    .on("mouseover", function(d, i) {
      svg.selectAll(".layer").transition()
      .duration(250)
      .attr("opacity", function(d, j) {
        return j != i ? 0.3 : 1;
    })})
    .on("mousemove", function(d, i) {
      mousex = D3.mouse(this)[0];
      mousey = D3.mouse(this)[1];
      var ix = x.invert(mousex);
      ix.setHours(0,0,0,0);
      var ixTime = ix.getTime();
      var selected = null;
      for (var i = 0; i < d.values.length; i++) {
        if ((d.values[i].date.getTime() - ixTime) == 0) {
          selected = d.values[i]; 
          break;
        }
      }
      if (selected != null) {
        D3.select(".tooltip").style("visibility", "visible");
        var ypos = mousey + ((mousey > height/2) ? -10 : 20);
        var mm = selected.date.getMonth()+1;
        if (mm < 10) mm = "0"+mm;
        var dd = selected.date.getDate();
        if (dd < 10) dd = "0"+dd;
        tooltip.select("text")
          .attr("y", Math.round(ypos))
          .text(mm+"/"+dd+" "+selected.key+" "+(selected.value*selected.value).toFixed(0));
        var textWidth = tooltip.select("text").node().getComputedTextLength();
        var xpos, rxpos;
        if (mousex > width/2) {
          xpos = Math.round(mousex-textWidth-10);
          rxpos = xpos;
        } else {
          xpos = Math.round(mousex+10);
          rxpos = xpos-5;
        }
        tooltip.select("text")
          .attr("x", xpos);
        tooltip.select("rect")
          .attr("width", textWidth+10)
          .attr("x", rxpos)
          .attr("y", Math.round(ypos-15));
        }
    })
    .on("mouseout", function(d, i) {
     svg.selectAll(".layer")
      .transition()
      .duration(250)
      .attr("opacity", 0.65);
     tooltip.style("visibility", "hidden");
  });
    
  var vertical = D3.select(".chart")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "19")
        .style("width", "1px")
        .style("height", "600px")
        .style("top", "10px")
        .style("bottom", "30px")
        .style("left", "0px")
        .style("background", "#fff");
  D3.select(".chart")
      .on("mousemove", function(){  
         mousex = D3.mouse(this);
         mousex = mousex[0] + 5;
         vertical.style("left", mousex + "px" )})
      .on("mouseover", function(){  
         mousex = D3.mouse(this);
         mousex = mousex[0] + 5;
         vertical.style("left", mousex + "px")});
		 
	// subchart(layers,data0);
});
}

function drawLegend() {

  // Dimensions of legend item: width, height, spacing, radius of rounded rect.
  var li = {
    w: 60, h: 30, s: 3, r: 3
  };

  var legend = D3.select("#legend").append("svg:svg")
      .attr("width", li.w)
      .attr("height", D3.keys(colordict).length * (li.h + li.s));

  var g = legend.selectAll("g")
      .data(D3.entries(colordict))
      .enter().append("svg:g")
      .attr("transform", function(d, i) {
              return "translate(0," + i * (li.h + li.s) + ")";
           });

  g.append("svg:rect")
      .attr("rx", li.r)
      .attr("ry", li.r)
      .attr("width", li.w)
      .attr("height", li.h)
      .style("fill", function(d) { return d.value; });

  g.append("svg:text")
      .attr("x", li.w / 2)
      .attr("y", li.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.key; });
}

function toggleLegend() {
  var legend = D3.select("#legend");
  if (legend.style("visibility") == "hidden") {
    legend.style("visibility", "");
  } else {
    legend.style("visibility", "hidden");
  }
}