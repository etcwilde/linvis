/*
 * Evan Wilde <etcwilde@uvic>
 * May 14, 2017
 */


// Authorship processor
var drawAuthors = function(authors, pane) {
    let data = $.map(authors, function(value, index) {return [value];});
    let tab = $("<table></table>",
        {"id": "author-table",
         "class": "display table table-striped table-bordered",
         "width": "100%"});
    pane.html(tab);

    let dataTable = tab.DataTable({
        data: data,
        order: [[1, 'desc']],
        columns: [
            {orderable: false, className: 'details-control',  data: null, defaultContent: '<span class=\'glyphicon glyphicon-menu-right\'></span>'},
            {title: 'Author', data: 'author'},
            {title: 'Files', data: 'files.length'},
            {title: 'Added', data: 'added'},
            {title: 'Removed', data: 'removed'}
        ]
    });

    var authorDetails = function(d) {
        let tab = $('<table></table>',
            {   'id': 'nested-table',
                'class': 'display table table-striped table-bordered',
                'width': '100%'});

        let header = $('<thead></thead>').append(
            $('<tr></tr>')
            .append($('<td></td>').html('Commit'))
            .append($('<td></td>').html('Filename'))
            .append($('<td></td>').html('Lines Added'))
            .append($('<td></td>').html('Lines Removed')));

        let body = $('<tbody></tbody>');

        for (var f in d.files) {
            let data = d.files[f];
            body.append($('<tr></tr>')
                .append($('<td></td>').html($('<a></a>', {'href': '/commits/' + data.cid})
                    .html(data.cid.substring(0, 10))))
                .append($('<td></td>').html(data.fname))
                .append($('<td></td>').html(data.added))
                .append($('<td></td>').html(data.removed)));
        }
        return tab.append(header).append(body);
    }

    tab.on('click', 'td.details-control', function() {
        let tr = $(this).closest('tr')
            row = dataTable.row(tr);
        if (row.child.isShown()) {
            row.child.hide();
            $(this).html('<span class=\'glyphicon glyphicon-menu-right\'></span');
        } else {
            row.child(authorDetails(row.data())).show();
            $(this).html('<span class=\'glyphicon glyphicon-menu-down\'></span');
            $(this).parent().next().children().children().DataTable({});
        }
    });

}


// File Data processor
var drawFiles = function(files, pane) {
    let data = $.map(files, function(value, index) { return [value];});
    let tab = $("<table></table>", { "id": "file-table",
            "class": "display table table-striped table-bordered",
            "width": "100%"});
    pane.html(tab);
    let dataTable = tab.DataTable({
        data: data,
        columns: [
            {orderable: false, className: 'details-control',  data: null, defaultContent: '<span class=\'glyphicon glyphicon-menu-right\'></span>'},
            {title: 'File', data: 'fname'},
            {title: 'Added', data: 'added'},
            {title: 'removed', data: 'removed'}
        ]
    });

    var fileDetails = function(d) {
        let tab = $('<table></table>',
            {   'id': 'nested-table',
                'class': 'display table table-striped table-bordered',
                'width': '100%'});

        let header = $('<thead></thead>').append(
            $('<tr></tr>')
            .append($('<td></td>').html('Commit'))
            .append($('<td></td>').html('Lines Added'))
            .append($('<td></td>').html('Lines Removed')));

        let body = $('<tbody></tbody>');

        for (var f in d.cids) {
            let data = d.cids[f];
            body.append($('<tr></tr>')
                .append($('<td></td>').html($('<a></a>', {'href': '/commits/' + data.cid})
                    .html(data.cid.substring(0, 10))))
                .append($('<td></td>').html(data.added))
                .append($('<td></td>').html(data.removed)));
        }
        return tab.append(header).append(body);
    }

    tab.on('click', 'td.details-control', function() {
        let tr = $(this).closest('tr')
            row = dataTable.row(tr);
        if (row.child.isShown()) {
            row.child.hide();
            $(this).html('<span class=\'glyphicon glyphicon-menu-right\'></span');
        } else {
            row.child(fileDetails(row.data())).show();
            $(this).html('<span class=\'glyphicon glyphicon-menu-down\'></span');
            $(this).parent().next().children().children().DataTable({});
        }
    });

}


// Module processor
var drawModules = function(modules, pane) {
    let data = $.map(modules, function(value, index) { return [value];});
    let tab = $("<table></table>", {"id": "module-table",
        "class": "display table table-striped table-bordered",
        "width": "100%"});
    pane.html(tab);
    let dataTable = tab.DataTable({
        data: data,
        columns: [
            {orderable: false, className: 'details-control',  data: null, defaultContent: '<span class=\'glyphicon glyphicon-menu-right\'></span>'},
            {title: 'Module', data: 'module'},
            {title: 'Count', data: 'count'}
        ]
    });

    var moduleDetails = function(d) {
        let root = $("<ul></ul>");
        for (var i in d.cids) {
            let cid = d.cids[i];
            root.append($('<li></li>').html($('<a></a>', {'href': '/commits/' + cid}).html(cid.substring(0, 10))));
        }
        return root;
    }

    tab.on('click', 'td.details-control', function() {
        let tr = $(this).closest('tr')
            row = dataTable.row(tr);
        if (row.child.isShown()) {
            row.child.hide();
            $(this).html('<span class=\'glyphicon glyphicon-menu-right\'></span');
        } else {
            row.child(moduleDetails(row.data())).show();
            $(this).html('<span class=\'glyphicon glyphicon-menu-down\'></span');
            // $(this).parent().next().children().children().DataTable({});
        }
    });
}
