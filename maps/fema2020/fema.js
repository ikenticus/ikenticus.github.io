function setColor(range, value, cell) {
    let hue = range.indexOf(parseInt(value.replace(/,/, ''))) / range.length;
    let sat = '100%';
    let lum = '70%';
    if (hue == 0) lum = '40%';
    if (hue == (range.length-1)/range.length) {
        sat = '50%';
        lum = '40%';
    }
	let color = 'hsl(' + (1.0 - hue) * 120 + ',' + sat + ',' + lum + ')';
    if (cell) {
		cell.css({backgroundColor: color});
	} else {
		return color;
	}
}

function setColorRGB(range, value, cell) {
    let hue = range.indexOf(parseInt(value.replace(/,/, ''))) / range.length;
    let color = 'rgb(' + hue*240 + ',255,' + hue*240 + ')';
    if (cell) {
		cell.css({backgroundColor: color});
	} else {
		return color;
	}
}

function getRange(data) {
    let values = _.flatten(_.map(data, d => {
        return _.compact(_.values(d).slice(1).map(m => { return parseInt(m); }));
    }));
    values.sort((a,b) => { return a - b; });
    values = [...new Set(values)];
	console.log(values);
    return values;
}

/*  This visualization was made possible by modifying code provided by:

Scott Murray, Choropleth example from "Interactive Data Visualization for the Web"
https://github.com/alignedleft/d3-book/blob/master/chapter_12/05_choropleth.html

Malcolm Maclean, tooltips example tutorial
http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html

Mike Bostock, Pie Chart Legend
http://bl.ocks.org/mbostock/3888852  */


//Width and height of map
var width = 900;
var height = 500;

// D3 Projection
var projection = d3.geo.albersUsa()
				   .translate([width/2, height/2])    // translate to center of screen
				   .scale([1000]);          // scale things down so see entire US

// Define path generator
var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
		  	 .projection(projection);  // tell path generator to use albersUsa projection

//Create SVG element and append map to the SVG
var svg = d3.select("body")
			.append("svg")
			.attr("width", width)
			.attr("height", height);

// Append Div for tooltip to SVG
var div = d3.select("body")
		    .append("div")
    		.attr("class", "tooltip")
    		.style("opacity", 0);

// Load in my states data!
d3.csv("approved-states.csv", function(data) {
	let range = getRange(data);

	// Load GeoJSON data and merge with states data
	d3.json("us-states.json", function(json) {

		// Loop through each state data value in the .csv file
		for (var i = 0; i < data.length; i++) {
			// Grab State Name
			var dataState = data[i].state;
			// Grab data value
			var dataValue = data[i].days;
			// Find the corresponding state inside the GeoJSON
			for (var j = 0; j < json.features.length; j++)  {
				var jsonState = json.features[j].properties.name;
				if (dataState == jsonState) {
					// Copy the data value into the JSON
					json.features[j].properties.approved = dataValue;
                    json.features[j].properties.date = data[i]['08/08/20'];
					// Stop looking through the JSON
					break;
				}
			}
		}

		// Bind the data to the SVG and create one path per GeoJSON feature
		svg.selectAll("path")
			.data(json.features)
			.enter()
			.append("path")
			.attr("d", path)
			.style("stroke", "#fff")
			.style("stroke-width", "1")
			.style("fill", function(d) {
				// Get data value
				var value = d.properties.approved;

				if (value > 0) {
					//If value exists…
					return setColor(range, value);
				} else {
					//If value is undefined…
					return "rgb(213,222,217)";
				}
			})
			.on("mouseover", function(d) {
		    	div.transition()
		      	   .duration(200)
		           .style("opacity", .9);
		        div.text(d.properties.date || 'N/A')
		           .style("left", (d3.event.pageX) + "px")
		           .style("top", (d3.event.pageY - 28) + "px");
			})
		    // fade out tooltip on mouse out
		    .on("mouseout", function(d) {
		        div.transition()
		           .duration(500)
		           .style("opacity", 0);
		    });

	}); // close us-states.json

}); // close approved-states.csv
