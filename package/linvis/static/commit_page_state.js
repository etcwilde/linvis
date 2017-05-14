var current_tab = 0;
var b_authors_loaded = false;
var b_modules_loaded = false;
var b_files_loaded = false;
var b_tree_loaded = false;

var authors = [];
var modules = [];
var files = [];
var tree = null;
var tree_base;

var commit_list = [];
var crumbTree = null;
var bread_crumb_list = []

var b_message_loaded = false;

var message = "";

// function getFiles() {
//   $.get("/data/files/JSON/" + cid, function(data) {
//     files = [];
//     var remaining_items = [jQuery.parseJSON(data)];
//     var firewood = {};
//     var cids = [];
//     while(remaining_items.length > 0) {
//       var item = remaining_items.shift();
//       cids.push(item.cid);
//       var children = [];
//       for (var i = 0; i < item.children.length; i++) {
//         remaining_items.push(item.children[i]);
//         children.push(item.children[i].cid);
//       }
//       firewood[item.cid] = {
//         'cid': item.cid,
//         'children': children,
//         'files': item.files};
//     }

//     var tmp_files = {};
//     // Now stack those logs!
//     while (cids.length > 0) {
//       var log_tag = cids.shift(); // Apparently logs have names...
//       for (var i = 0; i < firewood[log_tag].files.length; i++) {
//         if (firewood[log_tag].files[i][0] in tmp_files) {
//           tmp_files[firewood[log_tag].files[i][0]].added += firewood[log_tag].files[i][1];
//           tmp_files[firewood[log_tag].files[i][0]].removed += firewood[log_tag].files[i][2];
//           tmp_files[firewood[log_tag].files[i][0]].cids.push(log_tag);
//         } else {
//           if (firewood[log_tag].files[i][0] === null) continue;
//           tmp_files[firewood[log_tag].files[i][0]] = {
//             'filename': firewood[log_tag].files[i][0],
//             'added': firewood[log_tag].files[i][1],
//             'removed': firewood[log_tag].files[i][2],
//             'cids': [log_tag]};
//         }
//       }
//     }
//     for (var key in tmp_files)
//       files.push([key, tmp_files[key].added, tmp_files[key].removed]);
//   }).success(function() {
//     b_files_loaded = true;
//     $('#content').html($("<table></table>", { "id": "file-table",
//                                               "class": "display table table-striped table-bordered",
//                                               "width": "100%"}));
//     $('table[id=file-table]').DataTable({
//       data: files,
//       columns: [
//         {title: "Filename" },
//         {title: "Added"},
//         {title: "Removed"}]});
//   });
// }

// Base is location in DOM
// root is location in tree
// function build_list_tree(base, root) {
//   var entry = $("<li></li>", {"id": root['cid']})
//     .append($("<a></a>", {"href": '/commits/'+root['cid']}).append(root['name']))
//     .appendTo(base);
//   if (root.children != null) {
//     var sublist = $("<ul></ul>");
//     var namelist = Object.keys(root.children);
//     for (var c in namelist)build_list_tree(sublist,root['children'][namelist[c]]);
//     entry.append(sublist);
//   }
// }

// function get_treeBase(continuation) {
//     $.get("/data/tree/JSON/" + cid, function(data) {
//         tree  = jQuery.parseJSON(data);
//         var root = tree;
//         var remaining_path = crumbs.slice();
//         remaining_path.shift();
//         while(remaining_path.length > 0)
//             root = root['children'][remaining_path.shift()];
//         tree_base = root;
//     }).success(continuation);
// }

// function build_tree() {
//     var bt = function() {
//         $('#content').html("<ul></ul>", {"id": "list_tree"});
//         build_list_tree($('#content'), tree_base);
//     }
//     if (typeof tree_base === "undefined") { get_treeBase(bt); } else { bt(); }
// }

