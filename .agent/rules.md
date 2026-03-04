Reglas de Desarrollo de Jorge
Como asistente personal de Jorge, debes seguir estas directrices para asegurar que el código y la interfaz cumplan con sus estándares de calidad, estética y profesionalismo. El objetivo es un código limpio, mantenible, una experiencia de usuario excepcional y un flujo de trabajo eficiente.

1. Arquitectura y Modularización Extrema (La Regla de Hierro)
Límite de Líneas: NINGÚN archivo debe superar las 200 líneas de código. Si un componente o archivo crece más allá de esto, es una orden imperativa separarlo en submódulos, componentes o hooks más pequeños.

Arquitectura UI/Lógica (Separación de Responsabilidades):

Extraer toda la lógica de negocio, manejo de estado y efectos secundarios a Custom Hooks independientes.

Los componentes de la interfaz (JSX/TSX) deben ser puramente presentacionales y declarativos. Su única responsabilidad es recibir props y renderizar la UI.

Principio DRY (Don't Repeat Yourself): Eliminar el código duplicado de forma sistemática. Los archivos principales (como páginas o layouts) deben mantenerse extremadamente limpios, limitándose a orquestar y componer los submódulos.

Migración Gradual: Al refactorizar, hacerlo por etapas (funcionalidad por funcionalidad) para conservar la funcionalidad en todo momento y agrupar siempre el código relacionado.

Imports/Exports: Mantener interfaces claras y explícitas entre el archivo principal y los nuevos componentes. Favorecer exports nombrados sobre default exports para facilitar refactors y autocompletado.

2. Idioma, Claridad, Nomenclatura y Documentación
Idioma: Todo el código, comentarios, documentación y mensajes de commit debe estar en español para garantizar la claridad y alineación con el equipo.

Comentarios de Código: Explicar siempre el "por qué" (la decisión lógica o arquitectónica), no solo el "qué" (que el código ya lo explica). Incluir docstrings/JSDoc para todas las funciones y clases principales.

Nombres de Archivos: Descriptivos y en español. Usar PascalCase para componentes (ej: FormularioGasto.tsx, SelectorEntidad.ts) y camelCase para el resto (ej: calcularTotal.ts, useObtenerDatos.ts).

Nombres de Variables/Funciones: Descriptivos, en español y en camelCase (ej: usuarioActual, obtenerDatosUsuario). Esto es prioritario, incluso si rompe ligeramente con convenciones inglesas del framework, en aras de la claridad del proyecto.

Commits (Control de Versiones):

Idioma: Los mensajes de commit deben estar escritos siempre en español.

Formato (Imperativo Impersonal): Redactar los mensajes en tercera persona del singular del pretérito impersonal, comenzando con la palabra "Se" seguida de un verbo en pasado.

Estructura: Se [verbo en pasado] [objeto/módulo]: [descripción breve]

Ejemplos:

Se agrega validación al formulario de login

Se corrige error en el hook useObtenerDatos

Se refactoriza componente de perfil de usuario

Se elimina código duplicado en módulo de exportación

Extensión y Detalle: La primera línea debe ser concisa (máx. 70 caracteres). Si se requiere más contexto, dejar una línea en blanco y luego agregar un cuerpo con explicaciones más detalladas sobre el por qué del cambio.

text
Se implementa optimistic UI en panel de tareas

- Ahora al marcar una tarea como completada, la UI se actualiza
  instantáneamente sin esperar la respuesta del servidor.
- Si la petición falla, la UI revierte al estado anterior.
- Esto mejora la percepción de velocidad en la aplicación (Regla #4).
Comunicación y Walkthroughs: Mantener un tono profesional y proactivo. Al finalizar una tarea, generar un resumen detallado con los pasos realizados, decisiones tomadas y, si aplica, capturas de pantalla o grabaciones.

3. Estética, UX de Alta Fidelidad (Estilo "Apple")
Paleta "Grises Pro": PROHIBIDO usar negro puro (#000000) y blanco puro como fondo de la app. Utilizar tonos de grises profundos para el modo oscuro (ej. bg-[#1C1C1E]) y grises muy suaves para el modo claro (ej. bg-[#F5F5F7]). Centralizar estos colores en las variables globales.

Dark Mode por Defecto: La aplicación debe soportar siempre modo claro/oscuro, pero el modo oscuro debe ser el predeterminado del tema.

Alineación y Simetría: Consistencia absoluta en anchos, márgenes y ejes visuales (max-w-xxl). Uso extensivo de glassmorphism (backdrop-blur), sombras suaves, bordes redondeados y transiciones suaves (idealmente con Framer Motion).

Mobile-First: Diseñar y desarrollar primero para móviles (uso de Bottom Tab Bars, menús FAB interactivos). La experiencia en escritorio debe ser una expansión natural y fluida de la versión móvil.

Sincronización Multilingüe: En aplicaciones bilingües, mantener una paridad 1:1 absoluta. Deben existir los mismos campos, la misma estructura de datos y la misma experiencia de usuario en todos los idiomas soportados.

4. Feedback Visual y UX Reactiva (La Triada de Jorge)
Skeleton Screens: Implementar siempre loaders esqueleto durante la carga de cualquier lista, tarjeta o gráfico. Nunca mostrar una pantalla en blanco o un spinner genérico si se puede evitar.

Optimistic UI: Las acciones del usuario (agregar, borrar, marcar como completado) deben reflejarse en la UI de manera instantánea, antes de confirmar la respuesta del backend. Revertir los cambios si la operación falla.

Ilusiones de Progreso: Nunca dejar al usuario esperando sin señales visuales. En procesos críticos (análisis de datos, sincronización), si la operación es muy rápida, se pueden añadir retrasos artificiales elegantes (~1.2s con un spinner) para transmitir sensación de solidez y procesamiento.

5. Control de Proyecto, DevOps y Portabilidad
Soberanía de Datos: Siempre que sea aplicable, incluir opciones para que el usuario pueda exportar/importar toda su configuración o datos en formato JSON. Esto garantiza la portabilidad y el control del usuario sobre su información.

Superusuario (Backdoors para Desarrollo): Implementar variables de entorno (ej. VITE_DEV_ADMIN, DEV_BYPASS_SUBSCRIPTION) para forzar roles de administrador y saltar barreras de suscripción o permisos durante el desarrollo y testing.

Changelogs y Versiones: Mantener un archivo changelog.json sincronizado con el historial de commits de git. Este changelog debe mostrarse en una sección "Acerca de" o "Novedades" dentro de la propia aplicación.

Variables Globales y Tokens: Centralizar todos los valores dinámicos (colores, tipografías, breakpoints, configuraciones de animación) en un archivo de configuración global, como configuracionEstetica.ts o en globals.css para las variables CSS.

6. Calidad, Robustez y Buenas Prácticas
Buenas Prácticas: Seguir los estándares específicos del lenguaje y framework (PEP 8 para Python, convenciones de React/Next.js, etc.). Favorecer siempre el código declarativo sobre el imperativo.

Robustez y Manejo de Errores:

Incluir validaciones de entrada en todos los puntos donde se reciben datos del exterior (formularios, API, etc.).

Implementar un manejo de errores explícito y consistente. Usar bloques try/catch y diferenciar entre errores esperados e inesperados.

Incorporar logging básico para facilitar el debugging en desarrollo y, si es necesario, en producción.

Código Testeable: Favorecer la creación de funciones puras (misma entrada = misma salida, sin efectos secundarios) para facilitar las pruebas unitarias. Considerar y documentar los casos edge (borde o límite).

Especificaciones Claras: Al proponer o implementar una funcionalidad, definir claramente los frameworks, versiones y dependencias necesarias. Incluir ejemplos de uso o datos de prueba para facilitar la comprensión y el testing.

Optimización y SEO: Priorizar el rendimiento. Utilizar componentes nativos optimizados del framework (ej. next/image para Next.js, next/link para navegación) y seguir las mejores prácticas de SEO (metadatos, semántica HTML, etc.).