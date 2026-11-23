# ADR-001: OrthanC como Servidor DICOM

Estado: Aceptado para MVP

## Contexto

MedImaging Lab requiere un sistema capaz de recibir, almacenar, buscar y devolver estudios de imágenes médicas usando estandards DICOM establecidos.

Implementando estas capaciodades directamente en Node.js introduciría complejidad innecesaria y responsabilidades de

## Decisión

Usar OrthanC como servidor DICOM, con su plugin DICOMweb activado, desplegado usando Docker Compose.

OrthanC será responsable por el almacenamiento y la interoperabilidad DICOM. El backend Node.js manejará la lógica específica de la aplicación y la orquestación sin duplicar la funcionalidad de OrthanC.

## Justificación

- Soporte nativo para comunicación con DICOM tradicional, incluyendo operaciones DIMSE como C-STORE, C-FIND y C-MOVE.
- Soporte DICOMweb a través de QIDO-RS, WADO-RS y STOW-RS.
- Compatibilidad

## Alternativas Consideradas

## Consecuencias

## Limitaciones

## Decisiones Relacionadas
