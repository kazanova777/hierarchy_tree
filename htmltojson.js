/*

made by Zholdas Aldanbergen, 2023*

*/


const fs = require('fs');
const cheerio = require('cheerio');

// Base URL for constructing full URLs from page IDs
const BASE_URL = "https://confluence.ecc.kz/pages/viewpage.action?pageId=";

// Load the content of a file and return it as a string
function loadHtmlContent(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}

// Parse the provided HTML string and extract structured data
function extractDataFromHtml(htmlContent) {
    const $ = cheerio.load(htmlContent);
    
    // Recursively extract data from HTML elements
    function extractData(element) {
        const children = [];
        
        // Iterate through direct `li` children of `ul`
        $(element).find('> ul > li').each((i, childElement) => {
            const anchor = $(childElement).find('> a');
            const pageId = anchor.attr('href').replace('.html', '');
            const fullUrl = `${BASE_URL}${pageId}`;
            const childData = {
                name: anchor.text(),
                url: fullUrl,
                // If this element has further nested children nodes, then recursively capture them
                ...(extractData(childElement).length ? { children: extractData(childElement) } : {})
            };
            children.push(childData);
        });

        return children;
    }

    // Capture the grandparent name based on the specific structure you provided
    const grandparentName = $('th.confluenceTh').filter((i, element) => {
        return $(element).text().trim() === "Name";
    }).next().text().trim();
    const children = extractData($('.pageSection'));
    
    return {
        name: grandparentName,
        children: children
    };
}

function addPositionLeftToAllNodes(data) {
    data.position = "left"; // Add to the current node

    if (Array.isArray(data.children)) {
        data.children.forEach(child => {
            addPositionLeftToAllNodes(child);  // Recursive call
        });
    }
}


// Load and extract data from both HTML files
const data1 = extractDataFromHtml(loadHtmlContent('eminfin.html'));
const data2 = extractDataFromHtml(loadHtmlContent('isgb.html'));
const data3 = extractDataFromHtml(loadHtmlContent('ecd.html'));

// Add "position": "left" to all nodes in data2
addPositionLeftToAllNodes(data2);


// Combine the results
const combinedData = {
    name: "EFC",
    children: [data1, data2, data3]
};

// Write combined result to output JSON file
fs.writeFileSync('data.json', JSON.stringify(combinedData, null, 2));