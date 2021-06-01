var block = d3.select(".newsblock");
//d3.json("https://filearchiver.oss-cn-beijing.aliyuncs.com/visclass/timeline.json").then(function(data) {
d3.json("./data/timeline.json").then(function(data) {
	for (var key in data)
	{
		console.log(key)
		textdiv = block.append("g")
        .selectAll(".newsdiv")
        .data([key])
        .enter()
        .append("div")
        	.attr("class", "newsdiv")
        	.attr("id", key)
            .on("click", function() {
            	d3.select(this)
            		.transition()
            		.duration(500)
            		.style("height", "auto")
            })
        textdiv.selectAll("p")
            .data([key])
            .enter()
            .append("p")
            .attr("class", "datetext")
            .text(d => d)
        textdiv.append("g")
        	.selectAll("p")
            .data(data[key].split('\n'))
            .enter()
            .append("p")
            .attr("class", "newstext")
            .text(d => d)
       
	}
});
