/**
 * Shared components: validation messages, date picker, select, dropzone, tables and pagination.
 */
export const components = {
  // Validation
  'validation.thisField': 'Este campo',
  'validation.required': '{label} es obligatorio',
  'validation.requiredF': '{label} es obligatoria',
  'validation.email': 'Formato de correo inválido',
  'validation.pattern': 'Formato inválido',
  'validation.minLength': 'Mínimo {length} caracteres',
  'validation.maxLength': 'Máximo {length} caracteres',
  'validation.min': 'Mínimo {value}',
  'validation.max': 'Máximo {value}',
  'validation.noMatch': 'Las contraseñas no coinciden',
  'validation.acceptTerms': 'Debes aceptar los términos y el aviso de privacidad',
  'validation.minimumAge': 'Debes ser mayor de {age} años',
  'validation.hourInPast': 'La hora seleccionada ya pasó',
  'validation.fileType': 'El archivo debe ser una imagen JPEG, JPG, PNG o WEBP',
  'validation.invalidFile': 'Archivo inválido',
  'validation.maxSize': 'El archivo es demasiado grande',
  'validation.emailOrPhone': 'Debe ser un correo válido o un teléfono de 10 dígitos',
  'validation.profanity': 'El contenido contiene palabras no permitidas',
  'validation.clabeFormat': 'La CLABE debe tener exactamente 18 dígitos',
  'validation.clabeInvalid': 'La CLABE es inválida (el dígito verificador no coincide)',
  'validation.rfcInvalid': 'Formato inválido. Ejemplo: XEXX010101000 (persona física)',
  'validation.passwordFormat': 'Mínimo 8 caracteres de longitud. Debe incluir al menos una mayúscula, una minúscula, un número y un símbolo',

  // Datepicker
  'datepicker.placeholder': 'Selecciona una fecha',
  'datepicker.placeholderRange': 'Selecciona un rango',
  'datepicker.placeholderMultiple': 'Selecciona fechas',
  'datepicker.selectedCount': '{count} fechas seleccionadas',
  'datepicker.clear': 'Limpiar',
  'datepicker.today': 'Hoy',
  'datepicker.apply': 'Aplicar',
  'datepicker.previous': 'Anterior',
  'datepicker.next': 'Siguiente',
  'datepicker.chooseMonth': 'Elegir mes',
  'datepicker.chooseYear': 'Elegir año',
  'datepicker.time': 'Hora',
  'datepicker.hours': 'Horas',
  'datepicker.minutes': 'Minutos',
  'datepicker.preset.today': 'Hoy',
  'datepicker.preset.yesterday': 'Ayer',
  'datepicker.preset.last7Days': 'Últimos 7 días',
  'datepicker.preset.last30Days': 'Últimos 30 días',
  'datepicker.preset.thisMonth': 'Este mes',
  'datepicker.preset.lastMonth': 'Mes pasado',

  // Select, dropzone and forms demo
  'select.placeholder': 'Selecciona una opción',
  'select.placeholderMultiple': 'Selecciona opciones',
  'select.search': 'Buscar...',
  'select.empty': 'Sin resultados',
  'select.clear': 'Limpiar selección',
  'select.remove': 'Quitar',
  'dropzone.title': 'Arrastra y suelta tus archivos aquí',
  'dropzone.drop': 'Suelta para agregarlos',
  'dropzone.or': 'o',
  'dropzone.browse': 'búscalos en tu equipo',
  'dropzone.hintTypes': 'Formatos: {types}',
  'dropzone.hintSize': 'Máx. {size} MB por archivo',
  'dropzone.hintCount': 'Hasta {count} archivos',
  'dropzone.remove': 'Quitar',
  'dropzone.errorType': '{name}: formato no permitido',
  'dropzone.errorSize': '{name}: supera los {size} MB',
  'dropzone.errorCount': 'Solo puedes subir {count} archivos',
  'rangeSlider.min': 'Mínimo',
  'rangeSlider.max': 'Máximo',

  // Tables demo and pagination
  'pagination.label': 'Paginación',
  'pagination.showing': 'Mostrando {from}–{to} de {total}',
  'pagination.previous': 'Página anterior',
  'pagination.next': 'Página siguiente',
  'pagination.page': 'Página',

  // Data table
  'table.empty': 'No hay registros para mostrar',

  // Buttons and badges demo
  'ui.action.options': 'Opciones',
  'ui.badge.online': 'En línea',
  'ui.badge.away': 'Ausente',
  'ui.badge.busy': 'Ocupado',
  'ui.badge.offline': 'Desconectado',

  // Avatars, modals and breadcrumbs
  'breadcrumb.label': 'Ruta de navegación',
  'breadcrumb.more': 'Mostrar más niveles',
} satisfies Record<string, string>;