// function getAuthors() {
//     var build_authors = function() {
//         $.get("/data/authors/JSON/" + cid, function(data) {
//             data = jQuery.parseJSON(data);
//             var authKeys = {};
//             var remaining_items = [tree_base];
//             var firewood = {};
//             var cids = [];
//             while(remaining_items.length > 0) {
//                 var item = remaining_items.shift();
//                 var children = [];
//                 for (var key in item.children) {
//                     if (key in data && data[key].author in authKeys) {
//                         authKeys[data[key].author].added += data[key].added;
//                         authKeys[data[key].author].removed +=  data[key].removed;
//                     } else if (key in data) {
//                         authKeys[data[key].author] = data[key];
//                     }
//                     remaining_items.push(item.children[key]);
//                 }
//             }
//             var authors = [];
//             for (var a in authKeys) {
//                 authors.push([a, authKeys[a].added, authKeys[a].removed, authKeys[a].added - authKeys[a].removed, authKeys[a].added + authKeys[a].removed]);
//             }
//             $('#content').html($("<table></table>", { "id": "author-table",
//                 "class": "display table table-striped table-bordered",
//                 "width": "100%"}));
//             $('table[id=author-table]').DataTable({
//                 data: authors,
//                 columns: [  {title: "Author"},
//                 {title: "Added"},
//                 {title: "Removed"},
//                 {title: "Delta"},
//                 {title: "Total"}]});
//         });
//     }
//     if (typeof tree_base === "undefined") {
//         get_treeBase(build_authors);
//     } else {
//         build_authors();
//     }
// }


// function build_reingold() {
//     var tree_preview_node = $("<div></div>", {"id": "treePreview", "class": "container"});
//     var tree_view_node = $("<div></div>", {"id": "treeView", "class": "container"});
//     $('#content').html('');
//     $('#content')
//         .append(tree_preview_node)
//         .append(tree_view_node);

//     var duration = 750;
//     var root;
//     var levelWidth;
//     var radius = 15;

//     var viewerWidth = $('#treeView').width();
//     var viewerHeight = $(document).height();

//     var tree = d3.layout.tree();

//     var diagonal = d3.svg.diagonal()
//         .projection(function(d) { return [d.x, d.y]; });

//     function sortTree() {
//         tree.sort(function(a, b) {
//             return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
//         });
//     }

//     function zoom() {
//         svgGroup.attr("transform",
//         "translate(" + d3.event.translate +
//         ")scale(" + d3.event.scale + ")");
//     }

//     function updatePreview(d) {
//         $("#treePreview").html("");
//         $("#treePreview")
//             .show()
//             .append($("<p></p>")
//                 .html($("<a></a>", {"href": "/commits/" + d.cid}).html(d.name)))
//             .append($("<p></p>").html(d.author));
//     }


//     function click(d) {
//         if (d3.event.defaultPrevented) return; // Click suppressed
//         centerNode(d);
//         updatePreview(d);
//     }

//     var zoomListener = d3.behavior.zoom().scaleExtent([0.05, 5]).on("zoom", zoom);

//     var baseSVG = d3.select("#treeView").append("svg")
//         .attr("width", viewerWidth)
//         .attr("height", viewerHeight)
//         .attr("class", "overlay")
//         .call(zoomListener);

//     var svgGroup = baseSVG.append('g');

//     function centerNode(source) {
//         var scale = zoomListener.scale();
//         x = -source.x;
//         y = -source.y;
//         x = (viewerWidth / 2.) + x * scale ;
//         y = (viewerHeight / 2.) + y * scale;
//         svgGroup.transition()
//             .duration(duration)
//             .attr("transform", "translate("+x+","+y+")scale("+scale+")");
//         zoomListener.scale(scale);
//         zoomListener.translate([x,y]);
//     }


//     d3.json("/data/tree/JSON/" + cid, function(error, t) {



