// Elementos do DOM
const anuncioForm = document.getElementById('anuncio-form');
const muralCards = document.getElementById('mural-cards');
const searchInput = document.getElementById('search-input');
const filterTipo = document.getElementById('filter-tipo');
const tipoSelect = document.getElementById('tipo');
const precoInput = document.getElementById('preco');

// Gerencia obrigatoriedade do campo preço com base no tipo de oferta
tipoSelect.addEventListener('change', () => {
    if (tipoSelect.value === 'Doação') {
        precoInput.value = '';
        precoInput.disabled = true;
        precoInput.removeAttribute('required');
    } else {
        precoInput.disabled = false;
        if (tipoSelect.value === 'Venda') {
            precoInput.setAttribute('required', 'true');
        }
    }
});

// Salvar e buscar do LocalStorage
let anuncios = JSON.parse(localStorage.getItem('sebo_anuncios')) || [];

// Função para renderizar os cards na tela
function renderizarMural() {
    muralCards.innerHTML = '';
    
    const busca = searchInput.value.toLowerCase();
    const tipoFiltrado = filterTipo.value;

    const anunciosFiltrados = anuncios.filter(anuncio => {
        const correspondeTexto = 
            anuncio.titulo.toLowerCase().includes(busca) ||
            anuncio.instituicao.toLowerCase().includes(busca) ||
            anuncio.campus.toLowerCase().includes(busca) ||
            anuncio.categoria.toLowerCase().includes(busca);
            
        const correspondeTipo = tipoFiltrado === 'Todos' || anuncio.tipo === tipoFiltrado;
        
        return correspondeTexto && BlacklistFilter(correspondeTipo);
    });

    if (anunciosFiltrados.length === 0) {
        muralCards.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Nenhum material encontrado com os filtros selecionados.</p>';
        return;
    }

    anunciosFiltrados.forEach((anuncio, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Formata o preço
        const textoPreco = anuncio.tipo === 'Doação' ? 'Grátis' : `R$ ${parseFloat(anuncio.preco).toFixed(2)}`;
        
        // Criar link do WhatsApp customizado
        const mensagemWhats = encodeURIComponent(`Olá! Vi seu anúncio do material "${anuncio.titulo}" no Sebo Estudantil e tenho interesse. Ainda está disponível? Estudo na instituição ${anuncio.instituicao}.`);
        const urlWhatsapp = `https://whatsapp.com{anuncio.whatsapp.replace(/\D/g, '')}&text=${mensagemWhats}`;

        card.innerHTML = `
            <span class="badge ${anuncio.tipo.toLowerCase()}">${anuncio.tipo}</span>
            <div>
                <h3 class="card-title">${anuncio.titulo}</h3>
                <div class="card-price">${textoPreco}</div>
                <div class="card-info">📁 <strong>Categoria:</strong> ${anuncio.categoria}</div>
                <div class="card-info">🏫 <strong>Instituição:</strong> ${anuncio.instituicao}</div>
                <div class="card-info">📍 <strong>Campus/Local:</strong> ${anuncio.campus}</div>
            </div>
            <div>
                <a href="${urlWhatsapp}" target="_blank" class="btn-whatsapp">Tenho Interesse</a>
                <button onclick="removerAnuncio(${index})" class="btn-delete">Excluir Anúncio</button>
            </div>
        `;
        
        muralCards.appendChild(card);
    });
}

// Helper interno para filtro simples
function BlacklistFilter(val) { return val; }

// Adicionar novo anúncio
anuncioForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const novoAnuncio = {
        titulo: document.getElementById('titulo').value,
        categoria: document.getElementById('categoria').value,
        tipo: document.getElementById('tipo').value,
        preco: document.getElementById('preco').value || 0,
        instituicao: document.getElementById('instituicao').value,
        campus: document.getElementById('campus').value,
        whatsapp: document.getElementById('whatsapp').value
    };

    anuncios.unshift(novoAnuncio); // Adiciona no início da lista
    localStorage.setItem('sebo_anuncios', JSON.stringify(anuncios));
    
    anuncioForm.reset();
    precoInput.disabled = false;
    renderizarMural();
    alert('Anúncio publicado com sucesso!');
});

// Remover anúncio
window.removerAnuncio = function(index) {
    if(confirm('Tem certeza de que deseja remover este anúncio?')) {
        anuncios.splice(index, 1);
        localStorage.setItem('sebo_anuncios', JSON.stringify(anuncios));
        renderizarMural();
    }
}

// Eventos de escuta para filtros em tempo real
searchInput.addEventListener('input', renderizarMural);
filterTipo.addEventListener('change', renderizarMural);

// Inicialização da página
renderizarMural();
