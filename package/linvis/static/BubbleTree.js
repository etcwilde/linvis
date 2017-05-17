function BuildBubbleTree(data, treeRoot, pane, width, height, clickFunction, hoverFunction) {

    // Data Handling
    let margin = 5,
        diameter = width;
    let pack = d3.layout.pack()
        .padding(margin)
        .size([diameter - margin, diameter - margin])
        .value(function(d) { if (d.children != null) return d.children.length + 5; return 5;});
    let nodes = pack.nodes(data);


    var maxDepth = 0,
        view,
        focus;

    readTree(data, function(el){
        if (el.cid == cid) {focus = el; view = el;}
        if (maxDepth < el.depth) maxDepth = el.depth;
    })

    // User Functions
    function click(d) {
        if (d3.event != null && d3.event.defaultPrevented) return;
        if (d === view) d = nodes[0];
        view = d;
        zoomTo(d);
        if (clickFunction !== undefined) clickFunction(d);
    }

    function zoomTo(d) {
        let k = diameter / (d.r * 2 + margin); // Ratio of diameter to thing (scale factor)
        let x = (width / 2.) - d.x * k;
        let y = (height / 2.) - d.y * k;
        svgGroup.transition()
            .duration(750)
            .attr("transform", "translate("+x+","+y+")scale("+k+")");
    }

    // Drawing
    //
    var color = d3.scale.linear()
        .domain([0, maxDepth])
        .range(["hsl(212,100%,75%)", "hsl(212,100%,25%)"])
        .interpolate(d3.interpolateHcl);


    var svg = pane.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "overlay"); // TODO: Call zoomListener

    var svgGroup = svg.append('g');

    var circles = svgGroup.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr('class', 'node')
        .attr('fill', function(d) { return d == focus ? '#fd6500' : d.children ? color(d.depth) : 'white'; })
        .attr('r', function(d) { return d.r; })
        .attr('transform', function(d) { return "translate("+d.x+","+d.y+")"})
        .style('cursor', 'pointer')
        .on('click', click)
        .on('mouseover', function(d) {
            if (hoverFunction !== undefined) hoverFunction(d, 0);
            this.style.stroke = '000';
        })
        .on('mouseleave', function(d) {
            this.style.stroke = '';
            if (hoverFunction !== undefined) hoverFunction(view, 1);
        })

    zoomTo(focus);
    if (clickFunction != undefined) { clickFunction(focus); }
}
