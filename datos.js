document.addEventListener('DOMContentLoaded', function() {
    // Mapeo de meses en español e inglés
    const monthsMap = {
        '01': { es: 'ENE', en: 'JAN' },
        '02': { es: 'FEB', en: 'FEB' },
        '03': { es: 'MAR', en: 'MAR' },
        '04': { es: 'ABR', en: 'APR' },
        '05': { es: 'MAY', en: 'MAY' },
        '06': { es: 'JUN', en: 'JUN' },
        '07': { es: 'JUL', en: 'JUL' },
        '08': { es: 'AGO', en: 'AUG' },
        '09': { es: 'SEPT', en: 'SEP' },
        '10': { es: 'OCT', en: 'OCT' },
        '11': { es: 'NOV', en: 'NOV' },
        '12': { es: 'DIC', en: 'DEC' }
    };

    // Función para formatear número de DNI con puntos
    function formatDNI(number) {
        const cleanNumber = number.toString().replace(/\./g, '').substring(0, 8);
        if (cleanNumber.length <= 2) return cleanNumber;
        if (cleanNumber.length <= 5) return `${cleanNumber.substring(0, 2)}.${cleanNumber.substring(2)}`;
        return `${cleanNumber.substring(0, 2)}.${cleanNumber.substring(2, 5)}.${cleanNumber.substring(5, 8)}`;
    }

    // Función para formatear fecha al formato del DNI
    function formatDateToDNI(dateString) {
        const [year, month, day] = dateString.split('-');
        const monthData = monthsMap[month];
        return `${day} ${monthData.es}/ ${monthData.en} ${year}`;
    }

    // Función para sumar años a una fecha
    function addYearsToDate(dateString, years) {
        const date = new Date(dateString);
        date.setFullYear(date.getFullYear() + years);
        return date.toISOString().split('T')[0];
    }

    // Función principal para actualizar campos del DNI
    function updateDNIField(inputSelector, dniClass, variableName, options = {}) {
        const input = document.querySelector(inputSelector);
        if (!input) return;

        if (options.isImageToggle) {
            // Manejo del cambio de imágenes del DNI
            const updateImages = () => {
                const selected = document.querySelector(`${inputSelector}:checked`);
                if (selected) {
                    const isOld = selected.value === 'true';
                    const frontImg = document.querySelector('.DNI_IMG');
                    const backImg = document.querySelector('.DNI_back img');
                    
                    if (frontImg && backImg) {
                        frontImg.src = isOld ? 'imgs/arg_front_viejo.webp' : 'imgs/arg_front_new.webp';
                        backImg.src = isOld ? 'imgs/arg_back_viejo.webp' : 'imgs/arg_back_new.webp';
                    }
                }
            };
            
            document.querySelectorAll(inputSelector).forEach(radio => {
                radio.addEventListener('change', updateImages);
            });
            updateImages();
            return;
        }

        // Configuración según tipo de campo
        if (options.isDNI) {
            // Manejo especial para DNI con la nueva estructura
            const dniDisplay = document.querySelector('.DNI_content1Letters.Documento .DNI_text');
            if (!dniDisplay) return;

            const updateField = () => {
                const cleanValue = input.value.toString().replace(/\./g, '');
                window[variableName] = cleanValue;
                dniDisplay.textContent = formatDNI(cleanValue);
                input.value = cleanValue; // Mantener valor sin puntos en el input
            };
            
            input.addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '');
                if (this.value.length > 8) this.value = this.value.substring(0, 8);
                updateField();
            });
            updateField();
            return;
        }

        const dniSpanContainer = document.querySelector(`.DNI_content1Letters.${dniClass}`);
        if (!dniSpanContainer) return;

        if (options.isRadio) {
            // Manejo de radio buttons (sexo)
            const updateField = () => {
                const selected = document.querySelector(`${inputSelector}:checked`);
                if (selected) {
                    window[variableName] = selected.value === 'Masculino' ? 'M' : 'F';
                    const valueSpan = dniSpanContainer.querySelector('.DNI_text:last-child');
                    if (valueSpan) valueSpan.textContent = window[variableName];
                }
            };
            updateField();
            document.querySelectorAll(inputSelector).forEach(input => input.addEventListener('change', updateField));

        } else if (options.isDate) {
            // Manejo de campos de fecha
            const updateField = () => {
                window[variableName] = input.value;
                const valueSpan = dniSpanContainer.querySelector('.DNI_text:last-child');
                if (valueSpan) valueSpan.textContent = formatDateToDNI(input.value);
                
                if (dniClass === 'FechaEmision') {
                    const vencimientoSpan = document.querySelector('.DNI_content1Letters.FechaVencimiento .DNI_text:last-child');
                    if (vencimientoSpan) {
                        const fechaVencimiento = addYearsToDate(input.value, 15);
                        vencimientoSpan.textContent = formatDateToDNI(fechaVencimiento);
                    }
                }
            };
            updateField();
            input.addEventListener('change', updateField);

        } else if (options.isDomicilio) {
            // Manejo mejorado para domicilio
            const updateField = () => {
                window[variableName] = input.value.toUpperCase();
                const valueSpan = dniSpanContainer.querySelector('.DNI_text:not([style*="transform: scale(0.8)"])');
                if (!valueSpan) {
                    const fallbackSpan = dniSpanContainer.querySelector('.DNI_text:last-child');
                    if (fallbackSpan) fallbackSpan.textContent = window[variableName];
                } else {
                    valueSpan.textContent = window[variableName];
                }
            };
            
            input.addEventListener('input', updateField);
            updateField();

        } else {
            // Manejo de campos de texto normales (nombre, apellido)
            const updateField = () => {
                window[variableName] = input.value.toUpperCase();
                const valueSpan = dniSpanContainer.querySelector('.DNI_text:last-child');
                if (valueSpan) valueSpan.textContent = window[variableName];
            };
            
            input.addEventListener('input', updateField);
            updateField();
        }
    }

    // Configuración de todos los campos
    updateDNIField('input[name="name"]', 'Nombre', 'nombre');
    updateDNIField('input[name="surname"]', 'Apellido', 'apellido');
    updateDNIField('input[name="sex"]', 'Sex', 'sexo', { isRadio: true });
    updateDNIField('.nacimiento input[type="date"]', 'FechaNacimiento', 'fechaNacimiento', { isDate: true });
    updateDNIField('.Emision input[type="date"]', 'FechaEmision', 'fechaEmision', { isDate: true });
    updateDNIField('input[name="dni"]', null, 'numeroDNI', { isDNI: true });
    updateDNIField('input[name="oldDniBg"]', null, null, { isImageToggle: true });
    updateDNIField('input[name="adress"]', 'Domicilio', 'domicilio', { isDomicilio: true });
});