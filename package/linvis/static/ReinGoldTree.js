function ReingoldTree(data, treeRoot) {
    this.data = data;
    this.height = 480;
    this.width = 640;
    this.root = treeRoot;
    this.focus = treeRoot;
    this.duration = 750;


    this.tree = d3.layout.tree();
    this.nodes = this.tree.nodes(data);
    this.links = this.tree.links(this.nodes);


    var max_width = 0;
    var levelWidth = [];
    var focus;

    readTree(data, function(el) {
        if (el.cid == cid) focus = el;
        if (el.children == undefined) return;
        if (el.children.length > max_width) max_width = el.children.length;
        while (el.depth >= levelWidth.length) levelWidth.push(0);
        levelWidth[el.depth] += el.children.length;
        });

    this.max_width = max_width;
    this.levelWidth = levelWidth;


    this.radius = 15;
    this.tree.size([d3.max(levelWidth) * this.radius * 4 + Math.pow((levelWidth.length - levelWidth.indexOf(d3.max(levelWidth))) * 2, 2),
        levelWidth.length * this.radius * 5 + d3.max(levelWidth)]);
    this.nodes = this.tree.nodes(data);
    this.links = this.tree.links(this.nodes);
}


ReingoldTree.prototype.draw = function(pane, width, height, clickFunction, hoverFunction) {
    var color = d3.scale.linear()
        .domain([1, this.max_width])
        .range(["hsl(212,100%,75%)", "hsl(212,100%,25%)"])
        .interpolate(d3.interpolateHcl);


    function zoom() {
        svgGroup.attr("transform", "translate("+d3.event.translate+")scale("+d3.event.scale+")");
    }

    function click(d) {
        if (d3.event != null && d3.event.defaultPrevented) { console.log("Click prevented"); return; }
        centerNode(d);
        focus = d;
        if (clickFunction !== undefined) clickFunction(d);
    }

    function centerNode(d) {
        let scale = zoomListener.scale();
        let x = (width / 2.) - d.x * scale;
        let y = 50 - d.y * scale;
        svgGroup.transition()
            .duration(750)
            .attr("transform", "translate("+x+","+y+")scale("+scale+")");
        zoomListener.scale(scale);
        zoomListener.translate([x,y]);
    }

    var zoomListener = d3.behavior.zoom()
        .scaleExtent([0.05, 8])
        .on('zoom', zoom);

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.x, d.y];});

    var rad = this.radius;
    var svg = pane.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "overlay")
        .call(zoomListener);

    var svgGroup = svg.append('g');


    // List of edges
    var link = svgGroup.selectAll('link')
        .data(this.links)
        .enter()
        .append('g')
        .attr('fill', 'none')
        .append('path')
        .attr('stroke-width', '1.2')
        .attr('stroke', '#666')
        .attr('d', diagonal);

    var focus = this.focus;

    var circles = svgGroup.selectAll("circle")
        .data(this.nodes)
        .enter()
        .append('circle')
        .attr('class', 'node')
        .attr('fill', function(d) { return d == focus ? '#fd6500' : d.children ? color(d.children.length) : 'white'; })
        .attr('r', this.radius)
        .attr('transform', function(d){ return "translate("+d.x+","+d.y+")";})
        .style('cursor', 'pointer')
        .style('stroke', function(d) { return d.children ? color(d.children.length) : '000';})
        .style('stroke-width', function(d) { return d === focus ? 3 : 1; })
        .on('click', click)
        .on('mouseover', function(d) { if ( hoverFunction !== undefined) hoverFunction(d, 0) })
        .on('mouseleave', function(d) { if ( hoverFunction !== undefined) hoverFunction(focus, 1) });

    centerNode(this.focus);
    if (clickFunction != undefined ) clickFunction(this.focus);


}
