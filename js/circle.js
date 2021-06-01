let colordict4circle={"BBC中文":"#7cb342","人民日报":"#2196f3","香港众志":"#ffa726"};
drawLegend();
d3.select("#togglelegend4circle").on("click", toggleLegend4circle);
function drawLegend() {

  // Dimensions of legend item: width, height, spacing, radius of rounded rect.
  var li = {
    w: 60, h: 30, s: 3, r: 3
  };

  var legend = D3.select("#legend4circle").append("svg:svg")
      .attr("width", li.w)
      .attr("height", D3.keys(colordict4circle).length * (li.h + li.s));

  var g = legend.selectAll("g")
      .data(D3.entries(colordict4circle))
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

function drawConcernCircle() {
    let margin = {top: 5, right: 60, bottom: 0, left: 40};
    let width = 400 - margin.left - margin.right;
    let height = 450 - margin.top - margin.bottom;
    let center_x = width / 2;
    let center_y = height / 2;
    let r0 = width / 2;

    let svg = d3.select("#circle")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

    //let graph = d3.json("https://filearchiver.oss-cn-beijing.aliyuncs.com/visclass/class_project/data2.json").then(function(rawData) {
	let graph = d3.json("./data/data2.json").then(function(rawData) {    
    // filter the label of each news
        let data = [];
        let labels = ["中央", "香港政府", "示威者", "示威", "游行", "人权与自由", "警暴", "台湾", "美国", "选举", "逃犯条例", "警察"];
        let medias = ["bbcchinese", "pdchina", "demosisto"]
        for (let key in rawData) {
            for (let i = 0; i < 12; i++) {
                let label = rawData[key][i]["label"]
                for (let j = 0; j < 3; j++) {
                    if (rawData[key][i]["medias"][j]["comments"].length != 0) {
                        data.push({"media": rawData[key][i]["medias"][j]["media"], "label": label})
                    }
                }
            }
        }

        let unterCircle = svg.append("g")
            .append("circle")
            .attr("transform", "translate(" + center_x + "," + center_y + ")")
            .attr("r", r0+6)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 8)
            .attr("opacity", 0.1)

        let colorScale = d3.scaleOrdinal()
            .domain(medias)
            .range(["#bef67a", "#6ab7ff", "#ffd95b"])

        let colorScaleMouseOver = d3.scaleOrdinal()
            .domain(medias)
            .range(["#7cb342", "#2196f3", "#ffa726"])
            
        for (let i in data) {
            // draw each data point
            let media = data[i]["media"];
            let label = data[i]["label"];
            let r = 0;
            let theta = 0;

            // set radial coordinate for each point
            for (let j in labels) {
                if (labels[j] == label) {
                    theta = 60 + j * 30;
                }
            }
            function centricForceCalc(t) {
                return Math.sqrt(Math.pow(Math.random(), 2) * 4);
            }
            r = Math.pow(centricForceCalc(theta) / 2, 1/3) * r0;
            theta += centricForceCalc(theta) * 15 + Math.pow(centricForceCalc(theta), 8) * 0.7;

            // transform into rect coordinate
            let xCoord = center_x + r * Math.cos(theta * 2 * Math.PI / 360);
            let yCoord = center_y + r * Math.sin(theta * 2 * Math.PI / 360);

            // draw the point
            svg.append("g")
                .append("circle")
                .attr("cx", xCoord)
                .attr("cy", yCoord)
                .attr("r", 2)
                .attr("fill", colorScale(media))
                .attr("opacity", 0.8)
                .attr("class", media)
                .on("mouseover", function(d) {
                    for (let i in medias) {
                        if (medias[i] != media) {
                            d3.selectAll("." + medias[i])
                                .transition()
                                .duration(1000)
                                .attr("fill", "gray")
                                .attr("opacity", 0.1)
                        } else {
                            d3.selectAll("." + medias[i])
                                .transition()
                                .duration(1000)
                                .attr("fill", colorScaleMouseOver(medias[i]))
                                .attr("opacity", 1)
                        }
                    }
                    
                })
                .on("mouseout", function(d) {
                    for (let i in medias) {
                        d3.selectAll("." + medias[i])
                            .transition()
                            .duration(1000)
                            .attr("fill", colorScale(medias[i]))
                            .attr("opacity", 0.8)
                    }
                })
        }

        // append text for each label
        let textOffset_x = [10, -10, -10, -10, -10, -10, 0, 0, 5, 5, 14, 10];
        let textOffset_y = [ 5,    5,  5,   0,   0, -10, 0, 0, 0, 0, 10,  5];
        
        for (let i in labels) {
            let r = r0 + 20;
            let theta = 75 + i * 30;
            let x = center_x + r * Math.cos(theta * 2 * Math.PI / 360);
            let y = center_y + r * Math.sin(theta * 2 * Math.PI / 360);

            svg.append("g")
                .append("text")
                .text(function() {
                    if (labels[i] != "逃犯条例") {
                        return labels[i];
                    } else {
                        return "逃犯条例";
                    }
                })
                .attr("class", "text")
                .attr("x", x + textOffset_x[i])
                .attr("y", y + textOffset_y[i])
        }

        // append legends
        for (let i in medias) {
            svg.append("g")
                .append("circle")
                .attr("class", "legend")
                .attr("cx", 20 + i * 150)
                .attr("cy", 530)
                .attr("r", 5)
                .attr("fill", colorScale(medias[i]))
            svg.append("g")
                .append("text")
                .attr("class", "legend-text")
                .text(function() {
                    if (i == 0) { return "BBC 中文"; }
                    else if (i == 1) { return "人民日报"; }
                    else { return "香港众志"; }
                })
                .attr("x", 30 + i * 150)
                .attr("y", 535)
        }
    });
}

function toggleLegend4circle() {
  var legend = D3.select("#legend4circle");
  if (legend.style("visibility") == "hidden") {
    legend.style("visibility", "");
  } else {
    legend.style("visibility", "hidden");
  }
}