/* ============================================
   PetBook - Lógica da Aplicação
   ============================================ */

// ---- Estado ----
let pets = JSON.parse(localStorage.getItem('petbook_pets') || '[]');
let currentFilter = 'all';
let currentSearch = '';

// ---- Espécies ----
const speciesEmoji = {
    cachorro: '🐕',
    gato: '🐈',
    ave: '🦜',
    roedor: '🐹',
    reptil: '🦎',
    peixe: '🐠',
    outro: '🐾'
};

const speciesLabels = {
    cachorro: 'Cachorro',
    gato: 'Gato',
    ave: 'Ave',
    roedor: 'Roedor',
    reptil: 'Réptil',
    peixe: 'Peixe',
    outro: 'Outro'
};

const sizeLabels = {
    mini: 'Mini',
    pequeno: 'Pequeno',
    medio: 'Médio',
    grande: 'Grande',
    gigante: 'Gigante'
};

const genderLabels = {
    macho: '♂️ Macho',
    femea: '♀️ Fêmea'
};

const genderIcons = {
    macho: '♂️',
    femea: '♀️'
};

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    renderPets();
    createParticles();
    updateStats();
});

// ---- Background ----
function createParticles() {
    const container = document.getElementById('bgParticles');
    const emojis = ['🐾', '💜', '⭐', '✨', '🐕', '🐈', '🦜'];

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        particle.style.left = Math.random() * 100 + '%';
        particle.style.fontSize = (Math.random() * 16 + 10) + 'px';
        particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
        particle.style.animationDelay = (Math.random() * 10) + 's';
        container.appendChild(particle);
    }
}

// ---- Status ----
function updateStats() {
    document.getElementById('totalPets').textContent = pets.length;
}

// ---- Calculadora de Idade ----
function calculateAge(birthdate) {
    if (!birthdate) return null;

    const birth = new Date(birthdate);
    const today = new Date();

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
        years--;
        months += 12;
    }

    if (today.getDate() < birth.getDate()) {
        months--;
    }

    if (years > 0) {
        return years === 1 ? '1 ano' : `${years} anos`;
    } else if (months > 0) {
        return months === 1 ? '1 mês' : `${months} meses`;
    } else {
        const diffTime = Math.abs(today - birth);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 1 ? '1 dia' : `${diffDays} dias`;
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ---- Gerar ID Único ----
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ---- Renderizar Pets ----
function renderPets() {
    const grid = document.getElementById('petsGrid');
    const emptyState = document.getElementById('emptyState');

    let filtered = pets;

    // Filtrar por Espécies
    if (currentFilter !== 'all') {
        filtered = filtered.filter(p => p.species === currentFilter);
    }

    // Filtrar por busca
    if (currentSearch) {
        const search = currentSearch.toLowerCase();
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(search) ||
            (p.breed && p.breed.toLowerCase().includes(search)) ||
            (p.color && p.color.toLowerCase().includes(search))
        );
    }

    if (filtered.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.add('visible');
        grid.style.display = 'none';
    } else {
        emptyState.classList.remove('visible');
        grid.style.display = 'grid';

        grid.innerHTML = filtered.map((pet, index) => {
            const age = calculateAge(pet.birthdate);
            const emoji = speciesEmoji[pet.species] || '🐾';
            const speciesLabel = speciesLabels[pet.species] || pet.species;
            const genderIcon = pet.gender ? (genderIcons[pet.gender] || '') : '';

            return `
                <div class="pet-card" style="animation-delay: ${index * 0.08}s" onclick="openDetailModal('${pet.id}')">
                    <div class="pet-card-actions">
                        <button class="btn-icon-sm btn-edit" onclick="event.stopPropagation(); editPet('${pet.id}')" title="Editar">✏️</button>
                        <button class="btn-icon-sm btn-delete" onclick="event.stopPropagation(); deletePet('${pet.id}')" title="Excluir">🗑️</button>
                    </div>
                    <div class="pet-card-image">
                        ${pet.photo
                    ? `<img src="${pet.photo}" alt="${pet.name}" loading="lazy">`
                    : `<span class="pet-card-placeholder">${emoji}</span>`
                }
                        <span class="pet-card-species-badge">${emoji} ${speciesLabel}</span>
                    </div>
                    <div class="pet-card-body">
                        <div class="pet-card-name">
                            ${pet.name}
                            <span class="gender-icon">${genderIcon}</span>
                        </div>
                        ${pet.breed ? `<div class="pet-card-breed">${pet.breed}</div>` : '<div class="pet-card-breed" style="opacity:0.4">Sem raça definida</div>'}
                        <div class="pet-card-info">
                            ${age ? `<span class="pet-info-tag">🎂 ${age}</span>` : ''}
                            ${pet.color ? `<span class="pet-info-tag">🎨 ${pet.color}</span>` : ''}
                            ${pet.weight ? `<span class="pet-info-tag">⚖️ ${pet.weight}kg</span>` : ''}
                            ${pet.size ? `<span class="pet-info-tag">📏 ${sizeLabels[pet.size] || pet.size}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateStats();
}

// ---- Filtros ----
function setFilter(filter, btn) {
    currentFilter = filter;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    renderPets();
}

function filterPets() {
    currentSearch = document.getElementById('searchInput').value;
    renderPets();
}

// ---- Photo Preview (with HEIC support) ----
function isHeicFile(file) {
    const name = file.name.toLowerCase();
    return name.endsWith('.heic') || name.endsWith('.heif') ||
           file.type === 'image/heic' || file.type === 'image/heif';
}

async function previewPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    const preview = document.getElementById('photoPreview');

    // Show loading state
    preview.innerHTML = `
        <span class="upload-icon">⏳</span>
        <span class="upload-text">Processando imagem...</span>
    `;

    try {
        let processedFile = file;

        // Convert HEIC/HEIF to JPEG
        if (isHeicFile(file)) {
            showToast('Convertendo HEIC para JPEG...', 'info');
            const convertedBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.85
            });
            // heic2any may return an array of blobs for multi-image HEIC
            processedFile = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            compressImage(e.target.result, 600, 0.7, (compressed) => {
                preview.innerHTML = `<img src="${compressed}" alt="Preview">`;
                preview.dataset.src = compressed;
                if (isHeicFile(file)) {
                    showToast('Foto HEIC convertida com sucesso! ✅', 'success');
                }
            });
        };
        reader.readAsDataURL(processedFile);
    } catch (err) {
        console.error('Erro ao processar imagem:', err);
        preview.innerHTML = `
            <span class="upload-icon">❌</span>
            <span class="upload-text">Erro ao converter. Tente outro formato.</span>
        `;
        showToast('Erro ao converter imagem HEIC. Tente enviar em JPEG/PNG.', 'error');
    }
}

