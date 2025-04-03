document.getElementById('calcular').addEventListener('click', function() {
    const inscricaoImobiliaria = document.getElementById('inscricao-imobiliaria').value;
    const pavimentosExcedidos = parseFloat(document.getElementById('pavimentos-excedidos').value);
    const areaExtrapolaCA = parseFloat(document.getElementById('area-extrapola-ca').value);
    const areaRecuoFrontal = parseFloat(document.getElementById('area-recuo-frontal').value);
    const areaRecuoLateralFundos = parseFloat(document.getElementById('area-recuo-lateral-fundos').value);
    const areaVagasGaragem = parseFloat(document.getElementById('area-vagas-garagem').value);
    const areaExtrapolaTaxaOcupacao = parseFloat(document.getElementById('area-extrapola-taxa-ocupacao').value);
    const areaLazerFaltante = parseFloat(document.getElementById('area-lazer-faltante').value);
    const areaPermeavelFaltante = parseFloat(document.getElementById('area-permeavel-faltante').value);

    // Validação de inputs
    if (!validarInscricaoImobiliaria(inscricaoImobiliaria)) {
        mostrarErro('Inscrição Imobiliária inválida. Use o formato 000.000.00.0000');
        return;
    }

    if (!validarAreas([pavimentosExcedidos, areaExtrapolaCA, areaRecuoFrontal, areaRecuoLateralFundos, areaVagasGaragem, areaExtrapolaTaxaOcupacao, areaLazerFaltante, areaPermeavelFaltante])) {
        mostrarErro('As áreas de infração devem ser números não negativos.');
        return;
    }

    // Tratamento de erros nos selects
    const fatoresCorrecao = obterFatoresCorrecao();
    if (!fatoresCorrecao) {
        mostrarErro('Selecione valores válidos para todos os fatores de correção.');
        return;
    }

    // Verificar se todos os fatores são maiores que zero
    if (!verificarFatoresMaioresQueZero(fatoresCorrecao)) {
        mostrarErro('Preencha todos os fatores de correção em "Dados do imóvel".');
        return;
    }

    // Verificar se pelo menos uma área de infração é maior que zero
    if (!verificarAreaInfracaoMaiorQueZero([pavimentosExcedidos, areaExtrapolaCA, areaRecuoFrontal, areaRecuoLateralFundos, areaVagasGaragem, areaExtrapolaTaxaOcupacao, areaLazerFaltante, areaPermeavelFaltante])) {
        mostrarErro('Pelo menos uma área de infração deve ser maior que zero.');
        return;
    }

    // Cálculo da multa
    const UFM = 241.30;
    const BMC = calcularBMC(fatoresCorrecao, UFM);
    const VMC = calcularVMC(BMC, {
        pavimentosExcedidos,
        areaExtrapolaCA,
        areaRecuoFrontal,
        areaRecuoLateralFundos,
        areaVagasGaragem,
        areaExtrapolaTaxaOcupacao,
        areaLazerFaltante,
        areaPermeavelFaltante
    });

    // Exibição do resultado
    exibirResultado(inscricaoImobiliaria, fatoresCorrecao, {
        pavimentosExcedidos,
        areaExtrapolaCA,
        areaRecuoFrontal,
        areaRecuoLateralFundos,
        areaVagasGaragem,
        areaExtrapolaTaxaOcupacao,
        areaLazerFaltante,
        areaPermeavelFaltante
    }, BMC, VMC);
});

document.getElementById('limpar').addEventListener('click', function() {
    if (confirm('Deseja limpar todos os campos?')) {
        limparCampos();
    }
});

document.getElementById('imprimir').addEventListener('click', function() {
    document.querySelector('.d-grid').style.display = 'none';
    window.print();
    document.querySelector('.d-grid').style.display = 'flex';
});

function validarInscricaoImobiliaria(inscricao) {
    const regex = /^\d{3}\.\d{3}\.\d{2}\.\d{4}$/;
    return regex.test(inscricao);
}

function validarAreas(areas) {
    return areas.every(area => area >= 0);
}

