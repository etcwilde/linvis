var drawAuthors = function(authors, pane) {
    let data = $.map(authors, function(value, index) {return [value];});
    let tab = $("<table></table>",
        {"id": "author-table",
         "class": "display table table-striped table-bordered",
         "width": "100%"});
    pane.html(tab);
    tab.DataTable({
        data: data,
        searching: true,
        columns: [
            {title: 'Author', data: 'author'},
            {title: 'Added', data: 'added'},
            {title: 'Removed', data: 'removed'}
        ]
    });
}