//         if (error) throw error;
//         // Extract this commit, convert children objects to arrays
//         var thisCommit;
//         function breakTree(inputTree) {
//             var retObject = {}
//             retObject.author = inputTree.author;
//             retObject.cid = inputTree.cid;
//             retObject.name = inputTree.name;
//             if (retObject.cid == cid) thisCommit = retObject;
//             if (inputTree.children != null) {
//                 retObject.children = [];
//                 $.each(inputTree.children, function(index, value) {
//                     retObject.children.push(breakTree(value));
//                 });
//             }
//             return retObject;
//         }
//         var root = breakTree(t);
//         maxChildren = 0;
//         levelWidth = [1];
//         var childCount = function(level, n) {
//             if (n.children && n.children.length > 0) {
//                 maxChildren = maxChildren < n.children.length ? n.children.length : maxChildren;
//                 if (levelWidth.length <= level + 1) levelWidth.push(0);
//                 levelWidth[level+1] += n.children.length;
//                 n.children.forEach(function(d){childCount(level + 1, d);});
//             }
//         };
//         childCount(0, root);
//         var color = d3.scale.linear()
//             .domain([1, maxChildren])
//             .range(["hsl(212,100%,75%)", "hsl(212,100%,25%)"])
//             .interpolate(d3.interpolateHcl);
//         var maxWidthIndex = levelWidth.indexOf(d3.max(levelWidth));
//         tree = tree.size([d3.max(levelWidth) * radius * 4 + Math.pow((levelWidth.length - maxWidthIndex) * 2, 2),
//         levelWidth.length * radius * 5 + d3.max(levelWidth)]);
//         var focus = thisCommit, nodes = tree.nodes(root), links = tree.links(nodes);
//         centerNode(focus);
//         updatePreview(focus);
//         sortTree();

//         var link = svgGroup.selectAll(".link")
//             .data(links)
//             .enter().append("g")
//             .attr("fill", "none")
//             .append("path")
//             .attr("stroke-width", "1.2")
//             .attr("stroke", "#666")
//             .attr("class", "link")
//             .attr("d", diagonal);

//         var circle = svgGroup.selectAll("circle")
//             .data(nodes);

//         var circleEnter = circle.enter().append("g")
//             .on('click', click);

//         circleEnter.append("circle")
//             .attr("transform", function(d) { return "translate("+d.x+","+d.y+")"; })
//             .attr("class",function(d){ return d.parent ? d.children ? "node" : "node" : "node node--root";})
//             .style("fill",function(d){ return d === thisCommit ?  "#fd6500" : d.children ? color(d.children.length) : "white";})
//             .style("stroke", function(d) {
//                 return d.children ? color(d.children.length) : d === thisCommit ? "#fc3e04" : "black" ;})
//             .style("stroke-width", function(d) { return d === thisCommit ? 3 : 1; })
//             .style("cursor", "pointer")
//             .attr("r", radius);

//         node  = svgGroup.selectAll("g.node");
//     });
// }

// function build_bubble() {
//   var tree_preview_node = $("<div></div>", {"id": "treePreview", "class": "container"});
//   var tree_view_node = $("<div></div>", {"id": "treeView", "class": "container"});
//   $('#content').html('');
//   $('#content').append(tree_preview_node).append(tree_view_node);

//   var margin = 5,
//     diameter = $('#content').width() / 2;

//   var color = d3.scale.linear()
//     .domain([-1, 10])
//     .range(["hsl(200,80%,80%)", "hsl(260,30%,40%)"])
//     .interpolate(d3.interpolateHcl);

//   var pack = d3.layout.pack()
//     .padding(5)
//     .size([diameter - margin, diameter - margin])
//     .value(function(d) {
//       if (d.children != null) return d.children.length + 5;
//       else return 5; });

