String.prototype.contains = function(it) { return this.indexOf(it) != -1; };
var countInterator = 0;
var simplexJS = {
	debug: false, // Ativa/Desativa mensagens de console
	/**
	 * [Constrói uma matriz com os elementos da tabela Simplex]
	 * @param  {[array]} matriz [Valores da função Z e das restrições]
	 * @param  {[array]} op     [Tipo da inequação das restrições]
	 * @return {[array]}        [Matriz com valores da tabela Simplex]
	 */	
	build: function(matriz, op, tipo ) {
		var tabela = []; var tCol; var tRow;
		var variaveis = matriz[0].length - 1; // - inequação
		var restricoes = matriz.length - 1; // - função Z
		var lastColumn = variaveis; // Coluna 'b' da Matriz
		// Número de Colunas da Tabela
		tCol = 1 + variaveis + restricoes + 1 ; // ( Base + Variáveis + Restrições + b )
		// Número de Linhas da Tabela
		tRow = 1 + restricoes + 1; // ( Cabeçalho + Variáveis Básicas + Z )
		
		// Constrói Cabeçalho
		// -----------------------------------------------------------------------------
		var f = 1; var v = 1;
		var row = []; 
		for( k = 0; k < tCol ; k++ ) {
			if( k == 0 ) 
				row[k] = 'Base';
			else if ( k > 0 && k <= ( variaveis ) ) {
				row[k] = 'x'+v;
				v++;
			}
			else if ( k > variaveis && k < tCol - 1 ) {
				row[k] = 'f'+f;
				f++;
			}
			else
				row[k] = 'b';
		}
		tabela[0] = row;

		// Constrói restante da Tabela
		// -----------------------------------------------------------------------------
		var isZ = false;
		for( l = 1; l < tRow ; l++ ) { // Começa após cabeçalho
			var row = [];

			// Constrói a Base
			if( l == tRow - 1) {
				isZ = true;
				row[0] = 'Z';
			}
			else {
				isZ = false;
				row[0] = 'f'+(l);
			}

			// Preenche tabela com valores
			for( c = 1; c < tCol ; c++ ) {

				if( c > variaveis && c < tCol - 1) { // Variáveis Básicas
					if( l == ( c - ( variaveis ))) {
						if( op[(l-1)] == '>=' )
							row[c] = -1;
						else if( op[(l-1)] == '<=' )
							row[c] = 1;
					}
						
					else
						row[c] = 0;
				} else if ( c == tCol - 1 ) { // b na última coluna
				
					if( isZ )
						row[c] = matriz[(0)][lastColumn];
					else
						row[c] = matriz[(l)][lastColumn];
				} else { // demais valores
					if( isZ ) {
						if( tipo == "max" ) // Maximização
							row[c] = matriz[(0)][(c-1)] * -1;
						else if ( tipo == "min" ) // Minificação
							row[c] = matriz[(0)][(c-1)];
					} else
						row[c] = matriz[l][(c-1)];
				}
			}

			tabela[l] = row;
		}
		if(simplexJS.debug == true) this.debugTable(tabela);
		return tabela;
	},
	show: function(tabela) {
		var html;
		var cols = tabela[0].length;
		var rows = tabela.length;

		html = `<table class="table table-striped">`;
			html += `<thead>`;
				html += `<tr>`;
				for( j = 0; j < cols ; j++) {
					html += `<th>`+tabela[0][j]+`</th>`;
				}
				html += `</tr>`;
			html += `</thead>`;

			html += `</tbody>`;
			for( i = 1; i < rows ; i++) {
				html += `<tr>`;
				for( j = 0; j < cols ; j++) {
					html += `<td>`+tabela[i][j]+`</td>`;
				}
				html += `</tr>`;
			}
			html += `</tbody>`;

		html += `</table>`;
		return html;
	},
	debugTable: function(tabela) {
		
		var cols = tabela[0].length;
		var rows = tabela.length;

		for( i = 0; i < rows ; i++) {
			var output = "";
			for( j = 0; j < cols ; j++) {
				if( tabela[i][j] == "Base" ) tabela[i][j] = "";
				output += tabela[i][j]+'\t';
			}
			console.log(output);
		}
		console.log('-------------------------------------');
		return;
	},
	rowIterator: function(tabela,row,funcao) {
		var cols = tabela[0].length;
		
		for( j = 1; j < cols ; j++ )
			funcao(j,tabela[row][j]);
	},
	colIterator: function(tabela,col,funcao) {
		var rows = tabela.length;
		
		for( j = 1; j < rows ; j++ )
			funcao(j,tabela[j][col]);
	},
	showSolution: function(stepTable) {
		var tabela = JSON.parse(JSON.stringify(stepTable[(stepTable.length - 1)]));  
		var cols = tabela[0].length;
		var rows = tabela.length;
		var zRow = (rows - 1);
		var bCol = (cols - 1);
		var basicas = [];
		var qtdBasicas = 0;
		var qtdNaoBasicas = 0;
		var naoBasicas = [];
		var basicasTable = "";
		var naoBasicasTable = "";
		
		// Salva variáveis básicas
		this.colIterator(tabela,0,(
			function(row,val) {
				basicas[qtdBasicas] = { 'variable': val, 'value': tabela[row][bCol] };
				qtdBasicas++;
			}
		));
		
		// Constrói HTML das variáveis básicas
		for( var j = 0; j < basicas.length ; j++ ) {
			basicasTable += `
				<tr>
					<td>`+basicas[j].variable+`</td>
					<td>`+basicas[j].value+`</td>
				</tr>
			`;
		}

		// Constrói Variáveis Não Básicas
		this.rowIterator(tabela,0,(
			function(col,val) {
				if( val == 'b' )
					return;
				// Verifica se não é básica
				for( var k = 0; k < (basicas.length - 1) ; k++ )
					if( basicas[k].variable === val )
						return;
				naoBasicas[qtdNaoBasicas] = { 'variable': val, 'value': 0 };
				qtdNaoBasicas++;
			}
		));			
		
		// Constrói HTML das variáveis não básicas
		for( j = 0; j < naoBasicas.length ; j++ )
			naoBasicasTable += `
				<tr>
					<td>`+naoBasicas[j].variable+`</td>
					<td>`+naoBasicas[j].value+`</td>
				</tr>
			`;
			
		$("#Solution").html(`
					<hr>
					<div class="row" >
						<div class="col-md-6">
							<h3 style="margin:0 0 10px 0;">Variáveis Básicas</h3>
							<div class="well">
								<table class="table table-striped">
									<thead>
										<tr>
											<th>Variável</th>
											<th>Valor</th>
										</tr>
									</thead>
									<tbody>
										`+basicasTable+`
									</tbody>
								</table>
							</div>
						</div>
						<div class="col-md-6">
							<h3 style="margin:0 0 10px 0;">Variáveis Não Básicas</h3>
							<div class="well">
								<table class="table table-striped">
									<thead>
										<tr>
											<th>Variável</th>
											<th>Valor</th>
										</tr>
									</thead>
									<tbody>
										`+naoBasicasTable+`
									</tbody>
								</table>
							</div>
						</div>
					</div>
					<hr>
					<div class="row" >
						<div class="col-md-12">
							<h3 style="margin:0 0 10px 0;">Cálculo de Sensibilidade</h3>
							<div class="well">
								`+this.calculateSensibility(stepTable,basicas,naoBasicas)+`
							</div>
						</div>
					</div>
		`);
	},
	calculateSensibility: function(stepTable,basicas,naoBasicas) {
		var firstTable = JSON.parse(JSON.stringify(stepTable[0]));  
		var table = JSON.parse(JSON.stringify(stepTable[(stepTable.length - 1)]));  
		var cols = table[0].length;
		var rows = table.length;
		var zRow = (rows - 1);
		var bCol = (cols - 1);
		var numRestricoes = rows - 2;
		var numVariaveis = cols - 2 - (rows - 2);

		// Restrições		
		var tableRestricoes = ``;
		var tableRestricoesValues = ``;
		var restricoes = [];


		for( i = 0; i < numRestricoes ; i++ )
			restricoes[i] = { 'original' : 0, 'excedente' : 0, 'sombra' : 0, 'inf' : 0, 'sup' : 0 };

		// Valores Iniciais
		this.colIterator(firstTable,bCol,(
			function(row,val) {
				if( row != zRow )
					restricoes[(row - 1)].original = val;
			}
		));

		// Excedente
		this.colIterator(table,bCol,(
			function(row,val) {
				if( val > 0 ) {
					if( table[row][0].contains('f') ) {
						var f = table[row][0].match(/\d+/)[0];
						if(simplexJS.debug == true) console.log( '[Excesso] F'+f+': '+table[row][bCol]);
						restricoes[( f - 1 )].excedente = table[row][bCol];
					}
				}
			}
		));

		// Preço Sombra
		this.rowIterator(table,zRow,(
			function(col,val) {
				if( col > numVariaveis && col < bCol) { // Só coluna das restrições
					restricoes[(col - numVariaveis - 1)].sombra = table[zRow][col];
				}
			}
		));
		
		// Limites
		for( i = 0; i < numRestricoes ; i++ ) {
			var resultados = [];
			var index;
			var j = 0;
			this.colIterator(table,bCol,(
				function(row,val) {
					if( row != zRow ) {

						if( table[row][( numVariaveis + 1 + i )] != 0 ) {
							j++
							resultados[j] = table[row][bCol] / ( table[row][( numVariaveis + 1 + i )] * -1 );
						}
						if(simplexJS.debug == true) console.log("Dividindo "+table[row][bCol]+" por "+( table[row][( numVariaveis + 1 + i )] * -1 )+" = "+resultados[j]);

					}
				}
			));

			resultados[(resultados.length)] = 0; // Insere o 0 no vetor
			resultados.sort(function(a,b){return a - b}); // Ordena o vetor de ordem crescente
			index = resultados.indexOf(0); // Acha a posição do 0 no vetor

			if(simplexJS.debug == true) console.log( 'Sequência: '+resultados);
			if(simplexJS.debug == true) console.log( '[0] na posição '+index);

			if( restricoes[i].excedente > 0 ) { // Se tiver excedente

				restricoes[i].sup = 'infinito';
				if( index == 0 )
					restricoes[i].inf = restricoes[i].original;
				else
					restricoes[i].inf = restricoes[i].original + resultados[(index - 1 )];

			} else {
				restricoes[i].sup = restricoes[i].original;
				restricoes[i].inf = restricoes[i].original;

				if( index > 0 && index < ( resultados.length - 1 )) { // Se tem ambos vizinhos
					restricoes[i].sup += resultados[(index + 1 )];
					restricoes[i].inf += resultados[(index - 1 )]; 
				} else if ( index == 0 && index < ( resultados.length - 1 ) ) { // Se só tem vizinho da direita
					restricoes[i].sup += resultados[(index + 1 )];					
				} else if ( index > 0 && index == ( resultados.length - 1 ) ) { // Se só tem vizinho da esquerda
					restricoes[i].inf += resultados[(index - 1 )]; 					
				}
			}
		}



		for( i = 1; i <= numRestricoes ; i++ )
			tableRestricoesValues += `
				<tr>
					<td><b>F`+i+`</b></td>
					<td>`+restricoes[(i-1)].original+`</td>
					<td>`+restricoes[(i-1)].excedente+`</td>
					<td>`+restricoes[(i-1)].sombra+`</td>
					<td>`+restricoes[(i-1)].inf+`</td>
					<td>`+restricoes[(i-1)].sup+`</td>
				</tr>
			`;

		tableRestricoes = `
			<table class="table table-striped">
				<thead>
					<tr>
						<th></th>
						<th>Valor Original</th>
						<th>Excedente</th>
						<th>Preço Sombra</th>
						<th>Limite Inferior</th>
						<th>Limite Superior</th>
					</tr>
				</thead>
				<tbody>
					`+tableRestricoesValues+`
				</tbody>
			</table>
		`

		// Variaveis	
		var tableVariaveis = ``;
		var tableVariaveisValues = ``;
		var variaveis = [];


		for( i = 0; i < numVariaveis ; i++ )
			variaveis[i] = { 'original' : 0, 'excedente' : 0, 'reduzido' : 0, 'min' : '-', 'max' : '-' };

		// Valores Iniciais
		this.rowIterator(firstTable,zRow,(
			function(col,val) {
				if( col > 0 && col <= numVariaveis )
					variaveis[(col - 1)].original = val * -1;
			}
		));

		// Custo Reduzido
		this.rowIterator(table,zRow,(
			function(col,val) {
				if( col > 0 && col <= numVariaveis )
					variaveis[(col - 1)].reduzido = val;
			}
		));

		// Excedente
		this.colIterator(table,bCol,(
			function(row,val) {
				if( val > 0 ) {
					if( table[row][0].contains('x') ) {
						var x = table[row][0].match(/\d+/)[0];
						if(simplexJS.debug == true) console.log( '[Excesso] X'+x+': '+table[row][bCol]);
						variaveis[( x - 1 )].excedente = table[row][bCol];
					}
				}
			}
		));

		for( i = 1; i <= numVariaveis ; i++ )
			tableVariaveisValues += `
				<tr>
					<td><b>X`+i+`</b></td>
					<td>`+variaveis[(i-1)].original+`</td>
					<td>`+variaveis[(i-1)].excedente+`</td>
					<td>`+variaveis[(i-1)].reduzido+`</td>
					<td>`+variaveis[(i-1)].min+`</td>
					<td>`+variaveis[(i-1)].max+`</td>
				</tr>
			`;

		tableVariaveis = `
			<table class="table table-striped">
				<thead>
					<tr>
						<th></th>
						<th>Valor Original</th>
						<th>Excedente</th>
						<th>Custo Reduzido</th>
						<th>Custo Máximo</th>
						<th>Custo Mínimo</th>
					</tr>
				</thead>
				<tbody>
					`+tableVariaveisValues+`
				</tbody>
			</table>
		`


		return `
			<h4>Variáveis</h4>
			`+tableVariaveis+`
			<br>

			<h4>Restrições</h4>
			`+tableRestricoes+`
		`;
	},
	calculate: function(stepTable,tabela,tipo) {
		countInterator++
		var cols = tabela[0].length;
		var rows = tabela.length;
		var zRow = (rows - 1);
		var bCol = (cols - 1);
		var variaveis = cols - 2 - (rows - 2);
		var aux = 0;
		var bFound, zFound, pivo;

		// Descobre valor mais espressivo da linha Z
		this.rowIterator(tabela,zRow,(
			function(col,val) {
				if(
					(( tipo == "max" && val < 0 ) || tipo == "min" )
					&& Math.abs(val) > Math.abs(aux)
					&& col < bCol // Só considera variáveis básicas
				) {
					aux = val;
					zFound = {'value': val, 'row': zRow, 'col': col};
				}
			}
		));

		numMaxInteracoes = parseInt( $("#varMaxInter").val() );

		if (countInterator >= numMaxInteracoes) {
			// Condição de Parada
			$("#goNext").prop('disabled', true);
			console.log('Numero maximo de interações');

			this.showSolution(stepTable);
			return tabela;
		}

		if( !zFound ) {
			// Condição de Parada
			$("#goNext").prop('disabled', true);
			if(simplexJS.debug == true) console.log('Z não encontrado');

			// Checa se não é irresolvível
			// Linha Z : Coluna B é negativo e o resto é positivo
			if( tabela[zRow][bCol] < 0 ) {
				alert('Não existe solução #1');
				return tabela;
			} else {
				if( tipo == "min" ) // Minimização inverte sinal do Z final
					tabela[zRow][bCol] *= -1;
			}
			// Mostra variáveis
			this.showSolution(stepTable);
			return tabela;
		}

		if(simplexJS.debug == true) console.log('Z: '+zFound.value+' em ['+zFound.row+','+zFound.col+']');

		aux = 0;

		// Descobre quem sai da base:  menor valor da coluna b / valor 	da coluna do Z
		this.colIterator(tabela,bCol,(
			function(row,val) {
				if( !(val < 0  || tabela[row][zFound.col] <= 0 )) { // Somente valores numéricos
					var division = val / tabela[row][zFound.col];

					if(simplexJS.debug == true) console.log('Testando B: '+val+' em ['+row+','+bCol+']');

					if( division > 0 && (( division < aux ) || aux == 0 )) {
						aux = division;
						bFound = {'value': val, 'row': row, 'col': bCol};
						if(simplexJS.debug == true) console.log('Menor achado - B: '+val+' em ['+row+','+bCol+']');
					}
				} else {
					if(simplexJS.debug == true) console.log('Não atende condição - B: '+val+' em ['+row+','+bCol+'] - '+tabela[row][zFound.col]);
				}
			}
		));

		// Se não encontrou quem sai da base, para.
		if( aux == 0 ) {
			$("#goNext").prop('disabled', true);
			alert('Não existe solução #2');
			return tabela;
		}

		// Define Pivo
		pivo = {'value': tabela[bFound.row][zFound.col], 'row': bFound.row, 'col': zFound.col }; 
		
		// Inverte variáveis no cabeçalho
		tabela[bFound.row][0] = tabela[0][zFound.col];

		if(simplexJS.debug == true) console.log('Pivo: '+pivo.value+' encontrado em ['+pivo.row+','+pivo.col+']');
		if(simplexJS.debug == true) console.log('Dividindo linha '+pivo.row+' pelo Pivô');

		// Transformação de Matriz
		// Divide elementos da Linha pelo Pivô
		this.rowIterator(tabela,bFound.row,(
			function(col,val) {
				tabela[bFound.row][col] = tabela[bFound.row][col] / pivo.value;
			}
		));

		if(simplexJS.debug == true) this.debugTable(tabela);
		if(simplexJS.debug == true) console.log('Zerando coluna do pivo');

		// Zera coluna do Pivô
		this.colIterator(tabela,pivo.col,(
			function(row,val) {

				var zerarValor = tabela[row][pivo.col] * -1;
				for( col = 1; col < cols ; col ++) {
					if( row == pivo.row ) continue;
					if(simplexJS.debug == true) console.log('['+row+','+col+'] '+tabela[row][col]+'= '+tabela[pivo.row][col]+'*'+zerarValor+'+'+tabela[row][col]+' = '+(tabela[pivo.row][col] * zerarValor + tabela[row][col]));
					tabela[row][col] = tabela[pivo.row][col] * zerarValor + tabela[row][col];
				}

				/*simplexJS.rowIterator(tabela,row,(
					function(col,val) {
						if( !(row == pivo.row) ) { // Não mexe na linha do pivo
							if(simplexJS.debug == true) console.log('['+row+','+col+'] '+tabela[row][col]+'= '+tabela[pivo.row][col]+'*'+zerarValor+'+'+tabela[row][col]+' = '+(tabela[pivo.row][col] * zerarValor + tabela[row][col]));
							tabela[row][col] = tabela[pivo.row][col] * zerarValor + tabela[row][col];
						}
					}
				));*/
			}
		));

		return tabela;
	}
}
