apos as localizações adicionar em negrito e vermelho eestes testo: "O RMA será enviado para o seu email, o mesmo deve de ser impresso e acompanhado com o acessório;"
devolver função completa pronta para uso 



async function generatePDF(Data, ProductsContent) {
  try {
    const pdfDoc = await PDFDocument.create();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const blueColor = rgb(0, 0.454, 1);
    const blackColor = rgb(0, 0, 0);

    let page = pdfDoc.addPage([595, 842]); // A4 em pontos
    let yPos = 800; // Posição inicial (no topo da página)
    const lineHeight = 14;

    // Função para verificar e criar nova página se necessário
    function checkAndCreateNewPage() {
      if (yPos < 100) {
        page = pdfDoc.addPage([595, 842]);
        yPos = 800; // Reiniciar a posição para o topo da nova página
      }
    }

    // Logo
    page.drawText("EXPORTECH", {
      x: 50,
      y: yPos,
      size: 26,
      font: fontBold,
      color: blueColor,
    });

    yPos -= 20;
    page.drawText("YOUR SECURITY PARTNER", {
      x: 50,
      y: yPos,
      size: 10,
      font: fontItalic,
      color: blueColor,
    });

    yPos -= 40;
    page.drawText("FORMULÁRIO DE DEVOLUÇÃO DE EQUIPAMENTOS (RMA)", {
      x: 50,
      y: yPos,
      size: 11,
      font: fontBold,
      color: blackColor,
    });

    yPos -= 30; // Espaço após o título "FORMULÁRIO RMA"


    if (Data && Data.company) {
      checkAndCreateNewPage(); // Verificar se precisa de nova página

      page.drawText("Detalhes da Empresa:", {
        x: 50,
        y: yPos,
        size: 11,
        font: fontBold,
        color: blackColor,
      });

      yPos -= 18;

      // Exibindo os dados da empresa
      const companyData = [
        { label: 'Empresa:', value: Data.company },
        { label: 'E-mail:', value: Data.email },
        { label: 'NIF:', value: Data.nif },
        { label: 'Telefone:', value: Data.phone },
      ];

      companyData.forEach((item) => {
        checkAndCreateNewPage(); // Verificar se precisa de nova página

        page.drawText(`${item.label} ${item.value}`, {
          x: 50,
          y: yPos,
          size: 10,
          font: fontRegular,
          color: blackColor,
        });

        yPos -= lineHeight;
      });
    }

    //  Título "Detalhes dos Produtos"
    yPos -= 20;
    page.drawText("Detalhes dos Produtos", {
      x: 50,
      y: yPos,
      size: 11,
      font: fontBold,
      color: blackColor,
    });

    //  Separar os produtos
    const entries = ProductsContent.split(/\(\d+\)\s*-\s*Referência:/).filter(Boolean);

    yPos -= 30;

    entries.forEach((entry, idx) => {
      checkAndCreateNewPage(); // Verificar se precisa de nova página

      if (yPos < 100) return;

      const fields = entry
        .replace(/\n/g, ' ')
        .trim()
        .split(/Motivo:|Nº Série:|Fatura:|Password:|Avaria:|Acessórios:/)
        .map((s) => s.trim());

      const labels = ['Referência', 'Motivo', 'Nº Série', 'Fatura', 'Password', 'Avaria', 'Acessórios'];

      //  Título do produto
      page.drawText(`(${idx + 1}) Produto`, {
        x: 50,
        y: yPos,
        size: 12,
        font: fontBold,
        color: blueColor,
      });
      yPos -= 18;

      //  Campos em coluna com indentação nas quebras de linha
      for (let i = 0; i < fields.length && i < labels.length; i++) {
        const label = labels[i];
        const value = fields[i];

        const wrapped = wrapText(value, fontRegular, 10, 450);

        wrapped.forEach((line, lineIdx) => {
          const text = lineIdx === 0 ? `${label}: ${line}` : `   ${line}`;
          page.drawText(text, {
            x: 55, // margem leve para a esquerda
            y: yPos,
            size: 10,
            font: fontRegular,
            color: blackColor,
          });
          yPos -= lineHeight;
        });

        yPos -= 4;
      }

      yPos -= 10; // Espaço entre produtos
    });

    //  Rodapé
    checkAndCreateNewPage(); // Verificar se precisa de nova página
    yPos -= 20;

    //  Loja online com "Loja online" em negrito e cor preta, link azul
    page.drawText("Loja online:", {
      x: 50,
      y: yPos,
      size: 9,
      font: fontBold,
      color: blackColor, // Cor preta para "Loja online"
    });

    page.drawText(" www.store.exportech.com.pt", {
      x: 120,
      y: yPos,
      size: 9,
      font: fontRegular,
      color: blueColor, // Cor azul para o link
    });

    yPos -= 20;
    page.drawText("Localizações:", {
      x: 50,
      y: yPos,
      size: 9,
      font: fontBold,
      color: blackColor,
    });

    yPos -= 12;
    page.drawText("Sede Lisboa:", {
      x: 50,
      y: yPos,
      size: 9,
      font: fontBold,
      color: blackColor, // Negrito para "Sede Lisboa:"
    });

    yPos -= 12;
    page.drawText("Rua Fernando Farinha nº 2A e 2B, Braço de Prata 1950-448 Lisboa | Tel: +351 210 353 555", {
      x: 50,
      y: yPos,
      size: 9,
      font: fontRegular,
      color: blackColor, // Localização normal
    });

    yPos -= 12;
    page.drawText("Filial Funchal:", {
      x: 50,
      y: yPos,
      size: 9,
      font: fontBold,
      color: blackColor, // Negrito para "Filial Funchal:"
    });

    yPos -= 12;
    page.drawText("Rua da Capela do Amparo, Edifício Alpha Living Loja A, 9000-267 Funchal | Tel: +351 291 601 603", {
      x: 50,
      y: yPos,
      size: 9,
      font: fontRegular,
      color: blackColor, // Localização normal
    });

    yPos -= 12;
    page.drawText("Armazém Logístico:", {
      x: 50,
      y: yPos,
      size: 9,
      font: fontBold,
      color: blackColor, // Negrito para "Armazém Logístico:"
    });

    yPos -= 12;
    page.drawText("Estrada do Contador nº 25 - Fracção B, Sesmaria do Colaço 2130-223 Benavente | Tel: +351 210 353 555", {
      x: 50,
      y: yPos,
      size: 9,
      font: fontRegular,
      color: blackColor, // Localização normal
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;

    // Função de quebra com indentação
    function wrapText(text, font, fontSize, maxWidth) {
      const words = text.split(' ');
      const lines = [];
      let line = '';

      words.forEach((word) => {
        const testLine = line + word + ' ';
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width > maxWidth && line !== '') {
          lines.push(line.trim());
          line = word + ' ';
        } else {
          line = testLine;
        }
      });

      if (line) lines.push(line.trim());
      return lines;
    }

  } catch (error) {
    console.error("Erro ao gerar o PDF:", error);
    throw error;
  }
}