//     var svg = d3.select("#treeView").append("svg")
//       .attr("width", diameter)
//       .attr("height", diameter)
//       .append("g")
//       .attr("transform", "translate("+diameter/2+","+diameter/2+")");
//     d3.json("/data/tree/JSON/" + cid, function(error, tree) {
//       if (error) throw error;
//       // unpack tree
//       // Basically want a visit method that massages the data into something nice
//       var thisCommit;
//       function breakTree(inputTree) // Do it with recursion first
//       {
//         var retObject = {}
//         retObject.author = inputTree.author;
//         retObject.cid = inputTree.cid;
//         retObject.name = inputTree.name;
//         if (retObject.cid == cid) thisCommit = retObject;
//         if (inputTree.children != null)
//           {
//             retObject.children = [];
//             $.each(inputTree.children, function(index, value) {
//               retObject.children.push(breakTree(value));
//             });
//           }
//           return retObject;
//       }

//       var root = breakTree(tree);
//       var focus = thisCommit,
//         nodes = pack.nodes(root),
//         view;
//       var circle = svg.selectAll("circle")
//         .data(nodes)
//         .enter()
//         .append("g")
//         .append("circle")
//         .attr("class", function(d) { return d.parent ? d.children ? "node" : "node" : "node node--root"; })
//         .style("fill", function(d) { return d === thisCommit ? "#fd6500" : d.children ?  color(d.depth) : "white"; })
//         .style("cursor", "pointer")
//         .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); })
//         .on("mouseover", function(d) { updatePreview(d); })
//         .on("mouseleave", function(d) { updatePreview(focus); });

//       function updatePreview(d)
//       {
//         $("#treePreview").html("")
//         $("#treePreview")
//           .show()
//           .append($("<p></p>").html($("<a></a>", {"href": "/commits/" + d.cid}).html(d.name)))
//           .append($("<p></p>").html(d.author));
//       }

//       updatePreview(focus);
//       var node = svg.selectAll("circle");
//       d3.select("#treeView").on("click", function() { zoom(root); });
//       zoomTo([focus.x, focus.y, focus.r * 2 + margin]);
//       function zoom(d) {
//         var focus0 = focus; focus = d;
//         updatePreview(focus);
//         var transition = d3.transition()
//           .duration(d3.event.altKey ? 7500 : 750)
//           .tween("zoom", function(d) {
//             var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
//             return function(t) { zoomTo(i(t)); };
//           });
//       }
//       function zoomTo(v) {
//         var k = diameter / v[2]; view = v;
//         node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
//         circle.attr("r", function(d) { return d.r * k; });
//       }
//     });
//     d3.select(self.frameElement).style("height", diameter + "px");
// }

// function getModules() {
//     $.get("/data/modules/JSON/" + cid, function(data) {
//         modules = [];
//         var d = jQuery.parseJSON(data);
//         var remaining_items = [jQuery.parseJSON(data)];
//         var firewood = {};
//         var cids = [];
//         while (remaining_items.length > 0) {
//             var item = remaining_items.shift(); cids.push(item.cid);
//             var children = [];
//             for (var child in item.children) {
//                 remaining_items.push(item.children[child]);
//                 children.push(item.children[child].cid);
//             }
//             firewood[item.cid] = { 'cid': item.cid, 'children': children,
//                 'module': item.module}
//         }
//         var tmp_modules = {};
//         while(cids.length > 0) {
//             var log_tag = cids.shift();
//             if(firewood[log_tag].module in tmp_modules) {
//                 tmp_modules[firewood[log_tag].module].count++;
//                 tmp_modules[firewood[log_tag].module].cids.push(log_tag);
//             } else {
//                 if(firewood[log_tag].module === null) continue;
//                 tmp_modules[firewood[log_tag].module] = {
//                     'module': firewood[log_tag].module,
//                     'count': 1, 'cids': [log_tag]};
//             }
//         }
//         for(var key in tmp_modules)
//             modules.push([key, tmp_modules[key].count, tmp_modules[key].cids]);
//     })
//     .success(function() {
//         b_modules_loaded = true;
//         $('#content').html("<table id=\"module-table\" class=\"display table table-striped table-bordered\" width=100%></table>");
//         $('table[id=module-table]').DataTable({
//             data: modules,
//             columns: [
//             {title: "Module"},
//             {title: "Count"}
//             ]});
//     });
// }

