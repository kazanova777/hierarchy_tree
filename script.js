/*

made by Zholdas Aldanbergen, 2023*

*/

// Read the JSON data and start the visualization process
d3.json("data.json").then(function(treeData) {

    // Set margins, width, and height for the SVG
    var margin = { top: 20, right: 90, bottom: 30, left: 90 },
        width = window.innerWidth - margin.left - margin.right,
        height = window.innerHeight - margin.top - margin.bottom;

    // Variables for animation and identification
    var i = 0,
    duration = 750,
    root;

    // Create a tooltip div that is initially hidden
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    // Convert the JSON data into a hierarchy suitable for d3
    var root = d3.hierarchy(treeData, function(d) {
        return d.children;
    });

    // Calculate the number of leaf nodes
    var leafNodes = root.leaves().length;

    const nodeWidth = 200;

    function wrapText(text, width) {
        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1,  // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("y", y).attr("x", 0).attr("dy", dy + "em"),
                truncated = false;
    
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" ") + (words.length ? "..." : "")); // Add ellipsis if there are more words
                    truncated = words.length > 0; // Mark the text as truncated
                    break;
                }
            }
    
            // Store the truncated status on the data
            text.datum().isTruncated = truncated;
        });
    }
    
    // Adjust the height based on the leaf nodes count
    const nodeHeight = 60; 

    root.x0 = height / 2;
    root.y0 = width / 2;
    
    // Create an SVG element
    var mainSvg = d3.select("#visualization")
        .append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom);

    var svgGroup = mainSvg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Store zoom behavior in a variable
    var zoomBehavior = d3.zoom().on("zoom", function(event) {
        svgGroup.attr("transform", event.transform);
    });
    mainSvg.call(zoomBehavior);
    
    root.children.forEach(collapse);

    // Define a d3 tree layout with specified size and separation logic between nodes
    var treeLayout = d3.tree()
        .nodeSize([100, 100])  
        .separation(function(a, b) {
            return a.parent == b.parent ? 1 : 2;
        });

            
    // Compute the tree's depth
    var maxDepth = 0;
    root.each(function(d) {
        if (d.depth > maxDepth) {
            maxDepth = d.depth;
        }
    });

    // Adjust separation based on the tree's depth
    var separationMultiplier = Math.max(1, (maxDepth / 10)); 

    treeLayout.separation(function(a, b) {
        return (a.parent == b.parent ? 1 : 2) * separationMultiplier;
    });

    
    // Start the visualization by updating
    console.log("Before update:", root.x0, root.y0);
    update(root);
    console.log("After update:", root.x0, root.y0);

    // Set up your initial view
    var yOffset = root.x0 - window.innerHeight / 2 + nodeHeight / 2;
    var xOffset = root.y0 - width / 2 + nodeWidth / 2;

    // Update the zoom behavior's internal transform state
    var initialTransform = d3.zoomIdentity.translate(-xOffset + margin.left, -yOffset + margin.top);
    zoomBehavior.transform(mainSvg, initialTransform);
    
    // function for zooming to the main node
    function zoomToRoot() {
        const nodeX = root.x0;
        const nodeY = root.y0;
        
        // Ensure that when zooming, the node comes to the center of the viewport.
        const xOffset = width / 2 - nodeY;
        const yOffset = height / 2 - nodeX;
    
        console.log("nodeX:", nodeX, "nodeY:", nodeY, "xOffset:", xOffset, "yOffset:", yOffset);
     
        const transform = d3.zoomIdentity.translate(xOffset + margin.left, yOffset + margin.top);
        mainSvg.transition().duration(800).call(zoomBehavior.transform, transform);
    }
    
    document.getElementById('zoomButton').addEventListener('click', function() {
        zoomToRoot();
    });
     
    
    // Function to collapse all children of a node
    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
            d._children.forEach(collapse);
        }
    }

    // Core function to compute the position of nodes and links, draw them, and update the visualization
    function update(source) {
    var treeData = treeLayout(root);  
    var nodes = treeData.descendants()
    var links = treeData.descendants().slice(1).filter(function(d) {
        return d.parent;  // Ensure the node has a parent, which means it should have a link
    });

    nodes.forEach(function(d) {
        d.y = d.depth * 400;
        if (d.parent && d.parent.data.position === "left") {
            d.data.position = "left";
            d.y = -d.y;
        }
        else if (d.data.position && d.data.position === "left") {
            d.y = -d.y;
        }
        
        d.x0 = d.x;
        d.y0 = d.y;
    });
    var node = svgGroup.selectAll("g.node").data(nodes, function(d) {
        return d.id || (d.id = ++i);
    });

    // The following code includes the logic for drawing and updating nodes, texts, images (icons), and links
    var nodeEnter = node
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
    })
        .attr("data-node-name", function(d) {
            return d.data.name;
        });
        

    nodeEnter
    .on("mouseover", function(event, d) {
        tooltip.transition()
               .duration(200)
               .style("opacity", .9);
        tooltip.html(d.data.name) // Assuming d.data.name contains the text you want to show in the tooltip.
               .style("left", (event.pageX + 5) + "px")
               .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
        tooltip.transition()
               .duration(500)
               .style("opacity", 0);
    });
    nodeEnter
    .filter(function(d) {
        return d.children || d._children; 
    })
    .on("click", function(event, d) { 
        click(d); 
    });

    nodeEnter
        .attr("class", "node")
        .attr("r", function(d) {
            return d.depth === 0 ? 50 : 30; // If it's the main node (depth of 0), set a bigger radius, otherwise use a smaller radius.
        })
        .style("fill", function(d) {
            return d.depth === 0 ? "#fff" : "#fff"; // If it's the main node, use a different color.
        });
    
    function truncate(str, maxLength, suffix) {
        if (str.length > maxLength) {
            str = str.substring(0, maxLength + 1); 
            str = str.substring(0, Math.min(str.length, str.lastIndexOf(" ")));  // Find the last space within maxLength
            str = str + suffix;
        }
        return str;
    }
    
    var maxTextLength = 100; // You can adjust this based on your requirement
    var texts = nodeEnter.append("text")
        .style("fill", "black")
        .attr("dy", "0em")  // Adjust based on your preference
        .attr("text-anchor", "middle")
        .attr("x", 0)  // Center it by placing at x=0
        .text(function(d) {
            var originalText = d.data.name;
            return truncate(originalText, maxTextLength, "...");
        });
    
    wrapText(texts, nodeWidth - 10);  // Using 10 as a buffer
    
    texts.each(function(d) {
        d.bbox = this.getBBox();
    });

    var iconWidth = 20;
    var iconHeight = 20;
    var iconSpacing = 5; 

    nodeEnter.append("image")
        .attr("xlink:href", function(d) {
            return d.data.icon;  
        })
        .attr("width", iconWidth)
        .attr("height", iconHeight)
        .attr("x", function(d) {
            return d.bbox.x - iconWidth - iconSpacing;
        })
        .attr("y", function(d) {
            return d.bbox.y + (d.bbox.height - iconHeight) / 2;  
        });

    nodeEnter.insert("rect", "text")
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("stroke-width", function(d) {
            return d.depth === 0 ? 3 : 1; // Thicker stroke for the main node
        })
        .attr("stroke", function(d) {
            return d.depth === 0 ? "#228B22" : "black"; // Different stroke color for the main node
        })
        .attr("x", -nodeWidth/2) 
        .attr("y", -nodeHeight/2)
        .attr("width", nodeWidth) 
        .attr("height", nodeHeight);
    
    nodeEnter.each(function(d) {
        if (!d.children && !d._children && d.data.url) {
            var node = d3.select(this);
            var link = d.data.url;
            var bbox = node.node().getBBox();

            // Append the link icon to the right of the node
            node.append("text")
                .attr("class", "link-icon")
                .attr("x", bbox.width / 2 + 5)  // Adjust this value if needed
                .attr("y", 0)
                .text("\uD83D\uDD17")
                .on("click", function() {
                    window.open(link);
                });
        }
    });

    var nodeUpdate = nodeEnter.merge(node);

    nodeUpdate
        .transition()
        .duration(duration)
        .attr("transform", function(d) {
        return "translate(" + d.y + "," + d.x + ")";
    })
    .end().then(drawLinks); // the drawLinks function will be called when node transition is completed
    var nodeExit = node
        .exit()
        .transition()
        .duration(duration)
        .attr("transform", function(d) {
        return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();
    nodeExit.select("rect").style("opacity", 1e-6);
    nodeExit.select("rect").attr("stroke-opacity", 1e-6);
    nodeExit.select("text").style("fill-opacity", 1e-6);

    var childTexts = nodeEnter.append("text")
        .style("fill", "black")
        .attr("dy", "0em")
        .attr("text-anchor", "middle")
        .attr("x", 0)  
        .text(function(d) {
            var count = d.children ? d.children.length : (d._children ? d._children.length : "");
            return count;
        });

    // Adjust position based on node height
    childTexts.attr("y", function(d) {
        var node = d3.select(this.parentNode);  // Get parent 'g' element of the text
        var bbox = node.node().getBBox();
        return bbox.height / 2 + 15;  // Adjust 15 if needed
    });
    
    var link = svgGroup.selectAll("path.link").data(links, function(d) {
        return d.id;
    });
    var linkEnter = link
        .enter()
        .insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
            var o = { x: source.x0, y: source.y0 };
            return diagonal(o, o);
        });
    var linkUpdate = linkEnter.merge(link);
    linkUpdate
        .transition()
        .duration(duration)
        .attr("d", function(d) {
        return diagonal(d, d.parent);
        });
    function drawLinks() {
        linkUpdate
            .transition()
            .duration(duration)
            .attr("d", function(d) {
            return diagonal(d, d.parent);
        });
    }
        
    var linkExit = link
        .exit()
        .transition()
        .duration(duration)
        .attr("d", function(d) {
            var o = { x: source.x, y: source.y };
            return diagonal(o, o);
        })
        .remove();
    
    // the fucntion to that calculates the Bezier curve links 
    function diagonal(s, d) {
        const path = `
            M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
            ${(s.y + d.y) / 2} ${d.x},
            ${d.y} ${d.x}
        `;
        return path;
    }
    
    // Click event handler for nodes, so the nodes are clickable
    function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else if (d._children) {  
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }    
    }

    // declaring the GenerationSelector, and binding it to the button
    d3.select("#generationSelector").on("change", function() {
        const selectedGeneration = +this.value;
    
        // Step 1: Reset all nodes to be fully expanded
        function fullyExpand(node) {
            if (node._children) {
                node.children = (node.children || []).concat(node._children);
                node._children = null;
            }
            if (node.children) {
                node.children.forEach(fullyExpand);
            }
        }
        fullyExpand(root);
    
        // Step 2: Adjust tree based on the dropdown
        function adjustTree(node, depth) {
            if (depth > selectedGeneration) {
                if (node.children) {
                    node._children = node.children;
                    node.children = null;
                }
            }
            if (node.children) {
                node.children.forEach(child => adjustTree(child, depth + 1));
            }
        }
    
        adjustTree(root, 1);  // root is considered 1st generation
        update(root);
    });
    
    let previouslyExpanded = []; // to keep track of nodes expanded in the previous search

    // declaring the searching algorigthm, and binding it to the button
    document.getElementById("searchButton").addEventListener("click", function() {

        // 1. Un-highlight previously highlighted nodes
        const highlightedNodes = document.querySelectorAll('.node.highlight');
        highlightedNodes.forEach(node => {
            node.classList.remove('highlight');
        });

        // 2. Collapse paths expanded from the previous search
        previouslyExpanded.forEach(collapseNode);
        previouslyExpanded = []; // reset it for the current search

        const searchValue = document.getElementById("searchField").value.trim();
        
        if (!searchValue) return;
        
        const targetNodes = findNodesByName(root, searchValue);

        if (targetNodes.length > 0) {
            targetNodes.forEach(targetNode => {
                expandPathToNode(targetNode);
                previouslyExpanded.push(targetNode);
            });
            
            // Reflect expanded nodes in the DOM
            update(root);
            
            // 3. Highlight the nodes after the DOM has been updated
            targetNodes.forEach(targetNode => {
                highlightNode(targetNode);
            });
        } else {
            alert("Node not found!");
        }
    });

    // Collapse a given node by hiding its children
    function collapseNode(node) {
        if (node.children) {
            node._children = node._children || node.children;
            node.children = null;
        }
    }

    // Recursively search for nodes whose name includes the given name
    function findNodesByName(node, name) {
        let matches = [];
        
        if (node.data.name.toLowerCase().includes(name.toLowerCase())) {
            matches.push(node);
        }
    
        let children = [].concat(node.children || [], node._children || []);
        for (let child of children) {
            matches = matches.concat(findNodesByName(child, name));
        }
        
        return matches;
    }

    // Recursively expand a node and all its descendants
    function expandNodeAndDescendants(node) {
        if (node._children) {
            node.children = node._children;
            node._children = null;
        }
        
        if (node.children) {
            node.children.forEach(expandNodeAndDescendants);
        }
    }
    
    // Expand a node and its path to the root node
    function expandPathToNode(node) {
        let currentNode = node;
    
        // Expand the node itself and all its descendants
        expandNodeAndDescendants(currentNode);
        
        // Traverse up the tree to ensure the whole path from the node to the root is expanded
        while (currentNode.parent) {
            if (currentNode._children) {
                currentNode.children = currentNode._children;
                currentNode._children = null;
            }
            currentNode = currentNode.parent;
        }
    }
    
    // Utility function to escape double quotes in a string
    function escapeQuotes(str) {
        return str.replace(/"/g, '\\"');
    }
    
    
    function highlightNode(node) {
        const escapedName = escapeQuotes(node.data.name);
        const nodeElement = document.querySelector(`.node[data-node-name="${escapedName}"]`);
            
        if (nodeElement) {
            nodeElement.classList.add('highlight');
        }
    }
      

    document.getElementById("resetButton").addEventListener("click", resetTree);
 
    // This function refreshes everything(cleaning the paths, highlights)  
    function resetTree() {

        // Remove highlight from all nodes
        const highlightedNodes = document.querySelectorAll('.node.highlight');
        highlightedNodes.forEach(node => {
            node.classList.remove('highlight');
        });
    
        // Collapse all nodes
        collapse(root);
    
        // Redraw or update tree if necessary
        update(root);
        zoomToRoot();
    }
    
    function collapse(node) {
        if (node.children) {
            node._children = node.children;
            node._children.forEach(collapse);
            node.children = null;
        }
    }
});