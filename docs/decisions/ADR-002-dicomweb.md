# ADR-002: DICOMweb como la Interfaz Primaria de Interoperabilidad

Estado: Accepted
Fecha: 2026-11-23
Proyecto: MedImaging Lab

### 1. Contexto:

MedImaging Lab requiere mecanismos estandarizados para almacenar, buscar y devolver estudios de imágenes médicas.

Los estándares DICOM soportan distintos enfoques de comunicación, incluyendo trabajo de red DICOM tradicional a través de DIMSE y servicios basados en HTTP a través de DICOMweb.

La plataforma debe debe soportar aplicaciones web modernas sin necesidad de olvidar la interoperabilidad con sistemas de hospitales existentes.

### 2. Decisión:

Adoptar DICOMweb como la interfaz de interoperabilidad primaria para la aplicación web.

OrthanC proveerá el almacenamiento de DICOM y los servicios de interoperabilidad requeridos.

Los siguientes servicios DICOMweb serán utilizados:

| Servicio | Propósito | Método HTTP |
| --- | --- | --- |
| STOW-RS | Almacenar instancias DICOM | POST |
| QIDO-RS | Buscar estudios, series e instancias | GET |
| WADO-RS | Obtención de objetos DICOM y metadata | GET |

Node.js implementará la lógica de negocio específica de la aplicación y la orquestación sin implementar un servidor DIMSE.

### 3. Interoperabilidad DICOM tradicional / DIMSE

#### 3.1 DICOMweb vs. DIMSE

DIMSE (Elemento de Servicio de Mensaje DICOM) provee servicios estandarizados para comunicación entre Entidades de Aplicación DICOM, típicamente sobre asociaciones TCP/IP.

DICOMweb provee interfaces basadas en HTTP para almacenar, buscar y devolver recursos DICOM.

| Operación | DICOM tradicional / DIMSE | DICOMweb |
| --- | --- | --- |
| Guardar | C-STORE | STOW-RS |
| Buscar | C-FIND | QIDO-RS |
| Obtener | C-MOVE/C-GET | WADO-RS |
| Conectividad | Asociaciones DICOM | HTTP/HTTPS |
| Integración típica | Equipos y PACS | Aplicaciones web y servicios |

Estos servicios proveen funcionalidades relacionadas aunque no son completamente equivalentes.

#### 3.2 Servicios DICOM Tradicionales

##### C-STORE

Transfiere instancias DICOM entre aplicaciones. comunmente desde unidades o dispositivos de imágenes médicas hacia sistemas PACS.

##### C-FIND

Busca información DICOM, como estudios disponibles, series e instancias, usando modelos de consulta soportados.

##### C-MOVE

Solicita la transferencia de instancias DICOM coincidentes hacia una aplicación destino específica. La entidad receptora debe ser accesible y estar configurada correctamente.

#### 3.3 OrthanC como un puente de interoperabilidad

OrthanC puede recibir y almacenar instancias DICOM a través de servicios DIMSE tradicionales y exponer las entidades almacenadas a través de DICOMweb.

Esto permite a los sistemas hospitalarios usar la red DICOM tradicional para interactuar con las aplicaciones web que consumen servicios basados en HTTP.

OrthanC provee ambas interfaces sin requerir que MedImaging Lab implemente los protocolos DICOM de red subyacentes.

#### 3.4 Por qué no implementar DIMSE en Node.js?

Implementar un servidor DIMSE dedicado introduciría responsabilidades adicionales:

- Administrar las asociaciones DICOM y los contextos de presentación.
- Soportar el manejo de mensajes de servicio y respuestas DIMSE.
- Administrar la sintaxis de transferencia y los objectos DICOM soportados.
- Manejar las fallas e incidencias de compatibilidad de nivel de protocolo.

OrthanC ya provee estas capacidades.

Por lo tanto, implementar DIMSE directamente en Node.js incrementaría la complejidad sin aportar suficiente valor para el presente MVP.

#### 3.5 Integración con PACS Hospitalario

Las futuras integraciones podrían incluir a sistemas hospitalarios PACS que se comuniquen a través de servicios DICOM.

OrthanC puede servir como un componente de interoperabilidad entre estos sistemas y MedImaging Lab.

La integración real con hospitales requeriría configuraciones de red adicionales, controles de seguridad, negociación de servicios soportados y control de calidad para la interoperabilidad.

**Ninguna funcionalidad DIMSE asicional está incluida en el presente MVP.**

### Alternativas Consideradas

#### Alternativa A: Implementar DIMSE directamente en Node.js

Rechazado para el MVP debido a la implementación innecesaria y a la complejidad del mantenimiento.

#### Alternativa B: Usar DICOMweb exclusivamente y quitar la compatibilidad con DIMSE

Rechazado porque sería innecesario limitar la interoperabilidad con sistemas hospitalarios tradicionales.

#### Alternativa C: Usar DICOMweb como la interfaz principal mientras preservamos DIMSE a través de OrthanC

**Seleccionado.**

Este enfoque separa las responsabilidades de la aplicación del protocolo de implementación.

### 5. Consecuencias

#### Positivas

- Interoperabilidad HTTP estandarizada.
- Compatibilidad con la infraestructura DICOM existente.
- Separación de la lógica de la aplicación y los servicios DICOM.
- Ruta de integración para OHIF y servicios de procesamiento de imágenes.

#### Inconvenientes y Limitaciones

- Dependencia arquitectónica de OrthanC.
- Configuración adicional para integraciones DIMSE externas.
- Necesidad de autenticación, autorización y transporte seguro.
- DICOMweb y los servicios DIMSE no son intercambiables en todos los flujos.
- Las integraciones hospitalarias requieren validación dedicada.

### 6. Validación

Los test de integración Github Actions han sido exitosamente verificados:

- Inicio de OrthanC y la disponibilidad del API HTTP.
- Autenticación HTTP requerida.
- Almacenamiento de instancias DICOM a través de STOW-RS.
- Descubrimiento de estudios a través de QIDO-RS.
- Retorno de instancias a través de WADO-RS.
- Verificación de identificadores devueltos y datos de píxeles.

### 7. Alcance

La implementación actual permanece sin cambios.

Tests de integración DIMSE adicionales, conectividad para PACS exteriores y flujos de trabajo hospitalarios estan pospuestos para futuros módulos.

### 8. Referencias

- DICOM PS3.7: Intercambio de mensajes.
- DICOM PS3.18: Servicios Web.
- Plugin OrthanC DICOMweb.
- Documentación de OrthanC.