function resetTabs() {
    $("li[id=0]").removeClass("active");
    $("li[id=1]").removeClass("active");
    $("li[id=2]").removeClass("active");
    $("li[id=3]").removeClass("active");
    $("li[id=4]").removeClass("active");
    $("li[id=5]").removeClass("active");
    $("li[id=6]").removeClass("active");
}

// Builds crumb tree
// function processCommits(success_func) {
//     console.log("Process Commits called");
//     if (!crumbTree) {
//         console.log("No CrumbTree")
//         crumbTree = new RadixTree()
//     }

//     $.get("/data/tree/JSON/" + cid, function(data) {
//         var remaining_items = [jQuery.parseJSON(data)];
//         while (remaining_items.length > 0) {
//             var item = remaining_items.shift();
//             commit_list.push(item.cid);
//             for (var c in item.children) { remaining_items.push(item.children[c]) }
//         }
//         crumbTree = new RadixTree()
//         commit_list.forEach(function(cv) { crumbTree.add(cv) })
//         crumbs.forEach(function(cv) {
//             console.log(cv)
//             bread_crumb_list.push([cv, crumbTree.find(cv).prefix]) })
//     })
//     .success(
//     function() {
//     if (success_func) success_func() });
// }

// Initialize
$(document).ready( function() {

    // Found it!
    if(cid) $.get("/data/log/"+cid,function(data){message=data;})
      .success(function() {
        b_message_loaded = true;
        $("li[id=0]").addClass("active");
        $("#content").html("<pre id=\"log\">");
        $("pre[id='log']").html(message);
        // processCommits();
      });

    $("li[id=0]").click(function() {
        spin($("#content"));
        if(!b_message_loaded) {
            $.get("/data/log/"+cid,function(data){message=data;});
            b_message_loaded = true;
        }
        $("#content").html("<pre id=\"log\">");
        $("pre[id='log']").html(message);
        resetTabs();
        $("li[id=0]").addClass("active");
    });

    $("li[id=1]").click(function() {
        spin($("#content"));
        if(!b_files_loaded)
            getFiles();
        else {
            $('#content').html("<table id=\"file-table\" class=\"display table table-striped table-bordered\" width=100%></table>");
            $('table[id=file-table]').DataTable( {
                data: files,
                columns: [
                {title: "Filename" },
                {title: "Added"},
                {title: "Removed"}]});
        }
        resetTabs();
        $("li[id=1]").addClass("active");
    });
    $("li[id=2]").click(function() {
        spin($("#content"));
        if(!b_modules_loaded)
            getModules();
        else {
            $('#content').html(
                    $("<table></table>")
                    .attr("id", "module-table")
                    .attr("class", "display table table-striped table-bordered")
                    .attr("width", "100%"));
            $('table[id=module-table]').DataTable({
                data: modules,
                columns: [
                {title: "Module"},
                {title: "Count"}]});
        }
        resetTabs();
        $("li[id=2]").addClass("active");
    });
    $("li[id=3]").click(function() {
        spin($("#content"));
        build_tree($('#list_tree'), tree_base);
        resetTabs();
        $("li[id=3]").addClass("active");
    });
    $("li[id=4]").click(function() {
        spin($("#content"));
        build_bubble();
        resetTabs();
        $("li[id=4]").addClass("active");
    });
    $("li[id=5]").click(function() {
        spin($("#content"));
        build_reingold();
        resetTabs();
        $("li[id=5]").addClass("active");
    });
    $("li[id=6]").click(function() {
        spin($("#content"));
        getAuthors();
        resetTabs();
        $("li[id=6]").addClass("active");
    });
});
