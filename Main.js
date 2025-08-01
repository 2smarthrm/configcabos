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

        const fiber_number = produto.name.includes("Duplex")   ? "2 - fibras duplex" : "1 - fibra simplex";

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


let currentConfigValue = 1;
function GetCablesImages(tp) {
    const Imagesdiv = document.createElement("div");
 
    const PigtailsImages = ` 
    <a href="https://ibb.co/HTsMJmMn"><img src="https://i.ibb.co/whXbvDbM/c-v.png" alt="c-V" border="0"></a> 
    <a href="https://ibb.co/ynXGTq2g"><img src="https://i.ibb.co/0jc8Nr5Y/c-L.png" alt="c-L" border="0"></a>
    <a href="https://ibb.co/Jj0C5j36"><img src="https://i.ibb.co/jkBHgkJ0/c-r.png" alt="c-r" border="0"></a>
    <a href="https://ibb.co/Df19vXW2"><img src="https://i.ibb.co/zVmXBcxv/c-A.png" alt="c-A" border="0"></a>    
    <a href="https://ibb.co/Tq0wvSw9"><img src="https://i.ibb.co/JFpcB4cD/c-azul.png" alt="c-B" border="0"></a>
    <a href="https://ibb.co/cSshRtCp"><img src="https://i.ibb.co/4n0RCMYD/c-w.png" alt="c-w" border="0"></a>
    <a href="https://ibb.co/0j5CZt7w"><img src="https://i.ibb.co/zhdXbJMk/branco.png" alt="c-br" border="0"></a>

    GREEN pigtails --------*****
    
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/rKVxGrYF/1din-pc-V-A.png" alt="1din-pc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/d4cpvJ0B/1fc-pc-V-A.png" alt="1fc-pc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/d4stRkd3/1lc-pc-V-A.png" alt="1lc-pc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/DDKG7z4b/1mtrl-pc-V-A.png" alt="1mtrl-pc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/C5FqgTWc/1mu-pc-V-A.png" alt="1mu-pc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/BK37DsV4/1sc-pc-V-A.png" alt="1sc-pc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/KjpGvPD9/1st-pc-V-A.png" alt="1st-pc-V-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/rKVxGrYF/1din-pc-V-A.png" alt="1din-upc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/d4cpvJ0B/1fc-pc-V-A.png" alt="1fc-upc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/d4stRkd3/1lc-pc-V-A.png" alt="1lc-upc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/DDKG7z4b/1mtrl-pc-V-A.png" alt="1mtrl-upc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/C5FqgTWc/1mu-pc-V-A.png" alt="1mu-upc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/BK37DsV4/1sc-pc-V-A.png" alt="1sc-upc-V-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/KjpGvPD9/1st-pc-V-A.png" alt="1st-upc-V-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/bMLSNtmT/1din-pc-V-B.png" alt="1din-pc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/LX5F4G85/1fc-pc-V-B.png" alt="1fc-pc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/M53ShyHR/1lc-pc-V-B.png" alt="1lc-pc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/QFdhXg8n/1mtrl-pc-V-B.png" alt="1mtrl-pc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/ynX5TXvv/1mu-pc-V-B.png" alt="1mu-pc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/ccp8pM0q/1sc-pc-V-B.png" alt="1sc-pc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/BKtQ3RYt/1st-pc-V-B.png" alt="1st-pc-V-B" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/bMLSNtmT/1din-pc-V-B.png" alt="1din-upc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/LX5F4G85/1fc-pc-V-B.png" alt="1fc-upc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/M53ShyHR/1lc-pc-V-B.png" alt="1lc-upc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/QFdhXg8n/1mtrl-pc-V-B.png" alt="1mtrl-upc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/ynX5TXvv/1mu-pc-V-B.png" alt="1mu-upc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/ccp8pM0q/1sc-pc-V-B.png" alt="1sc-upc-V-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/BKtQ3RYt/1st-pc-V-B.png" alt="1st-upc-V-B" border="0"></a>


    
    ORANGE  pigtails------*****

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/LDtVyLTS/1din-pc-L-A.png" alt="1din-pc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/8DPw5WGW/1fc-pc-L-A.png" alt="1fc-pc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/CrCK0Tm/1lc-pc-L-A.png" alt="1lc-pc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/prR32Rrz/1mtrl-pc-L-A.png" alt="1mtrl-pc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/R4QcFnMH/1mu-pc-L-A.png" alt="1mu-pc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Hv2gB7w/1sc-pc-L-A.png" alt="1sc-pc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/5X1LWFC2/1st-pc-L-A.png" alt="1st-pc-L-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/LDtVyLTS/1din-pc-L-A.png" alt="1din-upc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/8DPw5WGW/1fc-pc-L-A.png" alt="1fc-upc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/CrCK0Tm/1lc-pc-L-A.png" alt="1lc-upc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/prR32Rrz/1mtrl-pc-L-A.png" alt="1mtrl-upc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/R4QcFnMH/1mu-pc-L-A.png" alt="1mu-upc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Hv2gB7w/1sc-pc-L-A.png" alt="1sc-upc-L-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/5X1LWFC2/1st-pc-L-A.png" alt="1st-upc-L-A" border="0"></a>
 
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/JFC82pcX/1din-pc-L-B.png" alt="1din-pc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/JFFrY1W7/1fc-pc-L-B.png" alt="1fc-pc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/5WWF9QLd/1lc-pc-L-B.png" alt="1lc-pc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/1tdnxbRk/1mtrl-pc-L-B.png" alt="1mtrl-pc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/zTf854xh/1mu-pc-L-B.png" alt="1mu-pc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/WvP9rmqW/1sc-pc-L-B.png" alt="1sc-pc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/p6hqnQGc/1st-pc-L-B.png" alt="1st-pc-L-B" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/JFC82pcX/1din-pc-L-B.png" alt="1din-upc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/JFFrY1W7/1fc-pc-L-B.png" alt="1fc-upc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/5WWF9QLd/1lc-pc-L-B.png" alt="1lc-upc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/1tdnxbRk/1mtrl-pc-L-B.png" alt="1mtrl-upc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/zTf854xh/1mu-pc-L-B.png" alt="1mu-upc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/WvP9rmqW/1sc-pc-L-B.png" alt="1sc-upc-L-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/p6hqnQGc/1st-pc-L-B.png" alt="1st-upc-L-B" border="0"></a>


    PURPLE pigtails -----------*******
   
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/cSdDZJJz/1din-pc-R-A.png" alt="1din-pc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/9m6nH3HL/1fc-pc-R-A.png" alt="1fc-pc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Jj1Q0tDk/1lc-pc-R-A.png" alt="1lc-pc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Kz7rQvVc/1mtrl-pc-R-A.png" alt="1mtrl-pc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/396rfh82/1mu-pc-R-A.png" alt="1mu-pc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/G4LWt7DT/1sc-pc-R-A.png" alt="1sc-pc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/1fJVT5s9/1st-pc-R-A.png" alt="1st-pc-R-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/cSdDZJJz/1din-pc-R-A.png" alt="1din-upc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/9m6nH3HL/1fc-pc-R-A.png" alt="1fc-upc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Jj1Q0tDk/1lc-pc-R-A.png" alt="1lc-upc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Kz7rQvVc/1mtrl-pc-R-A.png" alt="1mtrl-upc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/396rfh82/1mu-pc-R-A.png" alt="1mu-upc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/G4LWt7DT/1sc-pc-R-A.png" alt="1sc-upc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/1fJVT5s9/1st-pc-R-A.png" alt="1st-upc-R-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/pBc5TDMg/1din-pc-R-B.png" alt="1din-pc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/7NZWRBcR/1fc-pc-R-B.png" alt="1fc-pc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Vk9QyJ3/1lc-pc-R-B.png" alt="1lc-pc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/h0NmKV5/1mtrl-pc-R-B.png" alt="1mtrl-pc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/gLZq0X7d/1mu-pc-R-B.png" alt="1mu-pc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/LdqjY1yd/1sc-pc-R-B.png" alt="1sc-pc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/tjgTxCN/1st-pc-R-B.png" alt="1st-pc-R-B" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/pBc5TDMg/1din-pc-R-B.png" alt="1din-upc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/7NZWRBcR/1fc-pc-R-B.png" alt="1fc-upc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Vk9QyJ3/1lc-pc-R-B.png" alt="1lc-upc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/h0NmKV5/1mtrl-pc-R-B.png" alt="1mtrl-upc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/gLZq0X7d/1mu-pc-R-B.png" alt="1mu-upc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/LdqjY1yd/1sc-pc-R-B.png" alt="1sc-upc-R-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/tjgTxCN/1st-pc-R-B.png" alt="1st-upc-R-B" border="0"></a>


    YELLOW pigtails -----------*******

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/bjwS98bc/1din-pc-A-A.png" alt="1din-pc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/tMSdhF0X/1e2000-apc-A-A.png" alt="1e2000-apc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/C3sT5txd/1e2000-upc-A-A.png" alt="1e2000-upc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/hFKtC81F/1fc-pc-A-A.png" alt="1fc-pc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/gNBz4LJ/1lc-apc-A-A.png" alt="1lc-apc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/vCLYQ1WK/1lc-upc-A-A.png" alt="1lc-upc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/rfRSfv9g/1mtrl-pc-A-A.png" alt="1mtrl-pc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/xKTBbKC0/1mu-pc-A-A.png" alt="1mu-pc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/KzDHFWY8/1sc-apc-A-A.png" alt="1sc-apc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/wrL6TRfq/1sc-upc-A-A.png" alt="1sc-upc-A-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/CKd65nPj/1st-pc-A-A.png" alt="1st-pc-A-A" border="0"></a> 
 
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/39Mmqn5w/1din-pc-A-B.png" alt="1din-pc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/hFY13DCy/1e2000-apc-A-B.png" alt="1e2000-apc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Dfy26fR5/1e2000-upc-A-B.png" alt="1e2000-upc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/SwdbwKtD/1fc-pc-A-B.png" alt="1fc-pc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/tPNFLWRG/1lc-apc-A-B.png" alt="1lc-apc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/TxcFs3kM/1lc-upc-A-B.png" alt="1lc-upc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/CsW4nRSh/1mtrl-pc-A-B.png" alt="1mtrl-pc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/h1BwLZDL/1mu-pc-A-B.png" alt="1mu-pc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Z6dxdFH2/1sc-apc-A-B.png" alt="1sc-apc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/8nnbQfcS/1sc-upc-A-B.png" alt="1sc-upc-A-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/zhnswN6P/1st-pc-A-B.png" alt="1st-pc-A-B" border="0"></a>


    // BLUE pigtails ---------------******

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/ch6pXjzQ/1din-pc-B-A.png" alt="1din-pc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/KxbXPGsV/1fc-pc-B-A.png" alt="1fc-pc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/CKytGkdd/1lc-pc-B-A.png" alt="1lc-pc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/8DZrr7Js/1mtrl-pc-B-A.png" alt="1mtrl-pc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/23T40ND1/1mu-pc-B-A.png" alt="1mu-pc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/GQDGGbjd/1sc-pc-B-A.png" alt="1sc-pc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/PZMVvSH6/1st-pc-B-A.png" alt="1st-pc-B-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/ch6pXjzQ/1din-pc-B-A.png" alt="1din-upc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/KxbXPGsV/1fc-pc-B-A.png" alt="1fc-upc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/CKytGkdd/1lc-pc-B-A.png" alt="1lc-upc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/8DZrr7Js/1mtrl-pc-B-A.png" alt="1mtrl-upc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/23T40ND1/1mu-pc-B-A.png" alt="1mu-upc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/GQDGGbjd/1sc-pc-B-A.png" alt="1sc-upc-B-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/PZMVvSH6/1st-pc-B-A.png" alt="1st-upc-B-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/xSwtNnrV/1din-pc-B-B.png" alt="1din-pc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/YTLBZz3H/1fc-pc-B-B.png" alt="1fc-pc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/p6k82XRP/1lc-pc-B-B.png" alt="1lc-pc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/F4pZJXVy/1mtrl-pc-B-B.png" alt="1mtrl-pc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/QFd2KfMq/1mu-pc-b-B.png" alt="1mu-pc-b-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/chs7LMX1/1sc-pc-B-B.png" alt="1sc-pc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/0ySB45Qp/1st-pc-B-B.png" alt="1st-pc-B-B" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/xSwtNnrV/1din-pc-B-B.png" alt="1din-upc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/YTLBZz3H/1fc-pc-B-B.png" alt="1fc-upc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/p6k82XRP/1lc-pc-B-B.png" alt="1lc-upc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/F4pZJXVy/1mtrl-pc-B-B.png" alt="1mtrl-upc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/QFd2KfMq/1mu-pc-b-B.png" alt="1mu-upc-b-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/chs7LMX1/1sc-pc-B-B.png" alt="1sc-upc-B-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/0ySB45Qp/1st-pc-B-B.png" alt="1st-upc-B-B" border="0"></a>


   // WATER pigtails --------------------*******

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/9kxX3mgv/1din-pc-W-A.png" alt="1din-pc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/gLVKCk8z/1fc-pc-W-A.png" alt="1fc-pc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/XZ9hypP9/1lc-pc-W-A.png" alt="1lc-pc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/k6cvhxds/1mtrl-pc-W-A.png" alt="1mtrl-pc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/gbpc26DK/1mu-pc-R-A.png" alt="1mu-pc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/4RsFC42w/1sc-pc-W-A.png" alt="1sc-pc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/jkMXNS81/1st-pc-W-A.png" alt="1st-pc-W-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/9kxX3mgv/1din-pc-W-A.png" alt="1din-upc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/gLVKCk8z/1fc-pc-W-A.png" alt="1fc-upc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/XZ9hypP9/1lc-pc-W-A.png" alt="1lc-upc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/k6cvhxds/1mtrl-pc-W-A.png" alt="1mtrl-upc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/gbpc26DK/1mu-pc-R-A.png" alt="1mu-upc-R-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/4RsFC42w/1sc-pc-W-A.png" alt="1sc-upc-W-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/jkMXNS81/1st-pc-W-A.png" alt="1st-upc-W-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/LdswMYkc/1din-pc-W-B.png" alt="1din-pc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/zL6v8KF/1fc-pc-W-B.png" alt="1fc-pc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/H0yHS2R/1lc-pc-W-B.png" alt="1lc-pc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/pBqg3jJZ/1mtrl-pc-W-B.png" alt="1mtrl-pc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Y7tyy9cZ/1mu-pc-W-B.png" alt="1mu-pc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Z1BS4j14/1sc-pc-w-B.png" alt="1sc-pc-w-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/VXY1CrV/1st-pc-W-B.png" alt="1st-pc-W-B" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/LdswMYkc/1din-pc-W-B.png" alt="1din-upc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/zL6v8KF/1fc-pc-W-B.png" alt="1fc-upc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/H0yHS2R/1lc-pc-W-B.png" alt="1lc-upc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/pBqg3jJZ/1mtrl-pc-W-B.png" alt="1mtrl-upc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Y7tyy9cZ/1mu-pc-W-B.png" alt="1mu-upc-W-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Z1BS4j14/1sc-pc-w-B.png" alt="1sc-upc-w-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/VXY1CrV/1st-pc-W-B.png" alt="1st-upc-W-B" border="0"></a>

    // WHITE pigtails ---------------------*******

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/sd590qMv/1din-pc-Br-A.png" alt="1din-pc-Br-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/QFcyG7yj/1fc-pc-BR-A.png" alt="1fc-pc-BR-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/DDkqdsg0/1lc-pc-BR-A.png" alt="1lc-pc-BR-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/S4nHTWZ1/1mtrl-pc-BR-A.png" alt="1mtrl-pc-BR-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/RTZhv9VW/1mu-pc-BR-A.png" alt="1mu-pc-BR-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/HWNv3FB/1sc-pc-BR-A.png" alt="1sc-pc-BR-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/s9ssZhvq/1st-pc-BR-A.png" alt="1st-pc-BR-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/sd590qMv/1din-pc-Br-A.png" alt="1din-upc-Br-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/QFcyG7yj/1fc-pc-BR-A.png" alt="1fc-upc-BR-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/DDkqdsg0/1lc-pc-BR-A.png" alt="1lc-upc-BR-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/S4nHTWZ1/1mtrl-pc-BR-A.png" alt="1mtrl-upc-BR-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/RTZhv9VW/1mu-pc-BR-A.png" alt="1mu-upc-BR-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/HWNv3FB/1sc-pc-BR-A.png" alt="1sc-upc-BR-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/s9ssZhvq/1st-pc-BR-A.png" alt="1st-upc-BR-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/6cQSGc6m/1din-pc-BR-B.png" alt="1din-pc-BR-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/8LrD54kK/1fc-pc-BR-B.png" alt="1fc-pc-BR-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/KchMFLHq/1lc-pc-BR-B.png" alt="1lc-pc-BR-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/p65sqMQX/1mtrl-pc-BR-B.png" alt="1mtrl-pc-BR-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/qYRCfF0M/1mu-pc-BR-B.png" alt="1mu-pc-BR-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/kszHTFgX/1sc-pc-BR-B.png" alt="1sc-pc-BR-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/5grj2Zmv/1st-pc-BR-B.png" alt="1st-pc-BR-B" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/6cQSGc6m/1din-pc-BR-B.png" alt="1din-upc-BR-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/8LrD54kK/1fc-pc-BR-B.png" alt="1fc-upc-BR-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/KchMFLHq/1lc-pc-BR-B.png" alt="1lc-upc-BR-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/p65sqMQX/1mtrl-pc-BR-B.png" alt="1mtrl-upc-BR-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/qYRCfF0M/1mu-pc-BR-B.png" alt="1mu-upc-BR-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/kszHTFgX/1sc-pc-BR-B.png" alt="1sc-upc-BR-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/5grj2Zmv/1st-pc-BR-B.png" alt="1st-upc-BR-B" border="0"></a>


    `;

    const JumpersImages = `
    
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
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/bZyZd8P/2mu-pc-R-A.png" alt="2mu-upc-W-A" border="0"></a>
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


    // WHITE ---------------------*******
    <a href="https://ibb.co/0j5CZt7w"><img src="https://i.ibb.co/zhdXbJMk/branco.png" alt="c-br" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/hFx9K8tk/2din-pc-BR-A.png" alt="2din-pc-BR-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/jv4RhrK4/2fc-pc-BR-A.png" alt="2fc-pc-BR-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/GQR8PTFV/2lc-pc-BR-A.png" alt="2lc-pc-BR-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/VWK1wgDg/2mu-pc-BR-A.png" alt="2mu-pc-BR-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/Mk6X938Y/2sc-pc-BR-A.png" alt="2sc-pc-BR-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/JRLTyhDY/2st-pc-BR-A.png" alt="2st-pc-BR-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/6R7qbhYp/mpo-pc-BR-A.png" alt="mpo-pc-BR-A" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/v6BRFXhM/mtrl-pc-BR-A.png" alt="mtrl-pc-BR-A" border="0"></a>

    <a href="https://imgbb.com/"><img src="https://i.ibb.co/wNtzBMJN/2din-pc-BR-B.png" alt="2din-pc-BR-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/4ZjtzHVP/2fc-pc-BR-B.png" alt="2fc-pc-BR-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/4RRTvPb9/2lc-pc-BR-B.png" alt="2lc-pc-BR-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/PvLMKt1Q/2mu-pc-BR-B.png" alt="2mu-pc-BR-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/DHWXvg2w/2sc-pc-BR-B.png" alt="2sc-pc-BR-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/27WGW0wD/2st-pc-BR-B.png" alt="2st-pc-BR-B" border="0"></a>
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/vf06fMD/mpo-pc-BR-B.png" alt="mpo-pc-BR-B" border="0"></a> 
    <a href="https://imgbb.com/"><img src="https://i.ibb.co/1fSr5LS1/mtrl-pc-BR-B.png" alt="mtrl-pc-BR-B" border="0"></a>
    `; 

    Imagesdiv.innerHTML =  tp === 1 ? JumpersImages : PigtailsImages;

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
            { color: "white", key: "BR" },
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


let Images = GetCablesImages(currentConfigValue);

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
                        { label: "1 Fibra (Simplex)", value: "1 fibra simplex" },
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
let CablesImages = GetCablesImages(currentConfigValue);
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
                if(element.id === "fiber_number_selector"){ 
                    const options = [
                        {label:"900µm (Mícron)", value: "900µm"},
                        {label:"2.0mm", value: "2.0mm"},
                        {label:"3.0mm", value: "3.0mm"},
                    ];  
                     let diameter = document.getElementById("fiber_diameter_selector");
                    if(e.target.value.split(" ").includes("duplex")){ 
                        diameter.innerHTML = "";
                        diameter.innerHTML = `<option disabled selected>selecionar...</option>`;
                         for(var i = 1; i < options.length; i++){
                              diameter.innerHTML += `<option value="${options[i].value}">${options[i].label}</option> `;
                         }
                    }else{ 
                        diameter.innerHTML = "";
                        diameter.innerHTML = `<option disabled selected>selecionar...</option>`;
                         for(var i = 0; i < options.length; i++) {
                              diameter.innerHTML += `<option value="${options[i].value}">${options[i].label}</option> `;
                         }
                    }
                }
                showDescrriptionWhileConfigurating();
                FindBestMatchingProduct(); 
                CalculateTotal(MeterValue, QuantityInputValue, configuratorFormData);
            });

            if (element.type !== "select") {
                document.getElementById(element.id).addEventListener("keyup", (e) => {
                    e.preventDefault();
                    element.value = e.target.value;
                    showDescrriptionWhileConfigurating();
                   console.log("Images data 2 = ", FindBestMatchingProduct())
                  CalculateTotal(MeterValue, QuantityInputValue, configuratorFormData);
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
        document.querySelectorAll("#config-form .hide").forEach(rm =>{rm.classList.remove("hide");});
        if(currentConfigValue === 3) BuildForm(3);
        else if(currentConfigValue === 2) BuildForm(2);
        else BuildForm(1);
        showDescrriptionWhileConfigurating();
        Images = GetCablesImages(currentConfigValue);
        CablesImages = GetCablesImages(currentConfigValue);
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



/// previnir a sumição do form e refresh
function PreventFormtorefresh(){
    let form = document.getElementById("config-form");
    form.addEventListener("submit", (e)=>{{
        e.preventDefault();
    }});
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
        type: "jumpers", 
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
            },
             {
                mode: "MM",
                termination: "UPC",
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
    {
        type: "pigtails",
        info: [
            {
                mode: "SM",
                termination: "UPC",
                connects: [
                    { connect: "SC", price: 0.77 },
                    { connect: "ST", price: 0.80 },
                    { connect: "LC", price: 0.77 },
                    { connect: "FC", price: 0.80 },
                    { connect: "E2000", price: 9.50 },
                    { connect: "DIN", price: 5.00 }
                ]
            },
            {
                mode: "SM",
                termination: "APC",
                connects: [
                    { connect: "SC", price: 0.86 },
                    { connect: "ST", price: 0.89 },
                    { connect: "LC", price: 0.86 },
                    { connect: "FC", price: 0.89 },
                    { connect: "E2000", price: 9.50 },
                    { connect: "DIN", price: 5.14 }
                ]
            },
            {
                mode: "MM",
                termination: "UPC",
                connects: [
                    { connect: "SC", price: 0.71 },
                    { connect: "ST", price: 0.74 },
                    { connect: "LC", price: 0.71 },
                    { connect: "FC", price: 0.74 },
                    { connect: "E2000", price: 9.50 },
                    { connect: "DIN", price: 4.71 }
                ]
            }
        ], 
    }
];







const CablesPrices = [
    {
        mode: "SM",
        prices: [
            { type: "G652D", diameter: "900µm", price: 0.07, fiber: 1 },
            { type: "G652D", diameter: "2.0mm", price: 0.11, fiber: 1 },
            { type: "G652D", diameter: "3.0mm", price: 0.13, fiber: 1 },
            { type: "G652D", diameter: "2.0mm", price: 0.23, fiber: 2 },
            { type: "G652D", diameter: "3.0mm", price: 0.26, fiber: 2 },
            { type: "G652D", diameter: "24FO for MTP", price: 2.51, fiber: 1 },
            { type: "G652D", diameter: "12FO for MTP", price: 1.29, fiber: 1 },

            { type: "G657A2", diameter: "900µm", price: 0.09, fiber: 1 },
            { type: "G657A2", diameter: "2.0mm", price: 0.13, fiber: 1 },
            { type: "G657A2", diameter: "3.0mm", price: 0.14, fiber: 1 },
            { type: "G657A2", diameter: "2.0mm", price: 0.26, fiber: 2 },
            { type: "G657A2", diameter: "3.0mm", price: 0.29, fiber: 2 },

            { type: "G657B3", diameter: "900µm", price: 0.26, fiber: 1 },
            { type: "G657B3", diameter: "2.0mm", price: 0.31, fiber: 1 },
            { type: "G657B3", diameter: "3.0mm", price: 0.34, fiber: 1 },
            { type: "G657B3", diameter: "2.0mm", price: 0.63, fiber: 2 },
            { type: "G657B3", diameter: "3.0mm", price: 0.69, fiber: 2 }
        ],
    },
    {
        mode: "MM",
        prices: [
            // OM1
            { type: "OM1", diameter: "900µm", price: 0.19, fiber: 1 },
            { type: "OM1", diameter: "2.0mm", price: 0.22, fiber: 1 },
            { type: "OM1", diameter: "3.0mm", price: 0.24, fiber: 1 },
            { type: "OM1", diameter: "Duplex 2mm", price: 0.46, fiber: 2 },
            { type: "OM1", diameter: "Duplex 3mm", price: 0.51, fiber: 2 },

            // OM2
            { type: "OM2", diameter: "900µm", price: 0.14, fiber: 1 },
            { type: "OM2", diameter: "2.0mm", price: 0.19, fiber: 1 },
            { type: "OM2", diameter: "3.0mm", price: 0.21, fiber: 1 },
            { type: "OM2", diameter: "2.0mm", price: 0.40, fiber: 2 },
            { type: "OM2", diameter: "3.0mm", price: 0.43, fiber: 2 },
            { type: "OM2", diameter: "24FO for MTP", price: 3.86, fiber: 24 },
            { type: "OM2", diameter: "12FO for MTP", price: 1.94, fiber: 12 },

            // OM3
            { type: "OM3", diameter: "900µm", price: 0.20, fiber: 1 },
            { type: "OM3", diameter: "2.0mm", price: 0.24, fiber: 1 },
            { type: "OM3", diameter: "3.0mm", price: 0.26, fiber: 1 },
            { type: "OM3", diameter: "2.0mm", price: 0.49, fiber: 2 },
            { type: "OM3", diameter: "3.0mm", price: 0.51, fiber: 2 },
            { type: "OM3", diameter: "24FO for MTP", price: 5.00, fiber: 24 },
            { type: "OM3", diameter: "12FO for MTP", price: 2.57, fiber: 12 },

            // OM4
            { type: "OM4", diameter: "900µm", price: 0.46, fiber: 1 },
            { type: "OM4", diameter: "2.0mm", price: 0.51, fiber: 1 },
            { type: "OM4", diameter: "3.0mm", price: 0.53, fiber: 1 },
            { type: "OM4", diameter: "2.0mm", price: 1.03, fiber: 2 },
            { type: "OM4", diameter: "3.0mm", price: 1.06, fiber: 2 },
            { type: "OM4", diameter: "24FO for MTP", price: 14.29, fiber: 24 },
            { type: "OM4", diameter: "12FO for MTP", price: 7.14, fiber: 12 },

            // OM5
            { type: "OM5", diameter: "900µm", price: 0.73, fiber: 1 },
            { type: "OM5", diameter: "2.0mm", price: 0.79, fiber: 1 },
            { type: "OM5", diameter: "3.0mm", price: 0.80, fiber: 1 },
            { type: "OM5", diameter: "2.0mm", price: 1.57, fiber: 2 },
            { type: "OM5", diameter: "3.0mm", price: 1.60, fiber: 2 }
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

    if (
        (currentConfigValue === 1 && sideA && sideB && cable) || // Jumpers
        (currentConfigValue === 3 && sideA && cable)              // Pigtails
    ) {
        total = calculateFormula(
            currentConfigValue,
            sideA.price,
            sideB?.price || 0,
            cable?.price || 0,
            fiberCount,
            metters,
            amount
        );

 

        TotalConfigurationTag.innerText = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(total) +  " +IVA";
        document.querySelector(".totalwithivavalue").innerText = `( `+ new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(total + (total * 23 / 100)) +" "+ ` c/Iva )`
        if (document.getElementById("totol")) {
            document.getElementById("totol").innerHTML = `Total (+IVA) : <span class="text-success">
                 ${new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(total + (total * 23 / 100))}
            </span>`;
        }
    }

    console.log("Dados da configuração = ", fiberData); 
    console.log("CABO = ", cable);
    console.log("output = ", result);


    return { ...result, total };
}


 function calculateFormula(configValue, sideAPrice, sideBPrice, cablePrice, fiberCount, metters, amount) {
    let total = 0;

    if (configValue === 1) { // Jumpers (Simplex ou Duplex)
        // Ex: Simplex = 1x Lado A + 1x Fibra (por metro) + 1x Lado B
        //     Duplex  = 2x Lado A + 1x Fibra (por metro, duplex) + 2x Lado B
        total = ((fiberCount * sideAPrice)  + (cablePrice * metters) + (fiberCount * sideBPrice)) * amount;
    } else if (configValue === 3) { // Pigtails
        // Apenas 1x conector lado A e fibra por metro
        total = (sideAPrice + cablePrice * metters) * amount;
    } else {
        total = 0;
    }

    let IvaValue = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(total * 23 / 100);
    let tot = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(total);
    let totpLusiva = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(total + (total * 23 / 100));

    return total;
}


 




QuantityInput.addEventListener("change", (e) => {
    QuantityInputValue = e.target.value * 1;
    const Result = CalculateTotal(MeterValue, QuantityInputValue, configuratorFormData); 
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
    PreventFormtorefresh();
    console.log(ProductsDatabase);
});




 
