// Evan Wilde
// Jun 14, 2017

// Takes the roots and children objects
// Returns an array of trees with children in single level
var rootify = function(roots, children) {
    for (var el in roots) { roots[el].push([]); }
    children.forEach(el => {
        if (el.mcid == undefined) {
            if (roots == undefined) roots = {};
            if (el.cid in roots) roots[el.cid][3].push(el);
            else roots[el.cid] = [el.preview, el.author, el.comdate, [el]];
        } else {
            if (roots[el.mcid] != undefined) roots[el.mcid][3].push(el);
            else console.error(el.mcid, "not in commits");
        }
    });
    return roots;
}

// Takes sum of children rankings and sorts by the mean
var rankTrees = function(trees) {
    trees = Object.keys(trees).map(e => {return {'cid': e,
            'preview': trees[e][0],
            'author': trees[e][1],
            'date': trees[e][2],
            'children': trees[e][3],
            'rank': function(val){ return trees[e][3].reduce(
                (ac, v) => ac+v.rank,0)/trees[e][3].length
            }(trees[e])};
    });
    trees.sort((a, b) => { return a.rank > b.rank ? -1 : 1;});
    return trees;
}

// Break the table into chunks
var paginate_search = function(items, callback, page=0, size=10) {
    let pages = Math.floor(items.length/size);
    page = page <= pages ? page : pages; // restrict page count
    let start = page * size,
        end = ((page + 1) * size) < items.length ? (page+1) * size : items.length;
    let trees = items.slice(start, end);
    if (callback != undefined) callback(trees, pages, page);
}

let drawTable = function(items, domel) {
        items.forEach(el => {
            let div = $('<div></div>',
                        {'class': 'panel panel-default',
                        'style': 'padding:0.5em'})
                        .append($('<div></div>', {'class': 'row',
                        'width': '90%',
                        'style': 'padding:0.5em'}))
                    .append($("<div></div>", {'class': 'col-sm-6'})
                        .append($("<h4></h4>")
                            .html($("<a></a>", {'id': 'commit'+ el.cid, 'href': '/commits/' + el.cid})
                            .html(el.preview))
                        )
                    )
                    .append($("<div></div>", {'class': 'col-sm-3'})
                        .append($("<h4></h4>")
                            .html(el.author)
                        )
                    )
                    .append($("<div></div>", {'class': 'col-sm-2'})
                        .append($("<h4></h4>")
                            .html(el.comdate)
                        )
                    )
            domel.append(div);
            let tab = $("<table></table>",
                {"class": "display table table-striped table-bordered",
                 "width": "100%"});

            div.append(tab);
            let dataTable = tab.DataTable({
                     data: el.children,
                     order: [[0, 'desc']],
                     deferRender: true,
                     lengthMenu: false,
                     dom: 'ftpr',
                    columns: [
                    {title: 'Rank', data: 'rank'},
                    {title: 'Preview', mRender: function(data, type, full) {
                        return "<a href=\"commits/"+full['cid']+"\">"+full.preview+"</a>";
                        }},
                    {title: 'Author', data: 'author'},
                    {title: 'Commit Date', data: 'com_date'},
                    {title: 'Authored Date', data: 'aut_date'}
                    ]
                });
            })
    }
