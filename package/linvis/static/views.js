/*
 * Evan Wilde <etcwilde@uvic>
 * May 14, 2017
 */

var drawAuthors = function(authors, pane) {
    let data = $.map(authors, function(value, index) {return [value];});
    let tab = $("<table></table>",
        {"id": "author-table",
         "class": "display table table-striped table-bordered",
         "width": "100%"});
    pane.html(tab);
    tab.DataTable({
        data: data,
        columns: [
            {title: 'Author', data: 'author'},
            {title: 'Added', data: 'added'},
            {title: 'Removed', data: 'removed'}
        ]
    });
}

var drawFiles = function(files, pane) {
    let data = $.map(files, function(value, index) { return [value];});
    let tab = $("<table></table>", { "id": "file-table",
            "class": "display table table-striped table-bordered",
            "width": "100%"});
    pane.html(tab);
    tab.DataTable({
        data: data,
        columns: [
            {title: 'File', data: 'fname'},
            {title: 'Added', data: 'added'},
            {title: 'removed', data: 'removed'}
        ]
    });
}
