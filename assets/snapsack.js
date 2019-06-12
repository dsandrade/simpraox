var snapsackJS = {
	debug: true, // Ativa/Desativa mensagens de console
	outputTable: function( table ) {
		var cols = table[0].length;
		var rows = table.length;

		for( var i = 0; i < rows ; i++) {
			var output = i+':\t';

			for( var j = 0; j < cols ; j++) {
				output += table[i][j]+'\t';
			}
			console.log(output);
		}
		console.log('-------------------------------------');
		return;
	},
	calculate: function( itens, capacity ) {
		// Método utilizado: 0/1 Programação Dinâmica
		// Vídeo: https://www.youtube.com/watch?v=EH6h7WA7sDw

		var valueTable = [];
		var keepTable = [];
		var choosedItens = [];
		var solution = {};
		// Usados na criação da solução
		var leftCapacity = capacity;
		var totalWeight = 0;
				
		if( snapsackJS.debug == true ) {
			console.log('Capcidade da Snapsack: '+capacity);
			console.log('Lista de itens recebidos:');
			console.log(itens);
		}

		// Inicializa os arrays, limitação do JavaScript..
		for( var currentItem = 0; currentItem <= itens.length   ; currentItem++ ) {
			valueTable[currentItem] = [];
			keepTable[currentItem] = [];
		}

		// Constrói as duas tabelas.
		for( var currentItem = 0; currentItem <= itens.length ; currentItem++ ) {
			for( var backpackCollumn = 0; backpackCollumn < capacity ; backpackCollumn++ ) {
				var backpackCapacity = backpackCollumn + 1;
				// Se não tem item para por na mochila, é tudo zero.
				if( currentItem == 0 ) { 
					valueTable[currentItem][backpackCollumn] = 0;
					keepTable[currentItem][backpackCollumn] = 0;
				} 
				// Verifica se item cabe na mochila
				else if( itens[( currentItem - 1)].weight <= backpackCapacity ) {
					var aboveValue = valueTable[(currentItem - 1)][backpackCollumn];
					var leftSpace = backpackCapacity - itens[( currentItem - 1)].weight;
					var currentValue = itens[( currentItem - 1)].value;

					if( leftSpace > 0 )
						currentValue += valueTable[(currentItem - 1)][(leftSpace - 1)];

					// Essa solução é melhor?
					if( currentValue > aboveValue ) {
						valueTable[currentItem][backpackCollumn] = currentValue;
						keepTable[currentItem][backpackCollumn] = 1;
					} else {
						valueTable[currentItem][backpackCollumn] = aboveValue;
						keepTable[currentItem][backpackCollumn] = 0;
					}					
				} 
				// Item não cabe, copia valor da linha de cima
				else {
					valueTable[currentItem][backpackCollumn] = valueTable[(currentItem - 1)][backpackCollumn];
					keepTable[currentItem][backpackCollumn] = 0;
				}

			}
		}
		
		
		// Vê quais itens serão inseridos através da tabela keep
		for( var i = itens.length ; i > 0 ; i-- ) {
			if( keepTable[i][(leftCapacity - 1)] == 1 ) {
				
				leftCapacity -= itens[( i - 1)].weight;
				totalWeight += itens[( i - 1)].weight;
				choosedItens.push((i - 1));
			}
		}

		if( snapsackJS.debug == true ) console.log(choosedItens);

		if( snapsackJS.debug == true ) {
			console.log('Tabela de Benefício:');
			snapsackJS.outputTable(valueTable);

			console.log('Tabela de Itens:');
			snapsackJS.outputTable(keepTable);
		}

		// Benefício Total será o último elemento da tabela
		solution = { 'totalBenefit' : valueTable[itens.length][(backpackCollumn - 1)], 'itens' : choosedItens, 'totalWeight' : totalWeight, 'leftCapacity' : leftCapacity };

		return solution;
	}
}