function compressImage(dataUrl, maxWidth, quality, callback) {
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
}

// ---- Modal ----
function openModal(petId) {
    const overlay = document.getElementById('modalOverlay');
    const form = document.getElementById('petForm');
    const title = document.getElementById('modalTitle');
    const saveBtn = document.getElementById('btnSaveText');
    const preview = document.getElementById('photoPreview');

    form.reset();
    document.getElementById('editingPetId').value = '';
    preview.innerHTML = `
        <span class="upload-icon">📷</span>
        <span class="upload-text">Clique para adicionar foto</span>
        <span class="upload-hint">Aceita JPEG, PNG, HEIC e outros</span>
    `;
    preview.dataset.src = '';

    if (petId) {
        const pet = pets.find(p => p.id === petId);
        if (pet) {
            title.textContent = 'Editar Pet ✏️';
            saveBtn.textContent = 'Atualizar';
            document.getElementById('editingPetId').value = pet.id;
            document.getElementById('petName').value = pet.name || '';
            document.getElementById('petSpecies').value = pet.species || '';
            document.getElementById('petBreed').value = pet.breed || '';
            document.getElementById('petBirthdate').value = pet.birthdate || '';
            document.getElementById('petGender').value = pet.gender || '';
            document.getElementById('petColor').value = pet.color || '';
            document.getElementById('petWeight').value = pet.weight || '';
            document.getElementById('petSize').value = pet.size || '';
            document.getElementById('petNotes').value = pet.notes || '';

            if (pet.photo) {
                preview.innerHTML = `<img src="${pet.photo}" alt="Preview">`;
                preview.dataset.src = pet.photo;
            }
        }
    } else {
        title.textContent = 'Novo Pet 🐾';
        saveBtn.textContent = 'Salvar Pet';
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function closeModalOverlay(event) {
    if (event.target === event.currentTarget) {
        closeModal();
    }
}

// ---- Salvar Pet ----
function savePet(event) {
    event.preventDefault();

    const editId = document.getElementById('editingPetId').value;
    const preview = document.getElementById('photoPreview');

    const petData = {
        id: editId || generateId(),
        name: document.getElementById('petName').value.trim(),
        species: document.getElementById('petSpecies').value,
        breed: document.getElementById('petBreed').value.trim(),
        birthdate: document.getElementById('petBirthdate').value,
        gender: document.getElementById('petGender').value,
        color: document.getElementById('petColor').value.trim(),
        weight: document.getElementById('petWeight').value,
        size: document.getElementById('petSize').value,
        notes: document.getElementById('petNotes').value.trim(),
        photo: preview.dataset.src || '',
        createdAt: editId ? (pets.find(p => p.id === editId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (editId) {
        const index = pets.findIndex(p => p.id === editId);
        if (index !== -1) {
            pets[index] = petData;
        }
        showToast(`${petData.name} foi atualizado! ✅`, 'success');
    } else {
        pets.unshift(petData);
        showToast(`${petData.name} foi adicionado! 🎉`, 'success');
    }

    savePetsToStorage();
    renderPets();
    closeModal();
}

// ---- Editar Pet ----
function editPet(id) {
    openModal(id);
}

// ---- Deletar Pet ----
function deletePet(id) {
    const pet = pets.find(p => p.id === id);
    if (!pet) return;

    if (confirm(`Tem certeza que deseja excluir ${pet.name}? 😢`)) {
        pets = pets.filter(p => p.id !== id);
        savePetsToStorage();
        renderPets();
        closeDetailModal();
        showToast(`${pet.name} foi removido`, 'info');
    }
}

// ---- Modal de Detalhes ----
function openDetailModal(id) {
    const pet = pets.find(p => p.id === id);
    if (!pet) return;

    const overlay = document.getElementById('detailModalOverlay');
    const content = document.getElementById('detailContent');

    const age = calculateAge(pet.birthdate);
    const emoji = speciesEmoji[pet.species] || '🐾';
    const speciesLabel = speciesLabels[pet.species] || pet.species;
    const genderIcon = pet.gender ? (genderIcons[pet.gender] || '') : '';
    const genderLabel = pet.gender ? (genderLabels[pet.gender] || '') : '—';

    content.innerHTML = `
        ${pet.photo
            ? `<img class="detail-image" src="${pet.photo}" alt="${pet.name}">`
            : `<div class="detail-placeholder">${emoji}</div>`
        }
        <div class="detail-body">
            <h2 class="detail-name">
                ${pet.name} ${genderIcon}
            </h2>
            <div class="detail-breed">${emoji} ${speciesLabel}${pet.breed ? ' • ' + pet.breed : ''}</div>
            
            <div class="detail-info-grid">
                <div class="detail-info-item">
                    <div class="detail-info-label">🎂 Idade</div>
                    <div class="detail-info-value">${age || '—'}</div>
                </div>
                <div class="detail-info-item">
                    <div class="detail-info-label">📅 Nascimento</div>
                    <div class="detail-info-value">${formatDate(pet.birthdate)}</div>
                </div>
                <div class="detail-info-item">
                    <div class="detail-info-label">🎨 Cor</div>
                    <div class="detail-info-value">${pet.color || '—'}</div>
                </div>
                <div class="detail-info-item">
                    <div class="detail-info-label">⚖️ Peso</div>
                    <div class="detail-info-value">${pet.weight ? pet.weight + ' kg' : '—'}</div>
                </div>
                <div class="detail-info-item">
                    <div class="detail-info-label">📏 Tamanho</div>
                    <div class="detail-info-value">${pet.size ? (sizeLabels[pet.size] || pet.size) : '—'}</div>
                </div>
                <div class="detail-info-item">
                    <div class="detail-info-label">⚧ Sexo</div>
                    <div class="detail-info-value">${genderLabel}</div>
                </div>
            </div>
            
            ${pet.notes ? `
                <div class="detail-notes">
                    <div class="detail-notes-label">📝 Observações</div>
                    <div class="detail-notes-text">${pet.notes.replace(/\n/g, '<br>')}</div>
                </div>
            ` : ''}
            
            <div class="detail-actions">
                <button class="btn-primary" onclick="closeDetailModal(); editPet('${pet.id}')">
                    <span class="btn-icon">✏️</span> Editar
                </button>
                <button class="btn-secondary" onclick="deletePet('${pet.id}')" style="border-color: rgba(239,68,68,0.3); color: #ef4444;">
                    <span class="btn-icon">🗑️</span> Excluir
                </button>
            </div>
        </div>
    `;

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
    const overlay = document.getElementById('detailModalOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function closeDetailModalOverlay(event) {
    if (event.target === event.currentTarget) {
        closeDetailModal();
    }
}

// ---- Toast Notifications ----
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3200);
}

// ---- LocalStorage ----
function savePetsToStorage() {
    try {
        localStorage.setItem('petbook_pets', JSON.stringify(pets));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            showToast('Armazenamento cheio! Tente remover fotos.', 'error');
        }
    }
}

// ---- Keyboard Shortcuts ----
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeDetailModal();
    }
});
