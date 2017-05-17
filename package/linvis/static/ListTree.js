function BuildListTree(root, pane) {
    var entry = $("<li></li>", {"id": root.cid})
        .append($("<a></a>", {"href": '/commits/' + root.cid}).append(root.name))
        .appendTo(pane);

    if (root.children != null) {
        let sublist = $("<ul></ul>");
        for (var c in root.children) {
            BuildListTree(root.children[c], sublist);
            entry.append(sublist);
        }

    }
}
