var commits = [];

$(document).ready(function() {
	$('#content').append($("<table></table>", {
		"id": "search-results",
	       	"class": "display table table-striped table-bordered"}));
	$('#search-results').DataTable({
		data: commits,
		columns: [
		{data: 'preview', title: "Log",
		"mRender": function(data, type, full){
		       	return "<a href=\"commits/"+full['cid']+"\">" + data;}},
		{data: 'author', title: "Author"},
		{data: 'aut_date', title: "Authored Date"},
		{data: 'com_date', title: "Commit Date"}]});
});
