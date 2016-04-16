var current_tab = 0;
var b_authors_loaded = false;
var b_modules_loaded = false;
var b_files_loaded = false;
var b_tree_loaded = false;

var b_listview = 0;

var authors = [];
var modules = [];
var files = [];
var tree = {};
var tree_base;
var crumbs=[];

var b_message_loaded = false;

var message = "";

function getFiles() {
	$.get("/data/files/JSON/" + cid, function(data) {
		files = [];
		var remaining_items = [jQuery.parseJSON(data)];
		var firewood = {};
		var cids = [];
		while(remaining_items.length > 0) {
			var item = remaining_items.shift();
			cids.push(item.cid);
			var children = [];
			for (var i = 0; i < item.children.length; i++) {
				remaining_items.push(item.children[i]);
				children.push(item.children[i].cid);
			}
			firewood[item.cid] = {
				'cid': item.cid,
				'children': children,
				'files': item.files};
		}

		var tmp_files = {};
		// Now stack those logs!
		while (cids.length > 0) {
			var log_tag = cids.shift(); // Apparently logs have names...
			for (var i = 0; i < firewood[log_tag].files.length; i++) {
				if (firewood[log_tag].files[i][0] in tmp_files) {
					tmp_files[firewood[log_tag].files[i][0]].added += firewood[log_tag].files[i][1];
					tmp_files[firewood[log_tag].files[i][0]].removed += firewood[log_tag].files[i][2];
					tmp_files[firewood[log_tag].files[i][0]].cids.push(log_tag);
				} else {
					if (firewood[log_tag].files[i][0] === null) continue;
					tmp_files[firewood[log_tag].files[i][0]] = {
						'filename': firewood[log_tag].files[i][0],
						'added': firewood[log_tag].files[i][1],
						'removed': firewood[log_tag].files[i][2],
						'cids': [log_tag]};
				}
			}
		}
		for (var key in tmp_files)
			files.push([key, tmp_files[key].added, tmp_files[key].removed]);
	}).success(function() {
		b_files_loaded = true;
		$('#content').html("<table id=\"file-table\" class=\"display table table-striped table-bordered\" width=100%></table>");
		$('table[id=file-table]').DataTable( {
			data: files,
			columns: [
			{title: "Filename" },
			{title: "Added"},
			{title: "Removed"}]});
	});
}

function visit(parent, visitFn)
{
    console.log("Visiting");
    visitFn(parent);
    if(parent.children != null)
    {
        var namelist = Object.keys(parent.children);
        for (var c in namelist) visit(parent.children[namelist[c]], visitFn);
    }
}

// Base is location in DOM
// root is location in tree
// TODO: Replace with the visit method
function build_list_tree(base, root) {
	var entry = $("<li></li>", {"id": root['cid']})
		.append($("<a></a>", {"href": '/commits/'+root['cid']}).append(root['name']))
		.appendTo(base);
    if (root.children != null){
		var sublist = $("<ul></ul>");
		var namelist = Object.keys(root.children);
		for (var c in namelist)build_list_tree(sublist,root['children'][namelist[c]]);
		entry.append(sublist);
	}
}

function buildPackTree(base)
{
}



function buildTree(base) {
    switch(b_listview)
    {
        case 0:
            base.html($("<ul></ul>", {"id": "list_tree"}));
            build_list_tree($('#list_tree'), tree_base);
            break;
        case 1:
            buildPackTree(base);
            //base.html($("<div></div>", {"class": "alert alert-warning", "role": "alert"})
            //        .append($("<span></span>", {"class": "glyphicon glyphicon-exclamation-sign", "aria-hidden": "true"}))
            //        .html("Not Yet Implemented"));
            break;
        default:
            base.html($("<div></div>", {"class": "alert alert-danger", "role": "alert"})
                    .append($("<span></span>", {"class": "glyphicon glyphicon-exclamation-sign", "aria-hidden": "true"}))
                    .html("Inavlid Tree Selector"));
            break;
    }
}

