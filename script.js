document.addEventListener('DOMContentLoaded', () => {
    const addNoteBtn = document.getElementById('add-note-btn');
    const colorOptions = document.getElementById('color-options');
    const notesGrid = document.getElementById('notes-grid');
    const searchInput = document.getElementById('search-input');

    // Cargar notas guardadas al iniciar
    loadNotes();

    // --- MANEJO DE EVENTOS ---

    // 1. Mostrar/ocultar paleta de colores
    addNoteBtn.addEventListener('click', () => {
        addNoteBtn.classList.toggle('active');
        colorOptions.classList.toggle('show');
    });

    // 2. Crear una nota al hacer clic en un color
    colorOptions.addEventListener('click', (e) => {
        if (e.target.classList.contains('color-circle')) {
            const color = e.target.dataset.color;
            addNote(null, '', color, new Date()); // Crear nota vacía
            
            // Ocultar paleta después de seleccionar
            addNoteBtn.classList.remove('active');
            colorOptions.classList.remove('show');
        }
    });

    // 3. Filtrar notas al buscar
    searchInput.addEventListener('input', (e) => {
        const searchText = e.target.value.toLowerCase();
        const notes = document.querySelectorAll('.note');
        
        notes.forEach(note => {
            const content = note.querySelector('textarea').value.toLowerCase();
            if (content.includes(searchText)) {
                note.style.display = 'flex';
            } else {
                note.style.display = 'none';
            }
        });
    });

    // --- FUNCIONES ---

    /**
     * Añade una nota al DOM y guarda el estado.
     * @param {string|null} id - ID único de la nota, o null para una nueva.
     * @param {string} content - Contenido de la nota.
     * @param {string} color - Color de fondo.
     * @param {Date|string} date - Fecha de creación.
     */
    function addNote(id, content, color, date) {
        const noteId = id || Date.now().toString(); // Asigna ID si es nueva
        const noteElement = document.createElement('div');
        noteElement.classList.add('note');
        noteElement.style.backgroundColor = color;
        noteElement.dataset.id = noteId;

        const formattedDate = new Date(date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        noteElement.innerHTML = `
            <textarea placeholder="Escribe tu nota aquí...">${content}</textarea>
            <div class="note-footer">
                <span class="note-date">${formattedDate}</span>
                <div class="note-actions">
                    <button class="edit-btn"><i class="fa-solid fa-pencil"></i></button>
                    <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
        
        // Añadir la nota al principio de la cuadrícula
        notesGrid.prepend(noteElement);

        // --- Eventos para la nueva nota ---
        const textarea = noteElement.querySelector('textarea');
        const editBtn = noteElement.querySelector('.edit-btn');
        const deleteBtn = noteElement.querySelector('.delete-btn');
        
        // Editar/Guardar nota
        editBtn.addEventListener('click', () => {
            textarea.classList.toggle('editable');
            if (textarea.classList.contains('editable')) {
                textarea.focus();
                editBtn.innerHTML = '<i class="fa-solid fa-save"></i>'; // Cambia a ícono de guardar
            } else {
                editBtn.innerHTML = '<i class="fa-solid fa-pencil"></i>'; // Vuelve a ícono de lápiz
                updateNote(noteId, textarea.value, color, new Date(date));
            }
        });

        // Eliminar nota
        deleteBtn.addEventListener('click', () => {
            deleteNote(noteId, noteElement);
        });

        // Guardar automáticamente al dejar de escribir (después de un tiempo)
        let timeoutId;
        textarea.addEventListener('input', () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (textarea.classList.contains('editable')) {
                     updateNote(noteId, textarea.value, color, new Date(date));
                }
            }, 500);
        });

        // Si es una nota nueva, la guardamos inmediatamente
        if (!id) {
            saveNotes();
        }
    }

    /**
     * Actualiza una nota específica y guarda el estado.
     */
    function updateNote(id, newContent, color, date) {
        const notes = getNotes();
        const noteToUpdate = notes.find(note => note.id === id);
        if (noteToUpdate) {
            noteToUpdate.content = newContent;
            saveNotes(notes);
        }
    }

    /**
     * Elimina una nota del DOM y del almacenamiento.
     */
    function deleteNote(id, element) {
        let notes = getNotes();
        notes = notes.filter(note => note.id !== id);
        saveNotes(notes);
        element.remove();
    }
    
    /**
     * Guarda todas las notas actuales en localStorage.
     * Si no se pasan notas, las toma del DOM.
     */
    function saveNotes(notesToSave) {
        if (!notesToSave) {
             notesToSave = [];
            document.querySelectorAll('.note').forEach(noteElement => {
                notesToSave.push({
                    id: noteElement.dataset.id,
                    content: noteElement.querySelector('textarea').value,
                    color: noteElement.style.backgroundColor,
                    date: new Date() // Actualiza la fecha al guardar
                });
            });
        }
        localStorage.setItem('notes-app-data', JSON.stringify(notesToSave));
    }

    /**
     * Carga las notas desde localStorage y las muestra.
     */
    function loadNotes() {
        const notes = getNotes();
        // Ordenar de más reciente a más antigua
        notes.sort((a, b) => new Date(b.date) - new Date(a.date));
        notes.forEach(note => {
            addNote(note.id, note.content, note.color, note.date);
        });
    }

    /**
     * Obtiene las notas de localStorage.
     * @returns {Array} - Array de objetos de nota.
     */
    function getNotes() {
        return JSON.parse(localStorage.getItem('notes-app-data') || '[]');
    }
});