function obterFatoresCorrecao() {
    const fatorFL = document.getElementById('fator-fl');
    const fatorVMQ = document.getElementById('fator-vmq');
    const fatorFT = document.getElementById('fator-ft');
    const fatorFV = document.getElementById('fator-fv');
    const fatorFS = document.getElementById('fator-fs');
    const fatorFI = document.getElementById('fator-fi');
    const fatorFA = document.getElementById('fator-fa');
    const fatorFU = document.getElementById('fator-fu');

    const fatores = {
        fl: { valor: parseFloat(fatorFL.value), descricao: fatorFL.options[fatorFL.selectedIndex].text },
        vmq: { valor: parseFloat(fatorVMQ.value), descricao: fatorVMQ.options[fatorVMQ.selectedIndex].text },
        ft: { valor: parseFloat(fatorFT.value), descricao: fatorFT.options[fatorFT.selectedIndex].text },
        fv: { valor: parseFloat(fatorFV.value), descricao: fatorFV.options[fatorFV.selectedIndex].text },
        fs: { valor: parseFloat(fatorFS.value), descricao: fatorFS.options[fatorFS.selectedIndex].text },
        fi: { valor: parseFloat(fatorFI.value), descricao: fatorFI.options[fatorFI.selectedIndex].text },
        fa: { valor: parseFloat(fatorFA.value), descricao: fatorFA.options[fatorFA.selectedIndex].text },
        fu: { valor: parseFloat(fatorFU.value), descricao: fatorFU.options[fatorFU.selectedIndex].text }
    };

    if (Object.values(fatores).some(fator => isNaN(fator.valor))) {
        return null;
    }

    return fatores;
}

function calcularBMC(fatoresCorrecao, UFM) {
    return fatoresCorrecao.vmq.valor * fatoresCorrecao.ft.valor * fatoresCorrecao.fv.valor * fatoresCorrecao.fs.valor * fatoresCorrecao.fa.valor * fatoresCorrecao.fi.valor * fatoresCorrecao.fu.valor * fatoresCorrecao.fl.valor * UFM;
}

function calcularVMC(BMC, areasInfracao) {
    return BMC * (
        (areasInfracao.pavimentosExcedidos * 0.4) +
        (areasInfracao.areaExtrapolaCA * 0.1) +
        (areasInfracao.areaRecuoFrontal * 0.2) +
        (areasInfracao.areaRecuoLateralFundos * 0.15) +
        (areasInfracao.areaVagasGaragem * 0.1) +
        (areasInfracao.areaPermeavelFaltante * 0.1) +
        (areasInfracao.areaLazerFaltante * 0.05) +
        (areasInfracao.areaExtrapolaTaxaOcupacao * 0.15)
    );
}

