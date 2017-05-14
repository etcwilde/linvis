var readTree = function(tree, operation) {
    let commit_list = [];
    let remaining_el = [tree];
    while (remaining_el.length > 0) {
        let el = remaining_el.shift();
        operation(el);
        for (var c in el.children) { remaining_el.push(el.children[c]); }
    }
}

// Breadcrumbs from a given commit
var getCrumbs = function(tree, cid, callback) {
    var breadcrumbs = [];
    let commit_list = [];
    readTree(tree, function(c){ commit_list.push(c.cid);});
    crumbTree = new RadixTree();
    commit_list.forEach(function(cv) {crumbTree.add(cv);});
    crumbs.forEach(function(cv){breadcrumbs.push([cv, crumbTree.find(cv).prefix]);});
    callback(breadcrumbs);
}

var processFiles = function(data) {
    console.log(data);
}

var processAuthors = function(data) {
    var authorKeys = {};

}
