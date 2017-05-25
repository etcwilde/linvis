function RadixNode(path, fullPath, data) {
        this.par = null
        this.path = path
        this.fullPath = fullPath
        this.data = data
        this.count = 0
        this.children = []
}

RadixNode.prototype.append = function(node) {
    this.children.push(node)
    node.par = this
    this.sort()
}

RadixNode.prototype.remove = function(node) {
    let position = this.children.indexOf(node);
    if (position === -1) return;
    this.children.splice(position, 1);
}

RadixNode.prototype.sort = function() {
    this.children.sort((a,b) => b.count - a.count)
}


function RadixTree() {
    this.root = null;
}

RadixTree.prototype.isEmpty = function() {
    return this.root === null
}


RadixTree.prototype.add = function(path, data=null) {
    if (this.isEmpty()) {
        this.root = new RadixNode('', '', null)
    }

    const fullPath = path
    let node = this.root
    node.count++
    node_loop:
    while(node) {
        path = path.substr(node.path.length)
        if (path.length === 0) {
            if (node.data) {
                console.log("Error: Node already exists")
            } else {
                node.data = data
            }
            return this
        }
        if (node.children.length) {
            for (let nodeIndex = 0; nodeIndex < node.children.length; nodeIndex++) {
                if (node.children[nodeIndex].path[0] === path[0]) {
                    let selectedNode = node.children[nodeIndex]
                    let compIndex
                    for (compIndex = 0; compIndex < Math.min(selectedNode.path.length, path.length); compIndex++) {
                        if (path[compIndex] !== selectedNode.path[compIndex]) {
                            break
                        }
                    }
                    // Continue into the tree
                    if (compIndex >= selectedNode.path.length) {
                        node.children[nodeIndex].count++
                        node.sort()
                        node = selectedNode
                        continue node_loop
                    } else if (compIndex >= path.length) {
                        // Create a new node, the new string is a substring of this one
                        let newChild = new RadixNode(path, fullPath, data)
                        selectedNode.path = selectedNode.path.replace(path, '')
                        node.remove(selectedNode)
                        node.append(newChild)
                        return this
                    } else if (compIndex > 0) {
                        // Matches partially, create new edge
                        let newEdge = new RadixNode(path.substr(0, compIndex), '', null)
                        selectedNode.path = selectedNode.path.substr(compIndex)
                        newEdge.count = selectedNode.count + 1
                        node.remove(selectedNode)
                        node.append(newEdge)
                        newEdge.append(selectedNode)
                        node = newEdge
                        continue node_loop
                    }
                }
            }
        }

        this.appendNode(node, path, fullPath, data)
        return this

    }

}

RadixTree.prototype.appendNode = function(node, path, fullPath, data) {
    let offset = 0
    let child = new RadixNode()
    child.path = path.substr(offset)
    child.fullPath = fullPath
    child.data = data
    node.append(child)
    return this
}

RadixTree.prototype.remove = function(path) {
    if (this.isEmpty()) {
        return this
    }
    let node = this.root
    let offset = node.path.length
    let pathLength = path.length
    let passedNodes = []
    node_loop:
    while(node) {
        passedNodes.push(node)
        if (pathLength === offset) {
            break
        }
        if (!node.children.length) {
            return this
        }
        for (let index = 0; index < node.children.length; index++) {
            let child = node.children[index]
            if (path[offset] === child.path[0] && path.indexOf(child.path, offset) === offset) {
                node = child
                offset += node.path.length
                continue node_loop
            }
        }
    }

}

RadixTree.prototype.clear = function() {
    this.root = null
    return this
}

RadixTree.prototype.find = function(path) {
    if (this.isEmpty()) {
        return undefined
    }
    let node = this.root
    let offset = node.path.length
    let pathLength = path.length
    node_loop:
    while(node) {
        if (pathLength === offset) {
            let prefix_list = []
            prefix_list.push(node.path.charAt(0))
            let cur_node = node
            node = node.par
            while (node.par) {
                prefix_list.push(node.path);
                node = node.par
            }
            prefix_list.reverse()
            let result = { prefix: prefix_list.reduce(function(pv, cv) { return pv + cv; }),
                            suffix: cur_node.path.substr(1),
                            full: cur_node.fullPath}
            if (node.data) { result.data = node.data }
            return result
        }
        if (!node.children.length) { break }
        for (let index = 0; index < node.children.length; index++) {
            let child = node.children[index]
            if(path[offset] === child.path[0] && path.indexOf(child.path, offset) === offset) {
                par = node
                node = child
                offset += node.path.length
                continue node_loop
            }
        }
        break
    }
    return undefined
}