function exibirResultado(inscricaoImobiliaria, fatoresCorrecao, areasInfracao, BMC, VMC) {
    let descricaoFatores = '';
    for (const key in fatoresCorrecao) {
        let nomeFator = '';
        switch (key) {
            case 'fl':
                nomeFator = 'Localização';
                break;
            case 'vmq':
                nomeFator = 'R$ do m² de Construção';
                break;
            case 'ft':
                nomeFator = 'Topografia';
                break;
            case 'fv':
                nomeFator = 'Largura da Via';
                break;
            case 'fs':
                nomeFator = 'Situação do Lote';
                break;
            case 'fi':
                nomeFator = 'Condição';
                break;
            case 'fa':
                nomeFator = 'Acabamento';
                break;
            case 'fu':
                nomeFator = 'Tipo de edificação';
                break;
        }
        descricaoFatores += `${nomeFator}: ${fatoresCorrecao[key].descricao}<br>`;
    }

    let descricaoAreas = '';
    for (const key in areasInfracao) {
        if (areasInfracao[key] > 0) {
            let label = '';
            switch (key) {
                case 'pavimentosExcedidos':
                    label = 'Pavimentos excedidos';
                    break;
                case 'areaExtrapolaCA':
                    label = 'Área que extrapola o CA';
                    break;
                case 'areaRecuoFrontal':
                    label = 'Área sobre o recuo frontal';
                    break;
                case 'areaRecuoLateralFundos':
                    label = 'Área sobre o recuo lateral ou fundos';
                    break;
                case 'areaVagasGaragem':
                    label = 'Área de vagas garagem faltantes';
                    break;
                case 'areaExtrapolaTaxaOcupacao':
                    label = 'Área que extrapola a taxa de ocupação';
                    break;
                case 'areaLazerFaltante':
                    label = 'Área de lazer faltante';
                    break;
                case 'areaPermeavelFaltante':
                    label = 'Área permeável faltante';
                    break;
            }
            descricaoAreas += `${label}: ${areasInfracao[key].toFixed(2)} m²<br>`;
        }
    }

    const valorMultaFormatado = VMC.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const memorial = `
        <p><strong>Inscrição Imobiliária:</strong> ${inscricaoImobiliaria}</p>
        <p><strong>Descrição dos fatores de correção:</strong><br>${descricaoFatores}</p>
        <p><strong>Descrição das áreas de infração:</strong><br>${descricaoAreas}</p>
        <p><strong>Memorial de cálculo:</strong></p>
        <p>Passo 1) Cálculo da base da multa compensatória (BMC)</p>
        <p>BMC = VMQ x FT x FV x FS x FA x FI x FU x FL x UFM</p>
        <p>BMC = ${fatoresCorrecao.vmq.valor.toFixed(2)} x ${fatoresCorrecao.ft.valor.toFixed(2)} x ${fatoresCorrecao.fv.valor.toFixed(2)} x ${fatoresCorrecao.fs.valor.toFixed(2)} x ${fatoresCorrecao.fa.valor.toFixed(2)} x ${fatoresCorrecao.fi.valor.toFixed(2)} x ${fatoresCorrecao.fu.valor.toFixed(2)} x ${fatoresCorrecao.fl.valor.toFixed(2)} x 241,30 = ${BMC.toFixed(2)}</p>
        <p>Passo 2) Cálculo do valor da multa compensatória (VMC)</p>
        <p>VMC = BMC x Somatório (Ai x i%)</p>
        <p>VMC = ${BMC.toFixed(2)} x [(${areasInfracao.pavimentosExcedidos.toFixed(2)} x 0.4) + (${areasInfracao.areaExtrapolaCA.toFixed(2)} x 0.1) + (${areasInfracao.areaRecuoFrontal.toFixed(2)} x 0.2) + (${areasInfracao.areaRecuoLateralFundos.toFixed(2)} x 0.15) + (${areasInfracao.areaVagasGaragem.toFixed(2)} x 0.1) + (${areasInfracao.areaPermeavelFaltante.toFixed(2)} x 0.1) + (${areasInfracao.areaLazerFaltante.toFixed(2)} x 0.05) + (${areasInfracao.areaExtrapolaTaxaOcupacao.toFixed(2)} x 0.15)] = ${VMC.toFixed(2)}</p>
        <p>Observação: UFM = Unidade Fiscal Municipal = R$241,30 (DECRETO Nº 13.426, DE 18 DE NOVEMBRO DE 2024).</p>
        <p><strong>Valor da multa:</strong></p>
        <p style="font-size: 1.1em; font-weight: bold;">R$ ${valorMultaFormatado}</p>
    `;

    document.getElementById('resultado-texto').innerHTML = memorial;
    document.getElementById('resultado').style.display = 'block';
    document.getElementById('erro').style.display = 'none'; // Limpa mensagens de erro anteriores
}

function limparCampos() {
    document.getElementById('inscricao-imobiliaria').value = '';
    document.getElementById('pavimentos-excedidos').value = '0.00';
    document.getElementById('area-extrapola-ca').value = '0.00';
    document.getElementById('area-recuo-frontal').value = '0.00';
    document.getElementById('area-recuo-lateral-fundos').value = '0.00';
    document.getElementById('area-vagas-garagem').value = '0.00';
    document.getElementById('area-extrapola-taxa-ocupacao').value = '0.00';
    document.getElementById('area-lazer-faltante').value = '0.00';
    document.getElementById('area-permeavel-faltante').value = '0.00';

    document.getElementById('fator-fl').selectedIndex = 0;
    document.getElementById('fator-vmq').selectedIndex = 0;
    document.getElementById('fator-ft').selectedIndex = 0;
    document.getElementById('fator-fv').selectedIndex = 0;
    document.getElementById('fator-fs').selectedIndex = 0;
    document.getElementById('fator-fi').selectedIndex = 0;
    document.getElementById('fator-fa').selectedIndex = 0;
    document.getElementById('fator-fu').selectedIndex = 0;

    document.getElementById('erro').style.display = 'none';
    document.getElementById('resultado').style.display = 'none';
}

function mostrarErro(mensagem) {
    document.getElementById('erro').textContent = mensagem;
    document.getElementById('erro').style.display = 'block';
    document.getElementById('resultado').style.display = 'none';
}

function verificarFatoresMaioresQueZero(fatores) {
    return Object.values(fatores).every(fator => fator.valor > 0);
}

function verificarAreaInfracaoMaiorQueZero(areas) {
    return areas.some(area => area > 0);
}
