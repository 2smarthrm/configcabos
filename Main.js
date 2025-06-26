//  - Criar Banco de dados dos produtos & combinações de configuração

let QuantityInputValue = 1;
let DB = [];
if (!localStorage.getItem("products")) {
    fetch('data.json').then(response => response.json()).then(data => {
        localStorage.setItem('products', JSON.stringify(data));
        DB = JSON.parse(localStorage.getItem("products"));
    }).catch(error => console.error('Error loading JSON:', error));
} else {
    DB = JSON.parse(localStorage.getItem("products"));
}


function formatArrayForCode(array) {
    const jsonStr = JSON.stringify(array, null, 2);
    const res = jsonStr.replace(/"([a-zA-Z_][a-zA-Z0-9_]*)":/g, '$1:');
    return eval('(' + res + ')');
}

const newDatabase = formatArrayForCode(DB);


function GetproductsByCategory(category) {
    let newItens = [];
    newDatabase.forEach(element => {
        if (!element.categories) return;
        element.categories.forEach(cat => {
            if (category.toLowerCase() === cat.toLowerCase()) {
                let namesplit = element.name.toLowerCase().split(" ");

                if (namesplit.includes("kit")) return;
                newItens.push(element);
            }
        });
    });
    return newItens;
}


// algumas vezes os conectore e terminais poderao estar assim nos nomes e descrições: 2SC/PC - MTRJ/PC
function extractConnectorColorCombinations(DB) {
    const validConnectors = ["LC", "SC", "FC", "ST", "E2000", "2SC"];
    const validTerminations = ["UPC", "APC", "PC"];
    const validColors = ["Azul", "Amarela", "Amarelo", "Laranja", "Verde", "Vermelha", "Vermelho", "Cinza", "Rosa", "Preta", "Branca", "Branco", "Preto"];

    const seen = new Set();
    const results = [];

    DB.forEach(product => {
        const fullText = (product.name + " " + product.description).toUpperCase();

        validConnectors.forEach(connector => {
            validTerminations.forEach(term => {
                const normalizedTerm = (term === "PC") ? "UPC" : term;
                const pattern = new RegExp(`\\b${connector}\\s*/\\s*${term}\\b`, "i");

                if (pattern.test(fullText)) {
                    let foundColor = null;

                    for (const color of validColors) {
                        if (fullText.includes(color.toUpperCase())) {
                            foundColor = color;
                            break;
                        }
                    }

                    const key = `${connector}_${normalizedTerm}_${foundColor}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        results.push({
                            conector: connector,
                            termination: normalizedTerm,
                            color: foundColor,  // será null se não encontrar
                            source: null
                        });
                    }
                }
            });
        });
    });

    return results;
}


function GetRealFormatProducts(produtos) {
    return produtos.map(produto => {
        const typeFiberMatch = produto.name.match(/OM\d\s?50\/125|OM\d|G657[AB]?\d?|G652D|OM\d\s?62\.5\/125/i);
        let type_fyber = typeFiberMatch ? typeFiberMatch[0].replace(/\s/g, '').replace('OM', 'OM') : null;

        let mode = null;
        if (/multimodo|multimode|OM\d/i.test(produto.name)) {
            mode = "MM";
        } else if (/monomodo|singlemode|G652|G657/i.test(produto.name)) {
            mode = "SM";
        }

        console.log("produto = ", produto)
        const fiber_number = produto.name.includes("Duplex") || produto.description.includes("2 Metros") ? "2 - fibras duplex" : "1 - fibra simplex";

        const connectorMatch = produto.name.match(/(LC|SC|FC|ST|E2000|D4)/i);
        const connector = connectorMatch ? connectorMatch[0].toUpperCase() : null;
        const termination = "PC";

        return {
            name: produto.name,
            sku: produto.sku,
            link: produto.link,
            connector_a: connector,
            termination_a: termination,
            connector_b: connector,
            termination_b: termination,
            fiber_number: fiber_number,
            mode: mode,
            type_fyber: type_fyber,
            images: {
                img_1: produto.image_url || "",
                img_2: "",
                img_3: ""
            }
        };
    });
}

function GetProducts(name) {
    let newItens = [];
    newDatabase.forEach(element => {
        let namesplit = element.name.toLowerCase().split(" ");
        if (namesplit[0] !== name.toLowerCase()) return;
        newItens.push(element);
    });
    return GetRealFormatProducts(newItens);
}


const ProductsDatabase = {
    jumpers: {
        sidesdata: extractConnectorColorCombinations(GetProducts("jumper")),
        database: GetProducts("jumper")
    },
    pigtails: {
        sidesdata: extractConnectorColorCombinations(GetProducts("pigtail")),
        database: GetProducts("pigtail")
    },
    multifiber: {
        sidesdata: extractConnectorColorCombinations(GetProducts("multifiber")),
        database: GetProducts("multifiber")
    }
}


function GetCablesImages() {
    const Imagesdiv = document.createElement("div");
    Imagesdiv.innerHTML = `
    ORANGE ------*****
    <a href="https://ibb.co/ynXGTq2g"><img src="https://i.ibb.co/0jc8Nr5Y/c-L.png" alt="c-L" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/VWk684PY/2din-pc-L-A.png" alt="2din-pc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/ksLMpT9F/2fc-pc-L.png" alt="2fc-pc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/sdtvqX0v/2lc-pc-L-A.png" alt="2lc-pc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/ccSgw9x8/2mu-pc-L.png" alt="2mu-pc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/60Zkjk4V/2sc-pc-L.png" alt="2sc-pc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/4ZGz73BY/2st-pc-L.png" alt="2st-pc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/5gbqTwym/mtrl-pc-L-A.png" alt="mtrl-pc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/KpVDTP2D/mpo-pc-L-A.png" alt="mpo-pc-L-A" border="0"></a> 

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/VWk684PY/2din-pc-L-A.png" alt="2din-upc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/ksLMpT9F/2fc-pc-L.png" alt="2fc-upc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/sdtvqX0v/2lc-pc-L-A.png" alt="2lc-upc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/ccSgw9x8/2mu-pc-L.png" alt="2mu-upc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/60Zkjk4V/2sc-pc-L.png" alt="2sc-upc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/4ZGz73BY/2st-pc-L.png" alt="2st-upc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/5gbqTwym/mtrl-pc-L-A.png" alt="mtrl-upc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/KpVDTP2D/mpo-pc-L-A.png" alt="mpo-upc-L-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Sqx80Gp/mpo-pc-L-B.png" alt="mpo-pc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/cqdLf1s/2din-pc-L-B.png" alt="2din-pc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/ccM76XkX/2fc-pc-L-B.png" alt="2fc-pc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/0jhcSb8S/2lc-pc-L-B.png" alt="2lc-pc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/XkFtWd6b/2mu-pc-L-B.png" alt="2mu-pc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/35r1gP0V/2sc-pc-L-B.png" alt="2sc-pc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/pBf0HvDw/2st-pc-L-B.png" alt="2st-pc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/KxWRYgNj/mtrl-pc-L-B.png" alt="mtrl-pc-L-B" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Sqx80Gp/mpo-pc-L-B.png" alt="mpo-upc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/cqdLf1s/2din-pc-L-B.png" alt="2din-upc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/ccM76XkX/2fc-pc-L-B.png" alt="2fc-upc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/0jhcSb8S/2lc-pc-L-B.png" alt="2lc-upc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/XkFtWd6b/2mu-pc-L-B.png" alt="2mu-upc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/35r1gP0V/2sc-pc-L-B.png" alt="2sc-upc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/pBf0HvDw/2st-pc-L-B.png" alt="2st-upc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/KxWRYgNj/mtrl-pc-L-B.png" alt="mtrl-upc-L-B" border="0"></a>


    GREEN --------*****
    <a href="https://ibb.co/HTsMJmMn"><img src="https://i.ibb.co/whXbvDbM/c-v.png" alt="c-V" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/JRNtqtwX/2din-pc-V-A.png" alt="2din-pc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/JRDyjjkL/2fc-pc-V-A.png" alt="2fc-pc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/nsJwJ4sr/2lc-pc-V-A.png" alt="2lc-pc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/1tJ7C0Cq/2mu-pc-V-A.png" alt="2mu-pc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/hhWY8tn/2sc-pc-V-A.png" alt="2sc-pc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/gFzWXdZD/2st-pc-V-A.png" alt="2st-pc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/MDj53J2L/mpo-pc-V-A.png" alt="mpo-pc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/tp9Rg9v1/mtrl-pc-V-A.png" alt="mtrl-pc-V-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/JRNtqtwX/2din-pc-V-A.png" alt="2din-upc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/JRDyjjkL/2fc-pc-V-A.png" alt="2fc-upc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/nsJwJ4sr/2lc-pc-V-A.png" alt="2lc-upc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/1tJ7C0Cq/2mu-pc-V-A.png" alt="2mu-upc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/hhWY8tn/2sc-pc-V-A.png" alt="2sc-upc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/gFzWXdZD/2st-pc-V-A.png" alt="2st-upc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/MDj53J2L/mpo-pc-V-A.png" alt="mpo-upc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/tp9Rg9v1/mtrl-pc-V-A.png" alt="mtrl-upc-V-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/DHS63tv8/2din-pc-V-B.png" alt="2din-pc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/TqN8Vd8r/2fc-pc-V-B.png" alt="2fc-pc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/GfRbWLtp/2lc-pc-V-B.png" alt="2lc-pc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/xq8HD42y/2mu-pc-V-B.png" alt="2mu-pc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/2YCbP7yJ/2sc-pc-V-B.png" alt="2sc-pc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/YTQssP20/2st-pc-V-B.png" alt="2st-pc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Gb4KqnN/mpo-pc-V-B.png" alt="mpo-pc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/LdhLYBzd/mtrl-pc-V-B.png" alt="mtrl-pc-V-B" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/DHS63tv8/2din-pc-V-B.png" alt="2din-upc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/TqN8Vd8r/2fc-pc-V-B.png" alt="2fc-upc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/GfRbWLtp/2lc-pc-V-B.png" alt="2lc-upc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/xq8HD42y/2mu-pc-V-B.png" alt="2mu-upc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/2YCbP7yJ/2sc-pc-V-B.png" alt="2sc-upc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/YTQssP20/2st-pc-V-B.png" alt="2st-upc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Gb4KqnN/mpo-pc-V-B.png" alt="mpo-upc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/LdhLYBzd/mtrl-pc-V-B.png" alt="mtrl-upc-V-B" border="0"></a>



    PURPLE -----------*******
    <a href="https://ibb.co/Jj0C5j36"><img src="https://i.ibb.co/jkBHgkJ0/c-r.png" alt="c-r" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Fq4j4gmS/2din-pc-R-A.png" alt="2din-pc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/PzM0r705/2fc-pc-R-A.png" alt="2fc-pc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/XZ77nPXL/2lc-pc-R-A.png" alt="2lc-pc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Y4FdHGdV/2mu-pc-R-A.png" alt="2mu-pc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/HfDTZy1K/2sc-pc-R-A.png" alt="2sc-pc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/wFrHfRYs/2st-pc-R-A.png" alt="2st-pc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/s9dJyGpr/mpo-pc-R-A.png" alt="mpo-pc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/m5ZwjxNq/mtrl-pc-R-A.png" alt="mtrl-pc-R-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Fq4j4gmS/2din-pc-R-A.png" alt="2din-upc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/PzM0r705/2fc-pc-R-A.png" alt="2fc-upc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/XZ77nPXL/2lc-pc-R-A.png" alt="2lc-upc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Y4FdHGdV/2mu-pc-R-A.png" alt="2mu-upc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/HfDTZy1K/2sc-pc-R-A.png" alt="2sc-upc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/wFrHfRYs/2st-pc-R-A.png" alt="2st-upc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/s9dJyGpr/mpo-pc-R-A.png" alt="mpo-upc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/m5ZwjxNq/mtrl-pc-R-A.png" alt="mtrl-upc-R-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/LzDdcprD/2din-pc-R-B.png" alt="2din-pc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/S45th9mz/2fc-pc-R-B.png" alt="2fc-pc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/m53jbh6R/2lc-pc-R-B.png" alt="2lc-pc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/jZWp6ndp/2mu-pc-R-B.png" alt="2mu-pc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/ynpKpLNb/2sc-pc-R-B.png" alt="2sc-pc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/7xg6H7Vc/2st-pc-R-B.png" alt="2st-pc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/mF6Mn3p8/mpo-pc-R-B.png" alt="mpo-pc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/5grzpyfZ/mtrl-pc-R-B.png" alt="mtrl-pc-R-B" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/LzDdcprD/2din-pc-R-B.png" alt="2din-upc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/S45th9mz/2fc-pc-R-B.png" alt="2fc-upc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/m53jbh6R/2lc-pc-R-B.png" alt="2lc-upc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/jZWp6ndp/2mu-pc-R-B.png" alt="2mu-upc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/ynpKpLNb/2sc-pc-R-B.png" alt="2sc-upc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/7xg6H7Vc/2st-pc-R-B.png" alt="2st-upc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/mF6Mn3p8/mpo-pc-R-B.png" alt="mpo-upc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/5grzpyfZ/mtrl-pc-R-B.png" alt="mtrl-upc-R-B" border="0"></a>


    YELLOW -----------*******
    <a href="https://ibb.co/Df19vXW2"><img src="https://i.ibb.co/zVmXBcxv/c-A.png" alt="c-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/mVm2tZbd/2din-pc-A-A.png" alt="2din-pc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/BvhVWjV/2fc-pc-A-A.png" alt="2fc-pc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/chwTLD40/2lc-apc-A-A.png" alt="2lc-apc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/sdMVJTrC/2lc-upc-A-A.png" alt="2lc-upc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/XkXW80jx/2mu-pc-A-A.png" alt="2mu-pc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/s9cJfvtS/2sc-apc-A-A.png" alt="2sc-apc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/d0Cn0PQ1/2sc-upc-A-A.png" alt="2sc-upc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/8gZqzBr8/2st-pc-A-A.png" alt="2st-pc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/r9YjsSG/e2000-apc-A-A.png" alt="e2000-apc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/bjSDb3nK/e2000-upc-A-A.png" alt="e2000-upc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/nNP5pVZG/mpo-pc-A-A.png" alt="mpo-pc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/8nkjK22z/mtrl-pc-A-A.png" alt="mtrl-pc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/20hSx9j3/2din-pc-A-B.png" alt="2din-pc-A-B" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/mVm2tZbd/2din-pc-A-A.png" alt="2din-upc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/BvhVWjV/2fc-pc-A-A.png" alt="2fc-upc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/chwTLD40/2lc-apc-A-A.png" alt="2lc-apc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/sdMVJTrC/2lc-upc-A-A.png" alt="2lc-pc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/XkXW80jx/2mu-pc-A-A.png" alt="2mu-upc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/s9cJfvtS/2sc-apc-A-A.png" alt="2sc-apc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/d0Cn0PQ1/2sc-upc-A-A.png" alt="2sc-pc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/8gZqzBr8/2st-pc-A-A.png" alt="2st-upc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/r9YjsSG/e2000-apc-A-A.png" alt="e2000-apc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/bjSDb3nK/e2000-upc-A-A.png" alt="e2000-pc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/nNP5pVZG/mpo-pc-A-A.png" alt="mpo-upc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/8nkjK22z/mtrl-pc-A-A.png" alt="mtrl-upc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/20hSx9j3/2din-pc-A-B.png" alt="2din-upc-A-B" border="0"></a>


    <a href="https://imgbb.com/"><img src="https://i.ibb.co/VWw0tZP7/2fc-pc-A-B.png" alt="2fc-pc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/gZ0KGnt1/2lc-apc-A-B.png" alt="2lc-apc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/N6FwZdGJ/2lc-upc-A-B.png" alt="2lc-upc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/S9Mz72h/2mu-pc-A-B.png" alt="2mu-pc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/bgT2y0tQ/2sc-apc-A-B.png" alt="2sc-apc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/HDCFpKsN/2sc-upc-A-B.png" alt="2sc-upc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/RGh7MD2d/2st-pc-A-B.png" alt="2st-pc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/ksz256BX/e2000-apc-A-B.png" alt="e2000-apc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/PG0TV1h3/e2000-upc-A-B.png" alt="e2000-upc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/fY2M4rZV/mpo-pc-A-B.png" alt="mpo-pc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/TxYMtGJj/mtrl-pc-A-B.png" alt="mtrl-pc-A-B" border="0"></a>

     <a href="https://imgbb.com/"><img src="https://i.ibb.co/VWw0tZP7/2fc-pc-A-B.png" alt="2fc-upc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/gZ0KGnt1/2lc-apc-A-B.png" alt="2lc-apc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/N6FwZdGJ/2lc-upc-A-B.png" alt="2lc-pc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/S9Mz72h/2mu-pc-A-B.png" alt="2mu-upc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/bgT2y0tQ/2sc-apc-A-B.png" alt="2sc-apc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/HDCFpKsN/2sc-upc-A-B.png" alt="2sc-pc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/RGh7MD2d/2st-pc-A-B.png" alt="2st-upc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/ksz256BX/e2000-apc-A-B.png" alt="e2000-apc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/PG0TV1h3/e2000-upc-A-B.png" alt="e2000-pc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/fY2M4rZV/mpo-pc-A-B.png" alt="mpo-upc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/TxYMtGJj/mtrl-pc-A-B.png" alt="mtrl-upc-A-B" border="0"></a>




    // BLUE ---------------******
    <a href="https://ibb.co/Tq0wvSw9"><img src="https://i.ibb.co/JFpcB4cD/c-azul.png" alt="c-B" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/nNQc9Fb8/2din-pc-B-A.png" alt="2din-pc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/qYnNDD2F/2fc-pc-B-A.png" alt="2fc-pc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/XMCzsf7/2lc-pc-B-A.png" alt="2lc-pc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/VW1cdbBz/2mu-pc-B-A.png" alt="2mu-pc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Kz2Z5CjV/2sc-pc-B-A.png" alt="2sc-pc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/rKHvCwj5/2st-pc-B-A.png" alt="2st-pc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/WNtCzBr1/mpo-pc-B-A.png" alt="mpo-pc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/KxK18LCf/mtrl-pc-B-A.png" alt="mtrl-pc-B-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/nNQc9Fb8/2din-pc-B-A.png" alt="2din-upc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/qYnNDD2F/2fc-pc-B-A.png" alt="2fc-upc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/XMCzsf7/2lc-pc-B-A.png" alt="2lc-upc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/VW1cdbBz/2mu-pc-B-A.png" alt="2mu-upc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Kz2Z5CjV/2sc-pc-B-A.png" alt="2sc-upc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/rKHvCwj5/2st-pc-B-A.png" alt="2st-upc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/WNtCzBr1/mpo-pc-B-A.png" alt="mpo-upc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/KxK18LCf/mtrl-pc-B-A.png" alt="mtrl-upc-B-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/pjLsQ58b/2din-pc-B-B.png" alt="2din-pc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/bRmN3SG7/2fc-pc-B-B.png" alt="2fc-pc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/WWwPbrQD/2lc-pc-B-B.png" alt="2lc-pc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/wr2BPm3s/2mu-pc-b-B.png" alt="2mu-pc-b-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/ksCJn0vb/2sc-pc-B-B.png" alt="2sc-pc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/k26GtKvV/2st-pc-B-B.png" alt="2st-pc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/MD8vY41q/mpo-pc-B-B.png" alt="mpo-pc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/m58ZdMPw/mtrl-pc-B-B.png" alt="mtrl-pc-B-B" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/pjLsQ58b/2din-pc-B-B.png" alt="2din-upc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/bRmN3SG7/2fc-pc-B-B.png" alt="2fc-upc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/WWwPbrQD/2lc-pc-B-B.png" alt="2lc-upc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/wr2BPm3s/2mu-pc-b-B.png" alt="2mu-upc-b-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/ksCJn0vb/2sc-pc-B-B.png" alt="2sc-upc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/k26GtKvV/2st-pc-B-B.png" alt="2st-upc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/MD8vY41q/mpo-pc-B-B.png" alt="mpo-upc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/m58ZdMPw/mtrl-pc-B-B.png" alt="mtrl-upc-B-B" border="0"></a>


    // WATER --------------------*******
    <a href="https://ibb.co/cSshRtCp"><img src="https://i.ibb.co/4n0RCMYD/c-w.png" alt="c-w" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/gbpMTxgr/2din-pc-W-A.png" alt="2din-pc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/mZjXxC5/2fc-pc-W-A.png" alt="2fc-pc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/0wgp5y9/2lc-pc-W-A.png" alt="2lc-pc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/bZyZd8P/2mu-pc-R-A.png" alt="2mu-pc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/sdQwksry/2sc-pc-W-A.png" alt="2sc-pc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/kVFJpPBs/2st-pc-W-A.png" alt="2st-pc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/39pThqMP/mpo-pc-W-A.png" alt="mpo-pc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/j9Kgpp8X/mtrl-pc-W-A.png" alt="mtrl-pc-W-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/gbpMTxgr/2din-pc-W-A.png" alt="2din-upc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/mZjXxC5/2fc-pc-W-A.png" alt="2fc-upc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/0wgp5y9/2lc-pc-W-A.png" alt="2lc-upc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/bZyZd8P/2mu-pc-R-A.png" alt="2mu-upc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/sdQwksry/2sc-pc-W-A.png" alt="2sc-upc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/kVFJpPBs/2st-pc-W-A.png" alt="2st-upc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/39pThqMP/mpo-pc-W-A.png" alt="mpo-upc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/j9Kgpp8X/mtrl-pc-W-A.png" alt="mtrl-upc-W-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/9k0Zv5FR/2din-pc-W-B.png" alt="2din-pc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/RptGZRJ4/2fc-pc-W-B.png" alt="2fc-pc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/RTLK1nSn/2lc-pc-W-B.png" alt="2lc-pc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/tMSyQfkh/2mu-pc-W-B.png" alt="2mu-pc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Jj7fqpmJ/2sc-pc-w-B.png" alt="2sc-pc-w-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Vcph6sD1/2st-pc-W-B.png" alt="2st-pc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/N6kSGnPt/mpo-pc-W-B.png" alt="mpo-pc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/jPMMn42N/mtrl-pc-W-B.png" alt="mtrl-pc-W-B" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/9k0Zv5FR/2din-pc-W-B.png" alt="2din-upc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/RptGZRJ4/2fc-pc-W-B.png" alt="2fc-upc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/RTLK1nSn/2lc-pc-W-B.png" alt="2lc-upc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/tMSyQfkh/2mu-pc-W-B.png" alt="2mu-upc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Jj7fqpmJ/2sc-pc-w-B.png" alt="2sc-upc-w-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Vcph6sD1/2st-pc-W-B.png" alt="2st-upc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/N6kSGnPt/mpo-pc-W-B.png" alt="mpo-upc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/jPMMn42N/mtrl-pc-W-B.png" alt="mtrl-upc-W-B" border="0"></a>

`;

    const configImages = [];
    let Images = Imagesdiv.querySelectorAll("img");


    const getColor = (color) => {
        let result = null;
        const colors = [
            { color: "orange", key: "L" },
            { color: "green", key: "V" },
            { color: "purple", key: "R" },
            { color: "yellow", key: "A" },
            { color: "blue", key: "B" },
            { color: "water", key: "W" },
        ];
        colors.forEach(el => {
            if (el.key === color.toLocaleUpperCase()) {
                result = el.color;
            }
        });

        console.clear();
        console.log("color = ", result);
        return result;
    }

    Images.forEach(img => {
        let alt = img.getAttribute("alt");
        if (alt) {
            let info = alt.split("-");
            if (info.length === 4) {
                const ITEM = {
                    connect: info[0].toLocaleUpperCase(),
                    termination: info[1].toLocaleUpperCase() === "PC" ? "UPC" : info[1].toLocaleUpperCase(),
                    color: getColor(info[2]),
                    side: info[3].toLocaleUpperCase(),
                    fibers: info[0].toLocaleUpperCase().split("")[0] * 1 === 2 ? 2 : 1,
                    source: img.getAttribute("src"),
                }
                if (configImages.length > 0) {
                    if (!configImages.find(item =>
                        item.connect === ITEM.connect &&
                        item.color === ITEM.color &&
                        item.termination === ITEM.termination &&
                        item.side === ITEM.side)) {
                        configImages.push(ITEM);
                    }
                } else {
                    configImages.push(ITEM);
                }
            } else if (info.length === 2) {
                if (configImages.length > 0) {
                    if (!configImages.find(item => item.color === getColor(info[1]))) {
                        configImages.push({
                            main: true,
                            color: getColor(info[1]),
                            source: img.getAttribute("src")
                        });
                    }
                } else {
                    configImages.push({
                        main: true,
                        color: getColor(info[1]),
                        source: img.getAttribute("src")
                    });
                }
            }
        }
    });

    console.log("RESULT = ", configImages);
    return configImages;
}


const Images = GetCablesImages();


// 0 - configurar o alerta
$(document).ready(function () {
    toastr.options = {
        'closeButton': true,
        'debug': false,
        'newestOnTop': false,
        'progressBar': false,
        'positionClass': 'toast-top-left',
        'preventDuplicates': false,
        'showDuration': '3000',
        'hideDuration': '1000',
        'timeOut': '5000',
        'extendedTimeOut': '1000',
        'showEasing': 'swing',
        'hideEasing': 'linear',
        'showMethod': 'fadeIn',
        'hideMethod': 'fadeOut',
    }
});

// 1 -  Pegar os inputs do configurador outros dados; 

let currentConfigValue = 1;
let colorDiv = document.querySelector(".colorselect");

const configValue = {
    fiber_mode_selector: "",
    noffiber_cable_selector: "",
    grade_selector: "",
    length_range: "",
    side_a_connector_selector: "",
    side_a_termination_selector: "",
    cable_typeoffiber_selector: "",
    cable_diameter_selector: "",
    side_b_connector_selector: "",
    side_b_termination_selector: "",
    request_amount_input: ""
};


const ProductsPrices = [
    {
        type: 1, /// for jumpers
        ref: "",
        meter: 100,
        price: 1250
    },

];


const DataColors = [
    { value: "G652D", color: "yellow", code: "#FFEA00" },
    { value: "G657B3", color: "white", code: "#ffff" },
    { value: "G657A2", color: "white", code: "#ffff" },
    { value: "OM1", color: "orange", code: "#fe7f2d" },
    { value: "OM2", color: "blue", code: "#566ec4" },
    { value: "OM3", color: "water", code: "#168aad" },
    { value: "OM4", color: "purple", code: "#9163cb" },
    { value: "OM5", color: "green", code: "#008000" },
];




const configuratorFormData = [
    {
        code: 1,
        data: [
            [
                {
                    name: "Modo de fibra",
                    id: "fiber_mode_selector",
                    type: 0,
                    inputType: null,
                    options: [
                        { label: "Singlemode (SM)", value: "SM" },
                        { label: "Multimode (MM)", value: "MM" },
                    ],
                },
                {
                    name: "Tipo de Fibra",
                    id: "fiber_type_selector",
                    type: 0,
                    inputType: null,
                    options: [
                        { label: "G652D", value: "G652D", color: "yellow" },
                        { label: "G657B3", value: "G657B3", color: "white" },
                        { label: "G657A2", value: "G657A2", color: "white" },
                        { label: "OM1", value: "OM1", color: "orange" },
                        { label: "OM2", value: "OM2", color: "blue" },
                        { label: "OM3", value: "OM3", color: "water" },
                        { label: "OM4", value: "OM4", color: "purple" },
                        { label: "OM5", value: "OM5", color: "green" },
                    ],
                },
                {
                    name: "Nº de fibras por cabo",
                    id: "fiber_number_selector",
                    type: 0,
                    inputType: null,
                    options: [
                        { label: "2 Fibras (Duplex)", value: "2 - fibras duplex" },
                    ],
                },
            ],
            [
                {
                    name: "Diâmetro",
                    id: "fiber_diameter_selector",
                    type: 0,
                    inputType: null,
                    options: [
                        { label: "900µm (Mícron)", value: "900µm" },
                        { label: "2.0mm", value: "2.0mm" },
                        { label: "3.0mm", value: "3.0mm" },
                    ],
                },
            ],
            [
                {
                    name: "range",
                    id: "config-length-range",
                    type: 0,
                    inputType: null,
                    options: [],
                },
            ],
        ],
        sides: [
            {
                title: "Lado A",
                options: [
                    {
                        label: "Conector",
                        id: "side_a_connector",
                        options: [
                            { label: "LC", value: "LC" },
                            { label: "SC", value: "SC" },
                            { label: "FC", value: "FC" },
                            { label: "MU", value: "MU" },
                            { label: "ST", value: "ST" },
                            { label: "DIN", value: "DIN" },
                            { label: "MTRL", value: "MTRL" },
                            { label: "E2000", value: "E2000" },
                        ]
                    },
                    {
                        label: "Terminação",
                        id: "side_a_termination",
                        options: [
                            { label: "UPC", value: "UPC" },
                            { label: "APC", value: "APC" },
                        ]
                    },
                ],
            },
            {
                title: "Lado B",
                options: [
                    {
                        label: "Conector",
                        id: "side_b_connector",
                        options: [
                            { label: "LC", value: "LC" },
                            { label: "SC", value: "SC" },
                            { label: "FC", value: "FC" },
                            { label: "MU", value: "MU" },
                            { label: "ST", value: "ST" },
                            { label: "DIN", value: "DIN" },
                            { label: "MTRL", value: "MTRL" },
                            { label: "E2000", value: "E2000" },
                        ]
                    },
                    {
                        label: "Terminação",
                        id: "side_b_termination",
                        options: [
                            { label: "UPC", value: "UPC" },
                            { label: "APC", value: "APC" },
                        ]
                    },
                ],
            },
        ]
    },
    {
        code: 2,
        data: [
            [
                {
                    name: "Modo de fibra",
                    id: "fiber_mode_selector",
                    type: 0,
                    inputType: null,
                    options: [
                        { label: "Singlemode (SM)", value: "SM" },
                        { label: "Multimode (MM)", value: "MM" },
                    ],
                },
                {
                    name: "Tipo de Fibra",
                    id: "fiber_type_selector",
                    type: 0,
                    inputType: null,
                    options: [
                        { label: "G652D", value: "G652D", color: "yellow" },
                        { label: "G657B3", value: "G657B3", color: "white" },
                        { label: "G657A2", value: "G657A2", color: "white" },
                        { label: "OM1", value: "OM1", color: "orange" },
                        { label: "OM2", value: "OM2", color: "blue" },
                        { label: "OM3", value: "OM3", color: "water" },
                        { label: "OM4", value: "OM4", color: "purple" },
                        { label: "OM5", value: "OM5", color: "green" },
                    ],
                },
                {
                    name: "Nº de fibras por cabo",
                    id: "fiber_number_selector",
                    type: 0,
                    inputType: null,
                    options: [
                        { label: "1 Fibra (1-FO)", value: "1  fibra 1(FO)" },
                        { label: "2 Fibras (2-FO)", value: "2  fibras 2(FO)" },
                        { label: "4 Fibras (4-FO)", value: "4  fibras 4(FO)" },
                        { label: "6 Fibras (6-FO)", value: "6  fibras 6(FO)" },
                        { label: "8 Fibras (8-FO)", value: "8 fibras 8(FO)" },
                        { label: "12 Fibras (12-FO)", value: "12 fibras 12(FO)" },
                        { label: "16 Fibras (16-FO)", value: "16 fibras 16(FO)" },
                        { label: "24 Fibras (24-FO)", value: "24 fibras 24(FO)" },
                        { label: "32 Fibras (32-FO)", value: "32 fibras 32(FO)" },
                        { label: "36 Fibras (36-FO)", value: "36 fibras 36(FO)" },
                        { label: "48 Fibras (48-FO)", value: "48 fibras 48(FO)" },
                        { label: "60 Fibras (60-FO)", value: "60 fibras 60(FO)" },
                        { label: "72 Fibras (72-FO)", value: "72 fibras 72(FO)" },
                        { label: "96 Fibras (96-FO)", value: "96 fibras 96(FO)" },
                        { label: "144 Fibras (144-FO)", value: "144 fibras 144(FO)" },
                    ],
                },
            ],
            [
                {
                    name: "Diâmetro",
                    id: "fiber_diameter_selector",
                    type: 0,
                    inputType: null,
                    options: [
                        { label: "Interior", value: "interior" },
                        { label: "Exterior", value: "exterior" },
                        { label: "Aéreo", value: "aéreo" },
                        { label: "Industrial", value: "industrial" },
                    ],
                },
            ],
            [
                {
                    name: "range",
                    id: "config-length-range",
                    type: 0,
                    inputType: null,
                    options: [],
                },
            ],
        ],
        sides: [
            {
                title: "Lado A",
                options: [
                    {
                        label: "Conector",
                        id: "side_a_connector",
                        options: [
                            { label: "LC", value: "LC" },
                            { label: "SC", value: "SC" },
                            { label: "FC", value: "FC" },
                            { label: "MU", value: "MU" },
                            { label: "ST", value: "ST" },
                            { label: "DIN", value: "DIN" },
                            { label: "MTRL", value: "MTRL" },
                            { label: "E2000", value: "E2000" },
                        ]
                    },
                    {
                        label: "Terminação",
                        id: "side_a_termination",
                        options: [
                            { label: "UPC", value: "UPC" },
                            { label: "APC", value: "APC" },
                        ]
                    },
                    {
                        label: "Comprimento do Extremo A",
                        id: "side_a_length",
                        type: "numer",
                        range: "20,150",
                        options: []
                    },
                ],
            },
            {
                title: "Lado B",
                options: [
                    {
                        label: "Conector",
                        id: "side_b_connector",
                        options: [
                            { label: "LC", value: "LC" },
                            { label: "SC", value: "SC" },
                            { label: "FC", value: "FC" },
                            { label: "MU", value: "MU" },
                            { label: "ST", value: "ST" },
                            { label: "DIN", value: "DIN" },
                            { label: "MTRL", value: "MTRL" },
                            { label: "E2000", value: "E2000" },
                        ]
                    },
                    {
                        label: "Terminação",
                        id: "side_b_termination",
                        options: [
                            { label: "UPC", value: "UPC" },
                            { label: "APC", value: "APC" },
                        ]
                    },
                    {
                        label: "Comprimento do Extremo B",
                        id: "side_b_length",
                        type: "numer",
                        range: "20,150",
                        options: []
                    },
                ],
            },
        ]
    },
    {
        code: 3,
        data: [
            [
                {
                    name: "Modo de fibra",
                    id: "fiber_mode_selector",
                    type: 0,
                    inputType: null,
                    options: [
                        { label: "Singlemode (SM)", value: "SM" },
                        { label: "Multimode (MM)", value: "MM" },
                    ],
                },
                {
                    name: "Tipo de Fibra",
                    id: "fiber_type_selector",
                    type: 0,
                    inputType: null,
                    options: [
                        { label: "G652D", value: "G652D", color: "yellow" },
                        { label: "G657B3", value: "G657B3", color: "white" },
                        { label: "G657A2", value: "G657A2", color: "white" },
                        { label: "OM1", value: "OM1", color: "orange" },
                        { label: "OM2", value: "OM2", color: "blue" },
                        { label: "OM3", value: "OM3", color: "water" },
                        { label: "OM4", value: "OM4", color: "purple" },
                        { label: "OM5", value: "OM5", color: "green" },
                    ],
                },
                {
                    name: "Nº de fibras por cabo",
                    id: "fiber_number_selector",
                    type: 0,
                    inputType: null,
                    options: [
                        { label: "1 Fibra (Simplex)", value: "1 fibra simplex" },
                    ],
                },
            ],
            [
                {
                    name: "Diâmetro",
                    id: "fiber_diameter_selector",
                    type: 0,
                    inputType: null,
                    options: [
                        { label: "900µm (Mícron)", value: "900µm" },
                        { label: "2.0mm", value: "2.0mm" },
                        { label: "3.0mm", value: "3.0mm" },
                    ],
                },
            ],
            [
                {
                    name: "range",
                    id: "config-length-range",
                    type: 0,
                    inputType: null,
                    options: [],
                },
            ],
        ],
        sides: [
            {
                title: "Lado A",
                options: [
                    {
                        label: "Conector",
                        id: "side_a_connector",
                        options: [
                            { label: "LC", value: "LC" },
                            { label: "SC", value: "SC" },
                            { label: "FC", value: "FC" },
                            { label: "MU", value: "MU" },
                            { label: "ST", value: "ST" },
                            { label: "DIN", value: "DIN" },
                            { label: "MTRL", value: "MTRL" },
                            { label: "E2000", value: "E2000" },
                        ]
                    },
                    {
                        label: "Terminação",
                        id: "side_a_termination",
                        options: [
                            { label: "UPC", value: "UPC" },
                            { label: "APC", value: "APC" },
                        ]
                    },
                ],
            },
        ]
    },
];

let configInputsValues = {
    config_1: [ // elementos do configurador de jumpers
        { type: "select", id: "fiber_mode_selector", value: null, name: "Modo de fibra" },
        { type: "select", id: "fiber_type_selector", value: null, name: "Tipo de fibra" },
        { type: "select", id: "fiber_number_selector", value: null, name: "Nº de fibras por cabo" },
        { type: "select", id: "side_a_connector", value: null, name: "Lado A conector" },
        { type: "select", id: "side_a_termination", value: null, name: "Lado A terminação" },
        { type: "select", id: "side_b_connector", value: null, name: "Lado B conector" },
        { type: "select", id: "side_b_termination", value: null, name: "Lado B terminação" },
        { type: "select", id: "fiber_diameter_selector", value: null, name: "Diâmetro" },
    ],
    config_2: [  // elementos do configurador de cabos pre-conectorizados
        { type: "select", id: "fiber_mode_selector", value: null, name: "Modo fe fibra" },
        { type: "select", id: "fiber_type_selector", value: null, name: "Tipo de fibra" },
        { type: "select", id: "fiber_number_selector", value: null, name: "Nº de fibras por cabo" },
        { type: "select", id: "side_a_connector", value: null, name: "Lado A conector" },
        { type: "select", id: "side_a_termination", value: null, name: "Lado A terminação" },
        { type: "select", id: "side_b_connector", value: null, name: "Lado B conector" },
        { type: "select", id: "side_b_termination", value: null, name: "Lado B terminação" },
        { type: "select", id: "fiber_diameter_selector", value: null, name: "Diâmetro" },
        { type: "input", id: "side_a_length", value: null, name: "Comprimento do Extremo A" },
        { type: "input", id: "side_b_length", value: null, name: "Comprimento do Extremo B" },
    ],
    config_3: [ // elementos do configurador de pigtails
        { type: "select", id: "fiber_mode_selector", value: null, name: "Modo de fibra" },
        { type: "select", id: "fiber_type_selector", value: null, name: "Tipo de fibra" },
        { type: "select", id: "fiber_number_selector", value: null, name: "Nº de fibras por cabo" },
        { type: "select", id: "side_a_connector", value: null, name: "Lado A conector" },
        { type: "select", id: "side_a_termination", value: null, name: "Lado A terminação" },
        { type: "select", id: "fiber_diameter_selector", value: null, name: "Diâmetro" },
    ]
};

// 2 -  Pegar outros elementos & criar variaveis globais
const ColorsList = document.getElementById("colors-list");
const removeButton = document.getElementById("remove-config-button");
const sendButton = document.getElementById("send-config-button");
const currentLength = document.getElementById("current-length");
const CountCurrentSelectedMetters = document.getElementById("unit-counter");
const ImageCanvas = document.getElementById("main-config-image-canvas");
const AreaToExport = document.getElementById("main-image-box");
const ImgPlaceholder = "";
const Image_a_element = document.getElementById("left-image-cv");
const Image_b_element = document.getElementById("right-image-cv");
const CablesImages = GetCablesImages();
const QuantityInput = document.getElementById("config-request-amount-input");

let MeterValue = 0;
let selectedColor = null;
const SELECTED_PRODUCTS = [];




function removeAllConfigurations() {
    BuildForm(currentConfigValue);
    currentConfigValue = null;
    GetInputsValuesAndFillThem();
    colorDiv.style.backgroundColor = "rgb(103, 102, 99)";
    ImageCanvas.src = ImgPlaceholder;
    Image_a_element.src = ImgPlaceholder;
    Image_b_element.src = ImgPlaceholder;

    if (currentConfigValue === 1) {
        configInputsValues.config_1.forEach(element => {
            element.value = null;
        });
    } else if (currentConfigValue === 2) {
        configInputsValues.config_2.forEach(element => {
            element.value = null;
        });
    } else if (currentConfigValue === 3) {
        configInputsValues.config_3.forEach(element => {
            element.value = null;
        });
    }

    let DescriptionDiv = document.getElementById("description-block");
    let lis = DescriptionDiv.querySelectorAll("span");
    lis.forEach(element => {
        element.classList.remove("text-success");
        element.classList.add("text-danger");
        element.innerText = "nenhuma informação foi atribuida";
    });

    QuantityInputValue = 1;
    QuantityInput.value = "1";
    document.getElementById("total-configuration").innerHTML = "0€";
    if (document.getElementById("totol")) document.getElementById("totol").innerHTML = `Total (+IVA) : <span class="text-success">0€</span>`
}


// Remover configurações
removeButton.addEventListener("click", () => {
    removeAllConfigurations();
});




// 5 - criar a função poara pegar e mudar os metros no input e exibir no label
function ChangeMetersLabel() {
    if (!document.getElementById("config-length-range") && !document.getElementById("config-length-range-inp")) return;
    document.getElementById("config-length-range").addEventListener("change", (e) => {
        MeterValue = e.target.value;
        currentLength.innerText = MeterValue + "m";
        CountCurrentSelectedMetters.innerText = MeterValue + "m";
        configValue.length_range = MeterValue;
        document.getElementById("config-length-range-inp").value = MeterValue;
        CalculateTotal(MeterValue, QuantityInputValue, configuratorFormData);
    });

    document.getElementById("config-length-range-inp").addEventListener("change", (e) => {
        MeterValue = e.target.value;
        currentLength.innerText = MeterValue + "m";
        CountCurrentSelectedMetters.innerText = MeterValue + "m";
        configValue.length_range = MeterValue;
        document.getElementById("config-length-range").value = MeterValue;
        CalculateTotal(MeterValue, QuantityInputValue, configuratorFormData);
    });
    document.getElementById("config-length-range-inp").addEventListener("keyup", (e) => {
        MeterValue = e.target.value;
        currentLength.innerText = MeterValue + "m";
        CountCurrentSelectedMetters.innerText = MeterValue + "m";
        configValue.length_range = MeterValue;
        document.getElementById("config-length-range").value = MeterValue;
        CalculateTotal(MeterValue, QuantityInputValue, configuratorFormData);
    });
    GetInputsValuesAndFillThem();
}



// 6 - pegar valores dos Inputs & chamar a função que aplica os filtros

function GetInputsValuesAndFillThem() {
    if (currentConfigValue === 1) getValues(configInputsValues.config_1)
    else if (currentConfigValue === 2) getValues(configInputsValues.config_2)
    else getValues(configInputsValues.config_3)

    function getValues(data) {
        data.forEach(element => {
            document.getElementById(element.id).addEventListener("change", (e) => {
                element.value = e.target.value;
                showDescrriptionWhileConfigurating();
                FindBestMatchingProduct();
            });

            if (element.type !== "select") {
                document.getElementById(element.id).addEventListener("keyup", (e) => {
                    element.value = e.target.value;
                    showDescrriptionWhileConfigurating();
                    FindBestMatchingProduct();
                });
            }

        });
    }
}


function showDescrriptionWhileConfigurating() {
    let inputs = [];
    let DescriptionDiv = document.getElementById("description-block");
    if (currentConfigValue === 1) inputs = configInputsValues.config_1;
    if (currentConfigValue === 2) inputs = configInputsValues.config_2;
    if (currentConfigValue === 3) inputs = configInputsValues.config_3;

    DescriptionDiv.innerHTML = "";
    inputs.forEach(element => {
        DescriptionDiv.innerHTML += `<li>${element.name} : 
        ${element.value !== null ? `<span class="text-success">${element.value}</span>` : `<span class="text-danger">nenhuma informação foi atribuida</span>`}</li>`;
    });

    DescriptionDiv.innerHTML += `<li id="totol" >Total (+IVA) : <span class="text-success">${document.getElementById("total-configuration").innerText}</span></li>`;
}






function FindBestMatchingProduct() {
    ImageCanvas.src = ImgPlaceholder;
    Image_a_element.src = ImgPlaceholder;
    Image_b_element.src = ImgPlaceholder;
    ImageCanvas.style.display = "none";
    Image_a_element.style.display = "none";
    Image_b_element.style.display = "none";
    console.clear();

    const configKeyMap = {
        1: "jumpers",
        2: "multifiber",
        3: "pigtails"
    };

    const configKey = configKeyMap[currentConfigValue];
    const inputs = configInputsValues[`config_${currentConfigValue}`];
    const db = ProductsDatabase[configKey];

    if (!db) return null;

    const getInputValue = id => {
        const input = inputs.find(i => i.id === id);
        return input ? input.value : null;
    };

    const mode = getInputValue("fiber_mode_selector");
    const type = getInputValue("fiber_type_selector");
    const fibers = getInputValue("fiber_number_selector");

    if (!mode || !type || !fibers) return null;

    const sideAConnector = getInputValue("side_a_connector");
    const sideATermination = getInputValue("side_a_termination");
    const sideBConnector = getInputValue("side_b_connector");
    const sideBTermination = getInputValue("side_b_termination");

    const cleanConnector = c => c ? c.replace(/[0-9]/g, '') : null;
    const fiberCount = fibers.includes("2") ? 2 : 1;

    const fiberColorData = DataColors.find(dc => dc.value === type);
    const mainColorImage = fiberColorData
        ? CablesImages.find(img => img.main && img.color === fiberColorData.color)
        : null;

    const getCableImageSide = (connector, termination, side) => {
        console.log(`
           fibers =  ${fiberCount}
           side =  ${(side)}
           connect a =  ${sideAConnector}   
           terminal a =  ${sideATermination} 
           connect b =  ${sideBConnector}   
           terminal b =  ${sideBTermination}   
           color = ${fiberColorData.color}
        `)
        if (!connector || !termination) return null;
        const resultF = CablesImages.find(img =>
            img.connect &&
            img.termination &&
            cleanConnector(img.connect).toUpperCase() === connector &&
            img.termination.toUpperCase() === termination &&
            img.side === side &&
            img.fibers === fiberCount &&
            img.color === fiberColorData.color
        ) || null;

        console.log("Founded = ", resultF !== null);
        console.log("Images = ", Images)
        return resultF;
    };

    const sideA = getCableImageSide(sideAConnector, sideATermination, "A");
    const sideB = getCableImageSide(sideBConnector, sideBTermination, "B");

    if (mainColorImage?.source) {
        ImageCanvas.style.display = "block";
        ImageCanvas.src = mainColorImage.source;
    }

    if (sideA?.source) {
        Image_a_element.style.display = "block";
        Image_a_element.src = sideA.source;
    }

    if (sideB?.source) {
        Image_b_element.style.display = "block";
        Image_b_element.src = sideB.source;
    }

    return {
        sides: {
            sideA,
            sideB
        },
        mainColorImage
    };
}





// 8 - função que vai permitir trocar o tipo de configurador & esconder os inputs basicamente;

function ChangeTypeOfConfiguration() {
    document.getElementById("config-mode-selector").addEventListener("change", (e) => {
        removeAllConfigurations();
        currentConfigValue = e.target.value * 1;
        document.querySelectorAll("#config-form .hide").forEach(rm => { rm.classList.remove("hide"); });
        if (currentConfigValue === 3) BuildForm(3);
        else if (currentConfigValue === 2) BuildForm(2);
        else BuildForm(1);
        showDescrriptionWhileConfigurating();
    });
}

// criar ou exibir o html para cada tipo de configurador
function BuildForm(type) {
    const FormContainer = document.getElementById("config-form");
    configuratorFormData.forEach(form => {
        if (form.code === type) {
            FormContainer.innerHTML = "";
            const formData = form.data;
            const formSides = form.sides;

            for (var i = 0; i < formData.length; i++) {
                let currentItem = formData[i];
                let count = currentItem.length;

                if (count === 3) {
                    currentItem.forEach(group => {

                        let select = document.createElement("select");
                        select.classList.add("form-select");
                        select.setAttribute("id", group.id);
                        select.innerHTML = `<option disabled selected>selecionar...</option>`
                        const Otheroptions = group.options.map(option => `<option value="${option.value}">${option.label}</option>`).join('');
                        select.innerHTML += Otheroptions;

                        const formGroup = document.createElement("div");
                        formGroup.classList.add("form-group");
                        const labeldiv = document.createElement("div");
                        labeldiv.classList.add("form-label");
                        const label = document.createElement("label");
                        label.setAttribute("for", group.id);
                        label.innerText = group.name;
                        labeldiv.append(label);
                        formGroup.append(labeldiv);
                        formGroup.appendChild(select);

                        FormContainer.appendChild(formGroup);
                    });
                }

                if (count === 1) {
                    currentItem.forEach(group => {
                        if (group.name !== "range") {
                            let select = document.createElement("select");
                            select.classList.add("form-select");
                            select.setAttribute("id", group.id);
                            select.innerHTML = `<option disabled selected>selecionar...</option>`
                            const Otheroptions = group.options.map(option => `<option value="${option.value}">${option.label}</option>`).join('');
                            select.innerHTML += Otheroptions;

                            const formGroup = document.createElement("div");
                            formGroup.classList.add("col-lg-12");
                            formGroup.classList.add("form-group");
                            const labeldiv = document.createElement("div");
                            labeldiv.classList.add("form-label");
                            const label = document.createElement("label");
                            label.setAttribute("for", group.id);
                            label.innerText = group.name;
                            labeldiv.append(label);
                            formGroup.append(labeldiv);
                            formGroup.appendChild(select);

                            FormContainer.appendChild(formGroup);
                        } else {
                            const formGroup = document.createElement("div");
                            formGroup.classList.add("col-lg-12");
                            formGroup.innerHTML = `<div class="form-group-ranges">
                                <div class="form-label"><label for="inp-1">Tamanho  (Metragem)</label></div>
                                <div class="d-flex">
                                    <strong id="current-length">0m</strong>
                                    <div class="range-input">
                                        <input type="range" value="0" max="10000" min="1" class="form-range" id="config-length-range">
                                    </div>
                                    <strong>10.000m</strong>
                                    <div class="ml-2" style="padding-left:20px;" >
                                        <input class="input form-control" placeholder="..."  id="config-length-range-inp" type="number" min="1"  />
                                    </div>
                                </div>
                            </div> `;
                            FormContainer.appendChild(formGroup);
                        }
                    });
                }
            }

            for (var i = 0; i < formSides.length; i++) {
                const side = formSides[i];

                const aside = document.createElement("aside");
                aside.classList.add("aside-area");
                aside.classList.add(`side-${side.options.length}`);
                const strong = document.createElement("strong");
                strong.innerText = side.title;
                aside.appendChild(strong);

                side.options.forEach(opt => {
                    const formGroup = document.createElement("div");
                    formGroup.classList.add("form-group");
                    const labeldiv = document.createElement("div");
                    labeldiv.classList.add("form-label");
                    const label = document.createElement("label");
                    label.setAttribute("for", opt.id);
                    label.innerText = opt.label;
                    labeldiv.appendChild(label);
                    formGroup.appendChild(labeldiv);

                    if (opt.type) {
                        const input = document.createElement("input");
                        input.classList.add("form-control");
                        input.setAttribute("id", opt.id);
                        let ranges = opt.range.split(",");
                        input.setAttribute("type", "number");
                        input.setAttribute("minlength", ranges[0] * 1);
                        input.setAttribute("maxlength", ranges[1] * 1);
                        input.setAttribute("placeholder", `${ranges[0] * 1}cm - ${ranges[1] * 1}cm`)
                        formGroup.appendChild(input);
                    } else {
                        const select = document.createElement("select");
                        select.classList.add("form-select");
                        select.setAttribute("id", opt.id);
                        select.innerHTML = `<option disabled selected>selecionar...</option>`;
                        select.innerHTML += opt.options.map(option => `<option value="${option.value}">${option.label}</option>`).join("");
                        formGroup.appendChild(select);
                    }
                    aside.appendChild(formGroup);
                });

                FormContainer.appendChild(aside);
            }



            ChangeMetersLabel();
            InputsAndSelectsActions();
            GetInputsValuesAndFillThem();
        }
    });
}








function InputsAndSelectsActions() {
    let terminationselect_a = document.getElementById("side_a_termination");
    let terminationselect_b = document.getElementById("side_b_termination");
    let select = document.getElementById("fiber_type_selector");
    let fiber_mode_selector = document.getElementById("fiber_mode_selector");


    /// A - função para mudar a cor do cabo 
    if (select) {
        select.addEventListener("change", (e) => {
            let value = e.target.value;
            DataColors.forEach(element => {
                if (element.value === value) {
                    colorDiv.style.backgroundColor = element.code;
                    CalculateTotal(MeterValue, QuantityInputValue, configuratorFormData);
                }
            });
        });
    }

    // B - MUltimodeActions select
    if (fiber_mode_selector) {
        fiber_mode_selector.addEventListener("change", (e) => {
            let value = e.target.value;

            //** Mudar os dados das terminações */
            if (terminationselect_b) {
                if (terminationselect_a && value === "MM") {
                    const opt = [{ label: "UPC", value: "UPC" }];
                    terminationselect_a.innerHTML = `<option disabled selected>selecionar...</option>`;
                    terminationselect_a.innerHTML += opt.map(option => `<option value="${option.value}">${option.label}</option>`).join("");
                } else {
                    const opt = [{ label: "UPC", value: "UPC" }, { label: "APC", value: "APC" }];
                    terminationselect_a.innerHTML = `<option disabled selected>selecionar...</option>`;
                    terminationselect_a.innerHTML += opt.map(option => `<option value="${option.value}">${option.label}</option>`).join("");
                }

                if (terminationselect_b && value === "MM") {
                    const opt = [{ label: "UPC", value: "UPC" }];
                    terminationselect_b.innerHTML = `<option disabled selected>selecionar...</option>`;
                    terminationselect_b.innerHTML += opt.map(option => `<option value="${option.value}">${option.label}</option>`).join("");
                } else {

                    const opt = [{ label: "UPC", value: "UPC" }, { label: "APC", value: "APC" }];
                    terminationselect_b.innerHTML = `<option disabled selected>selecionar...</option>`;
                    terminationselect_b.innerHTML += opt.map(option => `<option value="${option.value}">${option.label}</option>`).join("");
                }
            }
            CalculateTotal(MeterValue, QuantityInputValue, configuratorFormData);


        });
    }
}


async function sendFileToServer(div) {
    const userEmail = localStorage.getItem("userEmail") || "fabio.catela@exportech.com.pt";
    const userCompanyName = localStorage.getItem("userName") || "Fabio Catela";
    const userManager = "";
    const proposalCode = new Date() * Math.random(1000, 8000);
    const now = new Date();
    const sendButton = document.getElementById("send-config-button");
    const originalButtonHTML = sendButton.innerHTML;

    sendButton.disabled = true;
    sendButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...`;

    // Obter configuração ativa pelo código
    const selectedConfig = configuratorFormData.find(item => item.code === currentConfigValue);

    if (!selectedConfig) {
        toastr.warning("Configuração não encontrada!");
        sendButton.disabled = false;
        sendButton.innerHTML = originalButtonHTML;
        return false;
    }

    let allValid = true;


    for (const row of selectedConfig.data) {
        for (const field of row) {
            const element = document.getElementById(field.id);
            const value = element?.value?.trim();
            if (!value || value === "selecionar...") {
                allValid = false;
                console.warn(`Campo vazio: ${field.name} (${field.id})`);
                break;
            }

            console.warn(`Campo : ${field.name} (${field.id}) = `, value);
        }
        if (!allValid) break;
    }

    if (selectedConfig.sides && Array.isArray(selectedConfig.sides)) {
        for (const side of selectedConfig.sides) {
            for (const opt of side.options) {
                const element = document.getElementById(opt.id);
                const value = element?.value?.trim();
                if (!value || value === "selecionar...") {
                    allValid = false;
                    console.warn(`Campo vazio: ${opt.label} (${opt.id})`);
                    break;
                }
                console.warn(`Campo vazio: ${opt.label} (${opt.id}) = `, value);
            }
            if (!allValid) break;
        }
    }

    if (!allValid) {
        toastr.warning("Por favor, preencha todos os campos antes de finalizar a configuração.");
        sendButton.disabled = false;
        sendButton.innerHTML = originalButtonHTML;
        return false;
    }

    if (!userEmail) {
        toastr.warning("Nenhum email encontrado!");
        sendButton.disabled = false;
        sendButton.innerHTML = originalButtonHTML;
        return false;
    }

    try {
        const canvas = await html2canvas(div, {
            useCORS: true,
            allowTaint: true,
            scale: 1,
            scrollX: 0,
            scrollY: -window.scrollY
        });

        const imageBlob = await new Promise(resolve => {
            canvas.toBlob(blob => resolve(blob), "image/jpeg", 0.8);
        });

        const imageUrl = await uploadImageToCloudinary(imageBlob);

        if (!imageUrl) {
            toastr.warning("Erro ao carregar imagem para configuração!");
            sendButton.disabled = false;
            sendButton.innerHTML = originalButtonHTML;
            return false;
        }

        let descriptionBlockHTML = `<div class="container mt-4">
            <h3 class="text-primary">Lista de detalhes da configuração</h3>
            <ol class="list-group list-group-numbered">`;

        const descriptionBlock = document.querySelector("#description-block");
        if (descriptionBlock) {
            const listItems = descriptionBlock.querySelectorAll("li");
            if (listItems.length > 0) {
                listItems.forEach(item => {
                    descriptionBlockHTML += `<li class="list-group-item">${item.innerHTML}</li>`;
                });
            } else {
                descriptionBlockHTML += `<li class="list-group-item text-muted">Nenhum detalhe disponível.</li>`;
            }
        } else {
            descriptionBlockHTML += `<li class="list-group-item text-muted">Bloco de descrição não encontrado.</li>`;
        }

        descriptionBlockHTML += `</ol></div>`;

        const htmlContent = `
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Poppins', sans-serif; background-color: #f8f9fa; padding: 20px; }
                .logo-text { font-size: 36px; font-weight: 600; color: #0d6efd; text-transform: uppercase; }
                .email-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
                .email-footer { font-size: 14px; color: #6c757d; text-align: left; margin-top: 20px; }
                .email-footer strong { color: #dc3545; }
            </style>
        </head>
        <body>
            <div class="container email-container">
                <h1 class="logo-text text-center">EXPORTECH</h1>
                <p class="text-center"><strong>Website:</strong> <a style="color: #0d6efd;" href="https://www.exportech.com.pt">www.exportech.com.pt</a></p>
                <p class="text-center"><strong>Loja online:</strong> <a style="color: #0d6efd;" href="https://www.store.exportech.com.pt">www.store.exportech.com.pt</a></p>
                <p><strong>PAULO ALEXANDRE FERREIRA, UNIPESSOAL LDA</strong></p>

                <div class="mt-4">
                    <h4 class="text-primary">📍 Localizações</h4>
                    <ul class="list-group">
                        <li class="list-group-item"><strong>Sede Lisboa:</strong> Rua Fernando Farinha nº 2A e 2B, Braço de Prata 1950-448 Lisboa | Tel: +351 210 353 555</li>
                        <li class="list-group-item"><strong>Filial Funchal:</strong> Rua da Capela do Amparo, Edifício Alpha Living Loja A, 9000-267 Funchal | Tel: +351 291 601 603</li>
                        <li class="list-group-item"><strong>Armazém Logístico:</strong> Estrada do Contador nº 25 - Fracção B, Sesmaria do Colaço 2130-223 Benavente | Tel: +351 210 353 555</li>
                    </ul>
                </div>

                <div class="mt-4">
                    <h4 class="text-primary">📄 Configuração do Projeto (CABOS)</h4>
                    <p class="text-muted">Aqui está a sua configuração do projeto com todos os detalhes do cabo configurado.</p>
                </div>

                ${descriptionBlockHTML}

                <div style="max-width: 600px;">
                    <p class="email-footer text-left">Este e-mail foi enviado para: <strong>${userEmail}</strong></p>
                    <p class="email-footer text-left">Nome na conta : <strong>${userCompanyName}</strong></p>
                </div>
                <br/>
                <p><strong>Código da Proposta:</strong> ${proposalCode}</p>
                <p><strong>Data da Configuração:</strong> ${now.toLocaleString()}</p>
                <p><strong>Os preços apresentados no respectivo documento não são vinculativos. Podendo os mesmos serem alterados, sem necessidade de aviso prévio.</strong></p>

                <br/>
                <a style="color: #0d6efd;" href="${imageUrl}">${imageUrl}</a><br><br>
                <div style="max-width: 600px;">
                    <img src="${imageUrl}" alt="Captured Image" class="img-fluid rounded mx-auto d-block shadow-lg" style="max-width: 600px;">
                </div>
            </div>
        </body>
        </html>`;

        const response = await fetch("https://exportechsendemail-wmpe.vercel.app/sendfileconfig", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail, manager: userManager, htmlContent: htmlContent }),
        });

        const data = await response.json();
        toastr.success("Configuração enviada com sucesso!");
        return true;

    } catch (error) {
        console.error("Erro ao enviar:", error);
        toastr.error("Erro ao enviar a configuração. Tente novamente.");
        return false;
    } finally {
        sendButton.disabled = false;
        sendButton.innerHTML = originalButtonHTML;
    }
}






document.querySelector("#send-config-button").addEventListener("click", () => {
    sendFileToServer(document.getElementById("main-image-box"));
});


// 11  - função para armazenar dficheiros no cloudinary
async function uploadImageToCloudinary(imageBlob) {
    const formData = new FormData();
    formData.append("file", imageBlob);
    formData.append("upload_preset", "exportechupload");
    formData.append("cloud_name", "dcl5uszfj");

    try {
        const response = await fetch("https://api.cloudinary.com/v1_1/dcl5uszfj/image/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Erro no upload da imagem:", error);
        return null;
    }
}





const DataPrices = [
    {
        type: "jumpers", /// dados para os jumpers
        info: [
            {
                mode: "SM",
                termination: "UPC",
                connects: [
                    { connect: "SC", price: 0.91 },
                    { connect: "ST", price: 1.00 },
                    { connect: "LC", price: 0.91 },
                    { connect: "FC", price: 1.00 },
                    { connect: "E2000", price: 9.50 },
                    { connect: "SMA 906", price: 24.63 },
                    { connect: "MTRJ", price: 4.71 },
                    { connect: "DIN", price: 5.00 },
                    { connect: "M U", price: 3.29 },
                    { connect: "MTP 12F (USCONEC Standard)", price: 52.86 },
                    { connect: "MTP 24F (USCONEC Standard)", price: 120.00 },
                    { connect: "MPO 12F (OPTOSEA Standard)", price: 23.44 },
                    { connect: "MPO 24F (OPTOSEA Standard)", price: 64.84 }
                ]
            },
            {
                mode: "SM",
                termination: "APC",
                connects: [
                    { connect: "SC", price: 1.06 },
                    { connect: "ST", price: 1.11 },
                    { connect: "LC", price: 1.06 },
                    { connect: "FC", price: 1.11 },
                    { connect: "E2000", price: 9.50 },
                    { connect: "SMA 906", price: 24.63 },
                    { connect: "MTRJ", price: 4.86 },
                    { connect: "DIN", price: 5.14 },
                    { connect: "M U", price: 3.43 },
                    { connect: "MTP 12F (USCONEC Standard)", price: 52.86 },
                    { connect: "MTP 24F (USCONEC Standard)", price: 120.00 },
                    { connect: "MPO 12F (OPTOSEA Standard)", price: 23.44 },
                    { connect: "MPO 24F (OPTOSEA Standard)", price: 64.84 }
                ]
            },
            {
                mode: "MM",
                termination: "PC",
                connects: [
                    { connect: "SC", price: 0.91 },
                    { connect: "ST", price: 0.95 },
                    { connect: "LC", price: 0.91 },
                    { connect: "FC", price: 0.95 },
                    { connect: "E2000", price: 9.50 },
                    { connect: "SMA 906", price: 24.63 },
                    { connect: "MTRJ", price: 3.37 },
                    { connect: "DIN", price: 4.71 },
                    { connect: "M U", price: 3.14 },
                    { connect: "MTP 12F (USCONEC Standard)", price: 40.57 },
                    { connect: "MTP 24F (USCONEC Standard)", price: 71.43 },
                    { connect: "MPO 12F (OPTOSEA Standard)", price: 18.84 },
                    { connect: "MPO 24F (OPTOSEA Standard)", price: 41.77 }
                ]
            }
        ]
    },
];

const CablesPrices = [
    {
        mode: "SM",
        prices: [
            { type: "G652D", diameter: "900µm", price: 0.07, fiber: 1 },
            { type: "G652D", diameter: "2mm", price: 0.11, fiber: 1 },
            { type: "G652D", diameter: "3mm", price: 0.13, fiber: 1 },
            { type: "G652D", diameter: "2mm", price: 0.23, fiber: 2 },
            { type: "G652D", diameter: "3mm", price: 0.26, fiber: 2 },
            { type: "G652D", diameter: "24FO for MTP", price: 2.51, fiber: 1 },
            { type: "G652D", diameter: "12FO for MTP", price: 1.29, fiber: 1 },

            { type: "G657A2", diameter: "900µm", price: 0.09, fiber: 1 },
            { type: "G657A2", diameter: "2mm", price: 0.13, fiber: 1 },
            { type: "G657A2", diameter: "3mm", price: 0.14, fiber: 1 },
            { type: "G657A2", diameter: "2mm", price: 0.26, fiber: 2 },
            { type: "G657A2", diameter: "3mm", price: 0.29, fiber: 2 },

            { type: "G657B3", diameter: "900µm", price: 0.26, fiber: 1 },
            { type: "G657B3", diameter: "2mm", price: 0.31, fiber: 1 },
            { type: "G657B3", diameter: "3mm", price: 0.34, fiber: 1 },
            { type: "G657B3", diameter: "2mm", price: 0.63, fiber: 2 },
            { type: "G657B3", diameter: "3mm", price: 0.69, fiber: 2 }
        ],
    },
    {
        mode: "MM",
        prices: [
            // OM1
            { type: "OM1", diameter: "900µm", price: 0.19, fiber: 1 },
            { type: "OM1", diameter: "2mm", price: 0.22, fiber: 1 },
            { type: "OM1", diameter: "3mm", price: 0.24, fiber: 1 },
            { type: "OM1", diameter: "Duplex 2mm", price: 0.46, fiber: 2 },
            { type: "OM1", diameter: "Duplex 3mm", price: 0.51, fiber: 2 },

            // OM2
            { type: "OM2", diameter: "900µm", price: 0.14, fiber: 1 },
            { type: "OM2", diameter: "2mm", price: 0.19, fiber: 1 },
            { type: "OM2", diameter: "3mm", price: 0.21, fiber: 1 },
            { type: "OM2", diameter: "2mm", price: 0.40, fiber: 2 },
            { type: "OM2", diameter: "3mm", price: 0.43, fiber: 2 },
            { type: "OM2", diameter: "24FO for MTP", price: 3.86, fiber: 24 },
            { type: "OM2", diameter: "12FO for MTP", price: 1.94, fiber: 12 },

            // OM3
            { type: "OM3", diameter: "900µm", price: 0.20, fiber: 1 },
            { type: "OM3", diameter: "2mm", price: 0.24, fiber: 1 },
            { type: "OM3", diameter: "3mm", price: 0.26, fiber: 1 },
            { type: "OM3", diameter: "2mm", price: 0.49, fiber: 2 },
            { type: "OM3", diameter: "3mm", price: 0.51, fiber: 2 },
            { type: "OM3", diameter: "24FO for MTP", price: 5.00, fiber: 24 },
            { type: "OM3", diameter: "12FO for MTP", price: 2.57, fiber: 12 },

            // OM4
            { type: "OM4", diameter: "900µm", price: 0.46, fiber: 1 },
            { type: "OM4", diameter: "2mm", price: 0.51, fiber: 1 },
            { type: "OM4", diameter: "3mm", price: 0.53, fiber: 1 },
            { type: "OM4", diameter: "2mm", price: 1.03, fiber: 2 },
            { type: "OM4", diameter: "3mm", price: 1.06, fiber: 2 },
            { type: "OM4", diameter: "24FO for MTP", price: 14.29, fiber: 24 },
            { type: "OM4", diameter: "12FO for MTP", price: 7.14, fiber: 12 },

            // OM5
            { type: "OM5", diameter: "900µm", price: 0.73, fiber: 1 },
            { type: "OM5", diameter: "2mm", price: 0.79, fiber: 1 },
            { type: "OM5", diameter: "3mm", price: 0.80, fiber: 1 },
            { type: "OM5", diameter: "2mm", price: 1.57, fiber: 2 },
            { type: "OM5", diameter: "3mm", price: 1.60, fiber: 2 }
        ],
    }
];


function CalculateTotal(metters, amount, configuratorFormData) {
    const TotalConfigurationTag = document.getElementById("total-configuration");
    TotalConfigurationTag.innerText = "0€";

    const typeMap = {
        1: "jumpers",
        2: "multifiber",
        3: "pigtails"
    };
    const type = typeMap[currentConfigValue];
    const config = configuratorFormData.find(c => c.code === currentConfigValue);

    if (!config) return { total: null };

    const getValueById = (id) => {
        const el = document.getElementById(id);
        return el && el.value !== "selecionar..." ? el.value : null;
    };

    const fiber_mode_selector = getValueById("fiber_mode_selector");
    const fiber_type_selector = getValueById("fiber_type_selector");
    const fiber_number_selector = getValueById("fiber_number_selector");
    const fiber_diameter_selector = getValueById("fiber_diameter_selector");
    const side_a_connector = getValueById("side_a_connector");
    const side_a_termination = getValueById("side_a_termination");

    // Só busca sideB se não for multifiber (valor 2)
    const side_b_connector = currentConfigValue !== 2 ? getValueById("side_b_connector") : null;
    const side_b_termination = currentConfigValue !== 2 ? getValueById("side_b_termination") : null;

    const fiberData = {
        fiberMode: fiber_mode_selector,
        fiberType: fiber_type_selector,
        fiberNumber: fiber_number_selector,
        fiberDiameter: fiber_diameter_selector,
        sideAConnector: side_a_connector,
        sideATermination: side_a_termination,
        sideBConnector: side_b_connector,
        sideBTermination: side_b_termination,
    };

    const normalize = str => str?.toUpperCase().replace(/\s+/g, '').trim();

    const DataPricesFiltered = DataPrices.find(d => d.type === type);
    const getConnectorPrice = (mode, termination, connector) => {
        const infoMatch = DataPricesFiltered?.info.find(item =>
            normalize(item.mode) === normalize(mode) &&
            normalize(item.termination) === normalize(termination)
        );
        if (!infoMatch) return null;
        const connectorMatch = infoMatch.connects.find(c =>
            normalize(c.connect) === normalize(connector)
        );
        return connectorMatch ? { connect: connector, price: connectorMatch.price } : null;
    };

    const sideA = getConnectorPrice(fiber_mode_selector, side_a_termination, side_a_connector);
    const sideB = currentConfigValue !== 2
        ? getConnectorPrice(fiber_mode_selector, side_b_termination, side_b_connector)
        : null;

    const fiberCount = fiber_number_selector?.includes("2") ? 2 : 1;
    const cableGroup = CablesPrices.find(group =>
        normalize(group.mode) === normalize(fiber_mode_selector)
    );

    let cable = null;
    if (cableGroup) {
        cable = cableGroup.prices.find(item =>
            normalize(item.type) === normalize(fiber_type_selector) &&
            normalize(item.diameter) === normalize(fiber_diameter_selector) &&
            item.fiber === fiberCount
        );
    }

    const result = {
        sideA,
        sideB,
        cable,
        metters
    };

    let total = null;
    if (sideA && (currentConfigValue === 2 || sideB)) {
        const sideTotal = sideA.price + (sideB?.price || 0);
        total = calculateFormula(currentConfigValue, sideTotal, metters, amount);
        console.log("Tentando pegar apenas um lado ...");
       
        TotalConfigurationTag.innerText = total;
        if (document.getElementById("totol")) {
            document.getElementById("totol").innerHTML = `Total (+IVA) : <span class="text-success">${total}</span>`;
        }
    }

      console.log("FIBER DATA = ", fiberData);
      console.log("filtered data = ", DataPricesFiltered);
    return { ...result, total };
}



function calculateFormula(number, connectorAvgPrice, metters, amount) {
    const Iva = 23;
    const Total = number * connectorAvgPrice * metters;
    const IvaValue = Iva * Total / 100;
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format((Total + IvaValue) * amount);
}





QuantityInput.addEventListener("change", (e) => {
    QuantityInputValue = e.target.value * 1;
    const Result = CalculateTotal(MeterValue, QuantityInputValue, configuratorFormData);
    console.log(Result);
    console.log("Metters = ", MeterValue);
});


// 12 - send request
function SendConfigurationToUser() {
    sendButton.addEventListener("click", async () => {
        try {

        } catch (error) {
            toastr.error("Erro ao efectuar a configuração  !");
        } finally {
            toastr.success("Configuração executada com sucesso !");
        }
    });
}




/// carregar as funções apos o carregamento da pagina

document.addEventListener("DOMContentLoaded", () => {
    BuildForm(1);
    ChangeMetersLabel();
    GetInputsValuesAndFillThem();
    ChangeTypeOfConfiguration();
    showDescrriptionWhileConfigurating();
    console.log(ProductsDatabase);
});




 