function getTree() {
	$.get("/data/tree/JSON/" + cid, function(data) {
		console.log("Getting: data/tree/JSON/" + cid);
		tree  = jQuery.parseJSON(data);
		var root = tree;
		var remaining_path = crumbs;
		remaining_path.shift();
		while(remaining_path.length > 0)
			root = root['children'][remaining_path.shift()];
		tree_base = root;
	})
	.success(function() {
        $('#content').html("");
        // Header
        var treeNav =
            $("<div></div>", {"id": "treeNav", "class": "navbar navbar-default"})
                .append($("<form></form>", {"id": "tree-selector", "role": "form"})
                .append(
                        $("<label></label>", {"class": "radio-inline"})
                        .append($("<input/>", {"type": "radio", "name": "treeSelect", "value": "list"}))
                        .append("List Tree"))
                .append(
                        $("<label></label>", {"class": "radio-inline"})
                        .append($("<input/>", {"type": "radio", "name": "treeSelect", "value": "pack"}))
                        .append("Pack Tree")));
        var treeView = $("<div></div>", {"id": "treeView", "class": "container"});
        $('#content').append(treeNav);
        $('#content').append(treeView);
        $("#tree-selector")
            .on("change", function()
                    {
                        switch($('input[name=treeSelect]:checked', '#tree-selector').val())
                        {
                            case 'pack':
                                b_listview = 1;
                                break;
                            default:
                                b_listview = 0

                        }
                        buildTree($('#treeView'));
                    });
	});
};


function getModules() {
	$.get("/data/modules/JSON/" + cid, function(data) {
		modules = [];
		console.log("data/modules/JSON/" + cid);
		var d = jQuery.parseJSON(data);
		var remaining_items = [jQuery.parseJSON(data)];
		var firewood = {};
		var cids = [];
		while (remaining_items.length > 0) {
			var item = remaining_items.shift(); cids.push(item.cid);
			var children = [];
			for (var child in item.children) {
				remaining_items.push(item.children[child]);
				children.push(item.children[child].cid);
			}
			firewood[item.cid] = { 'cid': item.cid, 'children': children,
				'module': item.module}
		}
		var tmp_modules = {};
		while(cids.length > 0) {
			var log_tag = cids.shift();
			if(firewood[log_tag].module in tmp_modules) {
				tmp_modules[firewood[log_tag].module].count++;
				tmp_modules[firewood[log_tag].module].cids.push(log_tag);
			} else {
				if(firewood[log_tag].module === null) continue;
				tmp_modules[firewood[log_tag].module] = {
					'module': firewood[log_tag].module,
					'count': 1, 'cids': [log_tag]};
			}
		}
		for(var key in tmp_modules)
			modules.push([key, tmp_modules[key].count, tmp_modules[key].cids]);
	})
	.success(function() {
		b_modules_loaded = true;
		$('#content').html("<table id=\"module-table\" class=\"display table table-striped table-bordered\" width=100%></table>");
		$('table[id=module-table]').DataTable({
			data: modules,
			columns: [
			{title: "Module"},
			{title: "Count"}
			]});
	});
}

// Initialize
$(document).ready( function() {
	// Found it!
    if(cid) $.get("/data/log/"+cid,function(data){message=data;});
	b_message_loaded = true;

	$("li[id=0]").click(function() {
		$("#content").html("<div class='spinner'>"+
				"<div class='spinner__item1'></div>"+
				"<div class='spinner__item2'></div>"+
				"<div class='spinner__item3'></div>"+
				"<div class='spinner__item4'></div>");
		if(!b_message_loaded) {
			$.get("/data/log/"+cid,function(data){message=data;});
			b_message_loaded = true;
		}
		$("#content").html("<pre id=\"log\">");
		$("pre[id='log']").html(message);
		$("li[id=0]").addClass("active");
		$("li[id=1]").removeClass("active");
		$("li[id=2]").removeClass("active");
		$("li[id=3]").removeClass("active");
	});

	$("li[id=1]").click(function() {
		$("#content").html("<div class='spinner'>"+
				"<div class='spinner__item1'></div>"+
				"<div class='spinner__item2'></div>"+
				"<div class='spinner__item3'></div>"+
				"<div class='spinner__item4'></div>");
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
		$("li[id=0]").removeClass("active");
		$("li[id=1]").addClass("active");
		$("li[id=2]").removeClass("active");
		$("li[id=3]").removeClass("active");
	});
	$("li[id=2]").click(function() {
		$("#content").html("<div class='spinner'>"+
				"<div class='spinner__item1'></div>"+
				"<div class='spinner__item2'></div>"+
				"<div class='spinner__item3'></div>"+
				"<div class='spinner__item4'></div>");
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
		$("li[id=0]").removeClass("active");
		$("li[id=1]").removeClass("active");
		$("li[id=2]").addClass("active");
		$("li[id=3]").removeClass("active");
	});
	$("li[id=3]").click(function() {
		$("#content").html("<div class='spinner'>" +
				"<div class='spinner__item1'></div>"+
				"<div class='spinner__item2'></div>"+
				"<div class='spinner__item3'></div>"+
				"<div class='spinner__item4'></div>");
		if(!b_tree_loaded)
			getTree();
		else buildTree($('#content'));
		$("li[id=0]").removeClass("active");
		$("li[id=1]").removeClass("active");
		$("li[id=2]").removeClass("active");
		$("li[id=3]").addClass("active");
	});
});
